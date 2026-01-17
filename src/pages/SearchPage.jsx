import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { publicApi } from '@/lib/api';
import { ContentCard, ContentCardSkeleton } from '@/components/content/ContentCard';
import { Search, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Filters
  const [contentType, setContentType] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await publicApi.getGenres();
        setGenres(res.data);
      } catch (error) {
        console.error('Error fetching genres:', error);
      }
    };
    fetchGenres();
  }, []);

  useEffect(() => {
    const searchContents = async () => {
      if (!query.trim() && !contentType && selectedGenre === 'all' && selectedYear === 'all') {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await publicApi.getContents({
          search: query.trim() || undefined,
          content_type: contentType || undefined,
          genre: selectedGenre && selectedGenre !== 'all' ? selectedGenre : undefined,
          year: selectedYear && selectedYear !== 'all' ? selectedYear : undefined,
          limit: 50,
        });
        setResults(res.data);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchContents, 300);
    return () => clearTimeout(debounce);
  }, [query, contentType, selectedGenre, selectedYear]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({ q: query });
  };

  const clearSearch = () => {
    setQuery('');
    setSearchParams({});
  };

  const clearFilters = () => {
    setContentType('');
    setSelectedGenre('all');
    setSelectedYear('all');
  };

  const hasActiveFilters = contentType || (selectedGenre && selectedGenre !== 'all') || (selectedYear && selectedYear !== 'all');

  return (
    <div className="pt-24 pb-16 min-h-screen" data-testid="search-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Buscar</h1>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar series, películas, anime..."
              className="w-full pl-12 pr-12 py-4 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
              data-testid="search-input"
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </form>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8 p-4 glass rounded-xl">
          {/* Content Type */}
          <Select value={contentType || 'all'} onValueChange={(v) => setContentType(v === 'all' ? '' : v)}>
            <SelectTrigger className="w-40 bg-slate-800/50 border-white/10 text-white" data-testid="filter-type">
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/10">
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="serie">Series</SelectItem>
              <SelectItem value="miniserie">Miniseries</SelectItem>
              <SelectItem value="pelicula">Películas</SelectItem>
              <SelectItem value="anime">Anime</SelectItem>
            </SelectContent>
          </Select>

          {/* Genre */}
          <Select value={selectedGenre || 'all'} onValueChange={setSelectedGenre}>
            <SelectTrigger className="w-40 bg-slate-800/50 border-white/10 text-white" data-testid="filter-genre">
              <SelectValue placeholder="Género" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/10">
              <SelectItem value="all">Todos</SelectItem>
              {genres.map((genre) => (
                <SelectItem key={genre} value={genre}>
                  {genre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Year */}
          <Select value={selectedYear || 'all'} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32 bg-slate-800/50 border-white/10 text-white" data-testid="filter-year">
              <SelectValue placeholder="Año" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-white/10">
              <SelectItem value="all">Todos</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {[...Array(15)].map((_, i) => (
              <ContentCardSkeleton key={i} />
            ))}
          </div>
        ) : results.length > 0 ? (
          <>
            <p className="text-slate-400 mb-6">
              {results.length} resultado{results.length !== 1 ? 's' : ''} encontrado{results.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {results.map((content) => (
                <ContentCard key={content.id} content={content} />
              ))}
            </div>
          </>
        ) : (query || hasActiveFilters) ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg mb-4">
              No se encontraron resultados
            </p>
            <p className="text-slate-500 text-sm">
              Intenta con otros términos de búsqueda o filtros
            </p>
          </div>
        ) : (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">
              Escribe algo para buscar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
