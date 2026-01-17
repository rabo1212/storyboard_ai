
import OpenAI from 'openai';
import { StoryboardPanel } from "../types.ts";

const getOpenAI = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error("OPENAI_API_KEY가 설정되지 않았습니다. Vercel 설정(Settings > Environment Variables)에서 OPENAI_API_KEY를 등록하고 'Redeploy'를 진행해 주세요.");
  }
  return new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
};

// 샷 타입별 카메라 설명
const SHOT_TYPE_DESCRIPTIONS: Record<string, string> = {
  'EXTREME WIDE SHOT': 'extreme wide shot, very distant view showing entire landscape or location, subject appears very small in frame, establishing shot',
  'WIDE SHOT': 'wide shot, full body visible with surrounding environment, character shown from head to toe with context',
  'FULL SHOT': 'full shot, entire body of subject visible from head to feet, minimal headroom',
  'MEDIUM WIDE SHOT': 'medium wide shot, subject framed from knees up, also known as 3/4 shot',
  'MEDIUM SHOT': 'medium shot, subject framed from waist up, standard conversational framing',
  'MEDIUM CLOSE-UP': 'medium close-up, subject framed from chest up, focuses on face and upper body',
  'CLOSE-UP': 'close-up shot, face fills most of the frame, showing detailed facial expressions, head and shoulders only',
  'EXTREME CLOSE-UP': 'extreme close-up, very tight framing on specific detail like eyes, lips, or hands',
  'OVER THE SHOULDER': 'over the shoulder shot, camera behind one character looking at another',
  'POV': 'point of view shot, camera shows what character is seeing',
  'LOW ANGLE': 'low angle shot, camera looking up at subject, makes subject appear powerful',
  'HIGH ANGLE': 'high angle shot, camera looking down at subject',
  'DUTCH ANGLE': 'dutch angle, tilted camera for tension or disorientation',
  'TWO SHOT': 'two shot, two characters in frame together',
  'INSERT': 'insert shot, close-up of specific object or detail',
};

// 샷 타입을 카메라 설명으로 변환
const getShotDescription = (shotType: string): string => {
  const upperShot = shotType.toUpperCase().replace('-', ' ').replace('_', ' ');
  
  if (SHOT_TYPE_DESCRIPTIONS[upperShot]) {
    return SHOT_TYPE_DESCRIPTIONS[upperShot];
  }
  
  for (const [key, value] of Object.entries(SHOT_TYPE_DESCRIPTIONS)) {
    if (upperShot.includes(key) || key.includes(upperShot)) {
      return value;
    }
  }
  
  if (upperShot.includes('CLOSE')) return SHOT_TYPE_DESCRIPTIONS['CLOSE-UP'];
  if (upperShot.includes('WIDE')) return SHOT_TYPE_DESCRIPTIONS['WIDE SHOT'];
  if (upperShot.includes('MEDIUM')) return SHOT_TYPE_DESCRIPTIONS['MEDIUM SHOT'];
  
  return `${shotType} shot, cinematic framing`;
};

// 스타일 일관성을 위한 컨텍스트 생성 (GPT-4 사용)
export const generateStyleContext = async (prompt: string, style: string): Promise<string> => {
  const openai = getOpenAI();
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a character designer creating consistent character descriptions for storyboards. Output only the character description, no explanations.'
      },
      {
        role: 'user',
        content: `Based on this story: "${prompt}"

Create a CHARACTER CONSISTENCY GUIDE for a ${style} storyboard. This will be used as a PREFIX for every DALL-E image generation.

Create an extremely detailed character description including:
1. MAIN CHARACTER:
   - Exact age, gender, ethnicity
   - Face shape, eye details, eyebrows
   - Hair style, color, length
   - Skin tone
   - Body type, height
   - Exact clothing with colors
   - Distinctive features

2. ART STYLE:
   - Color palette
   - Lighting style
   - Visual style (realistic, anime, etc.)

Output as a single paragraph starting with "CHARACTER:" - keep it under 200 words for DALL-E prompt limits.`
      }
    ],
    max_tokens: 500,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || '';
};

// 스토리보드 스크립트 생성 (GPT-4 사용)
export const generateStoryboardScript = async (prompt: string, panelCount: number = 4): Promise<StoryboardPanel[]> => {
  const openai = getOpenAI();
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a professional storyboard artist. Create storyboard panels in JSON format.
        
Output ONLY valid JSON array, no markdown, no explanations.`
      },
      {
        role: 'user',
        content: `스토리보드 생성: ${prompt}
패널 수: ${panelCount}

규칙:
1. description은 한국어로 작성
2. visualPrompt는 영어로, DALL-E에 최적화된 상세한 설명
3. 모든 패널에서 캐릭터 외모를 동일하게 묘사
4. shotType은 다음 중 선택: EXTREME WIDE SHOT, WIDE SHOT, FULL SHOT, MEDIUM WIDE SHOT, MEDIUM SHOT, MEDIUM CLOSE-UP, CLOSE-UP, EXTREME CLOSE-UP, OVER THE SHOULDER, TWO SHOT

JSON 형식:
[
  {
    "sceneNumber": 1,
    "shotType": "MEDIUM SHOT",
    "description": "한국어 장면 설명",
    "dialogue": "대사 (없으면 빈 문자열)",
    "visualPrompt": "Detailed English description for DALL-E, including character appearance, setting, lighting, mood"
  }
]`
      }
    ],
    max_tokens: 2000,
    temperature: 0.8,
  });

  const text = response.choices[0]?.message?.content || '';
  
  // JSON 파싱 (마크다운 코드블록 제거)
  let cleanedText = text.trim();
  if (cleanedText.startsWith('```json')) {
    cleanedText = cleanedText.slice(7);
  }
  if (cleanedText.startsWith('```')) {
    cleanedText = cleanedText.slice(3);
  }
  if (cleanedText.endsWith('```')) {
    cleanedText = cleanedText.slice(0, -3);
  }
  cleanedText = cleanedText.trim();

  const parsed = JSON.parse(cleanedText);
  
  return parsed.map((item: any, index: number) => ({
    ...item,
    id: `panel-${Date.now()}-${index}`,
    isImageLoading: false,
    dialogue: item.dialogue || ""
  }));
};

// DALL-E 3로 이미지 생성
export const generatePanelImage = async (
  visualPrompt: string,
  style: string,
  styleContext?: string,
  shotType?: string
): Promise<string> => {
  const openai = getOpenAI();

  // 샷 타입 설명
  const shotDescription = shotType ? getShotDescription(shotType) : 'medium shot';

  // DALL-E 프롬프트 구성 (1000자 제한 고려)
  let finalPrompt: string;
  
  if (styleContext) {
    finalPrompt = `${styleContext}

SHOT TYPE: ${shotDescription}

SCENE: ${visualPrompt}

Style: ${style}, cinematic storyboard frame, professional lighting, no text, no watermarks`;
  } else {
    finalPrompt = `SHOT TYPE: ${shotDescription}

${visualPrompt}

Style: ${style}, cinematic storyboard frame, professional lighting, no text, no watermarks`;
  }

  // 프롬프트 길이 제한 (DALL-E 3는 4000자 제한)
  if (finalPrompt.length > 3800) {
    finalPrompt = finalPrompt.substring(0, 3800) + '...';
  }

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: finalPrompt,
    n: 1,
    size: '1792x1024', // 16:9에 가까운 와이드 비율
    quality: 'standard',
    style: 'vivid',
  });

  const imageUrl = response.data[0]?.url;
  
  if (!imageUrl) {
    throw new Error("이미지 생성 결과를 받지 못했습니다.");
  }

  // URL을 base64로 변환 (PDF 내보내기 위해)
  try {
    const imageResponse = await fetch(imageUrl);
    const blob = await imageResponse.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    // base64 변환 실패시 원본 URL 반환
    return imageUrl;
  }
};
