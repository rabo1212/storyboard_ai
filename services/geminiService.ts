
import { GoogleGenAI, Type } from "@google/genai";
import { StoryboardPanel } from "../types.ts";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error("API_KEY가 설정되지 않았습니다. Vercel 설정(Settings > Environment Variables)에서 API_KEY를 등록하고 'Redeploy'를 진행해 주세요.");
  }
  return new GoogleGenAI({ apiKey });
};

// 스타일 일관성을 위한 컨텍스트 생성
export const generateStyleContext = async (prompt: string, style: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `Based on this story: "${prompt}"

Create a consistent visual style guide for a ${style} storyboard. Include:
1. Character descriptions (age, hair color, clothing, distinctive features)
2. Color palette (main colors, lighting mood)
3. Environment style (setting details, atmosphere)
4. Art direction notes (line weight, shading style, level of detail)

Output as a single paragraph in English that can be used as a prefix for image generation prompts to maintain visual consistency across all panels.`,
  });

  return response.text || '';
};

export const generateStoryboardScript = async (prompt: string, panelCount: number = 4): Promise<StoryboardPanel[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `스토리보드 생성: ${prompt}, 패널수: ${panelCount}.

규칙:
1. 한국어로 설명(description) 작성
2. visualPrompt는 영어로 작성
3. 모든 패널에서 캐릭터의 외모, 의상, 특징을 동일하게 유지
4. 캐릭터 묘사 시 구체적인 특징 포함 (머리색, 의상 색상, 체형 등)
5. 배경과 조명 스타일도 일관되게 유지`,
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

  // 스타일 컨텍스트를 포함한 일관된 프롬프트 생성
  const consistentPrompt = styleContext
    ? `${styleContext}. Scene: ${visualPrompt}`
    : `Storyboard frame, ${style} style, ${visualPrompt}`;

  // Imagen 3 모델 사용 (고품질)
  const response = await ai.models.generateImages({
    model: 'imagen-3.0-generate-002',
    prompt: `${consistentPrompt}, cinematic composition, professional lighting, consistent character design, no text, no watermark`,
    config: {
      numberOfImages: 1,
      aspectRatio: '16:9',
    },
  });

  const generatedImage = response.generatedImages?.[0];
  if (!generatedImage || !generatedImage.image) {
    throw new Error("이미지 생성 결과를 받지 못했습니다.");
  }

  // base64 이미지 데이터 반환
  const imageData = generatedImage.image.imageBytes;
  if (!imageData) {
    throw new Error("이미지 데이터를 찾을 수 없습니다.");
  }

  return `data:image/png;base64,${imageData}`;
};
