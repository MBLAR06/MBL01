/*
  # Crear esquema completo de MoonlightBL

  ## Descripción
  Este migración crea todas las tablas necesarias para la plataforma MoonlightBL, 
  un catálogo de series BL, películas, anime y miniseries con panel administrativo.

  ## Nuevas Tablas
  
  ### 1. `contents`
  Tabla principal para almacenar todos los contenidos (series, películas, anime, miniseries)
  - `id` (uuid, primary key) - Identificador único
  - `content_type` (text) - Tipo: 'serie', 'miniserie', 'pelicula', 'anime'
  - `title` (text) - Título del contenido
  - `slug` (text, unique) - URL amigable
  - `year` (int) - Año de lanzamiento
  - `synopsis` (text) - Sinopsis
  - `genres` (text[]) - Array de géneros
  - `tags` (text[]) - Array de etiquetas
  - `rating` (float) - Calificación
  - `production_company` (text) - Compañía productora
  - `producer` (text) - Productor
  - `cast_members` (text[]) - Elenco
  - `poster` (text) - URL del póster
  - `backdrop` (text) - URL del backdrop
  - `gallery` (text[]) - Array de URLs de galería
  - `trailer_url` (text) - URL del trailer
  - `tmdb_id` (text) - ID de TMDB
  - `imdb_id` (text) - ID de IMDb
  - `country` (text) - País de origen
  - `status` (text) - Estado: 'pending', 'published'
  - `is_featured` (boolean) - Destacado
  - `is_trending` (boolean) - En tendencia
  - `is_popular` (boolean) - Popular
  - `servers` (jsonb) - Servidores de video (solo para películas)
  - `views` (int) - Visualizaciones
  - `season_count` (int) - Número de temporadas
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Fecha de actualización

  ### 2. `seasons`
  Tabla para temporadas de series/anime
  - `id` (uuid, primary key) - Identificador único
  - `content_id` (uuid, foreign key) - Referencia al contenido
  - `number` (int) - Número de temporada
  - `title` (text) - Título de la temporada
  - `slug` (text) - URL amigable
  - `custom_url` (text) - URL personalizada opcional
  - `poster` (text) - URL del póster
  - `backdrop` (text) - URL del backdrop
  - `year` (int) - Año
  - `synopsis` (text) - Sinopsis
  - `tmdb_id` (text) - ID de TMDB
  - `imdb_id` (text) - ID de IMDb
  - `air_date` (text) - Fecha de emisión
  - `status` (text) - Estado: 'pending', 'published'
  - `episode_count` (int) - Número de episodios
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Fecha de actualización

  ### 3. `episodes`
  Tabla para episodios
  - `id` (uuid, primary key) - Identificador único
  - `season_id` (uuid, foreign key) - Referencia a la temporada
  - `content_id` (uuid, foreign key) - Referencia al contenido
  - `number` (int) - Número de episodio
  - `title` (text) - Título del episodio
  - `slug` (text) - URL amigable
  - `custom_url` (text) - URL personalizada opcional
  - `synopsis` (text) - Sinopsis
  - `duration` (int) - Duración en minutos
  - `poster` (text) - URL del póster
  - `thumbnail` (text) - URL del thumbnail
  - `servers` (jsonb) - Servidores de video
  - `tmdb_id` (text) - ID de TMDB
  - `imdb_id` (text) - ID de IMDb
  - `air_date` (text) - Fecha de emisión
  - `status` (text) - Estado: 'pending', 'published'
  - `views` (int) - Visualizaciones
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Fecha de actualización

  ### 4. `carousel_config`
  Configuración del carrusel de la página principal
  - `id` (uuid, primary key) - Identificador único
  - `items` (jsonb) - Array de items del carrusel
  - `auto_populate` (boolean) - Auto-poblar
  - `auto_type` (text) - Tipo: 'popular', 'trending', 'latest'
  - `updated_at` (timestamptz) - Fecha de actualización

  ### 5. `view_stats`
  Estadísticas de visualización
  - `id` (uuid, primary key) - Identificador único
  - `content_id` (uuid) - ID del contenido
  - `episode_id` (uuid) - ID del episodio (opcional)
  - `timestamp` (timestamptz) - Fecha y hora
  - `user_agent` (text) - User agent
  - `ip_hash` (text) - Hash de IP

  ### 6. `audit_logs`
  Logs de auditoría para acciones administrativas
  - `id` (uuid, primary key) - Identificador único
  - `action` (text) - Acción: 'create', 'update', 'delete'
  - `entity_type` (text) - Tipo de entidad
  - `entity_id` (text) - ID de la entidad
  - `changes` (jsonb) - Cambios realizados
  - `timestamp` (timestamptz) - Fecha y hora
  - `username` (text) - Usuario que realizó la acción

  ### 7. `login_attempts`
  Intentos de inicio de sesión
  - `id` (uuid, primary key) - Identificador único
  - `username` (text) - Usuario
  - `success` (boolean) - Si fue exitoso
  - `ip_hash` (text) - Hash de IP
  - `timestamp` (timestamptz) - Fecha y hora

  ### 8. `contact_messages`
  Mensajes de contacto
  - `id` (uuid, primary key) - Identificador único
  - `name` (text) - Nombre
  - `email` (text) - Email
  - `subject` (text) - Asunto
  - `message` (text) - Mensaje
  - `read` (boolean) - Leído
  - `timestamp` (timestamptz) - Fecha y hora

  ### 9. `admin_users`
  Usuarios administradores (se usará con Supabase Auth)
  - `id` (uuid, primary key) - Identificador único que coincide con auth.users
  - `username` (text, unique) - Nombre de usuario
  - `created_at` (timestamptz) - Fecha de creación
  - `updated_at` (timestamptz) - Fecha de actualización

  ## Seguridad
  
  - Se habilita RLS en todas las tablas
  - Las tablas públicas (contents, seasons, episodes, carousel_config) tienen políticas de lectura pública
  - Las tablas administrativas requieren autenticación
  - Se crean índices para mejorar el rendimiento
*/

-- Crear tablas
CREATE TABLE IF NOT EXISTS contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type text NOT NULL,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  year int,
  synopsis text,
  genres text[] DEFAULT '{}',
  tags text[] DEFAULT '{}',
  rating float,
  production_company text,
  producer text,
  cast_members text[] DEFAULT '{}',
  poster text,
  backdrop text,
  gallery text[] DEFAULT '{}',
  trailer_url text,
  tmdb_id text,
  imdb_id text,
  country text,
  status text DEFAULT 'pending',
  is_featured boolean DEFAULT false,
  is_trending boolean DEFAULT false,
  is_popular boolean DEFAULT false,
  servers jsonb DEFAULT '[]',
  views int DEFAULT 0,
  season_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS seasons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  number int NOT NULL,
  title text,
  slug text NOT NULL,
  custom_url text,
  poster text,
  backdrop text,
  year int,
  synopsis text,
  tmdb_id text,
  imdb_id text,
  air_date text,
  status text DEFAULT 'pending',
  episode_count int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(content_id, slug)
);

CREATE TABLE IF NOT EXISTS episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id uuid NOT NULL REFERENCES seasons(id) ON DELETE CASCADE,
  content_id uuid NOT NULL REFERENCES contents(id) ON DELETE CASCADE,
  number int NOT NULL,
  title text NOT NULL,
  slug text NOT NULL,
  custom_url text,
  synopsis text,
  duration int,
  poster text,
  thumbnail text,
  servers jsonb DEFAULT '[]',
  tmdb_id text,
  imdb_id text,
  air_date text,
  status text DEFAULT 'pending',
  views int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(season_id, slug)
);

CREATE TABLE IF NOT EXISTS carousel_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  items jsonb DEFAULT '[]',
  auto_populate boolean DEFAULT true,
  auto_type text DEFAULT 'popular',
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS view_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id uuid,
  episode_id uuid,
  timestamp timestamptz DEFAULT now(),
  user_agent text,
  ip_hash text
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  changes jsonb DEFAULT '{}',
  timestamp timestamptz DEFAULT now(),
  username text DEFAULT 'ADMINBL'
);

CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  success boolean NOT NULL,
  ip_hash text,
  timestamp timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  timestamp timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_contents_content_type ON contents(content_type);
CREATE INDEX IF NOT EXISTS idx_contents_status ON contents(status);
CREATE INDEX IF NOT EXISTS idx_contents_slug ON contents(slug);
CREATE INDEX IF NOT EXISTS idx_contents_tmdb_id ON contents(tmdb_id);
CREATE INDEX IF NOT EXISTS idx_contents_imdb_id ON contents(imdb_id);
CREATE INDEX IF NOT EXISTS idx_contents_is_featured ON contents(is_featured);
CREATE INDEX IF NOT EXISTS idx_contents_is_trending ON contents(is_trending);
CREATE INDEX IF NOT EXISTS idx_contents_is_popular ON contents(is_popular);

CREATE INDEX IF NOT EXISTS idx_seasons_content_id ON seasons(content_id);
CREATE INDEX IF NOT EXISTS idx_seasons_slug ON seasons(slug);
CREATE INDEX IF NOT EXISTS idx_seasons_status ON seasons(status);

CREATE INDEX IF NOT EXISTS idx_episodes_season_id ON episodes(season_id);
CREATE INDEX IF NOT EXISTS idx_episodes_content_id ON episodes(content_id);
CREATE INDEX IF NOT EXISTS idx_episodes_slug ON episodes(slug);
CREATE INDEX IF NOT EXISTS idx_episodes_status ON episodes(status);

CREATE INDEX IF NOT EXISTS idx_view_stats_content_id ON view_stats(content_id);
CREATE INDEX IF NOT EXISTS idx_view_stats_episode_id ON view_stats(episode_id);
CREATE INDEX IF NOT EXISTS idx_view_stats_timestamp ON view_stats(timestamp);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_login_attempts_timestamp ON login_attempts(timestamp);
CREATE INDEX IF NOT EXISTS idx_contact_messages_timestamp ON contact_messages(timestamp);

-- Habilitar RLS en todas las tablas
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE seasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE carousel_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE view_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para contenido público (lectura para todos, escritura solo admin)

-- Contents: lectura pública para contenido publicado, escritura solo admin
CREATE POLICY "Public can view published contents"
  ON contents FOR SELECT
  USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "Admins can insert contents"
  ON contents FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update contents"
  ON contents FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete contents"
  ON contents FOR DELETE
  TO authenticated
  USING (true);

-- Seasons: lectura pública para contenido publicado, escritura solo admin
CREATE POLICY "Public can view published seasons"
  ON seasons FOR SELECT
  USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "Admins can insert seasons"
  ON seasons FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update seasons"
  ON seasons FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete seasons"
  ON seasons FOR DELETE
  TO authenticated
  USING (true);

-- Episodes: lectura pública para contenido publicado, escritura solo admin
CREATE POLICY "Public can view published episodes"
  ON episodes FOR SELECT
  USING (status = 'published' OR auth.role() = 'authenticated');

CREATE POLICY "Admins can insert episodes"
  ON episodes FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update episodes"
  ON episodes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete episodes"
  ON episodes FOR DELETE
  TO authenticated
  USING (true);

-- Carousel config: lectura pública, escritura solo admin
CREATE POLICY "Public can view carousel config"
  ON carousel_config FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert carousel config"
  ON carousel_config FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update carousel config"
  ON carousel_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Admins can delete carousel config"
  ON carousel_config FOR DELETE
  TO authenticated
  USING (true);

-- View stats: inserción pública (para registrar vistas), lectura solo admin
CREATE POLICY "Anyone can insert view stats"
  ON view_stats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view view stats"
  ON view_stats FOR SELECT
  TO authenticated
  USING (true);

-- Audit logs: solo admin
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert audit logs"
  ON audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Login attempts: inserción pública (para registro), lectura solo admin
CREATE POLICY "Anyone can insert login attempts"
  ON login_attempts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view login attempts"
  ON login_attempts FOR SELECT
  TO authenticated
  USING (true);

-- Contact messages: inserción pública, lectura/actualización solo admin
CREATE POLICY "Anyone can submit contact messages"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view contact messages"
  ON contact_messages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can update contact messages"
  ON contact_messages FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Admin users: solo admin puede ver y gestionar
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert admin users"
  ON admin_users FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can update admin users"
  ON admin_users FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
