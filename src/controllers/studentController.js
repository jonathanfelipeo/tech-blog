const db = require('../config/db');
const { hashPassword, verifyPassword, createAuthToken } = require('../utils/auth');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== 'string' || typeof password !== 'string' || !email.trim() || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  try {
    const result = await db.query(
      'SELECT id, name, email, registration, password_hash FROM students WHERE email = $1',
      [email]
    );
    const student = result.rows[0];

    if (!student || !(await verifyPassword(password, student.password_hash))) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos.' });
    }

    const user = {
      id: student.id,
      name: student.name,
      email: student.email,
      role: 'student',
    };

    return res.status(200).json({ user, token: createAuthToken(user) });
  } catch (error) {
    console.error('Erro ao autenticar aluno:', error.message);
    return res.status(500).json({ error: 'Erro interno ao autenticar aluno.' });
  }
};

exports.getAllStudents = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const countResult = await db.query('SELECT COUNT(*) FROM students');
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      'SELECT id, name, email, registration, created_at FROM students ORDER BY id DESC LIMIT $1 OFFSET $2',
      [limit, offset]
    );

    res.status(200).json({
      data: result.rows,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, registration FROM students WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createStudent = async (req, res) => {
  const { name, email, registration, password } = req.body;
  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() ||
    typeof password !== 'string' || !password.trim()
  ) {
    return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
  }
  if (password.trim().length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    const passwordHash = await hashPassword(password);
    const result = await db.query(
      'INSERT INTO students (name, email, registration, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email, registration',
      [name, email, registration, passwordHash]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao cadastrar aluno:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  const { name, email, registration, password } = req.body;
  if (
    typeof name !== 'string' || !name.trim() ||
    typeof email !== 'string' || !email.trim() ||
    (password !== undefined && typeof password !== 'string')
  ) {
    return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
  }

  const newPassword = typeof password === 'string' ? password.trim() : '';
  if (newPassword && newPassword.length < 6) {
    return res.status(400).json({ error: 'A senha deve ter pelo menos 6 caracteres.' });
  }

  try {
    const result = newPassword
      ? await db.query(
        'UPDATE students SET name = $1, email = $2, registration = $3, password_hash = $4 WHERE id = $5 RETURNING id, name, email, registration',
        [name, email, registration, await hashPassword(newPassword), req.params.id]
      )
      : await db.query(
        'UPDATE students SET name = $1, email = $2, registration = $3 WHERE id = $4 RETURNING id, name, email, registration',
        [name, email, registration, req.params.id]
      );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteStudent = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM students WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Aluno não encontrado' });
    res.status(200).json({ message: 'Aluno excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};