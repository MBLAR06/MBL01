import { useState, useEffect } from 'react';
import { publicApi } from '@/lib/api';
import HeroCarousel from '@/components/content/HeroCarousel';
import ContentRow from '@/components/content/ContentRow';

export default function HomePage() {
  const [carousel, setCarousel] = useState([]);
  const [popular, setPopular] = useState([]);
  const [trending, setTrending] = useState([]);
  const [latestSeries, setLatestSeries] = useState([]);
  const [latestMovies, setLatestMovies] = useState([]);
  const [latestAnime, setLatestAnime] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          carouselRes,
          popularRes,
          trendingRes,
          seriesRes,
          moviesRes,
          animeRes,
        ] = await Promise.all([
          publicApi.getCarousel(),
          publicApi.getContents({ is_popular: true, limit: 20 }),
          publicApi.getContents({ is_trending: true, limit: 20 }),
          publicApi.getContents({ content_type: 'serie', limit: 20, sort_by: 'created_at' }),
          publicApi.getContents({ content_type: 'pelicula', limit: 20, sort_by: 'created_at' }),
          publicApi.getContents({ content_type: 'anime', limit: 20, sort_by: 'created_at' }),
        ]);

        setCarousel(carouselRes.data);
        setPopular(popularRes.data);
        setTrending(trendingRes.data);
        setLatestSeries(seriesRes.data);
        setLatestMovies(moviesRes.data);
        setLatestAnime(animeRes.data);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div data-testid="home-page">
      {/* Hero Carousel */}
      <HeroCarousel contents={carousel} isLoading={isLoading} />

      {/* Content Rows */}
      <div className="relative z-10 -mt-20">
        {trending.length > 0 && (
          <ContentRow
            title="Tendencias"
            contents={trending}
            isLoading={isLoading}
          />
        )}

        {popular.length > 0 && (
          <ContentRow
            title="Populares"
            contents={popular}
            isLoading={isLoading}
          />
        )}

        {latestSeries.length > 0 && (
          <ContentRow
            title="Últimas Series"
            contents={latestSeries}
            isLoading={isLoading}
            viewAllLink="/series"
          />
        )}

        {latestMovies.length > 0 && (
          <ContentRow
            title="Últimas Películas"
            contents={latestMovies}
            isLoading={isLoading}
            viewAllLink="/peliculas"
          />
        )}

        {latestAnime.length > 0 && (
          <ContentRow
            title="Último Anime"
            contents={latestAnime}
            isLoading={isLoading}
            viewAllLink="/anime"
          />
        )}

        {/* Empty state when no content */}
        {!isLoading && 
         carousel.length === 0 && 
         popular.length === 0 && 
         trending.length === 0 && 
         latestSeries.length === 0 && 
         latestMovies.length === 0 && 
         latestAnime.length === 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Aún no hay contenido
            </h2>
            <p className="text-slate-400">
              El catálogo está vacío. El administrador debe agregar contenido desde el panel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
