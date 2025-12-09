import express from "express";
import Room from "../models/Room.js";
import { sendEmail, sendSummaryToAdmin } from "../services/email.js";

const router = express.Router();

// Rota GET para listar salas disponíveis
router.get("/", async (req, res) => {
  try {
    console.log("📋 Listando salas disponíveis...");
    const rooms = await Room.find({ drawn: false }).select("name participants");
    
    // Formatar resposta
    const formattedRooms = rooms.map(room => ({
      _id: room._id,
      name: room.name,
      participantCount: room.participants.length,
      status: room.drawn ? "Sorteado" : "Aguardando"
    }));
    
    console.log(`✅ ${formattedRooms.length} salas encontradas`);
    res.json(formattedRooms);
    
  } catch (err) {
    console.error("❌ Erro ao listar salas:", err);
    res.status(500).json({ error: "Erro ao carregar salas" });
  }
});

// Rota para criar nova sala
router.post("/", async (req, res) => {
  try {
    console.log("🆕 Criando nova sala...");
    
    const { name, roomPassword, adminPassword } = req.body;
    
    // Validações básicas
    if (!name || !roomPassword || !adminPassword) {
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }
    
    if (roomPassword.length < 4) {
      return res.status(400).json({ error: "A senha da sala deve ter pelo menos 4 caracteres" });
    }
    
    // Criar sala
    const room = await Room.create({
      name: name.trim(),
      roomPassword,
      adminPassword,
      participants: [],
      drawn: false,
      createdAt: new Date()
    });
    
    console.log(`✅ Sala criada: ${room.name} (ID: ${room._id})`);
    
    res.json({
      success: true,
      message: "Sala criada com sucesso!",
      room: {
        _id: room._id,
        name: room.name,
        createdAt: room.createdAt
      }
    });
    
  } catch (err) {
    console.error("❌ Erro ao criar sala:", err);
    
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: "Dados inválidos para criar sala" });
    }
    
    res.status(500).json({ error: "Erro interno ao criar sala" });
  }
});

// Rota para obter informações da sala com participantes
router.get("/:id/participants", async (req, res) => {
  try {
    console.log(`📡 Buscando participantes da sala: ${req.params.id}`);
    
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      console.log(`❌ Sala ${req.params.id} não encontrada`);
      return res.status(404).json({ error: "Sala não encontrada" });
    }
    
    console.log(`✅ Sala encontrada: ${room.name}, ${room.participants.length} participantes`);
    
    // Retornar informações da sala
    res.json({
      success: true,
      roomId: room._id,
      roomName: room.name,
     // participants: room.participants,
     participants: room.participants.map(p => ({
    name: p.name,  // ⬅️ SÓ O NOME
    friend: p.friend || "",  // ⬅️ Amigo oculto (se já sorteado)
    // NÃO incluir email aqui!
      })),
      count: room.participants.length,
      drawn: room.drawn || false,
      drawnAt: room.drawnAt,
      createdAt: room.createdAt
    });
    
  } catch (err) {
    console.error("❌ Erro ao buscar participantes:", err);
    res.status(500).json({ 
      error: "Erro ao buscar informações da sala"
    });
  }
});

// Rota para entrar na sala
router.post("/:id/join", async (req, res) => {
  try {
    console.log(`🎯 Recebendo solicitação para entrar na sala: ${req.params.id}`);
    console.log(`👤 Dados: ${req.body.name}, ${req.body.email}`);
    
    const { name, email, password } = req.body;
    
    // Validações básicas
    if (!name || !email || !password) {
      console.log("❌ Campos obrigatórios faltando");
      return res.status(400).json({ error: "Todos os campos são obrigatórios" });
    }
    
    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log(`❌ Email inválido: ${email}`);
      return res.status(400).json({ error: "Email inválido" });
    }
    
    // Buscar sala
    const room = await Room.findById(req.params.id);
    if (!room) {
      console.log(`❌ Sala ${req.params.id} não encontrada`);
      return res.status(404).json({ error: "Sala não encontrada" });
    }
    
    console.log(`✅ Sala encontrada: ${room.name}`);
    
    // Verificar se a sala já foi sorteada
    if (room.drawn) {
      console.log(`❌ Sala ${room.name} já foi sorteada`);
      return res.status(400).json({ error: "Esta sala já realizou o sorteio. Não é possível entrar." });
    }
    
    // Verificar senha da sala
    if (room.roomPassword !== password) {
      console.log(`❌ Senha incorreta para sala ${room.name}`);
      return res.status(401).json({ error: "Senha da sala incorreta" });
    }
    
    // Verificar se email já está na sala
    const emailExists = room.participants.some(p => p.email.toLowerCase() === email.toLowerCase());
    if (emailExists) {
      console.log(`❌ Email ${email} já está cadastrado na sala`);
      return res.status(400).json({ error: "Este email já está cadastrado nesta sala" });
    }
    
    // Verificar limite de participantes
    const MAX_PARTICIPANTS = 50;
    if (room.participants.length >= MAX_PARTICIPANTS) {
      console.log(`❌ Sala ${room.name} atingiu o limite de ${MAX_PARTICIPANTS} participantes`);
      return res.status(400).json({ error: `Esta sala atingiu o limite máximo de ${MAX_PARTICIPANTS} participantes` });
    }
    
    // Adicionar participante com timestamp
    const newParticipant = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      friend: "",
      joinedAt: new Date()
    };
    
    room.participants.push(newParticipant);
    await room.save();
    
    console.log(`✅ ${name} (${email}) entrou na sala ${room.name}`);
    console.log(`📊 Total de participantes: ${room.participants.length}`);
    
    // Responder com informações completas
    res.json({ 
      success: true,
      message: "Você entrou na sala com sucesso!",
      data: {
        roomId: room._id,
        roomName: room.name,
        participantName: name,
       // participantEmail: email,
        participantCount: room.participants.length,
        participantPosition: room.participants.length
      }
    });
    
  } catch (err) {
    console.error("💥 ERRO CRÍTICO na rota /join:", err);
    
    // Tratamento de erros específicos
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "ID da sala inválido" });
    }
    
    res.status(500).json({ 
      error: "Erro interno ao processar sua solicitação"
    });
  }
});

// Rota para realizar sorteio
router.post("/:id/draw", async (req, res) => {
  try {
    const { adminPassword, adminEmail } = req.body;
    const room = await Room.findById(req.params.id);
    
    if (!room) {
      return res.status(404).json({ error: "Sala não existe" });
    }
    
    if (room.adminPassword !== adminPassword) {
      return res.status(401).json({ error: "Senha admin incorreta" });
    }

    // Verificar número mínimo de participantes
    if (room.participants.length < 2) {
      return res.status(400).json({ 
        error: "Mínimo de 2 participantes necessário para o sorteio" 
      });
    }

    const people = room.participants.map(p => p.name);
    let shuffled = [...people].sort(() => Math.random() - 0.5);

    // Evitar que alguém tire a si mesmo
    for (let i = 0; i < people.length; i++) {
      if (people[i] === shuffled[i]) {
        shuffled = [...people].sort(() => Math.random() - 0.5);
        i = -1;
      }
    }

    // Atribuir amigos ocultos
    for (let i = 0; i < room.participants.length; i++) {
      room.participants[i].friend = shuffled[i];
    }

    console.log("🎲 Sorteio realizado:");
    room.participants.forEach((p, i) => {
      console.log(`${p.name} → ${p.friend}`);
    });

    // 1. Enviar emails individuais para participantes
    console.log("📧 Enviando emails para participantes...");
    const emailPromises = room.participants.map(async (p) => {
      try {
        await sendEmail(p.email, p.name, p.friend, room.name);
        console.log(`✅ Email enviado para: ${p.email}`);
        return { success: true, email: p.email };
      } catch (error) {
        console.error(`❌ Erro ao enviar para ${p.email}:`, error.message);
        return { success: false, email: p.email, error: error.message };
      }
    });

    // 2. Enviar email de resumo para o administrador (se tiver email)
    let summaryResult = null;
    if (adminEmail && adminEmail.includes('@')) {
      console.log(`📋 Enviando relatório para admin: ${adminEmail}`);
      try {
        summaryResult = await sendSummaryToAdmin(adminEmail, room.name, room.participants);
        console.log(`✅ Relatório enviado para admin!`);
      } catch (summaryError) {
        console.error(`⚠️ Erro ao enviar relatório:`, summaryError.message);
        summaryResult = { success: false, error: summaryError.message };
      }
    } else {
      console.log("ℹ️ Nenhum email de admin fornecido para relatório");
    }

    // Aguardar todos os emails
    const emailResults = await Promise.all(emailPromises);
    
    const successfulEmails = emailResults.filter(r => r.success).length;
    const failedEmails = emailResults.filter(r => !r.success);

    // Marcar sala como sorteada
    room.drawn = true;
    room.drawnAt = new Date();
    await room.save();
    console.log("✅ Sala marcada como sorteada");

    // Apagar sala após 30 segundos
    setTimeout(() => {
      console.log("🗑️ Removendo sala...");
      Room.findByIdAndDelete(room._id)
        .then(() => console.log("✅ Sala removida"))
        .catch(err => console.error("❌ Erro ao remover sala:", err));
    }, 30000);

    // Responder com detalhes
    res.json({
      success: true,
      message: `Sorteio realizado! ${successfulEmails} emails enviados.`,
      details: {
        roomName: room.name,
        participantsCount: room.participants.length,
        emailsSent: successfulEmails,
        emailsFailed: failedEmails.length,
        summarySent: summaryResult?.success || false,
        summaryTo: adminEmail,
        failures: failedEmails.map(f => ({
          email: f.email,
          error: f.error
        }))
      }
    });

  } catch (err) {
    console.error("💥 ERRO CRÍTICO NO SORTEIO:", err);
    res.status(500).json({ 
      error: "Erro interno no sorteio",
      details: err.message 
    });
  }
});

export default router;