import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares BÁSICOS
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ========== CONEXÃO MONGODB ==========
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
console.log("🔗 Tentando conectar ao MongoDB...");

if (mongoUri) {
  mongoose.connect(mongoUri, { 
    dbName: "amigo_oculto",
    serverSelectionTimeoutMS: 10000
  })
    .then(() => console.log("✅ MongoDB conectado com sucesso!"))
    .catch(err => {
      console.error("❌ Erro ao conectar MongoDB:", err.message);
      console.log("⚠️  Continuando sem MongoDB...");
    });
} else {
  console.log("⚠️  MONGO_URI não definida no .env");
}

// ========== ROTAS SIMPLES DE TESTE ==========

// Rota de saúde (IMPORTANTE para Render)
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "online",
    message: "API do Amigo Oculto está funcionando!",
    timestamp: new Date().toISOString(),
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    environment: process.env.NODE_ENV || "development"
  });
});

// Rota para debug do MongoDB
app.get("/api/debug", async (req, res) => {
  try {
    // Importa o modelo Room dinamicamente
    const Room = (await import("./models/Room.js")).default;
    
    const totalRooms = await Room.countDocuments({});
    const sampleRooms = await Room.find({}).limit(3);
    
    res.json({
      mongoConnected: mongoose.connection.readyState === 1,
      totalRooms: totalRooms,
      sampleRooms: sampleRooms,
      database: mongoose.connection.name
    });
  } catch (error) {
    res.json({
      error: error.message,
      mongoConnected: false
    });
  }
});

// ========== ROTAS DA APLICAÇÃO ==========

// Importar e usar rotas de rooms
import roomRoutes from "./routes/rooms.js";
app.use("/api/rooms", roomRoutes);

// Rota alternativa (compatibilidade)
app.get("/rooms", async (req, res) => {
  try {
    const Room = (await import("./models/Room.js")).default;
    const rooms = await Room.find({ drawn: false }).select("name");
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar salas" });
  }
});

// ========== ROTAS DO FRONTEND ==========

// Rota raiz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Páginas específicas
app.get("/create-room.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "create-room.html"));
});

app.get("/room.html", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "room.html"));
});

// Fallback para SPA
//app.get("*", (req, res) => {
//  res.sendFile(path.join(__dirname, "public", "index.html"));
//});
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ========== INICIAR SERVIDOR ==========
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(60));
  console.log(`🚀 Servidor iniciado na porta ${PORT}`);
  console.log(`🌐 Local: http://localhost:${PORT}`);
  console.log(`📡 Rotas disponíveis:`);
  console.log(`   • GET  /api/health`);
  console.log(`   • GET  /api/debug`);
  console.log(`   • GET  /api/rooms`);
  console.log(`   • POST /api/rooms`);
  console.log(`   • GET  /rooms (alternativa)`);
  console.log("=".repeat(60));
});