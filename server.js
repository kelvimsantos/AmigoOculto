import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Carregar .env PRIMEIRO
dotenv.config();

console.log("🔍 Server.js - Variáveis de ambiente:");
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "✅ Encontrada" : "❌ NÃO encontrada");
console.log("FROM_EMAIL:", process.env.FROM_EMAIL || "❌ Não definido");
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ Encontrada" : "❌ NÃO encontrada");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.static("public"));
app.use(express.static(path.join(__dirname, "public")));

mongoose.connect(process.env.MONGO_URI, { dbName: "amigo_oculto" })
  .then(() => console.log("✅ MongoDB conectado"))
  .catch(err => console.error("❌ Erro MongoDB", err));

// Importar rotas DEPOIS de configurar tudo
import roomRoutes from "./routes/rooms.js";
app.use("/rooms", roomRoutes);

app.get("/health", (_, res) => {
  console.log("✅ Health check - Tudo OK");
  res.json({ 
    ok: true, 
    resend: !!process.env.RESEND_API_KEY,
    mongo: !!process.env.MONGO_URI 
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
});

export default app;