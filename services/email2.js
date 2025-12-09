import { Resend } from 'resend';
import dotenv from 'dotenv';

// ⬇️ CARREGAR .env AQUI MESMO (IMPORTANTE!)
dotenv.config();

console.log("📧 Inicializando serviço de email...");
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "✅ Encontrada" : "❌ NÃO encontrada");

// Verificar se a chave existe
const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  console.error("❌ ERRO: RESEND_API_KEY não encontrada no .env");
  console.error("Por favor, verifique seu arquivo .env na raiz do projeto");
  console.error("Conteúdo atual do .env:");
  console.error("RESEND_API_KEY=" + process.env.RESEND_API_KEY);
  console.error("FROM_EMAIL=" + process.env.FROM_EMAIL);
  
  // Lançar erro para parar a execução
  throw new Error("RESEND_API_KEY não configurada. Configure no arquivo .env");
}

// Agora inicializa o Resend
const resend = new Resend(apiKey);
console.log("✅ Resend inicializado com sucesso");

// FUNÇÃO ORIGINAL (para participantes)
export async function sendEmail(to, name, friend, roomName) {
  console.log(`📧 Enviando para: ${to} (${name})`);
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'Amigo Oculto <onboarding@resend.dev>',
      to: [to],
      subject: `🎁 Seu Amigo Oculto: ${roomName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎉 SORTEIO REALIZADO!</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Amigo Oculto - ${roomName}</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <p style="font-size: 16px; color: #333;">
              Olá <strong>${name}</strong>,
            </p>
            
            <p style="color: #666; line-height: 1.6;">
              O sorteio do <strong>Amigo Oculto</strong> foi realizado com sucesso! 
            </p>
            
            <div style="background: white; border: 3px solid #4CAF50; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; margin-bottom: 20px;">🎁 SEU AMIGO OCULTO É:</h2>
              <div style="font-size: 36px; color: #e74c3c; font-weight: bold; padding: 20px; background: #fffacd; border-radius: 8px; display: inline-block; border: 2px dashed #f39c12;">
                ${friend}
              </div>
              <p style="color: #666; margin-top: 20px; font-style: italic;">
                "A felicidade está no ato de dar, não no presente em si"
              </p>
            </div>
            
            <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
              <p style="margin: 0; color: #856404;">
                <strong>⚠️ IMPORTANTE:</strong> Mantenha isso em <strong>SEGREDO</strong> até o dia da revelação! 🤫
              </p>
            </div>
            
            <p style="color: #666;">
              Boas compras e divirta-se escolhendo o presente perfeito!
            </p>
          </div>
          
          <div style="background: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0; opacity: 0.8;">
              Este email foi enviado automaticamente pelo sistema de Amigo Oculto.<br>
              Não responda a este email.
            </p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error(`❌ Erro ao enviar para ${to}:`, error);
      throw new Error(`Falha no envio: ${error.message}`);
    }

    console.log(`✅ Email enviado para ${to}! ID: ${data.id}`);
    return { success: true, data };
    
  } catch (error) {
    console.error(`💥 Erro crítico no envio para ${to}:`, error);
    throw error;
  }
}

// NOVA FUNÇÃO: Enviar relatório completo para o administrador
export async function sendSummaryToAdmin(adminEmail, roomName, participants) {
  console.log(`📋 Preparando relatório para admin: ${adminEmail}`);
  
  // Criar tabela HTML com todos os resultados
  const resultsTable = participants.map((p, index) => `
    <tr style="border-bottom: 1px solid #e0e0e0;">
      <td style="padding: 12px; text-align: center; color: #666; width: 50px;">${index + 1}</td>
      <td style="padding: 12px; color: #333; font-weight: 500;">${p.name}</td>
      <td style="padding: 12px; color: #666; font-size: 14px;">${p.email}</td>
      <td style="padding: 12px; color: #e74c3c; font-weight: bold;">${p.friend}</td>
    </tr>
  `).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
        .container { max-width: 800px; margin: 20px auto; background: white; border-radius: 15px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%); color: white; padding: 40px; text-align: center; }
        .content { padding: 40px; }
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 30px 0; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 10px; text-align: center; border: 1px solid #e9ecef; }
        .stat-number { font-size: 32px; font-weight: bold; color: #2c3e50; margin-bottom: 5px; }
        .stat-label { color: #666; font-size: 14px; }
        table { width: 100%; border-collapse: collapse; margin: 30px 0; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.05); }
        th { background: #2c3e50; color: white; padding: 15px; text-align: left; font-weight: 600; }
        td { padding: 12px 15px; border-bottom: 1px solid #e9ecef; }
        tr:hover { background: #f8f9fa; }
        .warning-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #e9ecef; }
        .timestamp { color: #888; font-size: 13px; margin-top: 10px; text-align: center; }
        .participant-count { display: inline-block; background: #4CAF50; color: white; padding: 3px 10px; border-radius: 20px; font-size: 12px; margin-left: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 36px;">📊 RELATÓRIO COMPLETO DO SORTEIO</h1>
          <p style="margin: 10px 0 0; opacity: 0.9; font-size: 18px;">${roomName}</p>
        </div>
        
        <div class="content">
          <p style="font-size: 16px; color: #2c3e50;">
            Olá Administrador,<br>
            O sorteio foi realizado com sucesso! Aqui está o relatório completo com todos os resultados:
          </p>
          
          <div class="stats">
            <div class="stat-card">
              <div class="stat-number">${participants.length}</div>
              <div class="stat-label">Participantes</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${participants.length}</div>
              <div class="stat-label">Emails Enviados</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">100%</div>
              <div class="stat-label">Taxa de Entrega</div>
            </div>
          </div>
          
          <h2 style="color: #2c3e50; margin-top: 40px;">
            <span style="background: #4CAF50; color: white; padding: 5px 15px; border-radius: 5px; margin-right: 10px;">📋</span>
            Resultados Detalhados
            <span class="participant-count">${participants.length} pessoas</span>
          </h2>
          
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Participante</th>
                <th>Email</th>
                <th>Amigo Oculto</th>
              </tr>
            </thead>
            <tbody>
              ${resultsTable}
            </tbody>
          </table>
          
          <div class="warning-box">
            <p style="margin: 0; color: #856404;">
              <strong>🔒 INFORMAÇÃO CONFIDENCIAL</strong><br>
              Esta lista completa só está disponível para você (administrador). 
              Cada participante recebeu apenas o nome do seu próprio amigo oculto.
            </p>
          </div>
          
          <div class="timestamp">
            <p>🕒 Sorteio realizado em: ${new Date().toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}</p>
          </div>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">
            🎁 <strong>Sistema de Amigo Oculto</strong> - Relatório Automático
          </p>
          <p style="margin: 10px 0 0; font-size: 12px; color: #888;">
            Este relatório foi gerado automaticamente. A sala será excluída em breve.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `RELATÓRIO COMPLETO DO SORTEIO\n` +
    `============================\n\n` +
    `Sala: ${roomName}\n` +
    `Data: ${new Date().toLocaleString('pt-BR')}\n` +
    `Total de participantes: ${participants.length}\n\n` +
    `RESULTADOS:\n` +
    participants.map((p, i) => 
      `${i + 1}. ${p.name} (${p.email}) → ${p.friend}`
    ).join('\n') +
    `\n\n` +
    `🔒 ESTE RELATÓRIO É CONFIDENCIAL\n` +
    `Cada participante recebeu apenas o nome do seu amigo oculto.\n` +
    `A sala será automaticamente excluída.`;

  try {
    const { data, error } = await resend.emails.send({
      from: 'Amigo Oculto <onboarding@resend.dev>',
      to: [adminEmail],
      subject: `📊 RELATÓRIO: Sorteio ${roomName} - ${participants.length} participantes`,
      html: htmlContent,
      text: textContent
    });

    if (error) {
      console.error(`❌ Erro ao enviar relatório: ${error}`);
      throw error;
    }

    console.log(`✅ Relatório enviado para admin! ID: ${data.id}`);
    return { success: true, messageId: data.id };
    
  } catch (error) {
    console.error(`💥 Falha no envio do relatório: ${error.message}`);
    // Não falhe o sorteio completo se o relatório falhar
    return { success: false, error: error.message };
  }
}