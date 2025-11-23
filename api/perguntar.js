export default async function handler(req, res) {
  const { pergunta, atividades } = req.body;

  if (!pergunta || !atividades) {
    return res.status(400).json({ erro: "Pergunta e atividades são obrigatórios" });
  }

  try {
    const { perguntarGemini } = await import("../back-end/app.js");
    const resposta = await perguntarGemini(pergunta, atividades);
    res.status(200).json({ resposta });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: err.message });
  }
}