import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getPosts, searchPosts } from '../api/client';
import { Post } from '../types';
import { useAuth } from '../contexts/AuthContext';

export const HomeScreen: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<any>();
  const { isTeacher } = useAuth();

  const fetchPosts = async (term = '') => {
    try {
      setLoading(true);
      if (term.trim()) {
        const data = await searchPosts(term.trim());
        setPosts(data);
      } else {
        const data = await getPosts();
        setPosts(data);
      }
    } catch (error) {
      console.error('Erro ao carregar postagens:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPosts(searchTerm);
    }, [])
  );

  const handleSearch = () => {
    fetchPosts(searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    fetchPosts('');
  };

  const getExcerpt = (content: string) => {
    if (!content) return '';
    return content.length > 120 ? `${content.substring(0, 120)}...` : content;
  };

  return (
    <View style={styles.container}>
      {/* Barra de Busca */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar posts por palavra-chave..."
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Buscar</Text>
        </TouchableOpacity>
        {searchTerm ? (
          <TouchableOpacity style={styles.clearButton} onPress={handleClearSearch}>
            <Text style={styles.clearButtonText}>Limpar</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Atalho para Professor criar post */}
      {isTeacher && (
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => navigation.navigate('PostForm')}
        >
          <Text style={styles.createButtonText}>+ Criar Nova Postagem</Text>
        </TouchableOpacity>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma postagem encontrada.</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardAuthor}>Por: {item.author}</Text>
              <Text style={styles.cardExcerpt}>{getExcerpt(item.content)}</Text>
              <Text style={styles.readMore}>Ler post completo →</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  searchButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  clearButton: {
    backgroundColor: '#6B7280',
    paddingHorizontal: 12,
    justifyContent: 'center',
    borderRadius: 8,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
  },
  createButton: {
    backgroundColor: '#16A34A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 15,
  },
  listContent: {
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  cardAuthor: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: '600',
    marginBottom: 8,
  },
  cardExcerpt: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
    marginBottom: 10,
  },
  readMore: {
    fontSize: 13,
    color: '#2563EB',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6B7280',
    marginTop: 40,
    fontSize: 15,
  },
});