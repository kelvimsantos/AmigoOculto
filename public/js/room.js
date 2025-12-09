const params = new URLSearchParams(window.location.search);
const roomId = params.get("id");

console.log("🎮 Room ID from URL:", roomId);

if (!roomId) {
  alert("❌ Sala inválida");
  window.location.href = "index.html";
}

// Elementos do DOM
let joinButton, drawButton;

// Função para mostrar mensagens
function showMessage(text, type = 'info') {
  const messageDiv = document.getElementById('message');
  messageDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${text}`;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  
  // Rolar suavemente para a mensagem
  setTimeout(() => {
    messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
  
  // Auto-esconder após 5 segundos (exceto para erros)
  if (type !== 'error') {
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }
}

// Função para esconder mensagem
function hideMessage() {
  document.getElementById('message').style.display = 'none';
}

// Validar email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Carregar informações da sala com participantes
async function loadRoomInfo() {
  try {
    console.log(`📡 Carregando informações da sala: ${roomId}`);
    
    // PRIMEIRO: Você precisa criar esta rota no backend!
    // GET /rooms/:id/participants
    const roomInfo = await api.get(`/rooms/${roomId}/participants`);
    
    console.log("✅ Informações da sala recebidas:", roomInfo);
    
    if (roomInfo && !roomInfo.error) {
      // Atualizar nome da sala
      if (roomInfo.roomName) {
        document.getElementById('roomName').textContent = roomInfo.roomName;
        document.title = `${roomInfo.roomName} - Amigo Oculto`;
      }
      
      // Atualizar status
      const statusElement = document.getElementById('roomStatus');
      if (statusElement) {
        if (roomInfo.drawn) {
          statusElement.textContent = "🎉 Sorteio realizado!";
          statusElement.style.color = "#4CAF50";
        } else {
          statusElement.textContent = `Aguardando participantes (${roomInfo.count || 0})`;
        }
      }
      
      // Atualizar contador de participantes
      updateParticipantCount(roomInfo.count || 0);
      
      // Atualizar lista de participantes
      updateParticipantsList(roomInfo.participants || []);
      
      // Se o sorteio já foi realizado, desabilitar tudo
      if (roomInfo.drawn) {
        disableAllInputs();
        showMessage("🎉 Esta sala já teve seu sorteio realizado! Os emails foram enviados.", 'info');
      }
    } else if (roomInfo && roomInfo.error) {
      console.error("❌ Erro ao carregar sala:", roomInfo.error);
      showMessage(`Erro: ${roomInfo.error}`, 'error');
    }
    
  } catch (error) {
    console.error("💥 Erro ao carregar informações da sala:", error);
    showMessage("Não foi possível carregar informações da sala.", 'error');
    
    // Mostrar ID da sala no título como fallback
    document.getElementById('roomName').textContent = `Sala ${roomId.substring(0, 8)}...`;
  }
}

// Atualizar contador de participantes
function updateParticipantCount(count) {
  const countElement = document.getElementById('participantCount');
  if (countElement) {
    countElement.textContent = count;
    countElement.className = count > 0 ? 'status pending' : 'status pending';
    
    // Emoji especial se tiver muitos participantes
    if (count >= 10) {
      countElement.textContent = `${count} 🎉`;
    } else if (count >= 5) {
      countElement.textContent = `${count} 👍`;
    }
  }
}

// Atualizar lista de participantes
function updateParticipantsList(participants) {
  const listElement = document.getElementById('participantsList');
  if (!listElement) return;
  
  if (!participants || participants.length === 0) {
    listElement.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #666;">
        <i class="fas fa-users" style="font-size: 24px; margin-bottom: 10px; display: block;"></i>
        <p>Nenhum participante ainda. Seja o primeiro!</p>
      </div>
    `;
    return;
  }
  
  // Gerar cores diferentes para cada avatar
  const getAvatarColor = (index) => {
    const hue = (index * 137) % 360; // Golden angle para distribuição
    return `hsl(${hue}, 70%, 65%)`;
  };
  
  listElement.innerHTML = participants.map((p, index) => `
    <div class="participant">
      <div class="participant-avatar" style="background: ${getAvatarColor(index)};">
        ${p.name.charAt(0).toUpperCase()}
      </div>
      <div class="participant-info">
        <h4>${p.name} ${index === 0 ? '👑' : ''}</h4>
        <p>${p.email}</p>
        <small style="color: #888; font-size: 11px;">
          ${p.friend ? `🎁 Amigo: ${p.friend}` : '⌛ Aguardando sorteio'}
        </small>
      </div>
      <div style="margin-left: auto; color: #888; font-size: 12px; padding: 0 10px;">
        #${index + 1}
      </div>
    </div>
  `).join('');
}

// Função para desabilitar todos os inputs quando sorteio já realizado
function disableAllInputs() {
  const elements = [
    'name', 'email', 'password', 'adminPassword', 'adminEmail',
    'joinButton', 'drawButton'
  ];
  
  elements.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.disabled = true;
      if (id.includes('Button')) {
        element.innerHTML = '<i class="fas fa-lock"></i> Sorteio Realizado';
        element.style.opacity = '0.6';
        element.style.cursor = 'not-allowed';
      }
    }
  });
  
  // Mostrar mensagem de sorteio realizado
  const drawInfo = document.getElementById('drawInfo');
  if (drawInfo) {
    drawInfo.innerHTML = `
      <p style="margin: 0; color: #155724; font-size: 14px;">
        <i class="fas fa-check-circle"></i> 
        <strong>Sorteio Realizado!</strong> Esta sala já completou seu ciclo.
      </p>
    `;
    drawInfo.style.display = 'block';
    drawInfo.style.background = '#d4edda';
    drawInfo.style.borderLeft = '4px solid #28a745';
  }
}

// Função para entrar na sala
async function joinRoom() {
  console.log("🎯 joinRoom chamada");
  
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  
  hideMessage();

  // Validação
  if (!name || !email || !password) {
    showMessage("Por favor, preencha todos os campos.", 'error');
    return;
  }

  if (!validateEmail(email)) {
    showMessage("Por favor, insira um email válido.", 'error');
    return;
  }

  try {
    // Mostrar loading no botão
    joinButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Entrando...';
    joinButton.disabled = true;
    
    console.log("📤 Enviando requisição para /join...");
    
    const res = await api.post(`/rooms/${roomId}/join`, {
      name,
      email,
      password
    });

    console.log("📥 Resposta do join:", res);

    if (res.error) {
      showMessage("❌ " + res.error, 'error');
    } else {
      showMessage("✅ Você entrou na sala com sucesso!", 'success');
      
      // Limpar campos
      document.getElementById("name").value = '';
      document.getElementById("email").value = '';
      document.getElementById("password").value = '';
      
      // Recarregar informações da sala após 1 segundo
      setTimeout(() => {
        loadRoomInfo();
      }, 1000);
    }
    
  } catch (error) {
    console.error("💥 Erro no joinRoom:", error);
    showMessage("❌ Erro ao entrar na sala. Tente novamente.", 'error');
  } finally {
    // Restaurar botão após 2 segundos
    setTimeout(() => {
      if (joinButton) {
        joinButton.innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar na Sala';
        joinButton.disabled = false;
      }
    }, 2000);
  }
}

// Função para realizar sorteio
async function draw() {
  console.log("🎲 draw chamada");
  
  const adminPassword = document.getElementById("adminPassword").value;
  const adminEmailInput = document.getElementById("adminEmail");
  let adminEmail = adminEmailInput ? adminEmailInput.value.trim() : "";
  
  hideMessage();

  // Validação básica
  if (!adminPassword) {
    showMessage("Por favor, informe a senha do administrador.", 'error');
    return;
  }

  // Se não tem email no campo, pedir via prompt
  if (!adminEmail) {
    adminEmail = prompt(
      "📧 Digite seu email para receber o relatório completo do sorteio:\n\n" +
      "(Este relatório terá a lista completa de quem tirou quem)",
      "seu-email@exemplo.com"
    );
    
    // Se cancelou o prompt
    if (adminEmail === null) {
      if (!confirm("⚠️  Você cancelou o email. Deseja continuar SEM receber o relatório?")) {
        return;
      }
      adminEmail = ""; // String vazia
    }
  }

  // Validar email se foi informado
  if (adminEmail && !validateEmail(adminEmail)) {
    showMessage("❌ Email inválido. Por favor, insira um email válido.", 'error');
    return;
  }

  // Mensagem de confirmação personalizada
  let confirmMessage = "🎲 CONFIRMAR REALIZAÇÃO DO SORTEIO?\n\n";
  
  if (adminEmail) {
    confirmMessage += "📋 Você receberá um relatório completo em:\n";
    confirmMessage += adminEmail + "\n\n";
  } else {
    confirmMessage += "⚠️  Você NÃO receberá o relatório completo\n";
    confirmMessage += "(Não informou email)\n\n";
  }
  
  confirmMessage += "Após confirmar:\n";
  confirmMessage += "• 📧 Emails serão enviados a todos os participantes\n";
  confirmMessage += "• 🗑️  A sala será excluída em 30 segundos\n";
  confirmMessage += "• 🔒 Os resultados serão finais e irreversíveis";
  
  if (!confirm(confirmMessage)) {
    console.log("Sorteio cancelado pelo usuário");
    return;
  }

  try {
    console.log("🔄 Iniciando sorteio...");
    console.log("Email para relatório:", adminEmail || "(não informado)");
    
    // Mostrar loading no botão
    drawButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sorteando...';
    drawButton.disabled = true;
    
    // Mostrar informações adicionais
    document.getElementById("drawInfo").style.display = 'block';
    
    // Enviar requisição
    const res = await api.post(`/rooms/${roomId}/draw`, {
      adminPassword,
      adminEmail: adminEmail || undefined
    });

    console.log("✅ Resposta do sorteio:", res);

    if (res.error) {
      showMessage("❌ Erro: " + res.error, 'error');
      return;
    }

    // Mensagem de sucesso detalhada
    let successMessage = "🎉 SORTEIO REALIZADO COM SUCESSO!<br><br>";
    
    // Usar os dados da nova estrutura de resposta
    if (res.details) {
      successMessage += `👥 ${res.details.participantsCount} participantes<br>`;
      successMessage += `📧 ${res.details.emailsSent} emails enviados<br>`;
      
      if (res.details.emailsFailed > 0) {
        successMessage += `<br>⚠️ ${res.details.emailsFailed} emails falharam no envio<br>`;
      }
      
      if (res.details.summarySent && res.details.summaryTo) {
        successMessage += `<br>📋 RELATÓRIO ENVIADO PARA:<br>${res.details.summaryTo}<br>`;
        successMessage += "(Verifique sua caixa de entrada e SPAM)<br>";
      }
    } else if (res.summarySentTo) {
      // Para compatibilidade com versão anterior
      successMessage += `<br>📋 Relatório enviado para: ${res.summarySentTo}<br>`;
    }
    
    successMessage += "<br>⏳ Você será redirecionado em 5 segundos...";
    
    // Mostrar alerta bonito
    showMessage(successMessage, 'success');
    
    // Desabilitar todos os botões e campos
    disableAllInputs();
    
    // Mostrar contagem regressiva no footer
    let countdown = 5;
    const footer = document.querySelector('.footer p:last-child');
    const originalFooterText = footer.textContent;
    
    const countdownInterval = setInterval(() => {
      footer.innerHTML = `<i class="fas fa-clock"></i> Redirecionando em ${countdown} segundos...`;
      countdown--;
      
      if (countdown < 0) {
        clearInterval(countdownInterval);
        window.location.href = "index.html";
      }
    }, 1000);

  } catch (error) {
    console.error("💥 Erro no sorteio:", error);
    showMessage("❌ Erro ao realizar sorteio. Tente novamente.", 'error');
    
    // Restaurar botão
    if (drawButton) {
      drawButton.innerHTML = '<i class="fas fa-random"></i> Realizar Sorteio';
      drawButton.disabled = false;
    }
  }
}

// Inicializar página
async function initPage() {
  console.log("🚀 Inicializando página da sala...");
  
  // Obter referências aos elementos
  joinButton = document.getElementById("joinButton");
  drawButton = document.getElementById("drawButton");
  
  // Verificar se os elementos existem
  if (!joinButton || !drawButton) {
    console.error("❌ Botões não encontrados no DOM");
    showMessage("Erro ao carregar página. Recarregue.", 'error');
    return;
  }
  
  console.log("✅ Elementos do DOM encontrados");
  
  // Adicionar event listeners
  joinButton.addEventListener("click", joinRoom);
  drawButton.addEventListener("click", draw);
  
  console.log("✅ Event listeners adicionados");
  
  // Mostrar ID da sala no footer
  const roomIdInfo = document.getElementById("roomIdInfo");
  if (roomIdInfo && roomId) {
    roomIdInfo.textContent = `ID da Sala: ${roomId}`;
  }
  
  // Permitir Enter nos campos
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (input.id === 'adminPassword' || input.id === 'adminEmail') {
          draw();
        } else {
          joinRoom();
        }
      }
    });
  });
  
  // Carregar informações da sala
  await loadRoomInfo();
  
  console.log("✅ Página inicializada com sucesso");
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', initPage);

// Adicionar funções ao objeto window para teste no console
window.joinRoom = joinRoom;
window.draw = draw;
window.showMessage = showMessage;
window.loadRoomInfo = loadRoomInfo; // Adicionei esta linha
window.roomId = roomId;