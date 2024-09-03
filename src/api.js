import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api', // Altere para a URL base da sua API
  timeout: 10000, // Tempo limite para requisições (opcional)
  headers: { 'Content-Type': 'application/json' }, // Cabeçalhos comuns (opcional)
});

export default api;