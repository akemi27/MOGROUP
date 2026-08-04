-- ============================================================
-- DATOS REALES — MO GROUP (Motocross & Bicimoto)
-- Basado en el Excel de ventas SN-001 a SN-124
-- ⚠ LIMPIA TODO — no ejecutar en producción sin backup
-- Contraseña de todos los usuarios: admin123
-- ============================================================

BEGIN;

TRUNCATE movimiento_kardex, det_venta, rec_venta, ord_venta,
         det_compra, rec_compra, ord_compra,
         unidad, producto, cat_producto,
         cliente, proveedor, almacen,
         tip_recibo, usuarios
RESTART IDENTITY CASCADE;

-- ==================== TIPOS DE RECIBO ====================
INSERT INTO tip_recibo (nombre) VALUES
('Factura'),
('Boleta de Venta'),
('Nota de Venta'),
('Ticket');
-- IDs: 1=Factura, 2=Boleta, 3=Nota de Venta, 4=Ticket

-- ==================== USUARIOS ====================
INSERT INTO usuarios (nombre, username, password, rol, activo) VALUES
('Administrador General', 'admin',   '$2b$10$8SVpm2ko2e7e8ZmGdOkqL.xKQIhtVaYH5ocVHmG7E6T6xQh9OujKm', 'admin',    true),
('María García López',    'mariag',  '$2b$10$8SVpm2ko2e7e8ZmGdOkqL.xKQIhtVaYH5ocVHmG7E6T6xQh9OujKm', 'empleado', true),
('Carlos Ramírez Torres', 'carlosr', '$2b$10$8SVpm2ko2e7e8ZmGdOkqL.xKQIhtVaYH5ocVHmG7E6T6xQh9OujKm', 'empleado', true);

-- ==================== CATEGORÍAS ====================
INSERT INTO cat_producto (nombre) VALUES
('Motocross'),
('Bicimoto'),
('Moto Eléctrica');
-- IDs: 1=Motocross, 2=Bicimoto, 3=Moto Eléctrica

-- ==================== ALMACENES ====================
INSERT INTO almacen (nombre, activo) VALUES
('Almacén A',  true),
('Almacén B',  true);
-- IDs: 1=Almacén A, 2=Almacén B

-- ==================== PROVEEDORES ====================
INSERT INTO proveedor (nombre, contacto, activo) VALUES
('Proveedor Principal Motocross', 'Contacto Proveedor', true);
-- ID: 1

-- ==================== CLIENTES (reales del Excel) ====================
INSERT INTO cliente (nombre, dni, celular, activo) VALUES
('HECTOR GUSTAVO OLAZABAL QUISPE',    '45081156', '946658436', true),  -- 1
('JOEL WALKY CARITIMARI',             '74579313', '997353909', true),  -- 2
('RICHARD CARUAJULCA GONZALES',       '40678420', '971815819', true),  -- 3
('MASIEL VALDERA RAMOS',              '47311601', '981044148', true),  -- 4
('LUZ MERLI COTRINA RAMOS',           '72033137', '918771088', true),  -- 5
('DORIS ELITA LUNA PASHANASI',        '78017422', '999400000', true),  -- 6
('ESTER ANA PAUCAR SANTANA',          '74403865', '944873087', true),  -- 7
('WILBERT MAQUI PHOOCCO HUANCA',      '72015501', '987846277', true),  -- 8
('YUMARA KIRIA FERNANADEZ',           '72547207', '966402035', true),  -- 9
('NANCY JANETH ALBERCA NEIRA',        '75798531', '963485390', true),  -- 10
('ANTHONY GUSTAVO LEON',              '75063103', '910608737', true),  -- 11
('KENYI ROSALES VILLAREAL',           '74459463', '927428092', true),  -- 12
('ARACELI VASQUES CORONEL',           '48668197', '945528522', true),  -- 13
('HARDY JHONNY HUAMAN ESPINOZA',      '44352744', '908757351', true),  -- 14
('FERNANDO DIAZ TAPIA',               '01150679', '943952846', true),  -- 15
('MILAGROS LUNA OLAYA',               '76259439', '967336201', true),  -- 16
('MUÑOZ HERRERA MIGUEL ANGEL',        '77917758', '920312108', true),  -- 17
('FLORCITA',                          '80676375', '916874640', true),  -- 18
('YONER NORBELTO QUISPE',             '44124498', '938700000', true),  -- 19
('JHAIR SNEIDER CABANILLAS YGLESIAS', '76628232', '978381867', true),  -- 20
('CIELITO SANTA CRUZ QUIÑONES',       '73189805', '970914437', true),  -- 21
('JUNIOR ALEXANDER ALEJO',            '45450417', '923909626', true),  -- 22
('EDGAR ROSENDO LIZANA SANCHEZ',      '42416111', '994962771', true),  -- 23
('YAMIR ANTONIO SANDOVAL BERNAL',     '43185085', '926765694', true),  -- 24
('MEDRANO GUEVARA AROLDO JORDY',      '71851080', '926765694', true),  -- 25
('HUMBERTO MARTIN ALARCON FERNANDEZ', '45206406', '928913843', true),  -- 26
('RIDER BENANCIO AGUILAR',            '48819773', '930695687', true),  -- 27
('ANDRE ANNARITA INDAMA RIOS',        '61082717', '925832157', true),  -- 28
('LLOYD STPHENSON LOPEZ ORTIZ',       '70292590', '994849554', true),  -- 29
('ABEL DAVID ZULOETA ESPINOZA',       '48496844', '901057635', true),  -- 30
('JOSUE CEVALLOS PERALES',            '48213675', '950551750', true),  -- 31
('WILBER APAZA MAMANI',               '46892139', '935962298', true),  -- 32
('JERRY ALDAIR ASENCIO GIL',          '72311339', '902037053', true),  -- 33
('ELMER MARTIN ANDERSON DIAZ',        '47934477', '927490165', true),  -- 34
('ROSA CANDIA MARQUEZ',               '73906216', '931308210', true),  -- 35
('YENNIFER DEL PILAR RODRIGUEZ',      '77163825', '953500000', true),  -- 36
('JHOAN ADRIAN MACHACA LUNA',         '47029840', '994000000', true),  -- 37
('ADNER JESUS MORENO PINO',           '60324462', '975000000', true),  -- 38
('JEAN CARLOS TITE QUISPE',           '48570414', '978000000', true),  -- 39
('POLITA DEL JESUS GOMEZ RODRIGUEZ',  '46662351', '953413667', true),  -- 40
('MANUEL ANTONIO MANAYAY CALLACA',    '44103704', '900000001', true),  -- 41
('ROXANA LAMADRID ODAR',              '46453005', '917105521', true),  -- 42
('JUAN CARLOS CHOZO CORNEJO',         '73816462', '900000002', true),  -- 43
('MARIELA INES TESEN MEDINA',         '45459589', '900000003', true),  -- 44
('KARLA MARIBEL NAVARRO VILLANUEVA',  '75253450', '904086756', true),  -- 45
('GHRIBETS JEREMIAH CASTAÑEDA',       '76584021', '974211044', true);  -- 46

-- ==================== PRODUCTOS ====================
INSERT INTO producto (nombre, cat_producto_id, precio_ref, garantia_std, activo) VALUES
('Motocross',               1, 920.00, 12, true),  -- 1
('Bicimoto con Bluetooth',  2, 850.00, 12, true),  -- 2
('Moto Eléctrica',          3, 920.00, 12, true);  -- 3

-- ==================== COMPRA DE INVENTARIO ====================
INSERT INTO ord_compra (proveedor_id, fecha, total, estado) VALUES
(1, '2025-09-01', 120000.00, 'recibido');  -- 1

INSERT INTO det_compra (ord_compra_id, producto_id, cantidad, costo_unit) VALUES
(1, 1, 130, 700.00),   -- 130 motocross a S/.700 costo
(1, 2,  20, 600.00);   -- 20 bicimoto a S/.600 costo

INSERT INTO rec_compra (ord_compra_id, tip_recibo_id, numero, fecha) VALUES
(1, 1, 'F001-00001', '2025-09-01');

-- ==================== UNIDADES CON DATOS REALES ====================
-- (serie = código SN del Excel, color = color de la moto)
INSERT INTO unidad (producto_id, almacen_id, serie, color, estado, precio_venta, garantia_meses, activo) VALUES
-- Motocross vendidos (SN-001 a SN-050)
(1, 1, 'SN-001', 'Rojo',   'vendido',    920.00, 12, true),   -- 1
(1, 1, 'SN-002', 'Azul',   'vendido',    920.00, 12, true),   -- 2
(1, 1, 'SN-003', 'Rojo',   'vendido',    920.00, 12, true),   -- 3
(1, 1, 'SN-004', 'Rojo',   'vendido',    920.00, 12, true),   -- 4
(1, 1, 'SN-005', 'Blanco', 'vendido',    920.00, 12, true),   -- 5
(1, 1, 'SN-006', 'Rojo',   'vendido',    920.00, 12, true),   -- 6
(1, 1, 'SN-007', 'Blanco', 'vendido',    920.00, 12, true),   -- 7
(1, 1, 'SN-008', 'Rojo',   'vendido',    920.00, 12, true),   -- 8
(1, 1, 'SN-009', 'Blanco', 'vendido',    899.99, 12, true),   -- 9
(1, 1, 'SN-010', 'Azul',   'vendido',    899.99, 12, true),   -- 10
(1, 1, 'SN-011', 'Rojo',   'vendido',    920.00, 12, true),   -- 11
(1, 1, 'SN-012', 'Azul',   'vendido',    920.00, 12, true),   -- 12
(1, 1, 'SN-013', 'Blanco', 'vendido',    920.00, 12, true),   -- 13
(1, 1, 'SN-014', 'Blanco', 'vendido',    920.00, 12, true),   -- 14
(1, 1, 'SN-015', 'Azul',   'vendido',    920.00, 12, true),   -- 15
(1, 1, 'SN-016', 'Negro',  'vendido',    920.00, 12, true),   -- 16
(1, 1, 'SN-017', 'Rojo',   'vendido',    920.00, 12, true),   -- 17
(1, 1, 'SN-018', 'Blanco', 'vendido',    920.00, 12, true),   -- 18
(1, 1, 'SN-019', 'Rojo',   'vendido',    920.00, 12, true),   -- 19
(1, 1, 'SN-020', 'Negro',  'vendido',    920.00, 12, true),   -- 20
(1, 1, 'SN-022', 'Azul',   'vendido',    920.00, 12, true),   -- 21
(1, 1, 'SN-024', 'Negro',  'vendido',    920.00, 12, true),   -- 22
(1, 1, 'SN-025', 'Negro',  'vendido',    920.00, 12, true),   -- 23
(1, 1, 'SN-026', 'Azul',   'vendido',    920.00, 12, true),   -- 24
(1, 1, 'SN-030', 'Rojo',   'vendido',    899.99, 12, true),   -- 25
(1, 1, 'SN-031', 'Azul',   'vendido',    890.00, 12, true),   -- 26
(1, 1, 'SN-032', 'Negro',  'vendido',    920.00, 12, true),   -- 27
(1, 1, 'SN-033', 'Azul',   'vendido',    899.99, 12, true),   -- 28
(1, 1, 'SN-034', 'Negro',  'vendido',    920.00, 12, true),   -- 29
(1, 1, 'SN-035', 'Azul',   'vendido',    920.00, 12, true),   -- 30
(1, 1, 'SN-039', 'Negro',  'vendido',    920.00, 12, true),   -- 31
(1, 1, 'SN-040', 'Rojo',   'vendido',    920.00, 12, true),   -- 32
(1, 1, 'SN-041', 'Negro',  'vendido',    920.00, 12, true),   -- 33
(1, 1, 'SN-043', 'Azul',   'vendido',    920.00, 12, true),   -- 34
(1, 1, 'SN-044', 'Azul',   'vendido',    920.00, 12, true),   -- 35
(1, 1, 'SN-045', 'Rojo',   'vendido',    899.99, 12, true),   -- 36
(1, 1, 'SN-046', 'Negro',  'vendido',    899.99, 12, true),   -- 37
(1, 1, 'SN-047', 'Azul',   'vendido',    920.00, 12, true),   -- 38
(1, 1, 'SN-048', 'Blanco', 'vendido',    920.00, 12, true),   -- 39
(1, 1, 'SN-049', 'Azul',   'vendido',    920.00, 12, true),   -- 40
(1, 1, 'SN-050', 'Azul',   'vendido',    920.00, 12, true),   -- 41
-- Retornada
(1, 1, 'SN-051', 'Rojo',   'disponible', 920.00, 12, true),   -- 42  (retornado → disponible)
-- Más vendidas
(1, 1, 'SN-053', 'Azul',   'vendido',    920.00, 12, true),   -- 43
(1, 1, 'SN-054', 'Negro',  'vendido',    920.00, 12, true),   -- 44
(1, 1, 'SN-055', 'Blanco', 'vendido',    920.00, 12, true),   -- 45
(1, 1, 'SN-056', 'Rojo',   'vendido',    920.00, 12, true),   -- 46
(1, 1, 'SN-057', 'Azul',   'vendido',    920.00, 12, true),   -- 47
(1, 1, 'SN-058', 'Blanco', 'vendido',    920.00, 12, true),   -- 48
(1, 1, 'SN-060', 'Rojo',   'defectuoso', 920.00, 12, true),   -- 49  (anulado/retornado)
(1, 1, 'SN-064', 'Negro',  'vendido',   1000.00, 12, true),   -- 50
(1, 1, 'SN-065', 'Rojo',   'vendido',   1000.00, 12, true),   -- 51
(1, 1, 'SN-066', 'Blanco', 'vendido',   1000.00, 12, true),   -- 52
(1, 1, 'SN-067', 'Blanco', 'vendido',   1000.00, 12, true),   -- 53
(1, 1, 'SN-068', 'Blanco', 'vendido',    920.00, 12, true),   -- 54
(1, 1, 'SN-069', 'Rojo',   'vendido',    920.00, 12, true),   -- 55
(1, 1, 'SN-070', 'Rojo',   'vendido',    920.00, 12, true),   -- 56
(1, 1, 'SN-071', 'Rojo',   'vendido',    920.00, 12, true),   -- 57
(1, 1, 'SN-072', 'Negro',  'vendido',    920.00, 12, true),   -- 58
(1, 1, 'SN-073', 'Rojo',   'en_transito',920.00, 12, true),   -- 59  (enviado)
(1, 1, 'SN-074', 'Azul',   'en_transito',920.00, 12, true),   -- 60  (falta enviar)
(1, 1, 'SN-075', 'Rojo',   'en_transito',920.00, 12, true),   -- 61
-- Bicimoto vendidas (SN-110 en adelante)
(2, 1, 'SN-110', 'Sin color','vendido',  850.00, 12, true),   -- 62
(2, 1, 'SN-111', 'Sin color','vendido',  850.00, 12, true),   -- 63
(2, 1, 'SN-112', 'Sin color','vendido',  850.00, 12, true),   -- 64
(2, 1, 'SN-115', 'Sin color','vendido',  850.00, 12, true),   -- 65
(2, 1, 'SN-117', 'Sin color','vendido',  850.00, 12, true),   -- 66
(2, 1, 'SN-118', 'Sin color','vendido',  850.00, 12, true),   -- 67
(2, 1, 'SN-120', 'Sin color','vendido',  850.00, 12, true),   -- 68
(2, 1, 'SN-121', 'Sin color','vendido',  850.00, 12, true),   -- 69
(2, 1, 'SN-122', 'Sin color','vendido',  850.00, 12, true),   -- 70
(2, 1, 'SN-123', 'Sin color','vendido',  850.00, 12, true),   -- 71
-- Nuevas adquisiciones (segunda lote)
(1, 1, 'SN-A01', 'Rojo',   'vendido',    950.00, 12, true),   -- 72 (SN-1 del lote 2)
(1, 1, 'SN-A02', 'Sin color','vendido',  900.00, 12, true),   -- 73
(1, 1, 'SN-A03', 'Sin color','vendido',  950.00, 12, true),   -- 74
(1, 1, 'SN-A04', 'Sin color','vendido',  950.00, 12, true),   -- 75
(1, 1, 'SN-A05', 'Sin color','vendido',  950.00, 12, true),   -- 76
(1, 1, 'SN-A06', 'Sin color','vendido',  950.00, 12, true),   -- 77
(1, 1, 'SN-A07', 'Sin color','vendido',  950.00, 12, true),   -- 78
(1, 1, 'SN-A08', 'Sin color','vendido',  950.00, 12, true),   -- 79
(1, 1, 'SN-A09', 'Azul',   'vendido',    750.00, 12, true),   -- 80
(1, 1, 'SN-A10', 'Sin color','vendido',  950.00, 12, true),   -- 81
(1, 1, 'SN-A11', 'Sin color','vendido',  950.00, 12, true),   -- 82
-- Stock disponible actual (para pruebas)
(1, 1, 'SN-B01', 'Rojo',   'disponible', 950.00, 12, true),   -- 82
(1, 1, 'SN-B02', 'Azul',   'disponible', 950.00, 12, true),   -- 83
(1, 1, 'SN-B03', 'Negro',  'disponible', 950.00, 12, true),   -- 84
(1, 1, 'SN-B04', 'Blanco', 'disponible', 950.00, 12, true),   -- 85
(1, 2, 'SN-B05', 'Rojo',   'disponible', 950.00, 12, true),   -- 86
(2, 1, 'SN-B06', 'Sin color','disponible',950.00, 12, true),  -- 87
(2, 1, 'SN-B07', 'Sin color','disponible',950.00, 12, true),  -- 88
-- Exhibición
(1, 2, 'SN-EX1', 'Rojo',   'exhibicion', 950.00, 12, true),   -- 89
(1, 2, 'SN-EX2', 'Azul',   'exhibicion', 950.00, 12, true),   -- 90
(2, 2, 'SN-EX3', 'Sin color','exhibicion',950.00, 12, true);  -- 91

-- ==================== VENTAS REALES (agrupadas por boleta/fecha) ====================

-- Venta SN-001: HECTOR OLAZABAL → Juliaca-Puno
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(1, '2025-09-15', 920.00, 'completado', 'Juliaca - Puno', '2025-09-05');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (1, 1, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (1, 2, 'EB01-18', '2025-09-15');

-- Venta SN-002: JOEL CARITIMARI → Lima - San Miguel
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(2, '2025-09-09', 920.00, 'completado', 'Lima - San Miguel', '2025-09-06');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (2, 2, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (2, 2, 'EB01-19', '2025-09-09');

-- Venta SN-003: RICHARD CARUAJULCA → Chiclayo
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(3, '2025-09-07', 920.00, 'completado', 'Chiclayo', '2025-09-07');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (3, 3, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (3, 2, 'EBO1-4', '2025-09-07');

-- Venta SN-004: MASIEL VALDERA → Chiclayo
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(4, '2025-09-07', 920.00, 'completado', 'Chiclayo', '2025-09-07');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (4, 4, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (4, 2, 'EBO1-20', '2025-09-07');

-- Venta SN-005: LUZ COTRINA → San Martin - Picota
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(5, '2025-09-11', 920.00, 'completado', 'San Martin - Picota', '2025-09-06');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (5, 5, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (5, 2, 'EBO1-21', '2025-09-11');

-- Venta SN-006: DORIS LUNA → San Martin - Tarapoto
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(6, '2025-09-12', 920.00, 'completado', 'San Martin - Tarapoto', '2025-09-08');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (6, 6, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (6, 2, 'EBO1-5', '2025-09-12');

-- Venta SN-007: ESTER PAUCAR → San Martin - Pangoa
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(7, '2025-09-08', 920.00, 'completado', 'San Martin - Pangoa', '2025-09-08');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (7, 7, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (7, 2, 'EBO1-6', '2025-09-08');

-- Venta SN-008: WILBERT MAQUI → Arequipa
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(8, '2025-09-13', 920.00, 'completado', 'Arequipa', '2025-09-08');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (8, 8, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (8, 2, 'EBO1-7', '2025-09-13');

-- Venta SN-009 + SN-010: YUMARA FERNANADEZ → Junin - Huancayo (2 motos, misma boleta)
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(9, '2025-09-11', 1799.98, 'completado', 'Junin - Huancayo', '2025-09-08');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (9, 9, 899.99), (9, 10, 899.99);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (9, 2, 'EBO1-22', '2025-09-11');

-- Venta SN-011: NANCY ALBERCA → Cajamarca - San Ignacio
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(10, '2025-09-09', 920.00, 'completado', 'Cajamarca - San Ignacio', '2025-09-08');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (10, 11, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (10, 2, 'EBO1-23', '2025-09-09');

-- Venta SN-012: ANTHONY LEON → Chiclayo
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(11, '2025-09-09', 920.00, 'completado', 'Chiclayo', '2025-09-09');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (11, 12, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (11, 2, 'EBO1-10', '2025-09-09');

-- Venta SN-013: KENYI ROSALES → Pataz - La Libertad
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(12, '2025-09-08', 920.00, 'completado', 'Pataz - La Libertad', '2025-09-08');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (12, 13, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (12, 2, 'EBO1-24', '2025-09-08');

-- Venta SN-014: ARACELI VASQUES → San Martin
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(13, '2025-09-12', 920.00, 'completado', 'San Martin', '2025-09-10');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (13, 14, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (13, 2, 'EBO1-2', '2025-09-12');

-- Venta SN-015: ARACELI VASQUES → San Martin - Pardo Miguel (segunda compra, misma cliente)
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(13, '2025-10-10', 920.00, 'completado', 'San Martin - Pardo Miguel', '2025-10-10');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (14, 15, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (14, 2, 'EBO1-2', '2025-10-10');

-- Venta SN-016: HARDY HUAMAN → Paita
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(14, '2025-10-25', 920.00, 'completado', 'Paita', '2025-09-10');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (15, 16, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (15, 2, 'EBO1-25', '2025-10-25');

-- Venta SN-017: FERNANDO DIAZ → Picota
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(15, '2025-09-15', 920.00, 'completado', 'Picota', '2025-09-10');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (16, 17, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (16, 2, 'EBO1-33', '2025-09-15');

-- Venta SN-019: MILAGROS LUNA → Chiclayo
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(16, '2025-09-10', 920.00, 'completado', 'Chiclayo', '2025-09-10');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (17, 19, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (17, 2, 'EBO1-3', '2025-09-10');

-- Venta SN-020: MUÑOZ HERRERA → Juanjui
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino) VALUES
(17, '2025-09-20', 920.00, 'completado', 'Juanjui - San Martin');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (18, 20, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (18, 3, 'NV-001', '2025-09-20');

-- Venta SN-022: FLORCITA → Iquitos
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(18, '2025-09-08', 920.00, 'completado', 'Iquitos', '2025-09-08');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (19, 21, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (19, 2, 'EBO1-8', '2025-09-08');

-- Venta SN-024: YONER QUISPE → Satipo
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(19, '2025-09-07', 920.00, 'completado', 'Satipo - Junin', '2025-09-26');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (20, 22, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (20, 2, 'EBO1-12', '2025-09-07');

-- Venta SN-025: JHAIR CABANILLAS → Chiclayo
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(20, '2025-10-06', 920.00, 'completado', 'Chiclayo', '2025-10-04');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (21, 23, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (21, 2, 'EBO1-9', '2025-10-06');

-- Venta SN-026: CIELITO SANTA CRUZ → Chiclayo (pago en efectivo)
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(21, '2025-10-08', 920.00, 'completado', 'Chiclayo', '2025-10-08');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (22, 24, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (22, 3, 'NV-002', '2025-10-08');

-- Venta SN-032+SN-033: MEDRANO GUEVARA AROLDO → Nueva Cajamarca (2 motos)
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(25, '2025-10-24', 1819.98, 'completado', 'Nueva Cajamarca', '2025-10-17');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (23, 27, 920.00), (23, 28, 899.99);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (23, 2, 'EBO1-34', '2025-10-24');

-- Venta SN-034: GHRIBETS CASTAÑEDA → Chiclayo (FACTURA)
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(46, '2025-10-21', 920.00, 'completado', 'Chiclayo', '2025-10-21');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (24, 29, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (24, 1, 'EOO1-1', '2025-10-21');

-- Venta SN-035: EDGAR LIZANA → Bagua Grande
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(23, '2025-10-24', 920.00, 'completado', 'Bagua Grande', '2025-10-24');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (25, 30, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (25, 2, 'EBO1-26', '2025-10-24');

-- Venta SN-039: HUMBERTO ALARCON → Chiclayo
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(26, '2025-10-28', 920.00, 'completado', 'Chiclayo', '2025-10-28');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (26, 31, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (26, 2, 'EBO1-30', '2025-10-28');

-- Venta SN-040: RIDER AGUILAR → Huanuco
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(27, '2025-11-07', 920.00, 'completado', 'Huanuco', '2025-11-03');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (27, 32, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (27, 2, 'EBO1-60', '2025-11-07');

-- Venta SN-041: ANDRE INDAMA → Pucallpa
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(28, '2025-10-22', 920.00, 'completado', 'Pucallpa', '2025-10-16');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (28, 33, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (28, 2, 'EBO1-35', '2025-10-22');

-- Venta SN-043: LLOYD LOPEZ → Tuman
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(29, '2025-10-20', 920.00, 'completado', 'Tuman - Chiclayo', '2025-10-20');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (29, 34, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (29, 2, 'EBO1-28', '2025-10-20');

-- Venta SN-044: ABEL ZULOETA → Tuman (FACTURA)
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(30, '2025-10-25', 920.00, 'completado', 'Tuman - Chiclayo', '2025-10-20');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (30, 35, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (30, 1, 'EB01-41', '2025-10-25');

-- Venta SN-045+SN-046: JOSUE CEVALLOS → Chiclayo (2 motos)
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(31, '2025-11-01', 1799.98, 'completado', 'Chiclayo', '2025-11-01');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (31, 36, 899.99), (31, 37, 899.99);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (31, 2, 'EBO1-36', '2025-11-01');

-- Venta SN-047: WILBER APAZA → Arequipa
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(32, '2025-11-01', 920.00, 'completado', 'Arequipa', '2025-10-28');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (32, 38, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (32, 2, 'EBO1-37', '2025-11-01');

-- Venta SN-049+SN-058: JERRY ASENCIO → Paijan + Trujillo
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(33, '2025-11-04', 1840.00, 'completado', 'Paijan / Trujillo', '2025-10-31');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (33, 40, 920.00), (33, 48, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (33, 2, 'EBO1-39', '2025-11-04');

-- Venta SN-050: ELMER ANDERSON → Picota
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(34, '2025-10-31', 920.00, 'completado', 'Picota - San Martin', '2025-10-31');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (34, 41, 920.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (34, 2, 'EB01-40', '2025-10-31');

-- Venta SN-A01: MANUEL MANAYAY (lote 2 - Marzo 2026)
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino) VALUES
(41, '2026-03-05', 950.00, 'completado', 'Chiclayo');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (35, 72, 950.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (35, 2, 'EB01-127', '2026-03-05');

-- Ventas de ROXANA LAMADRID (6 motos en Marzo 2026 - cliente frecuente, FACTURA)
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino) VALUES
(42, '2026-03-10', 5700.00, 'completado', 'Chiclayo');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES
(36, 73, 900.00), (36, 74, 950.00), (36, 75, 950.00),
(36, 76, 950.00), (36, 77, 950.00), (36, 78, 950.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (36, 1, 'E001-16', '2026-03-10');

-- Venta SN-A08: JUAN CARLOS CHOZO
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino) VALUES
(43, '2026-03-11', 950.00, 'completado', 'Chiclayo');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (37, 79, 950.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (37, 2, 'EB01-126', '2026-03-11');

-- Venta SN-A09: MARIELA TESEN
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino) VALUES
(44, '2026-03-16', 750.00, 'completado', 'Chiclayo');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (38, 80, 750.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (38, 2, 'EB01-125', '2026-03-16');

-- Venta SN-A10: KARLA NAVARRO → Jaen
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino, fecha_separacion) VALUES
(45, '2026-01-09', 750.00, 'completado', 'Jaen - Cajamarca', '2026-01-07');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (39, 81, 750.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (39, 2, 'EB01-112', '2026-01-09');

-- Ventas Bicimoto (SN-110 a SN-123)
INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino) VALUES
(NULL, '2026-01-12', 850.00, 'completado', 'Chiclayo');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (40, 62, 850.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (40, 1, 'E001-14', '2026-01-12');

INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino) VALUES
(NULL, '2026-01-12', 850.00, 'completado', 'Chiclayo');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (41, 63, 850.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (41, 2, 'EB01-110', '2026-01-12');

INSERT INTO ord_venta (cliente_id, fecha, total, estado, destino) VALUES
(NULL, '2026-01-12', 850.00, 'completado', 'Chiclayo');
INSERT INTO det_venta (ord_venta_id, unidad_id, precio) VALUES (42, 64, 850.00);
INSERT INTO rec_venta (ord_venta_id, tip_recibo_id, numero, fecha) VALUES (42, 2, 'EB01-111', '2026-01-12');

COMMIT;

SELECT 'Seed real cargado: ' || COUNT(*) || ' unidades' AS resultado FROM unidad;
SELECT 'Ventas registradas: ' || COUNT(*) AS ventas FROM ord_venta;
SELECT 'Clientes registrados: ' || COUNT(*) AS clientes FROM cliente;
