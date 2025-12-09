const API_URL = "http://localhost:3000";

const api = {
  get: async (path) => {
    console.log(`📡 GET: ${API_URL + path}`);
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
    console.log(`📤 POST: ${API_URL + path}`, data);
    try {
      const res = await fetch(API_URL + path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      
      const responseData = await res.json();
      
      if (!res.ok) {
        console.error(`❌ POST Error (${path}):`, responseData);
        return responseData; // Retorna o erro para ser tratado no frontend
      }
      
      return responseData;
    } catch (error) {
      console.error(`💥 Network Error (${path}):`, error);
      return { error: "Falha na conexão com o servidor" };
    }
  }
};