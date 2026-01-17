import OpenAI from 'openai';
import { StoryboardPanel } from "../types.ts";

const getOpenAI = () => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error("VITE_OPENAI_API_KEY가 설정되지 않았습니다. Vercel 설정(Settings > Environment Variables)에서 VITE_OPENAI_API_KEY를 등록하고 'Redeploy'를 진행해 주세요.");
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

// 스타일 일관성을 위한 컨텍스트 생성 (문맥 파악 버전)
export const generateStyleContext = async (prompt: string, style: string): Promise<string> => {
  const openai = getOpenAI();
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are a visual consistency expert for storyboards. Analyze the story and create a style guide.

CRITICAL RULES:
1. ONLY describe characters/subjects that are EXPLICITLY mentioned or clearly implied in the story
2. If the story is about animals, describe ONLY the animals - DO NOT add human characters
3. If the story is about objects/things, describe ONLY those objects - DO NOT add characters
4. If the story mentions specific people, describe ONLY those people
5. NEVER invent or add characters that are not in the original story

Output only the style guide, no explanations.`
      },
      {
        role: 'user',
        content: `Story: "${prompt}"
Art Style: ${style}

Analyze this story and create a VISUAL CONSISTENCY GUIDE.

First, identify what the story is actually about:
- Is it about animals? → Describe only the animals
- Is it about people? → Describe only those people  
- Is it about objects/scenes? → Describe only those elements
- Is it abstract/conceptual? → Focus only on art style

Then create a guide with:
1. SUBJECTS (only what's in the story):
   - For animals: species, fur/feather color, eye color, size, distinctive markings
   - For people: only if explicitly mentioned in story
   - For objects: material, color, condition

2. ART STYLE:
   - Color palette
   - Lighting style
   - Visual style (${style})

Output as a single paragraph starting with "STYLE:" - keep it under 150 words.
DO NOT add any characters or subjects not mentioned in the original story.`
      }
    ],
    max_tokens: 400,
    temperature: 0.5,
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

CRITICAL: Only include characters/subjects that are explicitly mentioned in the user's prompt.
- If the prompt is about animals, show ONLY animals
- If the prompt is about people, show ONLY those people
- DO NOT add random human characters to animal stories
        
Output ONLY valid JSON array, no markdown, no explanations.`
      },
      {
        role: 'user',
        content: `스토리보드 생성: ${prompt}
패널 수: ${panelCount}

규칙:
1. description은 한국어로 작성
2. visualPrompt는 영어로, DALL-E에 최적화된 상세한 설명
3. 프롬프트에 언급된 캐릭터/대상만 포함 (임의로 사람 추가 금지)
4. 모든 패널에서 같은 캐릭터는 동일한 외모로 묘사
5. shotType은 다음 중 선택: EXTREME WIDE SHOT, WIDE SHOT, FULL SHOT, MEDIUM WIDE SHOT, MEDIUM SHOT, MEDIUM CLOSE-UP, CLOSE-UP, EXTREME CLOSE-UP, OVER THE SHOULDER, TWO SHOT

JSON 형식:
[
  {
    "sceneNumber": 1,
    "shotType": "MEDIUM SHOT",
    "description": "한국어 장면 설명",
    "dialogue": "대사 (없으면 빈 문자열)",
    "visualPrompt": "Detailed English description - include ONLY subjects from the original prompt"
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

  // DALL-E 프롬프트 구성 - 단일 씬 이미지로 명확히 지시
  let finalPrompt: string;
  
  if (styleContext) {
    finalPrompt = `${styleContext}

CAMERA: ${shotDescription}

SCENE: ${visualPrompt}

IMPORTANT: Generate a SINGLE clean image of this ONE scene only. No collages, no multiple frames, no UI elements, no timelines, no color palettes, no text overlays.

Style: ${style}, cinematic film still, professional lighting, photorealistic rendering`;
  } else {
    finalPrompt = `CAMERA: ${shotDescription}

SCENE: ${visualPrompt}

IMPORTANT: Generate a SINGLE clean image of this ONE scene only. No collages, no multiple frames, no UI elements, no timelines, no color palettes, no text overlays.

Style: ${style}, cinematic film still, professional lighting, photorealistic rendering`;
  }

  // 프롬프트 길이 제한 (DALL-E 3는 4000자 제한)
  if (finalPrompt.length > 3800) {
    finalPrompt = finalPrompt.substring(0, 3800) + '...';
  }

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: finalPrompt,
    n: 1,
    size: '1792x1024',
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
    return imageUrl;
  }
};
