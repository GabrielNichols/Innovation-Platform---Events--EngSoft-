import React from 'react';
import { ProjectCard, ProjectCardProps } from '../components/ProjectCard';
import { GlassButton } from '../components/GlassButton';
import { GlassInput } from '../components/GlassInput';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/ui/badge';
import { EmptyState } from '../components/EmptyState';
import { Filter, Search, Sparkles, X, Inbox } from 'lucide-react';

interface FeedPageProps {
  onProjectClick: (projectId: string) => void;
  onCreateProject?: () => void;
  projects?: ProjectCardProps[]; // Backend data will be passed here
}

export function FeedPage({ onProjectClick, onCreateProject, projects = [] }: FeedPageProps) {
  const [showFilters, setShowFilters] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedFilters, setSelectedFilters] = React.useState<{
    stacks: string[];
    status: string[];
    location: string[];
  }>({
    stacks: [],
    status: [],
    location: [],
  });

  // TODO: Fetch filter options from backend
  const filterOptions = {
    stacks: ['React', 'Python', 'Node.js', 'Machine Learning', 'IoT', 'Blockchain'],
    status: ['Recrutando', 'Em Andamento', 'Completo'],
    location: ['Remoto', 'Híbrido - SP', 'Híbrido - RJ', 'Presencial'],
  };

  const toggleFilter = (category: keyof typeof selectedFilters, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value],
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({ stacks: [], status: [], location: [] });
    setSearchQuery('');
  };

  const hasActiveFilters = 
    selectedFilters.stacks.length > 0 ||
    selectedFilters.status.length > 0 ||
    selectedFilters.location.length > 0 ||
    searchQuery.length > 0;

  // TODO: Calculate from backend data
  const highMatchCount = projects.filter(p => (p as any).matchScore >= 80).length;

  return (
    <div className="min-h-screen page-background pb-24">
      {/* Header */}
      <div className="glass-strong sticky top-0 z-40 border-b border-border/50">
        <div className="max-w-screen-lg mx-auto px-4 py-4">
          <h2 className="mb-4">Descobrir Projetos</h2>
          
          <div className="flex gap-2">
            <div className="flex-1">
              <GlassInput
                placeholder="Buscar projetos, skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <GlassButton
              variant={showFilters ? 'filled' : 'ghost'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-5 w-5" />
            </GlassButton>
          </div>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 py-6">
        {/* Filters Panel */}
        {showFilters && (
          <GlassCard elevation="medium" className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3>Filtros</h3>
              {hasActiveFilters && (
                <GlassButton variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4" />
                  Limpar
                </GlassButton>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <p className="mb-2 text-muted-foreground">Tecnologias</p>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.stacks.map((stack) => (
                    <Badge
                      key={stack}
                      className={`cursor-pointer transition-all ${
                        selectedFilters.stacks.includes(stack)
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-transparent dark:from-teal-400 dark:to-emerald-500 dark:text-slate-900'
                          : 'bg-white/80 text-slate-700 border-slate-300 hover:bg-white hover:border-teal-400 dark:bg-slate-700/40 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600/50 dark:hover:border-teal-500'
                      }`}
                      onClick={() => toggleFilter('stacks', stack)}
                    >
                      {stack}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-muted-foreground">Status</p>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.status.map((status) => (
                    <Badge
                      key={status}
                      className={`cursor-pointer transition-all ${
                        selectedFilters.status.includes(status)
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-transparent dark:from-teal-400 dark:to-emerald-500 dark:text-slate-900'
                          : 'bg-white/80 text-slate-700 border-slate-300 hover:bg-white hover:border-teal-400 dark:bg-slate-700/40 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600/50 dark:hover:border-teal-500'
                      }`}
                      onClick={() => toggleFilter('status', status)}
                    >
                      {status}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-muted-foreground">Localização</p>
                <div className="flex flex-wrap gap-2">
                  {filterOptions.location.map((location) => (
                    <Badge
                      key={location}
                      className={`cursor-pointer transition-all ${
                        selectedFilters.location.includes(location)
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-transparent dark:from-teal-400 dark:to-emerald-500 dark:text-slate-900'
                          : 'bg-white/80 text-slate-700 border-slate-300 hover:bg-white hover:border-teal-400 dark:bg-slate-700/40 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600/50 dark:hover:border-teal-500'
                      }`}
                      onClick={() => toggleFilter('location', location)}
                    >
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* AI Recommendations - Only show if there are high match projects */}
        {projects.length > 0 && highMatchCount > 0 && (
          <GlassCard elevation="medium" className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="mb-1">Recomendações da IA</h4>
                <p className="text-muted-foreground">
                  Baseado nas suas skills, identificamos {highMatchCount} projetos com alto match
                </p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                {...project}
                onClick={() => onProjectClick(project.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title="Nenhum projeto disponível"
            description="Ainda não há projetos cadastrados na plataforma. Seja o primeiro a criar um projeto inovador!"
            actionLabel="Criar Projeto"
            onAction={onCreateProject}
          />
        )}
      </div>
    </div>
  );
}
