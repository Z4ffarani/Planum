import express from "express";
import cors from "cors";
import { perguntarGemini } from "./api.js";

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/perguntar", async (req, res) => {
  const { pergunta, atividades } = req.body;
  if (!pergunta || !atividades) {
    return res.status(400).json({ erro: "Pergunta e atividades são obrigatórios" });
  }

  try {
    const resposta = await perguntarGemini(pergunta, atividades);
    res.json({ resposta });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));