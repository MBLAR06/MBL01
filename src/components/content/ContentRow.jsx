import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ContentCard, ContentCardSkeleton } from './ContentCard';
import { cn } from '@/lib/utils';

export const ContentRow = ({ 
  title, 
  contents, 
  isLoading = false, 
  viewAllLink,
  className 
}) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <section className={cn('py-8', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <div className="skeleton h-8 w-48 rounded" />
          </div>
          <div className="flex gap-4">
            {[...Array(6)].map((_, i) => (
              <ContentCardSkeleton key={i} className="w-40 md:w-48 flex-shrink-0" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!contents || contents.length === 0) {
    return null;
  }

  return (
    <section className={cn('py-8', className)} data-testid={`content-row-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
          <div className="flex items-center gap-2">
            {viewAllLink && (
              <Link
                to={viewAllLink}
                className="text-sm text-violet-400 hover:text-violet-300 transition-colors mr-4"
              >
                Ver todo
              </Link>
            )}
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors hidden md:flex"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors hidden md:flex"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Scroll */}
        <div
          ref={scrollRef}
          className="scroll-container -mx-4 px-4"
        >
          {contents.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              className="w-36 md:w-44 lg:w-48"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContentRow;
