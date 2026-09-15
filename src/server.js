
const express = require('express');
const cors = require('cors');
// Importação das rotas de postagens
const postRoutes = require('./routes/postRoutes'); 

const app = express();

app.use(cors({
    origin: 'http://localhost:5173' // Permite apenas o seu front-end
}));

// Configuração de middleware para interpretação de requisições no formato JSON
app.use(express.json());

// Direcionamento de todas as requisições que iniciam com "/posts" para postRoutes
app.use('/posts', postRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});