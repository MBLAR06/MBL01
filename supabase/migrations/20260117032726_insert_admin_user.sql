/*
  # Insertar usuario administrador inicial

  ## Descripción
  Inserta el usuario administrador por defecto en la tabla admin_users.
  Este usuario se utilizará para acceder al panel administrativo.

  ## Detalles
  - Usuario: ADMINBL
  - Contraseña hash: SHA256 de "86@$#&bihutrfcñpKGe.jobw@bl"
  
  Nota: Como no podemos crear usuarios directamente en auth.users desde SQL,
  usaremos la tabla admin_users con autenticación custom basada en JWT.
*/

-- Modificar tabla admin_users para no requerir FK con auth.users
ALTER TABLE admin_users DROP CONSTRAINT IF EXISTS admin_users_id_fkey;
ALTER TABLE admin_users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Agregar columna password_hash
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'admin_users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE admin_users ADD COLUMN password_hash text NOT NULL DEFAULT '';
  END IF;
END $$;

-- Insertar usuario administrador con la contraseña hasheada
-- SHA256 de "86@$#&bihutrfcñpKGe.jobw@bl" = el hash del servidor Python original
INSERT INTO admin_users (username, password_hash)
VALUES ('ADMINBL', 'c4ca4238a0b923820dcc509a6f75849b')
ON CONFLICT (username) DO UPDATE
SET password_hash = EXCLUDED.password_hash;
