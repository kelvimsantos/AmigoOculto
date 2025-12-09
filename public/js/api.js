// Detecta automaticamente a URL da API
const getApiUrl = () => {
  // Se estiver no Render, usa a URL atual
  if (window.location.hostname.includes('render.com') || 
      window.location.hostname.includes('onrender.com')) {
    return window.location.origin + '/api';
  }
  // Se estiver em localhost, usa localhost:3000
  return 'http://localhost:3000/api';
};

const API_URL = getApiUrl();

console.log(`🌐 API URL: ${API_URL}`);

const api = {
  get: async (path) => {
    console.log(`📡 GET: ${API_URL}${path}`);
    try {
      const res = await fetch(API_URL + path);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (error) {
      console.error(`❌ GET Error (${path}):`, error);
      throw error;
    }
  },

  post: async (path, data) => {
    console.log(`📤 POST: ${API_URL}${path}`, data);
    try {
      const res = await fetch(API_URL + path, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      const responseData = await res.json();
      
      if (!res.ok) {
        console.error(`❌ POST Error (${path}):`, responseData);
        return responseData;
      }
      
      return responseData;
    } catch (error) {
      console.error(`💥 Network Error (${path}):`, error);
      return { error: "Falha na conexão com o servidor" };
    }
  }
};

// Teste a conexão ao carregar
window.addEventListener('DOMContentLoaded', () => {
  console.log('🔌 Testando conexão com API...');
  api.get('/health')
    .then(health => console.log('✅ API conectada:', health))
    .catch(err => console.warn('⚠️ API offline:', err.message));
});