
import { GoogleGenAI, Type } from "@google/genai";
import { StoryboardPanel } from "../types.ts";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error("API_KEY가 설정되지 않았습니다. Vercel 설정(Settings > Environment Variables)에서 API_KEY를 등록하고 'Redeploy'를 진행해 주세요.");
  }
  return new GoogleGenAI({ apiKey });
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

Output as a single, detailed paragraph in English that starts with "CONSISTENT CHARACTER:" followed by all details. This will be prepended to every image prompt to maintain visual consistency.

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
4. visualPrompt에 캐릭터 외모 묘사를 매번 상세히 포함할 것:
   - 나이, 성별, 얼굴형
   - 머리 스타일과 색상
   - 의상 (색상, 스타일 구체적으로)
   - 체형
5. 같은 캐릭터는 모든 장면에서 완전히 동일한 외모 묘사 사용
6. 배경과 조명 스타일도 일관되게 유지

예시 visualPrompt 형식:
"A 27-year-old Korean man with short black side-parted hair, oval face, wearing charcoal grey suit and white shirt, slim build - [장면 설명]"`,
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
  styleContext?: string
): Promise<string> => {
  const ai = getAI();

  // 스타일 컨텍스트(캐릭터 정보)를 강하게 포함한 프롬프트 생성
  let finalPrompt: string;
  
  if (styleContext) {
    // 캐릭터 일관성 컨텍스트를 맨 앞에 배치하여 강조
    finalPrompt = `${styleContext}

SCENE TO ILLUSTRATE: ${visualPrompt}

CRITICAL: The character must look EXACTLY as described in the CONSISTENT CHARACTER section above. Same face, same hair, same clothing, same body type in every frame.`;
  } else {
    finalPrompt = `Storyboard frame, ${style} style, ${visualPrompt}`;
  }

  // Gemini 2.0 Flash 이미지 생성 모델 사용
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: `Generate an image: ${finalPrompt}

Additional requirements:
- Maintain exact character appearance consistency
- ${style} art style
- Cinematic composition
- Professional lighting
- No text overlays
- No watermarks
- High quality storyboard frame
- Same character design as specified`,
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
