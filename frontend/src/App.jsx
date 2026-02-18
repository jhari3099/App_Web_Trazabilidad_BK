import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Placeholders para las páginas que se crearán
const Solicitudes = () => <div className="card" style={{margin: '2rem'}}><h2>Módulo de Solicitudes</h2><p>En desarrollo...</p></div>;
const Clientes = () => <div className="card" style={{margin: '2rem'}}><h2>Módulo de Clientes Históricos</h2><p>En desarrollo...</p></div>;
const Evaluaciones = () => <div className="card" style={{margin: '2rem'}}><h2>Módulo de Evaluaciones</h2><p>En desarrollo...</p></div>;
const Usuarios = () => <div className="card" style={{margin: '2rem'}}><h2>Módulo de Usuarios</h2><p>En desarrollo...</p></div>;
const Trazabilidad = () => <div className="card" style={{margin: '2rem'}}><h2>Módulo de Trazabilidad</h2><p>En desarrollo...</p></div>;

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Ruta pública */}
          <Route path="/login" element={<Login />} />

          {/* Rutas protegidas */}
          <Route
            path="/*"
            element={
              <PrivateRoute>
                <Layout>
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/solicitudes" element={<Solicitudes />} />
                    <Route path="/clientes" element={<Clientes />} />
                    <Route 
                      path="/evaluaciones" 
                      element={
                        <PrivateRoute roles={['Admin', 'Riesgos']}>
                          <Evaluaciones />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/usuarios" 
                      element={
                        <PrivateRoute roles={['Admin']}>
                          <Usuarios />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/trazabilidad" 
                      element={
                        <PrivateRoute roles={['Admin']}>
                          <Trazabilidad />
                        </PrivateRoute>
                      } 
                    />
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Layout>
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
