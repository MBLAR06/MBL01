import { Link } from 'react-router-dom';
import { Play, Star } from 'lucide-react';
import { cn, getContentTypeSlug, PLACEHOLDER_POSTER } from '@/lib/utils';

export const ContentCard = ({ content, className }) => {
  const typeSlug = getContentTypeSlug(content.content_type);
  const linkPath = `/${typeSlug}/${content.slug}`;

  return (
    <Link
      to={linkPath}
      className={cn('content-card block', className)}
      data-testid={`content-card-${content.slug}`}
    >
      <img
        src={content.poster || PLACEHOLDER_POSTER}
        alt={content.title}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      
      {/* Overlay */}
      <div className="overlay">
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-violet-500/90 flex items-center justify-center neon-glow">
            <Play className="w-6 h-6 text-white fill-white" />
          </div>
        </div>
        
        <div className="relative z-10">
          {content.rating && (
            <div className="flex items-center gap-1 mb-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="text-sm font-medium text-white">{content.rating.toFixed(1)}</span>
            </div>
          )}
          <h3 className="text-white font-semibold line-clamp-2 text-sm">{content.title}</h3>
          {content.year && (
            <p className="text-slate-400 text-xs mt-1">{content.year}</p>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="absolute top-2 left-2 flex flex-col gap-1">
        {content.is_trending && (
          <span className="badge badge-violet text-xs">Tendencia</span>
        )}
        {content.is_popular && !content.is_trending && (
          <span className="badge badge-violet text-xs">Popular</span>
        )}
      </div>
    </Link>
  );
};

export const ContentCardSkeleton = ({ className }) => (
  <div className={cn('content-card', className)}>
    <div className="skeleton w-full h-full" />
  </div>
);

export default ContentCard;
