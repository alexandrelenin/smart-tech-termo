
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini SDK with the API key from environment variables
const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const improveDescription = async (text: string, type: 'objective' | 'observations'): Promise<string> => {
  const ai = getAI();
  const prompt = type === 'objective' 
    ? `Melhore o seguinte objetivo de entrega de licenças de software para um tom mais formal e profissional em português brasileiro. Mantenha-o conciso: "${text}"`
    : `Melhore as seguintes observações de um relatório de entrega de licenças. Transforme anotações informais em um parágrafo profissional e estruturado em português brasileiro: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Access response.text directly (property, not a method)
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Erro ao processar com Gemini:", error);
    return text;
  }
};

export const generateSummary = async (items: any[]): Promise<string> => {
  const ai = getAI();
  // Fixed item mapping to match the LicenseItem interface fields
  const itemsText = items.map(i => `${i.quantity}x ${i.category} (Chave: ${i.key})`).join(', ');
  const prompt = `Gere uma breve conclusão formal em português para um relatório que está entregando as seguintes licenças: ${itemsText}. Fale sobre a importância da conformidade e uso correto.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    // Access response.text directly (property, not a method)
    return response.text?.trim() || "";
  } catch (error) {
    console.error("Erro ao gerar resumo:", error);
    return "";
  }
};
