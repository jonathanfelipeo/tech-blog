import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';

// Importação das páginas e componentes
import Header from './components/Header'; 
import Home from './pages/Home';
import PostView from './pages/PostView';
import Login from './pages/Login';
import Admin from './pages/Admin';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* O Header fica fora do <Routes> para aparecer em todas as telas */}
        <Header /> 
        
        <Routes>
          {/* Rotas Públicas */}
          <Route path="/" element={<Home />} />
          <Route path="/post/:id" element={<PostView />} />
          <Route path="/login" element={<Login />} />

          {/* Rotas Protegidas */}
          <Route 
            path="/admin" 
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/novo" 
            element={
              <PrivateRoute>
                <CreatePost />
              </PrivateRoute>
            } 
          />
          <Route 
            path="/admin/editar/:id" 
            element={
              <PrivateRoute>
                <EditPost />
              </PrivateRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;