import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { createPost, getPostById, updatePost } from '../api/client';
import { useAuth } from '../contexts/AuthContext';

export const PostFormScreen: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { user, isTeacher } = useAuth();

  const postId: number | undefined = route.params?.postId;
  const isEditing = !!postId;

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState(user?.name || '');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const notify = (titleMsg: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${titleMsg}: ${message}`);
    } else {
      Alert.alert(titleMsg, message);
    }
  };

  useEffect(() => {
    if (isEditing && postId) {
      const loadPost = async () => {
        try {
          setLoading(true);
          const data = await getPostById(postId);
          setTitle(data.title);
          setAuthor(data.author);
          setContent(data.content);
        } catch (error) {
          notify('Erro', 'Não foi possível carregar os dados da postagem.');
          navigation.goBack();
        } finally {
          setLoading(false);
        }
      };
      loadPost();
    }
  }, [isEditing, postId]);

  if (!isTeacher) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Acesso restrito. Apenas professores autenticados podem criar ou editar postagens.
        </Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  const handleSubmit = async () => {
    if (!title.trim() || !author.trim() || !content.trim()) {
      notify('Campos obrigatórios', 'Preencha título, autor e conteúdo.');
      return;
    }

    try {
      setSaving(true);
      if (isEditing && postId) {
        await updatePost(postId, {
          title: title.trim(),
          author: author.trim(),
          content: content.trim(),
        });
        notify('Sucesso', 'Postagem atualizada com sucesso!');
      } else {
        await createPost({
          title: title.trim(),
          author: author.trim(),
          content: content.trim(),
        });
        notify('Sucesso', 'Postagem criada com sucesso!');
      }
      navigation.goBack();
    } catch (error: any) {
      const msg = error?.response?.data?.error || 'Erro ao salvar a postagem.';
      notify('Erro', msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.headerTitle}>
          {isEditing ? 'Editar Postagem' : 'Nova Postagem'}
        </Text>

        <Text style={styles.label}>Título da Postagem</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o título do post"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Autor(a)</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do professor(a) autor(a)"
          value={author}
          onChangeText={setAuthor}
        />

        <Text style={styles.label}>Conteúdo</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Escreva o conteúdo completo da postagem..."
          value={content}
          onChangeText={setContent}
          multiline
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSubmit}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              {isEditing ? 'Salvar Alterações' : 'Publicar Postagem'}
            </Text>
          )}
        </TouchableOpacity>
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
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
  },
  textArea: {
    height: 180,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 15,
    textAlign: 'center',
  },
});