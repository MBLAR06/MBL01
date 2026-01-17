import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function generateSlug(title) {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatNumber(num) {
  if (!num) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function getContentTypeName(type) {
  const types = {
    serie: 'Series',
    miniserie: 'Miniseries',
    pelicula: 'Películas',
    anime: 'Anime',
  };
  return types[type] || type;
}

export function getContentTypeSlug(type) {
  const slugs = {
    serie: 'series',
    miniserie: 'miniseries',
    pelicula: 'peliculas',
    anime: 'anime',
  };
  return slugs[type] || type;
}

export function getStatusBadgeClass(status) {
  return status === 'published' ? 'badge-success' : 'badge-warning';
}

export function getStatusLabel(status) {
  return status === 'published' ? 'Publicado' : 'Pendiente';
}

export const PLACEHOLDER_POSTER = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=450&fit=crop';
export const PLACEHOLDER_BACKDROP = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1920&h=1080&fit=crop';
