const express = require('express');
const axios = require('axios');
const app = express();
const port = 3885;
const host = 'serverip';
const VIP_API_URL = 'http://localhost:3302/clientes';

// Middleware para analisar o corpo da requisição em JSON
app.use(express.json());

// Middleware de autenticação
const autenticarUsuario = async (req, res, next) => {
  try {
    const { phone, kea } = req.body;
    const response = await axios.get(VIP_API_URL);
    const usuariosVIP = response.data;

    const usuario = usuariosVIP.find((user) => user.id === phone);

    if (!usuario) {
      console.log('Usuário não autorizado detectado:', phone);
      return res.status(401).json({ error: 'Usuário não é cadastrado' });
    }

    if (usuario.kea !== kea) {
      console.log('Usuário não autenticado detectado:', kea);
      return res.status(401).json({ error: 'Chave de autenticação não está correta' });
    }

    if (usuario.tokens <= 0) {
      return res.status(403).json({ error: 'Você não tem tokens suficientes' });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Erro ao verificar usuário VIP' });
  }
};

// Rota principal para fazer requisição ao servidor JSON
app.post('/banks', autenticarUsuario, async (req, res) => {
  const { method, route } = req.body;

  // Configuração da URL do servidor JSON
  const url = `http://localhost:3302/banks/${route}`;

  try {
    // Envia a requisição para o servidor JSON usando o método especificado
    const response = await axios({
      method: method,
      url: url,
      headers: { 'Content-Type': 'application/json' }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao acessar o servidor JSON:', error.message);
    res.status(500).json({ error: 'Erro ao acessar o servidor JSON' });
  }
});
app.post('/markets', autenticarUsuario, async (req, res) => {
  const { method, route } = req.body;

  // Configuração da URL do servidor JSON
  const url = `http://localhost:3302/markets/${route}`;

  try {
    // Envia a requisição para o servidor JSON usando o método especificado
    const response = await axios({
      method: method,
      url: url,
      headers: { 'Content-Type': 'application/json' }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Erro ao acessar o servidor JSON:', error.message);
    res.status(500).json({ error: 'Erro ao acessar o servidor JSON' });
  }
});
// Inicia o servidor Express
app.listen(port, host, () => {
  console.log(`Servidor de autenticação rodando em http://${host}:${port}`);
});
