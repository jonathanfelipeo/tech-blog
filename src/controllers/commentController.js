const db = require('../config/db');

const validId = (id) => /^\d+$/.test(id) && Number(id) > 0 && Number(id) <= 2147483647;

exports.getComments = async (req, res) => {
  const { id } = req.params;
  if (!validId(id)) {
    return res.status(400).json({ error: 'Identificador de postagem inválido.' });
  }

  try {
    const post = await db.query('SELECT id FROM posts WHERE id = $1', [id]);
    if (post.rows.length === 0) {
      return res.status(404).json({ error: 'Postagem não encontrada.' });
    }

    const result = await db.query(
      'SELECT id, author, text, created_at, teacher_id FROM comments WHERE post_id = $1 ORDER BY created_at, id',
      [id]
    );
    return res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar comentários:', error.message);
    return res.status(500).json({ error: 'Erro ao buscar comentários.' });
  }
};

exports.createComment = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body || {};
  if (!validId(id)) {
    return res.status(400).json({ error: 'Identificador de postagem inválido.' });
  }
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'O comentário não pode estar vazio.' });
  }

  try {
    const isTeacher = req.user.role === 'teacher';
    const usersTable = isTeacher ? 'teachers' : 'students';
    const userColumn = isTeacher ? 'teacher_id' : 'student_id';
    const result = await db.query(
      `INSERT INTO comments (post_id, ${userColumn}, author, text)
       SELECT posts.id, author.id, author.name, $3
       FROM posts CROSS JOIN ${usersTable} AS author
       WHERE posts.id = $1 AND author.id = $2
       RETURNING id, author, text, created_at, teacher_id`,
      [id, req.user.sub, text.trim()]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Postagem ou usuário não encontrado.' });
    }
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar comentário:', error.message);
    return res.status(500).json({ error: 'Erro ao criar comentário.' });
  }
};

exports.updateComment = async (req, res) => {
  const { id, commentId } = req.params;
  const { text } = req.body || {};
  if (!validId(id) || !validId(commentId)) {
    return res.status(400).json({ error: 'Identificador de postagem ou comentário inválido.' });
  }
  if (typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'O comentário não pode estar vazio.' });
  }
  try {
    const result = await db.query(
      `UPDATE comments SET text = $1 WHERE post_id = $2 AND id = $3 AND teacher_id = $4
       RETURNING id, author, text, created_at, teacher_id`,
      [text.trim(), id, commentId, req.user.sub]
    );
    if (result.rows.length === 0) {
      const existing = await db.query(
        'SELECT id FROM comments WHERE post_id = $1 AND id = $2',
        [id, commentId]
      );
      if (existing.rows.length > 0) {
        return res.status(403).json({ error: 'Você só pode editar seus próprios comentários.' });
      }
      return res.status(404).json({ error: 'Comentário não encontrado nesta postagem.' });
    }
    return res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao editar comentário:', error.message);
    return res.status(500).json({ error: 'Erro ao editar comentário.' });
  }
};

exports.deleteComment = async (req, res) => {
  const { id, commentId } = req.params;
  if (!validId(id) || !validId(commentId)) {
    return res.status(400).json({ error: 'Identificador de postagem ou comentário inválido.' });
  }
  try {
    const result = await db.query(
      'DELETE FROM comments WHERE post_id = $1 AND id = $2 RETURNING id',
      [id, commentId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Comentário não encontrado nesta postagem.' });
    }
    return res.json({ message: 'Comentário excluído com sucesso.' });
  } catch (error) {
    console.error('Erro ao excluir comentário:', error.message);
    return res.status(500).json({ error: 'Erro ao excluir comentário.' });
  }
};
