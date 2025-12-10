import SibApiV3Sdk from 'sib-api-v3-sdk';
import dotenv from 'dotenv';

dotenv.config();

console.log("📧 Inicializando serviço de email Brevo API...");

// CONFIGURAÇÕES - AGORA COM VARIÁVEIS DE AMBIENTE
const BREVO_API_KEY = process.env.BREVO_API_KEY || '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';
const SENDER_EMAIL = process.env.FROM_EMAIL || 'contatoshake@hotmail.com';
const SENDER_NAME = process.env.SENDER_NAME || 'Mago';

console.log("🔑 API Key Brevo:", BREVO_API_KEY ? "✅ Configurada" : "❌ Não configurada");
console.log("📧 Remetente:", `${SENDER_NAME} <${SENDER_EMAIL}>`);

// CONFIGURAÇÃO DA API
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = BREVO_API_KEY;
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// TESTE DE CONEXÃO (OPCIONAL, MAS ÚTIL)
async function testConnection() {
  try {
    const accountApi = new SibApiV3Sdk.AccountApi();
    await accountApi.getAccount();
    console.log("✅ Conexão Brevo API verificada!");
  } catch (error) {
    console.error("⚠️  Aviso na conexão Brevo:", error.message);
  }
}

// Executa teste em background
testConnection();

// FUNÇÃO: Enviar email para participantes
export async function sendEmail(to, name, friend, roomName) {
  console.log(`\n📧 [BREVO API] Preparando email para: ${name} <${to}>`);
  console.log(`   🎁 Amigo oculto: ${friend}`);
  console.log(`   🏠 Sala: ${roomName}`);
  
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
    sender: { 
      name: SENDER_NAME,
      email: SENDER_EMAIL
    },
    to: [{ 
      email: to, 
      name: name 
    }],
    subject: `🎁 ${name}, seu amigo oculto no grupo "${roomName}"`,
    htmlContent: `
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
    `,
    textContent: `SORTEIO DE AMIGO OCULTO CONCLUÍDO!\n\nOlá ${name}!\n\nO sorteio do grupo "${roomName}" foi realizado!\n\n🎁 SEU AMIGO OCULTO É: ${friend}\n\n⚠️ IMPORTANTE: Mantenha isso em SEGREDO até o dia da revelação!\n\nDivirta-se preparando o presente!\n\n---\nEmail automático do sistema de Amigo Oculto.`
  });

  try {
    console.log(`📤 Enviando via Brevo API...`);
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log(`✅ EMAIL ENVIADO COM SUCESSO!`);
    console.log(`   📫 Para: ${name} <${to}>`);
    console.log(`   🆔 ID Brevo: ${data.messageId}`);
    console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
    
    return { 
      success: true, 
      messageId: data.messageId,
      to: to
    };
    
  } catch (error) {
    console.error(`❌ ERRO BREVO API ao enviar para ${to}:`);
    console.error(`   💥 ${error.message}`);
    
    if (error.response && error.response.text) {
      try {
        const errorBody = JSON.parse(error.response.text);
        console.error(`   🔍 Código: ${errorBody.code || 'N/A'}`);
        console.error(`   🔍 Mensagem: ${errorBody.message || 'N/A'}`);
      } catch (e) {
        console.error(`   🔍 Resposta: ${error.response.text}`);
      }
    }
    
    throw new Error(`Falha no envio para ${name}: ${error.message}`);
  }
}

// FUNÇÃO: Enviar relatório para administrador
export async function sendSummaryToAdmin(adminEmail, roomName, participants) {
  console.log(`\n📋 [BREVO API] Preparando relatório para admin: ${adminEmail}`);
  console.log(`   🏠 Sala: ${roomName}`);
  console.log(`   👥 Participantes: ${participants.length}`);
  
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
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 800px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
        .header { background: #2c3e50; color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th { background: #34495e; color: white; padding: 15px; text-align: left; }
        td { padding: 12px 15px; border-bottom: 1px solid #eee; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 28px;">📊 RELATÓRIO DO SORTEIO</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">${roomName}</p>
        </div>
        
        <div class="content">
          <p>Olá Administrador,</p>
          <p>O sorteio foi realizado com sucesso! Aqui está o relatório completo:</p>
          
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
          
          <p><strong>Total de participantes:</strong> ${participants.length}</p>
          <p><strong>Data do sorteio:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          
          <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ffc107;">
            <p style="margin: 0; color: #856404;">
              <strong>🔒 Informação confidencial:</strong> Esta lista completa só está disponível para você.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p style="margin: 0;">🎁 Sistema de Amigo Oculto - Relatório Automático</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail({
    sender: { 
      name: SENDER_NAME,
      email: SENDER_EMAIL
    },
    to: [{ email: adminEmail }],
    subject: `📊 RELATÓRIO: Sorteio ${roomName} - ${participants.length} participantes`,
    htmlContent: htmlContent,
    textContent: `RELATÓRIO DO SORTEIO\n\nSala: ${roomName}\nData: ${new Date().toLocaleString('pt-BR')}\n\n${participants.map((p, i) => `${i+1}. ${p.name} (${p.email}) → ${p.friend}`).join('\n')}`
  });

  try {
    console.log(`📤 Enviando relatório via API...`);
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log(`✅ RELATÓRIO ENVIADO!`);
    console.log(`   📫 Para: ${adminEmail}`);
    console.log(`   🆔 ID Brevo: ${data.messageId}`);
    
    return { 
      success: true, 
      messageId: data.messageId
    };
    
  } catch (error) {
    console.error(`❌ ERRO no relatório: ${error.message}`);
    
    if (error.response && error.response.text) {
      try {
        const errorBody = JSON.parse(error.response.text);
        console.error(`   🔍 Código: ${errorBody.code || 'N/A'}`);
      } catch (e) {
        console.error(`   🔍 Resposta: ${error.response.text}`);
      }
    }
    
    return { 
      success: false, 
      error: error.message 
    };
  }
}
//import brevo from '@getbrevo/brevo';
//import dotenv from 'dotenv';
//
//dotenv.config();
//
//console.log("📧 Inicializando serviço de email Brevo API 2025...");
//
//// SUA API KEY DO BREVO (diferente do SMTP!)
//const BREVO_API_KEY = process.env.BREVO_API_KEY;
//
//console.log("🔑 API Key Brevo:", BREVO_API_KEY ? "✅ Configurada" : "❌ Não configurada");
//
//// Configuração do cliente API
//const defaultClient = brevo.ApiClient.instance;
//const apiKey = defaultClient.authentications['api-key'];
//apiKey.apiKey = BREVO_API_KEY;
//
//const apiInstance = new brevo.TransactionalEmailsApi();
//
//// Testar conexão ao iniciar
//async function testConnection() {
//  if (!BREVO_API_KEY) {
//    console.error("❌ API Key não configurada no .env");
//    console.log("💡 Obtenha em: Brevo Dashboard → SMTP/API → API Keys");
//    return;
//  }
//  
//  try {
//    const accountApi = new brevo.AccountApi();
//    const account = await accountApi.getAccount();
//    console.log("✅ Conexão Brevo API estabelecida!");
//    console.log(`   👤 Plano: ${account.plan[0].type}`);
//    console.log(`   📧 Email: ${account.email}`);
//  } catch (error) {
//    console.error("❌ Falha na conexão Brevo API:", error.message);
//    console.log("💡 Verifique se a API Key está correta");
//  }
//}
//
//testConnection();
//
//// FUNÇÃO: Enviar email para participantes
//export async function sendEmail(to, name, friend, roomName) {
//  console.log(`\n📧 [BREVO API] Preparando email para: ${name} <${to}>`);
//  console.log(`   🎁 Amigo oculto: ${friend}`);
//  console.log(`   🏠 Sala: ${roomName}`);
//  
//  const sendSmtpEmail = new brevo.SendSmtpEmail({
//    to: [{ 
//      email: to, 
//      name: name 
//    }],
//    subject: `🎁 ${name}, seu amigo oculto no grupo "${roomName}"`,
//    htmlContent: `
//      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
//        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
//          <h1 style="margin: 0; font-size: 28px;">🎉 SORTEIO REALIZADO!</h1>
//          <p style="margin: 10px 0 0; opacity: 0.9;">Amigo Oculto - ${roomName}</p>
//        </div>
//        
//        <div style="padding: 30px; background: #f9f9f9;">
//          <p style="font-size: 16px; color: #333;">
//            Olá <strong>${name}</strong>,
//          </p>
//          
//          <p style="color: #666; line-height: 1.6;">
//            O sorteio do <strong>Amigo Oculto</strong> foi realizado com sucesso! 
//          </p>
//          
//          <div style="background: white; border: 3px solid #4CAF50; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
//            <h2 style="color: #333; margin-top: 0; margin-bottom: 20px;">🎁 SEU AMIGO OCULTO É:</h2>
//            <div style="font-size: 36px; color: #e74c3c; font-weight: bold; padding: 20px; background: #fffacd; border-radius: 8px; display: inline-block; border: 2px dashed #f39c12;">
//              ${friend}
//            </div>
//            <p style="color: #666; margin-top: 20px; font-style: italic;">
//              "A felicidade está no ato de dar, não no presente em si"
//            </p>
//          </div>
//          
//          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
//            <p style="margin: 0; color: #856404;">
//              <strong>⚠️ IMPORTANTE:</strong> Mantenha isso em <strong>SEGREDO</strong> até o dia da revelação! 🤫
//            </p>
//          </div>
//          
//          <p style="color: #666;">
//            Boas compras e divirta-se escolhendo o presente perfeito!
//          </p>
//        </div>
//        
//        <div style="background: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 12px;">
//          <p style="margin: 0; opacity: 0.8;">
//            Este email foi enviado automaticamente pelo sistema de Amigo Oculto.<br>
//            Não responda a este email.
//          </p>
//        </div>
//      </div>
//    `,
//    sender: { 
//      email: process.env.FROM_EMAIL || 'contatoshake@hotmail.com', 
//      name: '🎁 Amigo Oculto' 
//    },
//    textContent: `SORTEIO DE AMIGO OCULTO CONCLUÍDO!\n\nOlá ${name}!\n\nO sorteio do grupo "${roomName}" foi realizado!\n\n🎁 SEU AMIGO OCULTO É: ${friend}\n\n⚠️ IMPORTANTE: Mantenha isso em SEGREDO até o dia da revelação!\n\nDivirta-se preparando o presente!\n\n---\nEmail automático do sistema de Amigo Oculto.`
//  });
//
//  try {
//    console.log(`📤 Enviando via Brevo API...`);
//    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
//    
//    console.log(`✅ EMAIL ENVIADO COM SUCESSO!`);
//    console.log(`   📫 Para: ${name} <${to}>`);
//    console.log(`   🆔 ID Brevo: ${data.messageId}`);
//    console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
//    
//    return { 
//      success: true, 
//      messageId: data.messageId,
//      to: to
//    };
//    
//  } catch (error) {
//    console.error(`❌ ERRO BREVO API ao enviar para ${to}:`);
//    console.error(`   💥 ${error.message}`);
//    console.error(`   🔍 Status: ${error.status || 'N/A'}`);
//    
//    throw new Error(`Falha no envio para ${name}: ${error.message}`);
//  }
//}
//
//// FUNÇÃO: Enviar relatório para administrador
//export async function sendSummaryToAdmin(adminEmail, roomName, participants) {
//  console.log(`\n📋 [BREVO API] Preparando relatório para admin: ${adminEmail}`);
//  console.log(`   🏠 Sala: ${roomName}`);
//  console.log(`   👥 Participantes: ${participants.length}`);
//  
//  // Criar tabela HTML
//  const resultsTable = participants.map((p, index) => `
//    <tr style="border-bottom: 1px solid #e0e0e0;">
//      <td style="padding: 12px; text-align: center; color: #666; width: 50px;">${index + 1}</td>
//      <td style="padding: 12px; color: #333; font-weight: 500;">${p.name}</td>
//      <td style="padding: 12px; color: #666; font-size: 14px;">${p.email}</td>
//      <td style="padding: 12px; color: #e74c3c; font-weight: bold;">${p.friend}</td>
//    </tr>
//  `).join('');
//
//  const htmlContent = `
//    <!DOCTYPE html>
//    <html>
//    <head>
//      <meta charset="utf-8">
//      <style>
//        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
//        .container { max-width: 800px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
//        .header { background: #2c3e50; color: white; padding: 30px; text-align: center; }
//        .content { padding: 30px; }
//        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
//        th { background: #34495e; color: white; padding: 15px; text-align: left; }
//        td { padding: 12px 15px; border-bottom: 1px solid #eee; }
//        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
//      </style>
//    </head>
//    <body>
//      <div class="container">
//        <div class="header">
//          <h1 style="margin: 0; font-size: 28px;">📊 RELATÓRIO DO SORTEIO</h1>
//          <p style="margin: 10px 0 0; opacity: 0.9;">${roomName}</p>
//        </div>
//        
//        <div class="content">
//          <p>Olá Administrador,</p>
//          <p>O sorteio foi realizado com sucesso! Aqui está o relatório completo:</p>
//          
//          <table>
//            <thead>
//              <tr>
//                <th>#</th>
//                <th>Participante</th>
//                <th>Email</th>
//                <th>Amigo Oculto</th>
//              </tr>
//            </thead>
//            <tbody>
//              ${resultsTable}
//            </tbody>
//          </table>
//          
//          <p><strong>Total de participantes:</strong> ${participants.length}</p>
//          <p><strong>Data do sorteio:</strong> ${new Date().toLocaleString('pt-BR')}</p>
//          
//          <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ffc107;">
//            <p style="margin: 0; color: #856404;">
//              <strong>🔒 Informação confidencial:</strong> Esta lista completa só está disponível para você.
//            </p>
//          </div>
//        </div>
//        
//        <div class="footer">
//          <p style="margin: 0;">🎁 Sistema de Amigo Oculto - Relatório Automático</p>
//        </div>
//      </div>
//    </body>
//    </html>
//  `;
//
//  const sendSmtpEmail = new brevo.SendSmtpEmail({
//    to: [{ email: adminEmail }],
//    subject: `📊 RELATÓRIO: Sorteio ${roomName} - ${participants.length} participantes`,
//    htmlContent: htmlContent,
//    sender: { 
//      email: process.env.FROM_EMAIL || 'contatoshake@hotmail.com', 
//      name: '🎁 Amigo Oculto' 
//    },
//    textContent: `RELATÓRIO DO SORTEIO\n\nSala: ${roomName}\nData: ${new Date().toLocaleString('pt-BR')}\n\n${participants.map((p, i) => `${i+1}. ${p.name} (${p.email}) → ${p.friend}`).join('\n')}`
//  });
//
//  try {
//    console.log(`📤 Enviando relatório via API...`);
//    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
//    
//    console.log(`✅ RELATÓRIO ENVIADO!`);
//    console.log(`   📫 Para: ${adminEmail}`);
//    console.log(`   🆔 ID Brevo: ${data.messageId}`);
//    
//    return { 
//      success: true, 
//      messageId: data.messageId
//    };
//    
//  } catch (error) {
//    console.error(`❌ ERRO no relatório: ${error.message}`);
//    console.error(`   🔍 Status: ${error.status || 'N/A'}`);
//    return { 
//      success: false, 
//      error: error.message 
//    };
//  }
//}


//==========================================================================

//import nodemailer from 'nodemailer';
//import dotenv from 'dotenv';
//
//dotenv.config();
//
//console.log("📧 Inicializando serviço de email Brevo 2025...");
//
//// SUAS CREDENCIAIS BREVO (do que você encontrou)
//const BREVO_USER = process.env.BREVO_SMTP_USER || '9dae1a001@smtp-brevo.com';
//const BREVO_PASS = process.env.BREVO_SMTP_KEY || 'F2hmvRErdHCxwtPX';
//
//console.log("🔑 Usuário Brevo:", BREVO_USER);
//console.log("🔑 Senha Brevo:", BREVO_PASS ? "✅ Configurada" : "❌ Não configurada");
//
//// Configuração Brevo 2025
//const transporter = nodemailer.createTransport({
//  host: 'smtp-relay.brevo.com',
//  port: 587,
//  secure: false, // false para porta 587, true para 465
//  auth: {
//    user: BREVO_USER,
//    pass: BREVO_PASS
//  },
//  // Timeouts para evitar travamentos
//  connectionTimeout: 10000, // 10 segundos
//  greetingTimeout: 10000
//});
//
//// Testar conexão ao iniciar
//transporter.verify(function(error, success) {
//  if (error) {
//    console.error("❌ Falha na conexão Brevo:", error.message);
//    console.log("💡 Dica: Verifique se as portas 587/465 estão abertas no firewall");
//  } else {
//    console.log("✅ Conexão Brevo estabelecida! Pronto para enviar emails.");
//  }
//});
//
//// FUNÇÃO: Enviar email para participantes
//export async function sendEmail(to, name, friend, roomName) {
//  console.log(`\n📧 [BREVO] Preparando email para: ${name} <${to}>`);
//  console.log(`   🎁 Amigo oculto: ${friend}`);
//  console.log(`   🏠 Sala: ${roomName}`);
//  
//  const mailOptions = {
//    from: `"🎁 Amigo Oculto" <${process.env.FROM_EMAIL || 'contatoshake@hotmail.com'}>`,
//    to: to,
//    subject: `🎁 ${name}, seu amigo oculto no grupo "${roomName}"`,
//    html: `
//      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px; overflow: hidden;">
//        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
//          <h1 style="margin: 0; font-size: 28px;">🎉 SORTEIO REALIZADO!</h1>
//          <p style="margin: 10px 0 0; opacity: 0.9;">Amigo Oculto - ${roomName}</p>
//        </div>
//        
//        <div style="padding: 30px; background: #f9f9f9;">
//          <p style="font-size: 16px; color: #333;">
//            Olá <strong>${name}</strong>,
//          </p>
//          
//          <p style="color: #666; line-height: 1.6;">
//            O sorteio do <strong>Amigo Oculto</strong> foi realizado com sucesso! 
//          </p>
//          
//          <div style="background: white; border: 3px solid #4CAF50; border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
//            <h2 style="color: #333; margin-top: 0; margin-bottom: 20px;">🎁 SEU AMIGO OCULTO É:</h2>
//            <div style="font-size: 36px; color: #e74c3c; font-weight: bold; padding: 20px; background: #fffacd; border-radius: 8px; display: inline-block; border: 2px dashed #f39c12;">
//              ${friend}
//            </div>
//            <p style="color: #666; margin-top: 20px; font-style: italic;">
//              "A felicidade está no ato de dar, não no presente em si"
//            </p>
//          </div>
//          
//          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
//            <p style="margin: 0; color: #856404;">
//              <strong>⚠️ IMPORTANTE:</strong> Mantenha isso em <strong>SEGREDO</strong> até o dia da revelação! 🤫
//            </p>
//          </div>
//          
//          <p style="color: #666;">
//            Boas compras e divirta-se escolhendo o presente perfeito!
//          </p>
//        </div>
//        
//        <div style="background: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 12px;">
//          <p style="margin: 0; opacity: 0.8;">
//            Este email foi enviado automaticamente pelo sistema de Amigo Oculto.<br>
//            Não responda a este email.
//          </p>
//        </div>
//      </div>
//    `,
//    text: `SORTEIO DE AMIGO OCULTO CONCLUÍDO!\n\nOlá ${name}!\n\nO sorteio do grupo "${roomName}" foi realizado!\n\n🎁 SEU AMIGO OCULTO É: ${friend}\n\n⚠️ IMPORTANTE: Mantenha isso em SEGREDO até o dia da revelação!\n\nDivirta-se preparando o presente!\n\n---\nEmail automático do sistema de Amigo Oculto.`
//  };
//
//  try {
//    console.log(`📤 Enviando via Brevo...`);
//    const info = await transporter.sendMail(mailOptions);
//    
//    console.log(`✅ EMAIL ENVIADO COM SUCESSO!`);
//    console.log(`   📫 Para: ${name} <${to}>`);
//    console.log(`   🆔 ID Brevo: ${info.messageId}`);
//    console.log(`   ⏰ ${new Date().toLocaleTimeString()}`);
//    
//    return { 
//      success: true, 
//      messageId: info.messageId,
//      to: to
//    };
//    
//  } catch (error) {
//    console.error(`❌ ERRO BREVO ao enviar para ${to}:`);
//    console.error(`   💥 ${error.message}`);
//    console.error(`   🔍 Código: ${error.code || 'N/A'}`);
//    
//    throw new Error(`Falha no envio para ${name}: ${error.message}`);
//  }
//}
//
//// FUNÇÃO: Enviar relatório para administrador
//export async function sendSummaryToAdmin(adminEmail, roomName, participants) {
//  console.log(`\n📋 [BREVO] Preparando relatório para admin: ${adminEmail}`);
//  console.log(`   🏠 Sala: ${roomName}`);
//  console.log(`   👥 Participantes: ${participants.length}`);
//  
//  // Criar tabela HTML
//  const resultsTable = participants.map((p, index) => `
//    <tr style="border-bottom: 1px solid #e0e0e0;">
//      <td style="padding: 12px; text-align: center; color: #666; width: 50px;">${index + 1}</td>
//      <td style="padding: 12px; color: #333; font-weight: 500;">${p.name}</td>
//      <td style="padding: 12px; color: #666; font-size: 14px;">${p.email}</td>
//      <td style="padding: 12px; color: #e74c3c; font-weight: bold;">${p.friend}</td>
//    </tr>
//  `).join('');
//
//  const htmlContent = `
//    <!DOCTYPE html>
//    <html>
//    <head>
//      <meta charset="utf-8">
//      <style>
//        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
//        .container { max-width: 800px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
//        .header { background: #2c3e50; color: white; padding: 30px; text-align: center; }
//        .content { padding: 30px; }
//        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
//        th { background: #34495e; color: white; padding: 15px; text-align: left; }
//        td { padding: 12px 15px; border-bottom: 1px solid #eee; }
//        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
//      </style>
//    </head>
//    <body>
//      <div class="container">
//        <div class="header">
//          <h1 style="margin: 0; font-size: 28px;">📊 RELATÓRIO DO SORTEIO</h1>
//          <p style="margin: 10px 0 0; opacity: 0.9;">${roomName}</p>
//        </div>
//        
//        <div class="content">
//          <p>Olá Administrador,</p>
//          <p>O sorteio foi realizado com sucesso! Aqui está o relatório completo:</p>
//          
//          <table>
//            <thead>
//              <tr>
//                <th>#</th>
//                <th>Participante</th>
//                <th>Email</th>
//                <th>Amigo Oculto</th>
//              </tr>
//            </thead>
//            <tbody>
//              ${resultsTable}
//            </tbody>
//          </table>
//          
//          <p><strong>Total de participantes:</strong> ${participants.length}</p>
//          <p><strong>Data do sorteio:</strong> ${new Date().toLocaleString('pt-BR')}</p>
//          
//          <div style="background: #fff3cd; padding: 15px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #ffc107;">
//            <p style="margin: 0; color: #856404;">
//              <strong>🔒 Informação confidencial:</strong> Esta lista completa só está disponível para você.
//            </p>
//          </div>
//        </div>
//        
//        <div class="footer">
//          <p style="margin: 0;">🎁 Sistema de Amigo Oculto - Relatório Automático</p>
//        </div>
//      </div>
//    </body>
//    </html>
//  `;
//
//  const mailOptions = {
//    from: `"🎁 Amigo Oculto" <${process.env.FROM_EMAIL || 'contatoshake@hotmail.com'}>`,
//    to: adminEmail,
//    subject: `📊 RELATÓRIO: Sorteio ${roomName} - ${participants.length} participantes`,
//    html: htmlContent,
//    text: `RELATÓRIO DO SORTEIO\n\nSala: ${roomName}\nData: ${new Date().toLocaleString('pt-BR')}\n\n${participants.map((p, i) => `${i+1}. ${p.name} (${p.email}) → ${p.friend}`).join('\n')}`
//  };
//
//  try {
//    console.log(`📤 Enviando relatório...`);
//    const info = await transporter.sendMail(mailOptions);
//    
//    console.log(`✅ RELATÓRIO ENVIADO!`);
//    console.log(`   📫 Para: ${adminEmail}`);
//    console.log(`   🆔 ID Brevo: ${info.messageId}`);
//    
//    return { 
//      success: true, 
//      messageId: info.messageId
//    };
//    
//  } catch (error) {
//    console.error(`❌ ERRO no relatório: ${error.message}`);
//    return { 
//      success: false, 
//      error: error.message 
//    };
//  }
//}