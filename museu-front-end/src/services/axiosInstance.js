import axios from 'axios';

// Como na aula, todas as requisições da interface usam uma instância central.
// O Vue CLI encaminha /api para o servidor Node na porta 3000.
const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' }
});

export default axiosInstance;
