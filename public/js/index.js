async function loadRooms() {
  const roomsContainer = document.getElementById('rooms');
  
  try {
    const rooms = await api.get("/rooms");
    
    if (rooms.length === 0) {
      roomsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px;">
          <div style="font-size: 48px; color: #ddd; margin-bottom: 20px;">🏠</div>
          <h3 style="color: #666; margin-bottom: 10px;">Nenhuma sala disponível</h3>
          <p style="color: #999;">Seja o primeiro a criar uma sala!</p>
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
      `;
      
      roomCard.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h3 style="color: #333; font-size: 18px; margin: 0;">
            <i class="fas fa-door-open" style="color: #667eea; margin-right: 10px;"></i>
            ${room.name}
          </h3>
          <span class="status pending" style="font-size: 12px;">Aberta</span>
        </div>
        <p style="color: #666; margin-bottom: 15px; font-size: 14px;">
          <i class="fas fa-users" style="margin-right: 5px;"></i>
          Aguardando participantes...
        </p>
        <a href="room.html?id=${room._id}" 
           style="display: block; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: 600;
                  transition: all 0.3s;" 
           onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 5px 15px rgba(102, 126, 234, 0.3)'"
           onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'">
          <i class="fas fa-sign-in-alt"></i> Entrar na Sala
        </a>
      `;
      
      roomsContainer.appendChild(roomCard);
    });
    
  } catch (error) {
    roomsContainer.innerHTML = `
      <div class="message error">
        <i class="fas fa-exclamation-circle"></i>
        Erro ao carregar salas: ${error.message}
      </div>
    `;
  }
}

// Carregar salas quando a página carregar
window.addEventListener('DOMContentLoaded', loadRooms);