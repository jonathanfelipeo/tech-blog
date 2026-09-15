import React, { createContext, useState, useContext } from 'react';

// Cria o contexto
export const AuthContext = createContext();

// Componente provedor que vai abraçar a aplicação
export const AuthProvider = ({ children }) => {
  // Estado para armazenar se o usuário está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Função para simular o login para professores (depois integraremos com a API)
  const login = () => {
    setIsAuthenticated(true);
  };

  // Função para logout
  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para facilitar o uso do contexto
export const useAuth = () => useContext(AuthContext);