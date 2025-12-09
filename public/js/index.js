// public/js/index.js - Frontend para listar salas

async function loadRooms() {
  const roomsContainer = document.getElementById('rooms');
  
  try {
    console.log('📡 Carregando salas da API...');
    
    // Testa a conexão primeiro
    const health = await api.get("/health");
    console.log('✅ API conectada:', health);
    
    // Agora carrega as salas
    const rooms = await api.get("/rooms");
    console.log(`✅ ${rooms.length} salas carregadas`);
    
    if (rooms.length === 0) {
      roomsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <div style="font-size: 48px; color: #ddd; margin-bottom: 20px;">🏠</div>
          <h3 style="color: #666; margin-bottom: 10px;">Nenhuma sala disponível</h3>
          <p style="color: #999;">Seja o primeiro a criar uma sala!</p>
          <a href="create-room.html" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #667eea; color: white; border-radius: 8px; text-decoration: none;">
            <i class="fas fa-plus"></i> Criar Primeira Sala
          </a>
        </div>
      `;
      return;
    }
    
    roomsContainer.innerHTML = '';
    
    rooms.forEach(room => {
      const roomCard = document.createElement('div');
      roomCard.className = 'room-card';
      roomCard.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 20px;
        margin-bottom: 15px;
        border: 2px solid #f0f0f0;
        transition: all 0.3s;
        cursor: pointer;
      `;
      
      roomCard.onmouseover = function() {
        this.style.transform = 'translateY(-5px)';
        this.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        this.style.borderColor = '#667eea';
      };
      
      roomCard.onmouseout = function() {
        this.style.transform = 'translateY(0)';
        this.style.boxShadow = 'none';
        this.style.borderColor = '#f0f0f0';
      };
      
      roomCard.onclick = function() {
        window.location.href = `room.html?id=${room._id}`;
      };
      
      roomCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h3 style="color: #333; font-size: 18px; margin: 0;">
            <i class="fas fa-door-open" style="color: #667eea; margin-right: 10px;"></i>
            ${room.name || 'Sala sem nome'}
          </h3>
          <span style="background: #4CAF50; color: white; padding: 3px 10px; border-radius: 12px; font-size: 12px; font-weight: bold;">
            ${room.participantCount || 0} 👥
          </span>
        </div>
        <p style="color: #666; margin-bottom: 15px; font-size: 14px;">
          <i class="fas fa-hashtag" style="margin-right: 5px;"></i>
          ID: <code style="background: #f5f5f5; padding: 2px 6px; border-radius: 4px; font-size: 12px;">${room._id ? room._id.substring(0, 8) + '...' : 'N/A'}</code>
        </p>
        <p style="color: #888; font-size: 13px; margin-bottom: 15px;">
          <i class="fas fa-info-circle" style="margin-right: 5px;"></i>
          Clique para entrar na sala
        </p>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="color: #666; font-size: 12px;">
            <i class="fas fa-clock" style="margin-right: 3px;"></i>
            ${room.status === 'Sorteado' ? '🎉 Sorteio realizado' : '⏳ Aguardando sorteio'}
          </span>
          <button style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 600;
                  border: none; cursor: pointer; font-size: 14px;">
            <i class="fas fa-sign-in-alt"></i> Entrar
          </button>
        </div>
      `;
      
      roomsContainer.appendChild(roomCard);
    });
    
  } catch (error) {
    console.error('❌ Erro ao carregar salas:', error);
    
    let errorMessage = 'Erro ao carregar salas.';
    
    if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
      errorMessage = '❌ Não foi possível conectar ao servidor. Verifique:<br>' +
                    '1. Se o servidor está online<br>' +
                    '2. Sua conexão com a internet<br>' +
                    '3. URL atual: ' + window.location.origin;
    } else if (error.message.includes('404')) {
      errorMessage = '⚠️ Rota não encontrada. O servidor pode estar em manutenção.';
    }
    
    roomsContainer.innerHTML = `
      <div class="message error" style="text-align: center; padding: 30px;">
        <div style="font-size: 48px; color: #e74c3c; margin-bottom: 20px;">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 style="color: #c0392b; margin-bottom: 10px;">Erro de Conexão</h3>
        <p style="color: #666; margin-bottom: 20px;">${errorMessage}</p>
        <div style="display: flex; gap: 10px; justify-content: center;">
          <button onclick="location.reload()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
            <i class="fas fa-sync-alt"></i> Tentar Novamente
          </button>
          <button onclick="window.location.href='create-room.html'" style="padding: 10px 20px; background: #2ecc71; color: white; border: none; border-radius: 5px; cursor: pointer;">
            <i class="fas fa-plus"></i> Criar Sala
          </button>
        </div>
        <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px; font-size: 12px; color: #666;">
          <p style="margin: 0 0 5px 0;"><strong>Debug Info:</strong></p>
          <p style="margin: 0;">API URL: <code>${window.API_URL || 'Não definida'}</code></p>
          <p style="margin: 0;">Host: <code>${window.location.hostname}</code></p>
        </div>
      </div>
    `;
  }
}

// Carregar salas quando a página carregar
window.addEventListener('DOMContentLoaded', loadRooms);

// Atualizar a cada 30 segundos (opcional)
setInterval(loadRooms, 30000);

// Exportar para teste no console
window.loadRooms = loadRooms;