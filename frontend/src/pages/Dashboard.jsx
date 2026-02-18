import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { solicitudesService } from '../services/api';
import { 
  LayoutDashboard, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp 
} from 'lucide-react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await solicitudesService.getDashboard();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error cargando dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Solicitudes',
      value: stats?.total || 0,
      icon: FileText,
      color: 'blue',
    },
    {
      title: 'Pendientes',
      value: stats?.pendientes || 0,
      icon: Clock,
      color: 'yellow',
    },
    {
      title: 'Aprobadas',
      value: stats?.aprobadas || 0,
      icon: CheckCircle,
      color: 'green',
    },
    {
      title: 'Rechazadas',
      value: stats?.rechazadas || 0,
      icon: XCircle,
      color: 'red',
    },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Bienvenido, {user?.nombre_completo}</p>
        </div>
        <div className="user-badge">
          <span className="badge badge-info">{user?.rol}</span>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`stat-card stat-card-${stat.color}`}>
              <div className="stat-icon">
                <Icon size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-title">{stat.title}</p>
                <p className="stat-value">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="dashboard-content">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Resumen de Actividades</h2>
          </div>
          <div className="welcome-message">
            <LayoutDashboard size={64} strokeWidth={1} />
            <h3>¡Bienvenido al Sistema de Evaluación de Clientes!</h3>
            <p>
              {user?.rol === 'Comercial' && 
                'Desde aquí puedes gestionar tus solicitudes de evaluación de clientes.'}
              {user?.rol === 'Riesgos' && 
                'Desde aquí puedes evaluar las solicitudes y emitir dictámenes.'}
              {user?.rol === 'Admin' && 
                'Desde aquí puedes administrar usuarios y monitorear el sistema.'}
            </p>
            <div className="quick-actions">
              <h4>Acciones Rápidas:</h4>
              <ul>
                {user?.rol === 'Comercial' && (
                  <>
                    <li>Crear nueva solicitud de evaluación</li>
                    <li>Ver estado de mis solicitudes</li>
                    <li>Consultar historial de clientes</li>
                  </>
                )}
                {user?.rol === 'Riesgos' && (
                  <>
                    <li>Revisar solicitudes pendientes</li>
                    <li>Consultar API Sheriff</li>
                    <li>Emitir dictámenes de evaluación</li>
                  </>
                )}
                {user?.rol === 'Admin' && (
                  <>
                    <li>Gestionar usuarios del sistema</li>
                    <li>Ver trazabilidad completa</li>
                    <li>Importar datos históricos</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
