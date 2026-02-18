import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import '../styles/Login.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔍 Form submitted - username:', username, 'password:', password);
    setError('');
    setLoading(true);

    try {
      console.log('📤 Enviando petición a http://localhost:3000/api/auth/login');
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password })
      });

      console.log('📥 Status:', response.status);
      const data = await response.json();
      console.log('📥 Data:', data);

      if (response.ok && data.success) {
        console.log('✅ Login exitoso');
        console.log('📦 Guardando token y usuario en localStorage');
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        console.log('🔄 Navegando a /dashboard');
        console.log('navigate function:', navigate);
        navigate('/dashboard');
        console.log('🚀 Navigate llamado');
      } else {
        console.log('❌ Login fallido:', data.message);
        setError(data.message || 'Error al iniciar sesión');
      }
    } catch (err) {
      console.error('🔥 Error en login:', err);
      setError(err.message || 'Error al conectar con el servidor');
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <LogIn size={48} className="login-icon" />
          <h1>Sistema de Evaluación de Clientes</h1>
          <p>Ingresa tus credenciales para continuar</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="username" className="form-label">Usuario</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                console.log('Username changed:', e.target.value);
                setUsername(e.target.value);
              }}
              className="form-input"
              required
              autoComplete="username"
              placeholder="Ingresa tu usuario"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                console.log('Password changed');
                setPassword(e.target.value);
              }}
              className="form-input"
              required
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña"
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="loading-spinner"></div>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>Usuarios de prueba: admin / comercial1 / riesgos1</p>
          <p>Contraseña: Admin123!</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
