import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import roomRoutes from "./routes/rooms.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// IMPORTANTE: Obter URL do Render dinamicamente
const renderUrl = process.env.RENDER_EXTERNAL_URL || "http://localhost:3000";

// CORS para produção
app.use(cors({
  origin: [
    renderUrl,
    "http://localhost:3000",
    "http://localhost:5500",
    "http://127.0.0.1:5500"
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Conectar MongoDB
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI, { 
  dbName: "amigo_oculto",
  serverSelectionTimeoutMS: 10000
})
  .then(() => console.log("✅ MongoDB conectado"))
  .catch(err => console.error("❌ Erro MongoDB:", err.message));

// Rotas da API
app.use("/api/rooms", roomRoutes); // ⬅️ Mude para /api/rooms

// Rota de saúde
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    renderUrl: renderUrl,
    mongo: mongoose.connection.readyState === 1 ? "connected" : "disconnected"
  });
});

// Rota raiz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Para todas as outras rotas, servir o frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/debug", async (req, res) => {
  try {
    const Room = (await import("./models/Room.js")).default;
    
    // Contar todas as salas (incluindo sorteadas)
    const totalRooms = await Room.countDocuments({});
    
    // Buscar algumas salas como exemplo
    const sampleRooms = await Room.find({}).limit(5).select("name drawn participants");
    
    res.json({
      status: "debug",
      mongoConnected: mongoose.connection.readyState === 1,
      totalRooms: totalRooms,
      sampleRooms: sampleRooms,
      queryUsed: { drawn: false },
      database: mongoose.connection.db?.databaseName,
      collections: await mongoose.connection.db?.listCollections().toArray()
    });
    
  } catch (error) {
    res.json({
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("=".repeat(50));
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌐 URL: ${renderUrl}`);
  console.log(`🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log("=".repeat(50));
});