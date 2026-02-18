import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Database,
  Shield,
  Users,
  Activity,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import '../styles/Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      roles: ['Admin', 'Comercial', 'Riesgos']
    },
    {
      path: '/solicitudes',
      icon: FileText,
      label: 'Solicitudes',
      roles: ['Admin', 'Comercial', 'Riesgos']
    },
    {
      path: '/clientes',
      icon: Database,
      label: 'Clientes Históricos',
      roles: ['Admin', 'Comercial', 'Riesgos']
    },
    {
      path: '/evaluaciones',
      icon: Shield,
      label: 'Evaluaciones',
      roles: ['Admin', 'Riesgos']
    },
    {
      path: '/usuarios',
      icon: Users,
      label: 'Usuarios',
      roles: ['Admin']
    },
    {
      path: '/trazabilidad',
      icon: Activity,
      label: 'Trazabilidad',
      roles: ['Admin']
    },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.rol)
  );

  return (
    <div className="layout-container">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2>Sistema Evaluación</h2>
          <button 
            className="sidebar-toggle mobile-only"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'nav-item-active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.nombre_completo?.charAt(0) || 'U'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.nombre_completo}</p>
              <p className="user-role">{user?.rol}</p>
            </div>
          </div>
          <button className="btn btn-danger btn-logout" onClick={handleLogout}>
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        {/* Mobile Header */}
        <div className="mobile-header">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <h1>Sistema Evaluación</h1>
        </div>

        {/* Content */}
        <main className="content">
          {children}
        </main>
      </div>

      {/* Overlay para cerrar sidebar en mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;
