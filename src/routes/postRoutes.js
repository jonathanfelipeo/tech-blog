const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const commentController = require('../controllers/commentController');
const { requireAuth, requireRole } = require('../utils/auth');

// Rota para criação
router.post('/', requireAuth, requireRole('teacher'), postController.createPost);

// Rota para listagem geral
router.get('/', postController.getAllPosts);

// Rota para busca
router.get('/search', postController.searchPosts);

router.get('/:id/comments', commentController.getComments);
router.post('/:id/comments', requireAuth, commentController.createComment);
router.put('/:id/comments/:commentId', requireAuth, requireRole('teacher'), commentController.updateComment);
router.delete('/:id/comments/:commentId', requireAuth, requireRole('teacher'), commentController.deleteComment);

// Rota para leitura de postagem específica (o símbolo ":" indica que é um parâmetro dinâmico)
router.get('/:id', postController.getPostById);

// Rota para edição
router.put('/:id', requireAuth, requireRole('teacher'), postController.updatePost);

// Rota para exclusão
router.delete('/:id', requireAuth, requireRole('teacher'), postController.deletePost);

module.exports = router;