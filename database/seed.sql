-- =============================================
-- Script para generar usuarios de prueba
-- IMPORTANTE: Ejecutar después de schema.sql
-- =============================================

USE evaluacion_clientes;

-- Eliminar usuarios de prueba existentes (opcional)
DELETE FROM usuarios WHERE username IN ('admin', 'comercial1', 'comercial2', 'riesgos1', 'riesgos2');

-- Insertar usuarios
-- Password para todos: Admin123!
-- Hash generado con bcrypt (rounds=10)
INSERT INTO usuarios (username, email, password, nombre_completo, rol) VALUES
('admin', 'admin@empresa.com', '$2b$10$kO8pJ3h.SJVm1BoHZlZqP.VQC5KxN3p7GjDpNc7rWYJ.9DwBHBc5C', 'Administrador del Sistema', 'Admin'),
('comercial1', 'comercial1@empresa.com', '$2b$10$kO8pJ3h.SJVm1BoHZlZqP.VQC5KxN3p7GjDpNc7rWYJ.9DwBHBc5C', 'Juan Pérez - Comercial', 'Comercial'),
('comercial2', 'comercial2@empresa.com', '$2b$10$kO8pJ3h.SJVm1BoHZlZqP.VQC5KxN3p7GjDpNc7rWYJ.9DwBHBc5C', 'María García - Comercial', 'Comercial'),
('riesgos1', 'riesgos1@empresa.com', '$2b$10$kO8pJ3h.SJVm1BoHZlZqP.VQC5KxN3p7GjDpNc7rWYJ.9DwBHBc5C', 'Carlos López - Riesgos', 'Riesgos'),
('riesgos2', 'riesgos2@empresa.com', '$2b$10$kO8pJ3h.SJVm1BoHZlZqP.VQC5KxN3p7GjDpNc7rWYJ.9DwBHBc5C', 'Ana Martínez - Riesgos', 'Riesgos');

-- Insertar algunos clientes históricos de ejemplo
INSERT INTO clientes_historicos (ruc, razon_social, direccion, sector, monto_aprobado, unidades_aprobadas, estado) VALUES
('20123456789', 'EMPRESA EJEMPLO SAC', 'Av. Principal 123, Lima', 'Comercio', 500000.00, 10, 'Activo'),
('20987654321', 'DISTRIBUIDORA PERU SAC', 'Jr. Los Andes 456, Lima', 'Distribución', 750000.00, 15, 'Activo'),
('20555666777', 'IMPORTACIONES DEL SUR EIRL', 'Calle Las Flores 789, Arequipa', 'Importación', 350000.00, 8, 'Activo');

SELECT 'Usuarios y datos de prueba insertados correctamente' AS mensaje;
