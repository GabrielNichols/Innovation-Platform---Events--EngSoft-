import React from 'react';
import { ProjectCard, ProjectCardProps } from '../components/ProjectCard';
import { GlassButton } from '../components/GlassButton';
import { GlassInput } from '../components/GlassInput';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/ui/badge';
import { EmptyState } from '../components/EmptyState';
import { Filter, Search as SearchIcon, Sparkles, X, Sliders, TrendingUp } from 'lucide-react';

interface SearchPageProps {
  onProjectClick: (projectId: string) => void;
  projects?: ProjectCardProps[]; // TODO: Backend data will be passed here
}

export function SearchPage({ onProjectClick, projects = [] }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedFilters, setSelectedFilters] = React.useState<{
    stacks: string[];
    skills: string[];
    location: string[];
    commitment: string[];
  }>({
    stacks: [],
    skills: [],
    location: [],
    commitment: [],
  });

  // TODO: Fetch filter options from backend
  // GET /api/search/filters
  const filterOptions = {
    stacks: ['React', 'Python', 'Node.js', 'Machine Learning', 'IoT', 'Blockchain', 'Flutter', 'Java'],
    skills: ['Frontend', 'Backend', 'Design', 'Data Science', 'DevOps', 'Mobile', 'QA'],
    location: ['Remoto', 'Híbrido - SP', 'Híbrido - RJ', 'Presencial - SP', 'Presencial - BH'],
    commitment: ['Part-time', 'Full-time', 'Freelance', 'Estágio'],
  };

  // TODO: Fetch trending searches from backend
  // GET /api/search/trending
  const trendingSearches = [
    'React + TypeScript',
    'Machine Learning',
    'Startup MVP',
    'Hackathon 2025',
    'Projeto Universitário',
  ];

  const toggleFilter = (category: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value],
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({ stacks: [], skills: [], location: [], commitment: [] });
  };

  const hasActiveFilters = 
    selectedFilters.stacks.length > 0 ||
    selectedFilters.skills.length > 0 ||
    selectedFilters.location.length > 0 ||
    selectedFilters.commitment.length > 0;

  const handleSearch = () => {
    // TODO: Call backend search API
    // POST /api/search with { query: searchQuery, filters: selectedFilters }
    console.log('Search:', { searchQuery, filters: selectedFilters });
  };

  const handleTrendingClick = (trend: string) => {
    setSearchQuery(trend);
    // TODO: Trigger search with trending term
  };

  return (
    <div className="min-h-screen page-background pb-24">
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        
        {/* Search Header */}
        <GlassCard elevation="high" className="sticky top-4 z-10">
          <div className="space-y-4">
            {/* Search Input */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <GlassInput
                  type="text"
                  placeholder="Buscar projetos, skills, pessoas..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 pr-10"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <GlassButton
                variant={hasActiveFilters ? 'filled' : 'ghost'}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Sliders className="h-4 w-4" />
                {hasActiveFilters && (
                  <Badge className="ml-2 bg-white/30 dark:bg-black/30">
                    {Object.values(selectedFilters).flat().length}
                  </Badge>
                )}
              </GlassButton>

              <GlassButton variant="filled" onClick={handleSearch}>
                Buscar
              </GlassButton>
            </div>

            {/* Active Filters Pills */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2 items-center">
                <small className="text-muted-foreground">Filtros ativos:</small>
                {Object.entries(selectedFilters).map(([category, values]) =>
                  values.map((value) => (
                    <Badge
                      key={`${category}-${value}`}
                      variant="secondary"
                      className="glass-subtle cursor-pointer hover:bg-destructive/20"
                      onClick={() => toggleFilter(category as keyof typeof selectedFilters, value)}
                    >
                      {value}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ))
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs text-muted-foreground hover:text-foreground underline"
                >
                  Limpar tudo
                </button>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Filters Panel */}
        {showFilters && (
          <GlassCard elevation="medium">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3>Filtros</h3>
                <GlassButton variant="ghost" size="sm" onClick={clearFilters}>
                  Limpar
                </GlassButton>
              </div>

              {/* Stack Filter */}
              <div>
                <h4 className="mb-3">Stack Tecnológica</h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.stacks.map((stack) => (
                    <Badge
                      key={stack}
                      variant={selectedFilters.stacks.includes(stack) ? 'default' : 'outline'}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => toggleFilter('stacks', stack)}
                    >
                      {stack}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Skills Filter */}
              <div>
                <h4 className="mb-3">Habilidades Procuradas</h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.skills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={selectedFilters.skills.includes(skill) ? 'default' : 'outline'}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => toggleFilter('skills', skill)}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Location Filter */}
              <div>
                <h4 className="mb-3">Localização</h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.location.map((loc) => (
                    <Badge
                      key={loc}
                      variant={selectedFilters.location.includes(loc) ? 'default' : 'outline'}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => toggleFilter('location', loc)}
                    >
                      {loc}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Commitment Filter */}
              <div>
                <h4 className="mb-3">Disponibilidade</h4>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.commitment.map((commit) => (
                    <Badge
                      key={commit}
                      variant={selectedFilters.commitment.includes(commit) ? 'default' : 'outline'}
                      className="cursor-pointer hover:scale-105 transition-transform"
                      onClick={() => toggleFilter('commitment', commit)}
                    >
                      {commit}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Trending Searches */}
        {!searchQuery && !hasActiveFilters && (
          <GlassCard elevation="medium">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h3>Em Alta</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {trendingSearches.map((trend) => (
                <Badge
                  key={trend}
                  variant="outline"
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => handleTrendingClick(trend)}
                >
                  {trend}
                </Badge>
              ))}
            </div>
          </GlassCard>
        )}

        {/* AI Suggestions */}
        {!searchQuery && !hasActiveFilters && (
          <GlassCard elevation="medium" className="border-2 border-teal-500/20">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="mb-2">Recomendações personalizadas</h4>
                <p className="text-muted-foreground mb-4">
                  Configure seu perfil para receber sugestões baseadas em IA com projetos perfeitos para você.
                </p>
                <GlassButton variant="ghost">
                  Ver Recomendações
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Search Results */}
        {(searchQuery || hasActiveFilters) && (
          <>
            {projects.length === 0 ? (
              <EmptyState
                icon={SearchIcon}
                title="Nenhum resultado encontrado"
                description="Tente ajustar seus filtros ou buscar por outros termos"
                actionLabel="Limpar Filtros"
                onAction={clearFilters}
              />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-muted-foreground">
                    {projects.length} {projects.length === 1 ? 'resultado encontrado' : 'resultados encontrados'}
                  </p>
                  <GlassButton variant="ghost" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Ordenar
                  </GlassButton>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      {...project}
                      onClick={() => onProjectClick(project.id)}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
