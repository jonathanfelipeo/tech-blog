import axios from 'axios';

// Cria uma instância do axios com a URL base do seu back-end
const api = axios.create({
  // Ajuste a porta (ex: 3000, 8080) e o prefixo (ex: /api) conforme configurado no seu server.js
  baseURL: 'http://localhost:3000', 
});

// Interceptor para injetar o token de autorização em todas as requisições
api.interceptors.request.use(
  (config) => {
    // Quando implementarmos o login real, o token será salvo no localStorage
    const token = localStorage.getItem('token');
    
    // Se o token existir, adiciona no cabeçalho de Autorização
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;