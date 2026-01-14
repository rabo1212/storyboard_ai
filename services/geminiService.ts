
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { StoryboardPanel } from "../types.ts";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  // API 키가 없거나 문자열 'undefined'로 들어온 경우 체크
  if (!apiKey || apiKey === 'undefined' || apiKey === '') {
    throw new Error("API_KEY가 설정되지 않았습니다. Vercel 설정(Settings > Environment Variables)에서 API_KEY를 등록하고 'Redeploy'를 진행해 주세요.");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateStoryboardScript = async (prompt: string, panelCount: number = 4): Promise<StoryboardPanel[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
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
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Storyboard frame, ${style}, ${visualPrompt}, no text` }] },
    config: { imageConfig: { aspectRatio: "16:9" } },
  });

  const candidate = response.candidates?.[0];
  if (!candidate) throw new Error("이미지 생성 결과를 받지 못했습니다.");

  for (const part of candidate.content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("응답에서 이미지 데이터를 찾을 수 없습니다.");
};
