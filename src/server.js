const express = require('express');
const cors = require('cors');
const db = require('./config/db');
const postRoutes = require('./routes/postRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');

const app = express();

// Permite conexões tanto do Front-end Web (5173) quanto do App Mobile
app.use(cors());
app.use(express.json());

// Inicializa tabelas novas caso não existam e cria 1 professor padrão
const initTables = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        author VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS teachers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        subject VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        registration VARCHAR(50),
        password_hash TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE students ADD COLUMN IF NOT EXISTS password_hash TEXT;
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        student_id INTEGER REFERENCES students(id) ON DELETE SET NULL,
        author VARCHAR(100) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE comments ADD COLUMN IF NOT EXISTS teacher_id INTEGER REFERENCES teachers(id) ON DELETE SET NULL;
    `);

    const checkAdmin = await db.query('SELECT id FROM teachers WHERE email = $1', ['admin@fiap.com.br']);
    if (checkAdmin.rows.length === 0) {
      await db.query(
        'INSERT INTO teachers (name, email, password, subject) VALUES ($1, $2, $3, $4)',
        ['Professor Admin', 'admin@fiap.com.br', '123456', 'Full Stack Development']
      );
      console.log('Professor padrão criado: admin@fiap.com.br / Senha: 123456');
    }
  } catch (err) {
    console.error('Erro ao inicializar tabelas:', err.message);
  }
};

initTables();

app.use('/posts', postRoutes);
app.use('/teachers', teacherRoutes);
app.use('/students', studentRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});