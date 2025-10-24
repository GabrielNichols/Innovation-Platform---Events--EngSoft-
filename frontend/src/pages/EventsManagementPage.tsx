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
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

// TODO: Types should come from backend API
interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'draft' | 'published' | 'active' | 'finished';
  maxTeams?: number;
  maxParticipants?: number;
  registeredParticipants: number;
  submittedProjects: number;
  formedTeams: number;
  organizer: string;
  categories: string[];
  tags: string[];
  createdAt: string;
}

interface EventProject {
  id: string;
  title: string;
  eventId: string;
  teamName: string;
  members: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  category: string;
  skills: string[];
  submittedAt: string;
}

interface EventStats {
  totalEvents: number;
  activeEvents: number;
  totalProjects: number;
  totalParticipants: number;
}

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
  events = [],
  projects = [],
  userRole = 'organizer',
  onBack,
  onCreateEvent,
  onViewEvent,
}: EventsManagementPageProps) {
  const [selectedEvent, setSelectedEvent] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState<string>('all');

  // TODO: Fetch from backend microservice
  // GET /api/events/management - Get all events for organizer/admin
  // GET /api/events/:id/stats - Get stats for specific event
  // GET /api/events/:id/projects - Get projects for specific event
  // POST /api/events - Create new event
  // PUT /api/events/:id - Update event
  // DELETE /api/events/:id - Delete event
  // PATCH /api/events/:id/status - Change event status

  const displayStats = stats || {
    totalEvents: 0,
    activeEvents: 0,
    totalProjects: 0,
    totalParticipants: 0,
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
          <GlassButton 
            variant="filled" 
            size="lg"
            onClick={onCreateEvent}
          >
            <Plus className="h-5 w-5" />
            Criar Evento
          </GlassButton>
        </div>

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
              {projects.filter((p) => p.status === 'submitted').length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {projects.filter((p) => p.status === 'submitted').length}
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
            {filteredEvents.length > 0 ? (
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
                          <p className="text-muted-foreground mb-3">{event.description}</p>
                          <div className="flex flex-wrap gap-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <small>
                                {event.startDate} - {event.endDate}
                              </small>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <small>{event.location}</small>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              <small>{event.registeredParticipants} participantes</small>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <GlassButton 
                            variant="ghost" 
                            size="sm"
                            onClick={() => onViewEvent?.(event.id)}
                          >
                            <Eye className="h-4 w-4" />
                            Ver Detalhes
                          </GlassButton>
                          {userRole === 'admin' && (
                            <GlassButton variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/10">
                              <Trash2 className="h-4 w-4" />
                            </GlassButton>
                          )}
                        </div>
                      </div>

                      {/* Event Stats */}
                      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Briefcase className="h-4 w-4 text-primary" />
                            <h4>{event.submittedProjects}</h4>
                          </div>
                          <p className="text-muted-foreground">Projetos</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Users className="h-4 w-4 text-emerald-500" />
                            <h4>{event.formedTeams}</h4>
                          </div>
                          <p className="text-muted-foreground">Equipes</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <Award className="h-4 w-4 text-orange-500" />
                            <h4>{event.registeredParticipants}</h4>
                          </div>
                          <p className="text-muted-foreground">Inscritos</p>
                        </div>
                      </div>

                      {/* Categories & Tags */}
                      {(event.categories.length > 0 || event.tags.length > 0) && (
                        <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
                          {event.categories.map((cat) => (
                            <Badge key={cat} variant="outline" className="hover:bg-primary/10">
                              {cat}
                            </Badge>
                          ))}
                          {event.tags.map((tag) => (
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
                onAction={() => console.log('Create event')}
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

            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map((project) => (
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
                            <small>{project.members} membros</small>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <small>{project.submittedAt}</small>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {project.skills.map((skill, idx) => (
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
                description="Quando os participantes submeterem projetos, eles aparecerão aqui"
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
