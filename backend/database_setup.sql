-- Tabla de usuarios del sistema
CREATE TABLE IF NOT EXISTS usuarios (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    username    VARCHAR(50)  UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,
    rol         VARCHAR(20)  NOT NULL DEFAULT 'empleado' CHECK (rol IN ('admin', 'empleado')),
    activo      BOOLEAN      NOT NULL DEFAULT true,
    creado_en   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Usuario administrador inicial
-- Contraseña: admin123 (cambiar en producción)
INSERT INTO usuarios (nombre, username, password, rol)
VALUES (
    'Administrador',
    'admin',
    '$2b$10$8SVpm2ko2e7e8ZmGdOkqL.xKQIhtVaYH5ocVHmG7E6T6xQh9OujKm',
    'admin'
)
ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, rol = EXCLUDED.rol;

-- Contraseña: admin123
