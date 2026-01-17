# MoonlightBL - Plataforma de Catálogo BL/LGBT

Plataforma moderna de catálogo y visualización de series BL, miniseries, películas y anime LGBT con panel de administración completo.

## Características

### Público
- Catálogos organizados por tipo (Series, Miniseries, Películas, Anime)
- Fichas detalladas de contenido
- Reproductor de video con múltiples servidores
- Sistema de búsqueda y filtros avanzados
- Carrusel destacado en página principal

### Panel de Administración
- Dashboard con estadísticas en tiempo real
- Gestión completa de contenidos (CRUD)
- Gestión independiente de temporadas y episodios
- Configuración del carrusel
- Estadísticas y gráficos de visualización
- Gestión de mensajes de contacto

## Stack Tecnológico

- **Frontend**: React + TailwindCSS + Shadcn/UI
- **Base de Datos**: Supabase (PostgreSQL)
- **Autenticación**: Sistema JWT personalizado
- **Bundler**: Create React App con CRACO

## Credenciales de Administrador

- **Usuario**: ADMINBL
- **Contraseña**: 86@$#&bihutrfcñpKGe.jobw@bl

## Acceso al Panel Administrativo

El panel administrativo está disponible en la ruta `/admin/login`.

## Base de Datos

La aplicación utiliza Supabase con las siguientes tablas principales:

- **contents**: Almacena series, películas, anime y miniseries
- **seasons**: Temporadas de contenido
- **episodes**: Episodios con enlaces a servidores de video
- **carousel_config**: Configuración del carrusel
- **view_stats**: Estadísticas de visualización
- **audit_logs**: Registro de acciones administrativas
- **contact_messages**: Mensajes de contacto
- **admin_users**: Usuarios administradores

## Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Políticas de acceso restrictivas
- Contenido público solo accesible con status "published"
- Operaciones administrativas requieren autenticación
