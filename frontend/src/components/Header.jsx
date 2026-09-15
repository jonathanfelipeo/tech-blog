import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const Brand = styled(Link)`
  color: white;
  text-decoration: none;
  font-size: 24px;
  font-weight: bold;
`;

const NavBar = styled.nav`
  background-color: #2c3e50;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  margin-bottom: 20px;

  /* No mobile, empilha a logo e os links */
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 20px; /* Garante o espaçamento entre Home e Login */

  a {
    color: white;
    text-decoration: none;
    font-size: 16px;
    
    &:hover {
      text-decoration: underline;
    }
  }

  button {
    padding: 8px 12px;
    cursor: pointer;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;

    &:hover {
      background-color: #c0392b;
    }
  }

  /* Ajuste para mobile */
  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    gap: 15px;

    a, button {
      width: 100%;
      text-align: center;
    }
  }
`;

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/'); // Manda de volta para a Home ao sair
  };

  return (
    <NavBar>
      <Brand to="/">Tech Blog</Brand>
      <NavLinks>
        <Link to="/">Home</Link>
        
        {/* Renderização Condicional: Mostra links diferentes se estiver logado ou não */}
        {isAuthenticated ? (
          <>
            <Link to="/admin">Painel Admin</Link>
            <button onClick={handleLogout}>Sair</button>
          </>
        ) : (
          <Link to="/login">Login Professor</Link>
        )}
      </NavLinks>
    </NavBar>
  );
}