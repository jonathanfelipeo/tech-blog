import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import api from '../services/api';

const AdminContainer = styled.div`
  max-width: 900px;
  width: 100%; /* Força a ocupar no máximo 100% da tela */
  box-sizing: border-box; /* Impede que o padding vaze a largura da tela */
  margin: 0 auto;
  padding: 20px;
  
  @media (max-width: 768px) {
    padding: 10px; /* Reduz o espaçamento nas laterais no mobile */
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  /* No mobile, empilha o título e o botão */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    
    h2 {
      margin: 0;
      text-align: center;
    }
    
    a {
      width: 100%;
      text-align: center;
      box-sizing: border-box;
    }
  }
`;

const Button = styled(Link)`
  padding: 10px 15px;
  background-color: #28a745;
  color: white;
  text-decoration: none;
  border-radius: 4px;
`;

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto; /* Cria a barra de rolagem horizontal apenas aqui dentro */
  box-sizing: border-box;
  -webkit-overflow-scrolling: touch; /* Melhora a fluidez do scroll no celular */
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 16px;
  color: #fff; 
  
  th, td {
    padding: 16px;
    border: 1px solid #444; 
    text-align: left;
  }

  th {
    background-color: #1a1a1a; 
    font-weight: bold;
  }

  @media (max-width: 768px) {
    display: block;
    
    /* Esconde o cabeçalho da tabela no mobile */
    thead {
      display: none; 
    }
    
    tbody, tr, td {
      display: block;
      width: 100%;
    }
    
    /* Cada linha vira um Card isolado */
    tr {
      margin-bottom: 20px;
      border: 1px solid #555;
      border-radius: 8px;
      background-color: #2a2a2a; 
    }
    
    /* Configuração das células (Title, Author, Actions) */
    td {
      border: none;
      border-bottom: 1px solid #444; /* Linha divisória dentro do card */
      padding: 15px;
      text-align: right; /* Joga o conteúdo da postagem para a direita */
      position: relative;
    }
    
    /* Tira a borda da última célula (a de botões) e centraliza */
    td:last-child {
      border-bottom: none;
      text-align: center; 
    }
    
    /* Insere os rótulos falsos na esquerda de cada linha do card */
    td:nth-child(1)::before {
      content: "Título: ";
      float: left;
      font-weight: bold;
      color: #aaa;
    }
    
    td:nth-child(2)::before {
      content: "Autor: ";
      float: left;
      font-weight: bold;
      color: #aaa;
    }
  }
`;

const ActionButton = styled.button`
  padding: 5px 10px;
  margin-right: 5px;
  background-color: ${props => props.danger ? '#dc3545' : '#ffc107'};
  color: ${props => props.danger ? 'white' : 'black'};
  border: none;
  border-radius: 4px;
  cursor: pointer;

  @media (max-width: 768px) {
    margin-bottom: 5px; /* Separa os botões Editar e Excluir se eles quebrarem de linha */
    display: inline-block;
  }
`;

export default function Admin() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const response = await api.get('/posts');
      setPosts(response.data);
    } catch (error) {
      console.error("Erro ao carregar postagens:", error);
    }
  }

  async function handleDelete(id) {
    if (window.confirm('Tem certeza que deseja excluir este post?')) {
      try {
        await api.delete(`/posts/${id}`);
        // Atualiza a lista removendo o post deletado
        setPosts(posts.filter(post => post.id !== id));
      } catch (error) {
        console.error("Erro ao excluir postagem:", error);
      }
    }
  }

  return (
    <AdminContainer>
      <Header>
        <h2>Painel Administrativo</h2>
        <Button to="/admin/novo">+ Nova Postagem</Button>
      </Header>

      <Table>
        <thead>
          <tr>
            <th>Título</th>
            <th>Autor</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {posts.map(post => (
            <tr key={post.id}>
              <td>{post.title}</td>
              <td>{post.author}</td>
              <td>
                <Link to={`/admin/editar/${post.id}`}>
                  <ActionButton>Editar</ActionButton>
                </Link>
                <ActionButton danger onClick={() => handleDelete(post.id)}>
                  Excluir
                </ActionButton>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </AdminContainer>
  );
}