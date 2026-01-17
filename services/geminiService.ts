
import { GoogleGenAI, Type } from "@google/genai";
import { StoryboardPanel } from "../types.ts";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error("API_KEY가 설정되지 않았습니다. Vercel 설정(Settings > Environment Variables)에서 API_KEY를 등록하고 'Redeploy'를 진행해 주세요.");
  }
  return new GoogleGenAI({ apiKey });
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
  
  // 정확한 매칭 시도
  if (SHOT_TYPE_DESCRIPTIONS[upperShot]) {
    return SHOT_TYPE_DESCRIPTIONS[upperShot];
  }
  
  // 부분 매칭 시도
  for (const [key, value] of Object.entries(SHOT_TYPE_DESCRIPTIONS)) {
    if (upperShot.includes(key) || key.includes(upperShot)) {
      return value;
    }
  }
  
  // 기본값
  if (upperShot.includes('CLOSE')) return SHOT_TYPE_DESCRIPTIONS['CLOSE-UP'];
  if (upperShot.includes('WIDE')) return SHOT_TYPE_DESCRIPTIONS['WIDE SHOT'];
  if (upperShot.includes('MEDIUM')) return SHOT_TYPE_DESCRIPTIONS['MEDIUM SHOT'];
  
  return `${shotType} shot, cinematic framing`;
};

// 스타일 일관성을 위한 컨텍스트 생성 (캐릭터 일관성 강화)
export const generateStyleContext = async (prompt: string, style: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Based on this story: "${prompt}"

You are creating a CHARACTER CONSISTENCY GUIDE for a ${style} storyboard. This guide will be used as a PREFIX for every image generation to ensure ALL characters look IDENTICAL across all panels.

Create an extremely detailed and specific character description including:

1. MAIN CHARACTER (most important - be VERY specific):
   - Exact age (e.g., "27 years old")
   - Face shape (e.g., "oval face with soft jawline")
   - Eye details (e.g., "monolid dark brown eyes, thick eyebrows")
   - Hair (e.g., "short black hair, side-parted, slightly messy")
   - Skin tone (e.g., "fair skin with warm undertone")
   - Body type (e.g., "slim build, 175cm tall")
   - Clothing (e.g., "charcoal grey suit, white dress shirt, no tie, top button undone")
   - Distinctive features (e.g., "small mole under left eye")

2. SECONDARY CHARACTERS (if any):
   - Same level of detail as main character

3. ART STYLE CONSISTENCY:
   - Color palette (e.g., "warm oranges, soft yellows, muted browns")
   - Lighting style (e.g., "soft ambient lighting with warm glow")
   - Line weight and rendering style
   - Level of detail and realism

Output as a single, detailed paragraph in English that starts with "CONSISTENT CHARACTER:" followed by all details.

Example format:
"CONSISTENT CHARACTER: A 27-year-old Korean man with an oval face, monolid dark brown eyes, thick straight eyebrows, short black side-parted slightly messy hair, fair skin with warm undertone, slim build. He wears a charcoal grey suit with white dress shirt, no tie, top button undone. Small mole under left eye. ART STYLE: Anime-influenced illustration with soft warm lighting, color palette of warm oranges and muted browns, clean linework with soft cel-shading."`,
  });

  return response.text || '';
};

export const generateStoryboardScript = async (prompt: string, panelCount: number = 4): Promise<StoryboardPanel[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `스토리보드 생성: ${prompt}, 패널수: ${panelCount}.

중요 규칙:
1. 한국어로 설명(description) 작성
2. visualPrompt는 영어로 작성
3. ⚠️ 매우 중요: 모든 패널에서 캐릭터의 외모를 100% 동일하게 유지
4. shotType은 다음 중에서 장면에 맞게 선택:
   - EXTREME WIDE SHOT (아주 먼 전경)
   - WIDE SHOT (전신 + 배경)
   - FULL SHOT (전신)
   - MEDIUM WIDE SHOT (무릎 위)
   - MEDIUM SHOT (허리 위)
   - MEDIUM CLOSE-UP (가슴 위)
   - CLOSE-UP (얼굴 클로즈업)
   - EXTREME CLOSE-UP (눈, 입 등 극단적 클로즈업)
   - OVER THE SHOULDER (어깨 너머 샷)
   - TWO SHOT (두 인물)
5. visualPrompt에 캐릭터 외모 묘사를 매번 상세히 포함
6. 같은 캐릭터는 모든 장면에서 완전히 동일한 외모 묘사 사용`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sceneNumber: { type: Type.NUMBER },
            shotType: { type: Type.STRING },
            description: { type: Type.STRING },
            dialogue: { type: Type.STRING },
            visualPrompt: { type: Type.STRING },
          },
          required: ["sceneNumber", "shotType", "description", "visualPrompt"],
        },
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("AI 응답을 받지 못했습니다.");

  const parsed = JSON.parse(text);
  return parsed.map((item: any, index: number) => ({
    ...item,
    id: `panel-${Date.now()}-${index}`,
    isImageLoading: false,
    dialogue: item.dialogue || ""
  }));
};

export const generatePanelImage = async (
  visualPrompt: string,
  style: string,
  styleContext?: string,
  shotType?: string
): Promise<string> => {
  const ai = getAI();

  // 샷 타입 설명 가져오기
  const shotDescription = shotType ? getShotDescription(shotType) : 'medium shot, standard framing';

  // 스타일 컨텍스트(캐릭터 정보)와 샷 타입을 포함한 프롬프트 생성
  let finalPrompt: string;
  
  if (styleContext) {
    finalPrompt = `${styleContext}

CAMERA/SHOT TYPE: ${shotDescription}

SCENE TO ILLUSTRATE: ${visualPrompt}

CRITICAL REQUIREMENTS:
1. The character must look EXACTLY as described in the CONSISTENT CHARACTER section above
2. Same face, same hair, same clothing, same body type in every frame
3. Follow the CAMERA/SHOT TYPE framing precisely - this determines how much of the character is visible
4. ${style} art style`;
  } else {
    finalPrompt = `CAMERA/SHOT TYPE: ${shotDescription}

Storyboard frame, ${style} style, ${visualPrompt}

Follow the camera shot type framing precisely.`;
  }

  // Gemini 2.0 Flash 이미지 생성 모델 사용
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: `Generate an image with these specifications:

${finalPrompt}

Additional requirements:
- Maintain exact character appearance consistency
- Follow the specified camera shot/framing type exactly
- Cinematic composition appropriate for the shot type
- Professional lighting
- No text overlays
- No watermarks
- High quality storyboard frame`,
    config: {
      responseModalities: ['image', 'text'],
    },
  });

  const candidate = response.candidates?.[0];
  if (!candidate) {
    throw new Error("이미지 생성 결과를 받지 못했습니다.");
  }

  // 이미지 데이터 추출
  for (const part of candidate.content.parts) {
    if (part.inlineData) {
      const mimeType = part.inlineData.mimeType || 'image/png';
      return `data:${mimeType};base64,${part.inlineData.data}`;
    }
  }

  throw new Error("응답에서 이미지 데이터를 찾을 수 없습니다.");
};
