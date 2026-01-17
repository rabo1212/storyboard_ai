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

// 스타일 일관성을 위한 컨텍스트 생성 (아트 스타일만)
export const generateStyleContext = async (prompt: string, style: string): Promise<string> => {
  const openai = getOpenAI();
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are an art director. Create ONLY an art style guide. DO NOT describe any characters, people, or animals. Focus only on visual style.`
      },
      {
        role: 'user',
        content: `Story theme: "${prompt}"
Art Style: ${style}

Create an ART STYLE GUIDE with ONLY:
- Color palette (warm/cool/vibrant/muted)
- Lighting style (golden hour/soft/dramatic/natural)
- Rendering style (photorealistic/3D animated/painted/illustrated)
- Mood/atmosphere (peaceful/energetic/mysterious/cheerful)

DO NOT mention any characters, animals, people, or specific subjects.
Output as one short paragraph starting with "ART STYLE:" - maximum 50 words.`
      }
    ],
    max_tokens: 150,
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

CRITICAL RULES:
1. Each panel's visualPrompt must describe EXACTLY what is described in that scene - no more, no less
2. If a scene has 1 character, show 1. If it has 5 characters, show 5.
3. visualPrompt should be SELF-CONTAINED - include all necessary details for that specific scene
4. DO NOT carry over characters from other scenes unless they are mentioned in that specific scene
5. Parse the scene description carefully to understand WHO and WHAT should appear
        
Output ONLY valid JSON array, no markdown, no explanations.`
      },
      {
        role: 'user',
        content: `스토리보드 생성: ${prompt}
패널 수: ${panelCount}

규칙:
1. description은 한국어로 작성
2. visualPrompt는 영어로, 해당 씬에 등장하는 모든 요소를 정확히 묘사
3. 씬에 1명이면 1명, 2명이면 2명, 동물 3마리면 3마리 - 정확히 맞춰서
4. 다른 씬의 캐릭터를 가져오지 말 것 (해당 씬에 언급된 것만)
5. visualPrompt는 독립적으로 완전한 설명이어야 함 (배경, 조명, 인물 외모 등 포함)
6. shotType은 장면에 맞게: WIDE SHOT, MEDIUM SHOT, CLOSE-UP, TWO SHOT 등

JSON 형식:
[
  {
    "sceneNumber": 1,
    "shotType": "MEDIUM SHOT",
    "description": "한국어 장면 설명",
    "dialogue": "대사 (없으면 빈 문자열)",
    "visualPrompt": "Complete scene description in English. Include: all characters/subjects IN THIS SCENE ONLY, their appearance, actions, setting, lighting, mood. Be specific and self-contained."
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
