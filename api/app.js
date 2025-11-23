import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY,
});

/**
 * Pergunta ao Gemini usando o JSON de atividades.
 * Retorna o texto gerado de forma objetiva e polida.
 */
export async function perguntarGemini(pergunta, atividades) {
  const prompt = `
Você é o assistente Planum.
Responda APENAS perguntas relacionadas a calendários, atividades, horários,
prioridades, complexidade e organização.
Nunca trate assuntos fora disso.
Se a pergunta não for sobre atividades, responda:
"Posso ajudar apenas com dúvidas relacionadas ao calendário e às atividades."
Responda de forma objetiva, clara e resumida, evitando listas longas ou quebras desnecessárias.

As atividades atuais são:
${JSON.stringify(atividades)}

Pergunta do usuário:
${pergunta}

Forneça a resposta em um parágrafo coeso, sem formatar como JSON ou listas. 
Use frases completas, mas sucintas.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
    });

    return response?.text?.trim() || "Não consegui interpretar a pergunta.";
  } catch (erro) {
    console.error("Erro ao chamar Gemini:", erro);
    throw new Error("Erro ao tentar obter resposta do assistente.");
  }
}