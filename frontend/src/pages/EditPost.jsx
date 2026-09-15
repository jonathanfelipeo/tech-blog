import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import styled from 'styled-components';
import api from '../services/api';

const FormContainer = styled.div`
  max-width: 800px; /* Aumentado de 600px para 800px */
  width: 100%; /* Força o contêiner a usar o espaço disponível */
  box-sizing: border-box;
  margin: 40px auto;
  padding: 30px; /* Mais respiro interno */
  border: 1px solid #ddd;
  border-radius: 8px;

  @media (max-width: 768px) {
    margin: 20px auto;
    width: 90%; /* Deixa uma margem lateral agradável no celular */
    padding: 20px;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  display: flex;
  flex-direction: column;
`;

const Input = styled.input`
  width: 100%; /* Faz o input esticar horizontalmente */
  box-sizing: border-box; /* Impede que o padding vaze do contêiner */
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const TextArea = styled.textarea`
  width: 100%; /* Faz o textarea esticar horizontalmente */
  box-sizing: border-box;
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-height: 250px; /* Aumenta a altura para facilitar a edição de textos longos */
  resize: vertical;
`;

const Button = styled.button`
  padding: 10px 15px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  width: 100%;

  &:hover {
    background-color: #0056b3;
  }
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

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  // Carrega os dados atuais do post ao montar o componente
  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await api.get(`/posts/${id}`);
        setTitle(response.data.title);
        setAuthor(response.data.author);
        setContent(response.data.content);
      } catch (error) {
        console.error('Erro ao buscar dados do post:', error);
      }
    }
    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Atualiza os dados através do método PUT no back-end
      await api.put(`/posts/${id}`, { title, author, content });
      alert('Postagem atualizada com sucesso!');
      navigate('/admin');
    } catch (error) {
      console.error('Erro ao atualizar postagem:', error);
      alert('Falha ao atualizar a postagem.');
    }
  };

  return (
    <FormContainer>
      <BackLink to="/admin">&larr; Voltar ao Painel</BackLink>
      <h2>Editar Postagem</h2>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <label>Título:</label>
          <Input 
            type="text" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </FormGroup>
        <FormGroup>
          <label>Autor:</label>
          <Input 
            type="text" 
            value={author} 
            onChange={(e) => setAuthor(e.target.value)} 
            required 
          />
        </FormGroup>
        <FormGroup>
          <label>Conteúdo:</label>
          <TextArea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required 
          />
        </FormGroup>
        <Button type="submit">Salvar Alterações</Button>
      </form>
    </FormContainer>
  );
}