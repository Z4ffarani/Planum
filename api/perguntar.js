import { perguntarGemini } from "../back-end/app.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const { pergunta, atividades } = req.body;
  if (!pergunta || !atividades) {
    return res.status(400).json({ erro: "Pergunta e atividades são obrigatórios" });
  }

  try {
    const resposta = await perguntarGemini(pergunta, atividades);
    res.status(200).json({ resposta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
}