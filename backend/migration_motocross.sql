-- ============================================================
-- MIGRACIÓN: Campos específicos del negocio Motocross
-- Ejecutar UNA VEZ sobre la BD existente
-- ============================================================

ALTER TABLE unidad
  ADD COLUMN IF NOT EXISTS color VARCHAR(50);

ALTER TABLE ord_venta
  ADD COLUMN IF NOT EXISTS destino VARCHAR(200),
  ADD COLUMN IF NOT EXISTS fecha_separacion DATE;

-- Actualizar la vista del estado con el nuevo valor
ALTER TABLE unidad
  DROP CONSTRAINT IF EXISTS unidad_estado_check;

ALTER TABLE unidad
  ADD CONSTRAINT unidad_estado_check
  CHECK (estado IN ('disponible', 'vendido', 'defectuoso', 'garantia', 'en_transito', 'exhibicion'));

SELECT 'Migración aplicada correctamente' AS resultado;
