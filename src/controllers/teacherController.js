const db = require('../config/db');
const { createAuthToken } = require('../utils/auth');

// Login de Professor
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query(
      'SELECT id, name, email, subject FROM teachers WHERE email = $1 AND password = $2',
      [email, password]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'E-mail ou senha inválidos' });
    }
    const teacher = result.rows[0];
    const user = { ...teacher, role: 'teacher' };
    res.status(200).json({ user, token: createAuthToken(user) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Listagem paginada de Professores
exports.getAllTeachers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const countResult = await db.query('SELECT COUNT(*) FROM teachers');
    const total = parseInt(countResult.rows[0].count);

    const result = await db.query(
      'SELECT id, name, email, subject, created_at FROM teachers ORDER BY id DESC LIMIT $1 OFFSET $2',
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

exports.getTeacherById = async (req, res) => {
  try {
    const result = await db.query('SELECT id, name, email, subject FROM teachers WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Professor não encontrado' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTeacher = async (req, res) => {
  const { name, email, password, subject } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO teachers (name, email, password, subject) VALUES ($1, $2, $3, $4) RETURNING id, name, email, subject',
      [name, email, password || '123456', subject]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTeacher = async (req, res) => {
  const { name, email, password, subject } = req.body;
  try {
    let result;
    if (password) {
      result = await db.query(
        'UPDATE teachers SET name = $1, email = $2, password = $3, subject = $4 WHERE id = $5 RETURNING id, name, email, subject',
        [name, email, password, subject, req.params.id]
      );
    } else {
      result = await db.query(
        'UPDATE teachers SET name = $1, email = $2, subject = $3 WHERE id = $4 RETURNING id, name, email, subject',
        [name, email, subject, req.params.id]
      );
    }
    if (result.rows.length === 0) return res.status(404).json({ error: 'Professor não encontrado' });
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const result = await db.query('DELETE FROM teachers WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Professor não encontrado' });
    res.status(200).json({ message: 'Professor excluído com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};