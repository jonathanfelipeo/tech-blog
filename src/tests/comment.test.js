const request = require('supertest');
const express = require('express');
const postRoutes = require('../routes/postRoutes');
const db = require('../config/db');
const { createAuthToken } = require('../utils/auth');

jest.mock('../config/db');
process.env.AUTH_TOKEN_SECRET = 'test-only-secret-for-tech-blog';

const app = express();
app.use(express.json());
app.use('/posts', postRoutes);

const studentToken = createAuthToken({ id: 12, role: 'student', name: 'Aluno' });
const teacherToken = createAuthToken({ id: 1, role: 'teacher', name: 'Professor' });

describe('Comentários', () => {
  afterEach(() => jest.resetAllMocks());

  it('lista comentários publicamente em ordem para uma postagem existente', async () => {
    const comment = { id: 2, author: 'Aluno', text: 'Olá', created_at: '2026-01-01', teacher_id: null };
    db.query.mockResolvedValueOnce({ rows: [{ id: 3 }] }).mockResolvedValueOnce({ rows: [comment] });

    const response = await request(app).get('/posts/3/comments');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([comment]);
    expect(db.query.mock.calls[1][1]).toEqual(['3']);
  });

  it('grava comentário com a identidade do aluno autenticado, não a enviada no corpo', async () => {
    const comment = { id: 2, author: 'Aluno', text: 'Olá', created_at: '2026-01-01', teacher_id: null };
    db.query.mockResolvedValue({ rows: [comment] });

    const response = await request(app)
      .post('/posts/3/comments')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ text: '  Olá  ', author: 'Outro', student_id: 99 });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(comment);
    expect(db.query.mock.calls[0][1]).toEqual(['3', 12, 'Olá']);
  });

  it('grava comentário usando a identidade do professor autenticado', async () => {
    const comment = { id: 4, author: 'Professor', text: 'Olá', created_at: '2026-01-01', teacher_id: 1 };
    db.query.mockResolvedValue({ rows: [comment] });
    const response = await request(app).post('/posts/3/comments')
      .set('Authorization', `Bearer ${teacherToken}`)
      .send({ text: ' Olá ', author: 'Outro', teacher_id: 99 });
    expect(response.status).toBe(201);
    expect(response.body).toEqual(comment);
    expect(db.query.mock.calls[0][0]).toContain('CROSS JOIN teachers');
    expect(db.query.mock.calls[0][1]).toEqual(['3', 1, 'Olá']);
  });

  it('recusa comentários de visitantes', async () => {
    const visitor = await request(app).post('/posts/3/comments').send({ text: 'Olá' });
    expect(visitor.status).toBe(401);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('permite ao professor editar seu comentário e excluir comentário de outro autor', async () => {
    const comment = { id: 2, author: 'Professor', text: 'Editado', created_at: '2026-01-01', teacher_id: 1 };
    db.query.mockResolvedValueOnce({ rows: [comment] }).mockResolvedValueOnce({ rows: [{ id: 2 }] });
    const update = await request(app).put('/posts/3/comments/2')
      .set('Authorization', `Bearer ${teacherToken}`).send({ text: ' Editado ', author: 'Outro' });
    const remove = await request(app).delete('/posts/3/comments/9')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(update.status).toBe(200);
    expect(update.body).toEqual(comment);
    expect(db.query.mock.calls[0][0]).toContain('teacher_id = $4');
    expect(db.query.mock.calls[0][1]).toEqual(['Editado', '3', '2', 1]);
    expect(remove.status).toBe(200);
    expect(db.query.mock.calls[1][1]).toEqual(['3', '9']);
  });

  it.each(['aluno', 'outro professor'])('nega edição de comentário de %s', async () => {
    db.query.mockResolvedValueOnce({ rows: [] }).mockResolvedValueOnce({ rows: [{ id: 2 }] });
    const update = await request(app).put('/posts/3/comments/2')
      .set('Authorization', `Bearer ${teacherToken}`).send({ text: 'Não permitido', teacher_id: 1 });
    expect(update.status).toBe(403);
    expect(db.query.mock.calls[0][1]).toEqual(['Não permitido', '3', '2', 1]);
  });

  it.each(['put', 'delete'])('nega %s a visitantes e alunos', async (method) => {
    const visitor = await request(app)[method]('/posts/3/comments/2').send({ text: 'Olá' });
    const student = await request(app)[method]('/posts/3/comments/2')
      .set('Authorization', `Bearer ${studentToken}`).send({ text: 'Olá' });
    expect(visitor.status).toBe(401);
    expect(student.status).toBe(403);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('rejeita edição vazia e identificadores inválidos', async () => {
    const empty = await request(app).put('/posts/3/comments/2')
      .set('Authorization', `Bearer ${teacherToken}`).send({ text: '   ' });
    const invalid = await request(app).delete('/posts/3/comments/abc')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(empty.status).toBe(400);
    expect(invalid.status).toBe(400);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('retorna 404 ao editar ou excluir comentário ausente ou pertencente a outro post', async () => {
    db.query.mockResolvedValue({ rows: [] });
    const update = await request(app).put('/posts/3/comments/2')
      .set('Authorization', `Bearer ${teacherToken}`).send({ text: 'Novo' });
    const remove = await request(app).delete('/posts/3/comments/2')
      .set('Authorization', `Bearer ${teacherToken}`);
    expect(update.status).toBe(404);
    expect(remove.status).toBe(404);
  });

  it('rejeita texto vazio e identificador inválido', async () => {
    const empty = await request(app).post('/posts/3/comments')
      .set('Authorization', `Bearer ${studentToken}`).send({ text: '   ' });
    const invalid = await request(app).get('/posts/abc/comments');
    expect(empty.status).toBe(400);
    expect(invalid.status).toBe(400);
    expect(db.query).not.toHaveBeenCalled();
  });

  it('retorna 404 para postagem inexistente na leitura ou gravação', async () => {
    db.query.mockResolvedValue({ rows: [] });
    const list = await request(app).get('/posts/999/comments');
    const create = await request(app).post('/posts/999/comments')
      .set('Authorization', `Bearer ${studentToken}`).send({ text: 'Olá' });
    expect(list.status).toBe(404);
    expect(create.status).toBe(404);
  });

  it('informa falhas de persistência', async () => {
    db.query.mockRejectedValue(new Error('banco indisponível'));
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const list = await request(app).get('/posts/3/comments');
      const create = await request(app).post('/posts/3/comments')
        .set('Authorization', `Bearer ${studentToken}`).send({ text: 'Olá' });
      const update = await request(app).put('/posts/3/comments/2')
        .set('Authorization', `Bearer ${teacherToken}`).send({ text: 'Olá' });
      const remove = await request(app).delete('/posts/3/comments/2')
        .set('Authorization', `Bearer ${teacherToken}`);
      expect(list.status).toBe(500);
      expect(create.status).toBe(500);
      expect(update.status).toBe(500);
      expect(remove.status).toBe(500);
    } finally {
      log.mockRestore();
    }
  });
});
