import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Se estiver logado, renderiza o componente filho (a página protegida)
  // Se não estiver, redireciona para a página de login
  return isAuthenticated ? children : <Navigate to="/login" />;
};