import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { createComment, deleteComment, getComments, getPostById, updateComment } from '../api/client';
import { Comment, Post } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const PostDetailScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { postId } = route.params;
  const { isTeacher, user } = useAuth();

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState('');
  const [commentError, setCommentError] = useState('');
  const [sending, setSending] = useState(false);
  const [reloadComments, setReloadComments] = useState(0);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [moderating, setModerating] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setLoading(true);
        const data = await getPostById(postId);
        setPost(data);
      } catch (error) {
        console.error('Erro ao buscar detalhes do post:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [postId]);

  useEffect(() => {
    let active = true;
    const loadComments = async () => {
      setCommentsLoading(true);
      setCommentsError('');
      try {
        const data = await getComments(postId);
        if (active) setComments(data);
      } catch (error) {
        console.error('Erro ao carregar comentários:', error);
        if (active) setCommentsError('Não foi possível carregar os comentários.');
      } finally {
        if (active) setCommentsLoading(false);
      }
    };
    loadComments();
    return () => { active = false; };
  }, [postId, reloadComments]);

  const handleAddComment = async () => {
    if (!user || sending || moderating) return;
    if (!commentText.trim()) {
      setCommentError('Escreva um comentário antes de enviar.');
      return;
    }

    setCommentError('');
    setSending(true);
    try {
      const newComment = await createComment(postId, commentText.trim());
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      setCommentError('Não foi possível enviar o comentário. Verifique sua conexão e sua sessão.');
    } finally {
      setSending(false);
    }
  };

  const handleUpdateComment = async (commentId: number) => {
    if (!isTeacher || !user || !comments.some((comment) => comment.id === commentId && comment.teacher_id === user.id) || moderating || sending) return;
    if (!editText.trim()) {
      setCommentError('Escreva um comentário antes de salvar.');
      return;
    }

    setCommentError('');
    setModerating(true);
    try {
      const updated = await updateComment(postId, commentId, editText.trim());
      setComments((prev) => prev.map((comment) => comment.id === commentId ? updated : comment));
      setEditingId(null);
      setEditText('');
    } catch (error) {
      console.error('Erro ao editar comentário:', error);
      setCommentError('Não foi possível editar o comentário. Verifique sua conexão e sua sessão.');
    } finally {
      setModerating(false);
    }
  };

  const handleDeleteComment = (commentId: number) => {
    if (!isTeacher || moderating || sending) return;
    const executeDelete = async () => {
      setCommentError('');
      setModerating(true);
      try {
        await deleteComment(postId, commentId);
        setComments((prev) => prev.filter((comment) => comment.id !== commentId));
        if (editingId === commentId) {
          setEditingId(null);
          setEditText('');
        }
      } catch (error) {
        console.error('Erro ao excluir comentário:', error);
        setCommentError('Não foi possível excluir o comentário. Verifique sua conexão e sua sessão.');
      } finally {
        setModerating(false);
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Deseja realmente excluir este comentário?')) executeDelete();
    } else {
      Alert.alert('Excluir comentário', 'Deseja realmente excluir este comentário?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: executeDelete },
      ]);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Postagem não encontrada.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>{post.title}</Text>
        <Text style={styles.meta}>
          Autor: {post.author}
          {post.created_at
            ? ` • ${new Date(post.created_at).toLocaleDateString('pt-BR')}`
            : ''}
        </Text>

        {isTeacher && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('PostForm', { postId: post.id })}
          >
            <Text style={styles.editButtonText}>Editar esta postagem</Text>
          </TouchableOpacity>
        )}

        <View style={styles.divider} />
        <Text style={styles.body}>{post.content}</Text>
      </View>

      <View style={styles.commentsSection}>
        <Text style={styles.sectionTitle}>Comentários</Text>

        {commentsLoading ? (
          <ActivityIndicator color="#2563EB" />
        ) : commentsError ? (
          <>
            <Text style={styles.errorText}>{commentsError}</Text>
            <TouchableOpacity onPress={() => setReloadComments((value) => value + 1)}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {comments.length === 0 && <Text style={styles.commentBody}>Nenhum comentário ainda.</Text>}
            {comments.map((c) => (
              <View key={c.id} style={styles.commentItem}>
                <Text style={styles.commentAuthor}>{c.author}</Text>
                {editingId === c.id && isTeacher && c.teacher_id === user?.id ? (
                  <TextInput
                    style={styles.input}
                    value={editText}
                    onChangeText={setEditText}
                    multiline
                    accessibilityLabel="Editar comentário"
                  />
                ) : (
                  <Text style={styles.commentBody}>{c.text}</Text>
                )}
                {isTeacher && (
                  <View style={styles.commentActions}>
                    {c.teacher_id === user?.id && (editingId === c.id ? (
                      <>
                        <TouchableOpacity disabled={moderating || sending} onPress={() => handleUpdateComment(c.id)}>
                          <Text style={styles.actionText}>Salvar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity disabled={moderating || sending} onPress={() => {
                          setEditingId(null);
                          setCommentError('');
                        }}>
                          <Text style={styles.actionText}>Cancelar</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <TouchableOpacity disabled={moderating || sending} onPress={() => {
                        setEditingId(c.id);
                        setEditText(c.text);
                        setCommentError('');
                      }}>
                        <Text style={styles.actionText}>Editar</Text>
                      </TouchableOpacity>
                    ))}
                    <TouchableOpacity disabled={moderating || sending} onPress={() => handleDeleteComment(c.id)}>
                      <Text style={styles.deleteText}>Excluir</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </>
        )}

        {commentError ? <Text style={styles.errorText}>{commentError}</Text> : null}
        {user ? (
          <>
            <TextInput
              style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
              placeholder="Escreva um comentário sobre a postagem..."
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity
              style={styles.commentButton}
              onPress={handleAddComment}
              disabled={sending || moderating || commentsLoading || !!commentsError}
            >
              <Text style={styles.commentButtonText}>
                {sending ? 'Enviando...' : 'Enviar Comentário'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.commentBody}>
            Entre como aluno ou professor para comentar. A leitura dos posts não exige login.
          </Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  content: {
    padding: 16,
    paddingBottom: 36,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 6,
  },
  meta: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 12,
  },
  editButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  },
  editButtonText: {
    color: '#1D4ED8',
    fontWeight: '600',
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  body: {
    fontSize: 16,
    color: '#1F2937',
    lineHeight: 24,
  },
  commentsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  commentItem: {
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentAuthor: {
    fontWeight: 'bold',
    fontSize: 13,
    color: '#2563EB',
    marginBottom: 2,
  },
  commentBody: {
    fontSize: 14,
    color: '#374151',
  },
  commentActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  actionText: {
    color: '#1D4ED8',
    fontWeight: '600',
  },
  deleteText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    marginTop: 8,
    backgroundColor: '#F9FAFB',
  },
  commentButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  commentButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorText: {
    fontSize: 16,
    color: '#DC2626',
  },
  retryText: {
    color: '#2563EB',
    marginVertical: 8,
  },
});