import React from 'react';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { EmptyState } from '../components/EmptyState';
import {
  Calendar,
  Users,
  Briefcase,
  Plus,
  TrendingUp,
  Award,
  Download,
  Inbox,
  MapPin,
  Clock,
  Settings,
  Eye,
  FolderKanban,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import {
  loadEventsManagement,
  getEventProjects,
  deleteEvent as deleteEventRequest,
  type Event,
  type EventProject,
  type EventStats,
  ApiError,
} from '../api/api';

interface EventsManagementPageProps {
  // TODO: Props will be populated by backend microservice
  // GET /api/events/management - Returns { stats, events }
  // GET /api/events/:eventId/projects - Returns projects
  stats?: EventStats;
  events?: Event[];
  projects?: EventProject[];
  userRole?: 'admin' | 'organizer';
  onBack?: () => void; // Navigate back to profile/previous page
  onCreateEvent?: () => void; // Navigate to create event page
  onViewEvent?: (eventId: string) => void; // Navigate to event detail page
}

export function EventsManagementPage({
  stats,
  events,
  projects,
  userRole = 'organizer',
  onBack,
  onCreateEvent,
  onViewEvent,
}: EventsManagementPageProps) {
  const [selectedEvent, setSelectedEvent] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [eventsData, setEventsData] = React.useState<Event[]>(events ?? []);
  const [statsData, setStatsData] = React.useState<EventStats | undefined>(stats);
  const [projectsData, setProjectsData] = React.useState<EventProject[]>(projects ?? []);
  const [loading, setLoading] = React.useState<boolean>((events?.length ?? 0) === 0);
  const [projectsLoading, setProjectsLoading] = React.useState<boolean>(false);
  const [refreshing, setRefreshing] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = React.useState<string | null>(null);

  const canManageEvents = userRole === 'organizer' || userRole === 'admin';
  const canDeleteEvents = userRole === 'admin';

  React.useEffect(() => {
    if (Array.isArray(events)) {
      setEventsData(events);
    }
  }, [events]);

  React.useEffect(() => {
    if (Array.isArray(projects)) {
      setProjectsData(projects);
    }
  }, [projects]);

  React.useEffect(() => {
    setStatsData(stats);
  }, [stats]);

  const fetchProjectsForEvents = React.useCallback(
    async (eventsList: Event[], signal?: AbortSignal) => {
      if (!eventsList.length) {
        setProjectsData([]);
        return;
      }

      setProjectsLoading(true);
      try {
        const results = await Promise.all(
          eventsList.map(async (event) => {
            try {
              return await getEventProjects(event.id, signal);
            } catch (err) {
              if (err instanceof DOMException && err.name === 'AbortError') {
                return [];
              }
              throw err;
            }
          })
        );
        setProjectsData(results.flat());
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Falha ao carregar projetos vinculados aos eventos.');
        }
      } finally {
        setProjectsLoading(false);
      }
    },
    []
  );

  const fetchData = React.useCallback(
    async (options?: { signal?: AbortSignal; silent?: boolean }) => {
      if (!canManageEvents) return;
      const { signal, silent } = options ?? {};

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      try {
        const response = await loadEventsManagement(signal);
        setStatsData(response.stats);
        setEventsData(response.events);
        await fetchProjectsForEvents(response.events, signal);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro inesperado ao buscar dados dos eventos.');
        }
      } finally {
        if (silent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [canManageEvents, fetchProjectsForEvents]
  );

  React.useEffect(() => {
    if (Array.isArray(events) && events.length > 0) {
      return;
    }
    if (!canManageEvents) return;

    const controller = new AbortController();
    fetchData({ signal: controller.signal });
    return () => controller.abort();
  }, [events, canManageEvents, fetchData]);

  const handleRefresh = React.useCallback(() => {
    fetchData({ silent: true });
  }, [fetchData]);

  const handleRetry = React.useCallback(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteEvent = React.useCallback(
    async (eventId: string) => {
      if (!canDeleteEvents) return;

      const confirmed = typeof window !== 'undefined'
        ? window.confirm('Tem certeza de que deseja deletar este evento? Esta ação não pode ser desfeita.')
        : true;

      if (!confirmed) return;

      setDeletingEventId(eventId);
      try {
        const result = await deleteEventRequest(eventId);
        if (!result?.success) {
          throw new ApiError(500, 'Falha ao deletar o evento.');
        }
        await fetchData({ silent: true });
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro inesperado ao deletar o evento.');
        }
      } finally {
        setDeletingEventId(null);
      }
    },
    [canDeleteEvents, fetchData]
  );

  const displayStats = statsData || {
    totalEvents: eventsData.length,
    activeEvents: eventsData.filter((event) => event.status === 'active').length,
    totalProjects: projectsData.length,
    totalParticipants: eventsData.reduce(
      (acc, event) => acc + (event.registeredParticipants ?? 0),
      0
    ),
  };

  const filteredEvents = eventsData.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredProjects = React.useMemo(() => {
    if (!selectedEvent) return projectsData;
    return projectsData.filter((project) => project.eventId === selectedEvent);
  }, [selectedEvent, projectsData]);

  const submittedProjectsCount = React.useMemo(
    () => projectsData.filter((project) => project.status === 'submitted').length,
    [projectsData]
  );

  const selectedEventName = React.useMemo(() => {
    if (!selectedEvent) return undefined;
    return eventsData.find((event) => event.id === selectedEvent)?.name;
  }, [selectedEvent, eventsData]);

  const getStatusBadge = (status: Event['status']) => {
    const statusConfig = {
      draft: { label: 'Rascunho', variant: 'outline' as const, className: '' },
      published: {
        label: 'Publicado',
        variant: 'outline' as const,
        className: 'border-blue-500/50 text-blue-600 dark:text-blue-400',
      },
      active: {
        label: 'Ativo',
        variant: 'default' as const,
        className: 'bg-green-500/20 text-green-700 dark:text-green-400',
      },
      finished: {
        label: 'Finalizado',
        variant: 'outline' as const,
        className: 'border-slate-500/50 text-slate-600 dark:text-slate-400',
      },
    };
    const config = statusConfig[status];
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getProjectStatusBadge = (status: EventProject['status']) => {
    const statusConfig = {
      draft: { icon: Edit, label: 'Rascunho', className: 'text-slate-600' },
      submitted: { icon: Clock, label: 'Submetido', className: 'text-blue-600' },
      approved: { icon: CheckCircle2, label: 'Aprovado', className: 'text-green-600' },
      rejected: { icon: XCircle, label: 'Rejeitado', className: 'text-red-600' },
    };
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <div className={`flex items-center gap-1 ${config.className}`}>
        <Icon className="h-4 w-4" />
        <span>{config.label}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen page-background pb-24">
      <div className="max-w-screen-xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {onBack && (
              <GlassButton variant="ghost" onClick={onBack}>
                ← Voltar
              </GlassButton>
            )}
            <div>
              <h1>Gestão de Eventos</h1>
              <p className="text-muted-foreground">
                {userRole === 'admin' ? 'Painel Administrativo de Eventos' : 'Seus Eventos e Projetos Vinculados'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <GlassButton
              variant="ghost"
              size="lg"
              onClick={handleRefresh}
              disabled={loading || refreshing}
              title="Atualizar dados"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </GlassButton>
            <GlassButton 
              variant="filled" 
              size="lg"
              onClick={onCreateEvent}
              disabled={!canManageEvents}
            >
              <Plus className="h-5 w-5" />
              Criar Evento
            </GlassButton>
          </div>
        </div>

        {error && (
          <GlassCard elevation="medium" className="border border-red-500/40 bg-red-500/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h4 className="text-red-500">Não foi possível carregar os dados</h4>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <GlassButton variant="ghost" onClick={handleRetry} disabled={loading || refreshing}>
                Tentar novamente
              </GlassButton>
            </div>
          </GlassCard>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassCard elevation="medium">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-teal-500" />
              <div>
                <h3>{displayStats.totalEvents}</h3>
                <p className="text-muted-foreground">Total de Eventos</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard elevation="medium">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-emerald-500" />
              <div>
                <h3>{displayStats.activeEvents}</h3>
                <p className="text-muted-foreground">Eventos Ativos</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard elevation="medium">
            <div className="flex items-center gap-3">
              <Briefcase className="h-8 w-8 text-green-500" />
              <div>
                <h3>{displayStats.totalProjects}</h3>
                <p className="text-muted-foreground">Projetos Submetidos</p>
              </div>
            </div>
          </GlassCard>

          <GlassCard elevation="medium">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-orange-500" />
              <div>
                <h3>{displayStats.totalParticipants}</h3>
                <p className="text-muted-foreground">Participantes</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="events" className="w-full">
          <TabsList className="glass w-full md:w-auto">
            <TabsTrigger value="events">
              <Calendar className="h-4 w-4 mr-2" />
              Eventos
            </TabsTrigger>
            <TabsTrigger value="projects">
              <Briefcase className="h-4 w-4 mr-2" />
              Projetos
              {submittedProjectsCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {submittedProjectsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Events Tab */}
          <TabsContent value="events" className="mt-6 space-y-4">
            {/* Filters */}
            <GlassCard elevation="medium">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <GlassInput
                    placeholder="Buscar eventos por nome ou descrição..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  {['all', 'draft', 'published', 'active', 'finished'].map((status) => (
                    <Badge
                      key={status}
                      variant={filterStatus === status ? undefined : 'outline'}
                      className={`cursor-pointer transition-all ${
                        filterStatus === status
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white border-transparent dark:from-teal-400 dark:to-emerald-500 dark:text-slate-900'
                          : 'hover:bg-primary/10'
                      }`}
                      onClick={() => setFilterStatus(status)}
                    >
                      {status === 'all' ? 'Todos' : status.charAt(0).toUpperCase() + status.slice(1)}
                    </Badge>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Events List */}
            {loading ? (
              <GlassCard elevation="medium" className="py-8 text-center text-muted-foreground">
                Carregando eventos...
              </GlassCard>
            ) : filteredEvents.length > 0 ? (
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <GlassCard key={event.id} elevation="high">
                    <div className="space-y-4">
                      {/* Event Header */}
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3>{event.name}</h3>
                            {getStatusBadge(event.status)}
                          </div>
                          <p className="text-muted-foreground mb-3">
                            {event.description || 'Sem descrição cadastrada no momento.'}
                          </p>
                          <div className="flex flex-wrap gap-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <small>
                                {event.startDate
                                  ? new Date(event.startDate).toLocaleDateString('pt-BR')
                                  : 'Data inicial indefinida'}{' '}
                                -{' '}
                                {event.endDate
                                  ? new Date(event.endDate).toLocaleDateString('pt-BR')
                                  : 'Data final indefinida'}
                              </small>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <small>{event.location || 'Local não informado'}</small>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <small>{event.registeredParticipants ?? 0} participantes</small>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <GlassButton 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onViewEvent?.(event.id)}
                          >
                            <Eye className="h-4 w-4" />
                            Ver Detalhes
                          </GlassButton>
                          <GlassButton
                            variant={selectedEvent === event.id ? 'filled' : 'ghost'}
                            size="sm"
                            onClick={() =>
                              setSelectedEvent((prev) => (prev === event.id ? null : event.id))
                            }
                          >
                            <FolderKanban className="h-4 w-4" />
                            {selectedEvent === event.id ? 'Todos os Projetos' : 'Ver Projetos'}
                          </GlassButton>
                          {userRole === 'admin' && (
                            <GlassButton
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:bg-red-500/10"
                              onClick={() => handleDeleteEvent(event.id)}
                              disabled={deletingEventId === event.id}
                            >
                              {deletingEventId === event.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </GlassButton>
                          )}
                        </div>
                      </div>

                      {/* Event Stats */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <h4>{event.submittedProjects ?? 0}</h4>
                          </div>
                          <p className="text-muted-foreground">Projetos</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-emerald-500" />
                            <h4>{event.formedTeams ?? 0}</h4>
                          </div>
                          <p className="text-muted-foreground">Equipes</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Award className="h-4 w-4 text-orange-500" />
                            <h4>{event.registeredParticipants ?? 0}</h4>
                          </div>
                          <p className="text-muted-foreground">Inscritos</p>
                        </div>
                      </div>

                      {/* Categories & Tags */}
                      {(event.categories.length > 0 || (event.tags?.length ?? 0) > 0) && (
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                          {event.categories.map((cat) => (
                            <Badge key={cat} variant="outline" className="hover:bg-primary/10">
                              {cat}
                            </Badge>
                          ))}
                          {event.tags?.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Calendar}
                title="Nenhum evento encontrado"
                description={
                  searchQuery || filterStatus !== 'all'
                    ? 'Tente ajustar os filtros de busca'
                    : 'Comece criando seu primeiro evento'
                }
                actionLabel="Criar Evento"
                onAction={() => onCreateEvent?.()}
              />
            )}
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="mt-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3>Projetos dos Eventos</h3>
                <p className="text-muted-foreground">Projetos submetidos pelos participantes</p>
              </div>
              <GlassButton variant="ghost">
                <Download className="h-4 w-4" />
                Exportar
              </GlassButton>
            </div>

            {selectedEventName && (
              <GlassCard elevation="medium" className="border border-primary/30 bg-primary/5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4>Filtro aplicado</h4>
                    <p className="text-muted-foreground">
                      Exibindo projetos vinculados ao evento <strong>{selectedEventName}</strong>
                    </p>
                  </div>
                  <GlassButton variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                    Limpar filtro
                  </GlassButton>
                </div>
              </GlassCard>
            )}

            {projectsLoading && (
              <GlassCard elevation="medium" className="py-6 text-center text-muted-foreground">
                Carregando projetos...
              </GlassCard>
            )}

            {filteredProjects.length > 0 ? (
              <div className="space-y-4">
                {filteredProjects.map((project) => (
                  <GlassCard key={project.id} elevation="medium">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4>{project.title}</h4>
                          <Badge variant="outline">{project.category}</Badge>
                        </div>
                        <div className="flex items-center gap-4 mb-3 text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <small>{project.teamName}</small>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <small>{project.members ?? project.teamMembers ?? 0} membros</small>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <small>
                              {project.submittedAt
                                ? new Date(project.submittedAt).toLocaleString('pt-BR')
                                : 'Data não informada'}
                            </small>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {(project.skills ?? []).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {getProjectStatusBadge(project.status)}
                        <div className="flex gap-2">
                          <GlassButton variant="ghost" size="sm">
                            Ver Detalhes
                          </GlassButton>
                          {project.status === 'submitted' && (
                            <>
                              <GlassButton
                                variant="filled"
                                size="sm"
                                className="bg-gradient-to-r from-green-500 to-green-600"
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </GlassButton>
                              <GlassButton variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10">
                                <XCircle className="h-4 w-4" />
                              </GlassButton>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Inbox}
                title="Nenhum projeto submetido"
                description={
                  projectsLoading
                    ? 'Carregando projetos...'
                    : 'Quando os participantes submeterem projetos, eles aparecerão aqui'
                }
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
