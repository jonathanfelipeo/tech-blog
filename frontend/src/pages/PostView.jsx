import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import api from '../services/api';

const ViewContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 20px;
  color: #646cff;
  text-decoration: none;
  font-weight: bold;

  &:hover {
    color: #535bf2;
    text-decoration: underline;
  }
`;

const PostHeader = styled.div`
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
`;

const PostTitle = styled.h1`
  font-size: 32px; /* Tamanho controlado para desktop */
  line-height: 1.3;
  margin-bottom: 10px;
  word-wrap: break-word; /* Força a quebra de palavras muito longas */

  /* Tamanho menor para telas de celular */
  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Content = styled.div`
  line-height: 1.6;
  font-size: 18px;
  color: #ffffff;
`;

export default function PostView() {
  const { id } = useParams(); // Pega o ID da URL
  const [post, setPost] = useState(null);

  useEffect(() => {
    async function fetchPost() {
      try {
        // Busca o post específico pelo ID
        const response = await api.get(`/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        console.error("Erro ao buscar o post:", error);
      }
    }
    fetchPost();
  }, [id]);

  if (!post) {
    return <ViewContainer>Carregando...</ViewContainer>;
  }

  return (
    <ViewContainer>
      <BackLink to="/">&larr; Voltar para a página principal</BackLink>
      <PostHeader>
        <PostTitle>{post.title}</PostTitle>
        <p><strong>Autor:</strong> {post.author}</p>
        </PostHeader>
      <Content>
        <p>{post.content}</p>
      </Content>
      
    </ViewContainer>
  );
}