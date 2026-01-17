import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Play, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, getContentTypeSlug, PLACEHOLDER_BACKDROP } from '@/lib/utils';

export const HeroCarousel = ({ contents, isLoading = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goToSlide = useCallback((index) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex(index);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [isTransitioning]);

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? contents.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = useCallback(() => {
    const newIndex = currentIndex === contents.length - 1 ? 0 : currentIndex + 1;
    goToSlide(newIndex);
  }, [currentIndex, contents?.length, goToSlide]);

  // Auto-advance
  useEffect(() => {
    if (!contents || contents.length <= 1) return;
    
    const interval = setInterval(goToNext, 8000);
    return () => clearInterval(interval);
  }, [contents, goToNext]);

  if (isLoading) {
    return (
      <div className="hero-slide">
        <div className="skeleton absolute inset-0" />
      </div>
    );
  }

  if (!contents || contents.length === 0) {
    return (
      <div 
        className="hero-slide"
        style={{ backgroundImage: `url(${PLACEHOLDER_BACKDROP})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              Bienvenido a MoonlightBL
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl mb-8">
              Tu plataforma de series BL, miniseries, películas y anime LGBT. 
              Explora el mejor contenido asiático subtitulado en español.
            </p>
            <Link to="/series" className="btn-primary inline-flex items-center gap-2">
              <Play className="w-5 h-5" />
              Explorar Series
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentContent = contents[currentIndex];
  const typeSlug = getContentTypeSlug(currentContent.content_type);

  return (
    <div className="relative" data-testid="hero-carousel">
      {/* Slides */}
      <div 
        className="hero-slide"
        style={{ 
          backgroundImage: `url(${currentContent.backdrop || currentContent.poster || PLACEHOLDER_BACKDROP})` 
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/80 via-transparent to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div 
              className={cn(
                'max-w-2xl transition-all duration-500',
                isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              )}
            >
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                {currentContent.is_trending && (
                  <span className="badge badge-violet">Tendencia</span>
                )}
                {currentContent.is_popular && (
                  <span className="badge badge-violet">Popular</span>
                )}
                {currentContent.year && (
                  <span className="text-slate-400 text-sm">{currentContent.year}</span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 leading-tight">
                {currentContent.title}
              </h1>

              {/* Genres */}
              {currentContent.genres && currentContent.genres.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {currentContent.genres.slice(0, 4).map((genre, i) => (
                    <span key={i} className="text-sm text-slate-300">
                      {genre}
                      {i < Math.min(currentContent.genres.length, 4) - 1 && (
                        <span className="mx-2 text-slate-600">•</span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {/* Synopsis */}
              {currentContent.synopsis && (
                <p className="text-slate-300 text-base md:text-lg line-clamp-3 mb-8 max-w-xl">
                  {currentContent.synopsis}
                </p>
              )}

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <Link 
                  to={`/${typeSlug}/${currentContent.slug}`} 
                  className="btn-primary inline-flex items-center gap-2"
                  data-testid="hero-play-btn"
                >
                  <Play className="w-5 h-5" />
                  Ver ahora
                </Link>
                <Link 
                  to={`/${typeSlug}/${currentContent.slug}`} 
                  className="btn-secondary inline-flex items-center gap-2"
                >
                  <Info className="w-5 h-5" />
                  Más información
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      {contents.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors hidden md:flex"
            aria-label="Previous slide"
            data-testid="hero-prev-btn"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/30 hover:bg-black/50 text-white transition-colors hidden md:flex"
            aria-label="Next slide"
            data-testid="hero-next-btn"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Dots */}
      {contents.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {contents.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-300',
                index === currentIndex 
                  ? 'w-8 bg-violet-500' 
                  : 'bg-white/30 hover:bg-white/50'
              )}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
