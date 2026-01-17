import { useState, useEffect } from 'react';
import { publicApi } from '@/lib/api';
import { ContentCard, ContentCardSkeleton } from '@/components/content/ContentCard';
import { getContentTypeName } from '@/lib/utils';
import { Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function CatalogPage({ type }) {
  const [contents, setContents] = useState([]);
  const [genres, setGenres] = useState([]);
  const [countries, setCountries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  // Filters
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 20 }, (_, i) => currentYear - i);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [contentsRes, genresRes, countriesRes] = await Promise.all([
          publicApi.getContents({
            content_type: type,
            genre: selectedGenre && selectedGenre !== 'all' ? selectedGenre : undefined,
            year: selectedYear && selectedYear !== 'all' ? selectedYear : undefined,
            country: selectedCountry && selectedCountry !== 'all' ? selectedCountry : undefined,
            sort_by: sortBy,
            limit: 50,
          }),
          publicApi.getGenres(),
          publicApi.getCountries(),
        ]);

        setContents(contentsRes.data);
        setGenres(genresRes.data);
        setCountries(countriesRes.data);
      } catch (error) {
        console.error('Error fetching catalog:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [type, selectedGenre, selectedYear, selectedCountry, sortBy]);

  const clearFilters = () => {
    setSelectedGenre('all');
    setSelectedYear('all');
    setSelectedCountry('all');
    setSortBy('created_at');
  };

  const hasActiveFilters = (selectedGenre && selectedGenre !== 'all') || (selectedYear && selectedYear !== 'all') || (selectedCountry && selectedCountry !== 'all');

  return (
    <div className="pt-24 pb-16" data-testid={`catalog-page-${type}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {getContentTypeName(type)}
            </h1>
            <p className="text-slate-400 mt-1">
              {contents.length} títulos disponibles
            </p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn-secondary inline-flex items-center gap-2 md:hidden"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-violet-500" />
            )}
          </button>
        </div>

        {/* Filters */}
        <div 
          className={`
            mb-8 p-4 glass rounded-xl
            md:flex md:items-center md:gap-4
            ${showFilters ? 'block' : 'hidden md:flex'}
          `}
        >
          <div className="grid grid-cols-2 md:flex md:items-center gap-4 flex-1">
            {/* Genre Filter */}
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger className="bg-slate-800/50 border-white/10 text-white" data-testid="filter-genre">
                <SelectValue placeholder="Género" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="all">Todos los géneros</SelectItem>
                {genres.map((genre) => (
                  <SelectItem key={genre} value={genre}>
                    {genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Year Filter */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="bg-slate-800/50 border-white/10 text-white" data-testid="filter-year">
                <SelectValue placeholder="Año" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="all">Todos los años</SelectItem>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Country Filter */}
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="bg-slate-800/50 border-white/10 text-white" data-testid="filter-country">
                <SelectValue placeholder="País" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="all">Todos los países</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="bg-slate-800/50 border-white/10 text-white" data-testid="filter-sort">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/10">
                <SelectItem value="created_at">Más recientes</SelectItem>
                <SelectItem value="views">Más vistos</SelectItem>
                <SelectItem value="rating">Mejor valorados</SelectItem>
                <SelectItem value="year">Por año</SelectItem>
                <SelectItem value="title">Alfabético</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 md:mt-0 flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Content Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {[...Array(15)].map((_, i) => (
              <ContentCardSkeleton key={i} />
            ))}
          </div>
        ) : contents.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {contents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-400 text-lg">
              No se encontraron resultados
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-violet-400 hover:text-violet-300 transition-colors"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
