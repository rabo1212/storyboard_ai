
import { GoogleGenAI, Type } from "@google/genai";
import { StoryboardPanel } from "../types.ts";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error("API_KEY가 설정되지 않았습니다. Vercel 설정(Settings > Environment Variables)에서 API_KEY를 등록하고 'Redeploy'를 진행해 주세요.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateStoryboardScript = async (prompt: string, panelCount: number = 4): Promise<StoryboardPanel[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: `스토리보드 생성: ${prompt}, 패널수: ${panelCount}. 한국어로 설명 작성, visualPrompt는 영어로.`,
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

export const generatePanelImage = async (visualPrompt: string, style: string): Promise<string> => {
  const ai = getAI();

  // Imagen 3 Fast 모델 사용 (고품질, $0.02/장)
  const response = await ai.models.generateImages({
    model: 'imagen-3.0-fast-generate-001',
    prompt: `Storyboard frame, ${style} style, ${visualPrompt}, cinematic composition, professional lighting, no text`,
    config: {
      numberOfImages: 1,
      aspectRatio: '16:9',
      outputMimeType: 'image/png',
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
