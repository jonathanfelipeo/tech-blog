import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import api from '../services/api';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 20px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const ReadMoreLink = styled(Link)`
  display: inline-block;
  margin-top: 15px;
  color: #646cff; /* Azul claro/vibrante, ótimo para fundo escuro */
  text-decoration: none;
  font-weight: bold;
  
  &:hover {
    color: #535bf2;
    text-decoration: underline;
  }
`;

const PostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* Cards lado a lado no desktop */
  gap: 20px;
  margin-top: 20px;

  /* Regra para telas menores (Mobile) */
  @media (max-width: 768px) {
    grid-template-columns: 1fr; /* Uma única coluna ocupando 100% da largura */
  }
`;

const PostCard = styled.div`
  border: 1px solid #eee;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const PostTitle = styled.h2`
  margin-top: 0;
  color: #ffffff;
`;

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Busca os posts na API ao carregar o componente
  useEffect(() => {
    async function fetchPosts() {
      try {
        // Realiza chamada ao endpoint REST para obter posts
        const response = await api.get('/posts'); 
        setPosts(response.data);
      } catch (error) {
        console.error("Erro ao buscar posts:", error);
      }
    }
    fetchPosts();
  }, []);

  // Filtra os posts baseado na palavra-chave digitada
  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <h1>Blog Principal</h1>
      
      {/* Campo de busca */}
      <SearchInput 
        type="text" 
        placeholder="Buscar posts por palavra-chave..." 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Lista de posts */}
      {filteredPosts.length > 0 ? (
        filteredPosts.map(post => (
          <PostCard key={post.id}>
            <PostTitle>{post.title}</PostTitle>
            <p><strong>Autor:</strong> {post.author}</p>
            <p>{post.content.substring(0, 100)}...</p> {/* Breve descrição */}
            <ReadMoreLink to={`/post/${post.id}`}>Ler mais...</ReadMoreLink>
          </PostCard>
        ))
      ) : (
        <p>Nenhum post encontrado.</p>
      )}
    </Container>
  );
}