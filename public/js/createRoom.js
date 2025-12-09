async function createRoom() {
  const name = document.getElementById('name').value.trim();
  const roomPassword = document.getElementById('roomPassword').value;
  const adminPassword = document.getElementById('adminPassword').value;
  const messageDiv = document.getElementById('message');
  
  // Reset mensagem
  messageDiv.style.display = 'none';
  
  // Validação
  if (!name || !roomPassword || !adminPassword) {
    showMessage('Por favor, preencha todos os campos.', 'error');
    return;
  }
  
  if (roomPassword.length < 4) {
    showMessage('A senha da sala deve ter pelo menos 4 caracteres.', 'error');
    return;
  }
  
  try {
    // Mostrar loading
    const createBtn = document.querySelector('button[onclick="createRoom()"]');
    const originalText = createBtn.innerHTML;
    createBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando...';
    createBtn.disabled = true;
    
    // Enviar requisição
    const res = await api.post('/rooms', {
      name,
      roomPassword,
      adminPassword
    });
    
    showMessage(`✅ Sala "${name}" criada com sucesso! Redirecionando...`, 'success');
    
    // Redirecionar para a sala após 2 segundos
    setTimeout(() => {
      window.location.href = `room.html?id=${res._id}`;
    }, 2000);
    
  } catch (error) {
    showMessage(`❌ Erro: ${error.error || error.message}`, 'error');
    
    // Restaurar botão
    const createBtn = document.querySelector('button[onclick="createRoom()"]');
    createBtn.innerHTML = originalText;
    createBtn.disabled = false;
  }
}

function showMessage(text, type) {
  const messageDiv = document.getElementById('message');
  messageDiv.textContent = text;
  messageDiv.className = `message ${type}`;
  messageDiv.style.display = 'block';
  
  // Rolar para a mensagem
  messageDiv.scrollIntoView({ behavior: 'smooth' });
}

// Permitir Enter para enviar
document.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') {
    createRoom();
  }
});