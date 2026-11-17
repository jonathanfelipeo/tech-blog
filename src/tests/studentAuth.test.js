const request = require('supertest');
const express = require('express');
const studentRoutes = require('../routes/studentRoutes');
const db = require('../config/db');
const { hashPassword, createAuthToken, verifyAuthToken } = require('../utils/auth');

jest.mock('../config/db');

process.env.AUTH_TOKEN_SECRET = 'test-only-secret-for-tech-blog';

const app = express();
app.use(express.json());
app.use('/students', studentRoutes);

describe('Autenticação de alunos', () => {
  let passwordHash;

  beforeAll(async () => {
    passwordHash = await hashPassword('senha-aluno-123');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('autentica com credenciais válidas sem retornar o hash da senha', async () => {
    db.query.mockResolvedValue({
      rows: [{
        id: 12,
        name: 'Aluno Exemplo',
        email: 'aluno@example.com',
        registration: 'RM123',
        password_hash: passwordHash,
      }],
    });

    const response = await request(app)
      .post('/students/login')
      .send({ email: 'aluno@example.com', password: 'senha-aluno-123' });

    expect(response.status).toBe(200);
    expect(response.body.user).toEqual({
      id: 12,
      name: 'Aluno Exemplo',
      email: 'aluno@example.com',
      role: 'student',
    });
    expect(response.body).not.toHaveProperty('user.password_hash');
    expect(verifyAuthToken(response.body.token).role).toBe('student');
  });

  it('rejeita senha inválida', async () => {
    db.query.mockResolvedValue({
      rows: [{
        id: 12,
        name: 'Aluno Exemplo',
        email: 'aluno@example.com',
        password_hash: passwordHash,
      }],
    });

    const response = await request(app)
      .post('/students/login')
      .send({ email: 'aluno@example.com', password: 'senha-incorreta' });

    expect(response.status).toBe(401);
  });

  it('exige autenticação docente para administrar alunos', async () => {
    const studentToken = createAuthToken({ id: 12, role: 'student', name: 'Aluno Exemplo' });
    const response = await request(app)
      .get('/students')
      .set('Authorization', `Bearer ${studentToken}`);

    expect(response.status).toBe(403);
  });
});
