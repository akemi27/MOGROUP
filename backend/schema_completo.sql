-- ============================================================
--  MO GROUP -- Schema completo de base de datos
--  Ejecutar en orden; requiere PostgreSQL 13+
-- ============================================================

-- ------------------------------------------------------------
-- 1. USUARIOS DEL SISTEMA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS usuarios (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100)  NOT NULL,
    username    VARCHAR(50)   NOT NULL UNIQUE,
    password    VARCHAR(255)  NOT NULL,
    rol         VARCHAR(20)   NOT NULL DEFAULT 'empleado'
                    CHECK (rol IN ('admin', 'empleado')),
    activo      BOOLEAN       NOT NULL DEFAULT true,
    creado_en   TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- Usuario administrador inicial  (contraseña: admin123)
INSERT INTO usuarios (nombre, username, password, rol)
VALUES ('Administrador', 'admin',
        '$2b$10$8SVpm2ko2e7e8ZmGdOkqL.xKQIhtVaYH5ocVHmG7E6T6xQh9OujKm',
        'admin')
ON CONFLICT (username) DO UPDATE
    SET password = EXCLUDED.password,
        rol      = EXCLUDED.rol;

-- ------------------------------------------------------------
-- 2. TIPOS DE RECIBO  (factura, boleta, nota de crédito…)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tip_recibo (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO tip_recibo (nombre) VALUES
    ('Factura'), ('Boleta de Venta'),
    ('Nota de Crédito'), ('Nota de Débito')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 3. CATEGORÍAS DE PRODUCTOS
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cat_producto (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(100) NOT NULL UNIQUE
);

-- ------------------------------------------------------------
-- 4. PROVEEDORES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proveedor (
    id          SERIAL PRIMARY KEY,
    ruc         VARCHAR(11)   UNIQUE,
    nombre      VARCHAR(200)  NOT NULL,
    contacto    VARCHAR(100),
    email       VARCHAR(100),
    telefono    VARCHAR(20),
    direccion   TEXT,
    activo      BOOLEAN       NOT NULL DEFAULT true
);

-- ------------------------------------------------------------
-- 5. ALMACENES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS almacen (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(100) NOT NULL UNIQUE,
    activo  BOOLEAN      NOT NULL DEFAULT true
);

INSERT INTO almacen (nombre) VALUES ('Almacén Principal')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- 6. PRODUCTOS  (modelo / referencia — no la unidad física)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS producto (
    id              SERIAL PRIMARY KEY,
    cat_producto_id INTEGER REFERENCES cat_producto(id),
    nombre          VARCHAR(200) NOT NULL,
    precio_ref      DECIMAL(10,2) NOT NULL DEFAULT 0,
    garantia_std    INTEGER       NOT NULL DEFAULT 12,   -- meses
    activo          BOOLEAN       NOT NULL DEFAULT true
);

-- ------------------------------------------------------------
-- 7. UNIDADES  (cada ítem físico: tiene serie / IMEI propio)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS unidad (
    id              SERIAL PRIMARY KEY,
    producto_id     INTEGER       NOT NULL REFERENCES producto(id),
    almacen_id      INTEGER       NOT NULL REFERENCES almacen(id),
    serie           VARCHAR(50),                          -- IMEI para celulares
    estado          VARCHAR(20)   NOT NULL DEFAULT 'disponible'
                        CHECK (estado IN ('disponible', 'vendido', 'defectuoso', 'garantia')),
    precio_venta    DECIMAL(10,2) NOT NULL DEFAULT 0,
    garantia_meses  INTEGER,
    activo          BOOLEAN       NOT NULL DEFAULT true
);

-- ------------------------------------------------------------
-- 8. ÓRDENES DE COMPRA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ord_compra (
    id              SERIAL PRIMARY KEY,
    proveedor_id    INTEGER       NOT NULL REFERENCES proveedor(id),
    fecha           DATE          NOT NULL DEFAULT CURRENT_DATE,
    total           DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado          VARCHAR(20)   NOT NULL DEFAULT 'pendiente'
                        CHECK (estado IN ('pendiente', 'recibido', 'cancelado')),
    creado_en       TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 9. DETALLE DE COMPRA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS det_compra (
    id              SERIAL PRIMARY KEY,
    ord_compra_id   INTEGER       NOT NULL REFERENCES ord_compra(id),
    producto_id     INTEGER       NOT NULL REFERENCES producto(id),
    cantidad        INTEGER       NOT NULL CHECK (cantidad > 0),
    costo_unit      DECIMAL(10,2) NOT NULL CHECK (costo_unit >= 0)
);

-- ------------------------------------------------------------
-- 10. RECIBOS DE COMPRA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rec_compra (
    id              SERIAL PRIMARY KEY,
    ord_compra_id   INTEGER NOT NULL REFERENCES ord_compra(id),
    tip_recibo_id   INTEGER NOT NULL REFERENCES tip_recibo(id),
    numero          VARCHAR(50)   NOT NULL,
    fecha           DATE          NOT NULL DEFAULT CURRENT_DATE
);

-- ------------------------------------------------------------
-- 11. CLIENTES
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cliente (
    id      SERIAL PRIMARY KEY,
    nombre  VARCHAR(200) NOT NULL,
    dni     VARCHAR(8)   UNIQUE,
    celular VARCHAR(15),
    email   VARCHAR(100),
    activo  BOOLEAN      NOT NULL DEFAULT true
);

-- ------------------------------------------------------------
-- 12. ÓRDENES DE VENTA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ord_venta (
    id          SERIAL PRIMARY KEY,
    cliente_id  INTEGER       REFERENCES cliente(id),
    fecha       DATE          NOT NULL DEFAULT CURRENT_DATE,
    total       DECIMAL(10,2) NOT NULL DEFAULT 0,
    estado      VARCHAR(20)   NOT NULL DEFAULT 'completado'
                    CHECK (estado IN ('completado', 'anulado')),
    creado_en   TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- 13. DETALLE DE VENTA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS det_venta (
    id           SERIAL PRIMARY KEY,
    ord_venta_id INTEGER       NOT NULL REFERENCES ord_venta(id),
    unidad_id    INTEGER       NOT NULL REFERENCES unidad(id),
    precio       DECIMAL(10,2) NOT NULL CHECK (precio >= 0)
);

-- ------------------------------------------------------------
-- 14. RECIBOS DE VENTA
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rec_venta (
    id              SERIAL PRIMARY KEY,
    ord_venta_id    INTEGER NOT NULL REFERENCES ord_venta(id),
    tip_recibo_id   INTEGER NOT NULL REFERENCES tip_recibo(id),
    numero          VARCHAR(50) NOT NULL,
    fecha           DATE        NOT NULL DEFAULT CURRENT_DATE
);

-- ------------------------------------------------------------
-- 15. MOVIMIENTO KARDEX
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS movimiento_kardex (
    id              SERIAL PRIMARY KEY,
    unidad_id       INTEGER       NOT NULL REFERENCES unidad(id),
    almacen_id      INTEGER       NOT NULL REFERENCES almacen(id),
    tipo            VARCHAR(20)   NOT NULL
                        CHECK (tipo IN ('entrada', 'salida', 'traslado')),
    cantidad        INTEGER       NOT NULL DEFAULT 1,
    costo_unit      DECIMAL(10,2) NOT NULL DEFAULT 0,
    fecha           DATE          NOT NULL DEFAULT CURRENT_DATE,
    det_compra_id   INTEGER       REFERENCES det_compra(id),
    det_venta_id    INTEGER       REFERENCES det_venta(id),
    saldo           DECIMAL(10,2) NOT NULL DEFAULT 0
);

-- ============================================================
--  ÍNDICES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_producto_cat     ON producto(cat_producto_id);
CREATE INDEX IF NOT EXISTS idx_unidad_producto  ON unidad(producto_id);
CREATE INDEX IF NOT EXISTS idx_unidad_almacen   ON unidad(almacen_id);
CREATE INDEX IF NOT EXISTS idx_unidad_serie     ON unidad(serie);
CREATE INDEX IF NOT EXISTS idx_detc_orden       ON det_compra(ord_compra_id);
CREATE INDEX IF NOT EXISTS idx_detc_producto    ON det_compra(producto_id);
CREATE INDEX IF NOT EXISTS idx_detv_orden       ON det_venta(ord_venta_id);
CREATE INDEX IF NOT EXISTS idx_detv_unidad      ON det_venta(unidad_id);
CREATE INDEX IF NOT EXISTS idx_kardex_unidad    ON movimiento_kardex(unidad_id);
CREATE INDEX IF NOT EXISTS idx_kardex_fecha     ON movimiento_kardex(fecha);
CREATE INDEX IF NOT EXISTS idx_ordc_proveedor   ON ord_compra(proveedor_id);
CREATE INDEX IF NOT EXISTS idx_ordv_cliente     ON ord_venta(cliente_id);
