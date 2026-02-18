-- =============================================
-- Sistema de Evaluación de Clientes
-- Script de Creación de Base de Datos
-- =============================================

-- Crear base de datos si no existe
CREATE DATABASE IF NOT EXISTS evaluacion_clientes 
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE evaluacion_clientes;

-- =============================================
-- Tabla: usuarios
-- Descripción: Almacena usuarios del sistema con roles
-- =============================================
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    rol ENUM('Admin', 'Comercial', 'Riesgos') NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_rol (rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabla: clientes_historicos
-- Descripción: Base histórica de clientes
-- =============================================
CREATE TABLE IF NOT EXISTS clientes_historicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ruc VARCHAR(11) NOT NULL UNIQUE,
    razon_social VARCHAR(255) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    sector VARCHAR(100),
    monto_aprobado DECIMAL(15, 2),
    unidades_aprobadas INT,
    estado VARCHAR(50),
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    datos_adicionales JSON,
    INDEX idx_ruc (ruc),
    INDEX idx_razon_social (razon_social),
    INDEX idx_estado (estado)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabla: solicitudes
-- Descripción: Solicitudes de evaluación de clientes
-- =============================================
CREATE TABLE IF NOT EXISTS solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ruc VARCHAR(11) NOT NULL,
    razon_social VARCHAR(255) NOT NULL,
    monto_solicitado DECIMAL(15, 2) NOT NULL,
    unidades_solicitadas INT NOT NULL,
    estado_solicitud ENUM('Pendiente', 'En Evaluación', 'Aprobado', 'Rechazado', 'Devuelto') DEFAULT 'Pendiente',
    comercial_id INT NOT NULL,
    fecha_solicitud TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    observaciones TEXT,
    FOREIGN KEY (comercial_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_ruc (ruc),
    INDEX idx_estado (estado_solicitud),
    INDEX idx_comercial (comercial_id),
    INDEX idx_fecha (fecha_solicitud)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabla: declaraciones_juradas
-- Descripción: Documentos de declaraciones juradas
-- =============================================
CREATE TABLE IF NOT EXISTS declaraciones_juradas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_documento VARCHAR(100),
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    INDEX idx_solicitud (solicitud_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabla: reportes_tributarios
-- Descripción: Documentos de reportes tributarios
-- =============================================
CREATE TABLE IF NOT EXISTS reportes_tributarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL,
    nombre_archivo VARCHAR(255) NOT NULL,
    ruta_archivo VARCHAR(500) NOT NULL,
    tipo_reporte VARCHAR(100),
    periodo VARCHAR(20),
    fecha_carga TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    INDEX idx_solicitud (solicitud_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabla: datos_sheriff
-- Descripción: Respuestas completas de la API Sheriff
-- =============================================
CREATE TABLE IF NOT EXISTS datos_sheriff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL,
    ruc VARCHAR(11) NOT NULL,
    respuesta_json JSON NOT NULL,
    fecha_consulta TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    usuario_consulta_id INT NOT NULL,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_consulta_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_solicitud (solicitud_id),
    INDEX idx_ruc (ruc),
    INDEX idx_fecha (fecha_consulta)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabla: dictamen_riesgo
-- Descripción: Dictámenes emitidos por el área de riesgos
-- =============================================
CREATE TABLE IF NOT EXISTS dictamen_riesgo (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitud_id INT NOT NULL,
    sheriff_data_id INT,
    dictamen ENUM('APROBADO', 'RECHAZADO', 'DEVUELTO') NOT NULL,
    monto_aprobado DECIMAL(15, 2),
    unidades_aprobadas INT,
    analista_id INT NOT NULL,
    comentarios TEXT,
    fecha_dictamen TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (solicitud_id) REFERENCES solicitudes(id) ON DELETE CASCADE,
    FOREIGN KEY (sheriff_data_id) REFERENCES datos_sheriff(id) ON DELETE SET NULL,
    FOREIGN KEY (analista_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_solicitud (solicitud_id),
    INDEX idx_dictamen (dictamen),
    INDEX idx_analista (analista_id),
    INDEX idx_fecha (fecha_dictamen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Tabla: trazabilidad
-- Descripción: Registro de todas las acciones del sistema
-- =============================================
CREATE TABLE IF NOT EXISTS trazabilidad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    area VARCHAR(50) NOT NULL,
    accion VARCHAR(255) NOT NULL,
    tabla_afectada VARCHAR(100),
    registro_id INT,
    comentario TEXT,
    datos_adicionales JSON,
    fecha_accion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
    INDEX idx_usuario (usuario_id),
    INDEX idx_area (area),
    INDEX idx_fecha (fecha_accion),
    INDEX idx_tabla (tabla_afectada, registro_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- Insertar usuarios por defecto
-- Contraseñas (todas: Admin123!)
-- =============================================
INSERT INTO usuarios (username, email, password, nombre_completo, rol) VALUES
('admin', 'admin@empresa.com', '$2b$10$YourHashedPasswordHere', 'Administrador del Sistema', 'Admin'),
('comercial1', 'comercial@empresa.com', '$2b$10$YourHashedPasswordHere', 'Usuario Comercial', 'Comercial'),
('riesgos1', 'riesgos@empresa.com', '$2b$10$YourHashedPasswordHere', 'Analista de Riesgos', 'Riesgos')
ON DUPLICATE KEY UPDATE username = username;

-- =============================================
-- Trigger para actualizar estado de solicitud
-- =============================================
DELIMITER $$

CREATE TRIGGER after_dictamen_insert
AFTER INSERT ON dictamen_riesgo
FOR EACH ROW
BEGIN
    UPDATE solicitudes 
    SET estado_solicitud = NEW.dictamen
    WHERE id = NEW.solicitud_id;
END$$

DELIMITER ;

-- =============================================
-- Vista: resumen_solicitudes
-- =============================================
CREATE OR REPLACE VIEW resumen_solicitudes AS
SELECT 
    s.id,
    s.ruc,
    s.razon_social,
    s.monto_solicitado,
    s.unidades_solicitadas,
    s.estado_solicitud,
    s.fecha_solicitud,
    u.nombre_completo AS comercial,
    dr.dictamen,
    dr.monto_aprobado,
    dr.unidades_aprobadas,
    dr.fecha_dictamen,
    CASE 
        WHEN ds.id IS NOT NULL THEN 'Si'
        ELSE 'No'
    END AS tiene_consulta_sheriff
FROM solicitudes s
LEFT JOIN usuarios u ON s.comercial_id = u.id
LEFT JOIN dictamen_riesgo dr ON s.id = dr.solicitud_id
LEFT JOIN datos_sheriff ds ON s.id = ds.solicitud_id;

-- =============================================
-- Procedimiento almacenado: obtener_trazabilidad_solicitud
-- =============================================
DELIMITER $$

CREATE PROCEDURE obtener_trazabilidad_solicitud(IN solicitud_id INT)
BEGIN
    SELECT 
        t.id,
        t.accion,
        t.comentario,
        t.fecha_accion,
        u.nombre_completo AS usuario,
        t.area
    FROM trazabilidad t
    INNER JOIN usuarios u ON t.usuario_id = u.id
    WHERE t.tabla_afectada = 'solicitudes' 
      AND t.registro_id = solicitud_id
    ORDER BY t.fecha_accion DESC;
END$$

DELIMITER ;

-- =============================================
-- Fin del script
-- =============================================
