import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { GlassButton } from '../components/GlassButton';
import { GlassInput } from '../components/GlassInput';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Avatar } from '../components/ui/avatar';
import { Switch } from '../components/ui/switch';
import { 
  ArrowLeft,
  Edit,
  Trash2,
  Copy,
  Share2,
  MoreVertical,
  Users,
  FolderKanban,
  MessageSquare,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  UserPlus,
  Filter,
  Download,
  Send,
  Bell,
  Eye,
  EyeOff,
  Award,
  TrendingUp,
  AlertCircle,
  FileText,
  Link2,
  Loader2,
} from 'lucide-react';
import {
  getEvent,
  getEventParticipants,
  getEventProjects,
  approveParticipant,
  rejectParticipant,
  updateProjectStatus,
  sendEventMessage,
  duplicateEvent,
  exportEventData,
  type Event,
  type EventParticipant,
  type EventProject,
  ApiError,
} from '../api/api';

interface EventDetailPageProps {
  eventId: string;
  eventData?: Event;
  userRole: 'organizer' | 'admin';
  onBack: () => void;
  onEdit: (event: Event) => void;
  onDelete?: (eventId: string) => void;
}

export function EventDetailPage({ eventId, eventData, userRole, onBack, onEdit, onDelete }: EventDetailPageProps) {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [selectedParticipants, setSelectedParticipants] = React.useState<string[]>([]);
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [messageText, setMessageText] = React.useState('');
  const [eventDetails, setEventDetails] = React.useState<Event | null>(eventData ?? null);
  const [participants, setParticipants] = React.useState<EventParticipant[]>([]);
  const [projects, setProjects] = React.useState<EventProject[]>([]);
  const [loading, setLoading] = React.useState<boolean>(!eventData);
  const [participantsLoading, setParticipantsLoading] = React.useState(false);
  const [projectsLoading, setProjectsLoading] = React.useState(false);
  const [messageLoading, setMessageLoading] = React.useState(false);
  const [duplicateLoading, setDuplicateLoading] = React.useState(false);
  const [downloadType, setDownloadType] = React.useState<'participants' | 'projects' | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);

  const currentEvent = eventDetails;
  const isLoadingInitial = loading && !currentEvent;

  const participantStats = React.useMemo(() => ({
    totalParticipants: participants.length,
    pending: participants.filter(p => p.status === 'pending').length,
    approved: participants.filter(p => p.status === 'approved').length,
    waitlist: participants.filter(p => p.status === 'waitlist').length,
    totalProjects: projects.length,
    projectsApproved: projects.filter(p => p.status === 'approved').length,
    projectsPending: projects.filter(p => p.status === 'submitted').length,
  }), [participants, projects]);

  const clampProgress = React.useCallback((value?: number) => {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      return 0;
    }
    return Math.min(100, Math.max(0, Math.round(value)));
  }, []);

  React.useEffect(() => {
    if (eventData) {
      setEventDetails(eventData);
    }
  }, [eventData]);

  const loadEventDetails = React.useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await getEvent(eventId, signal);
        setEventDetails(response);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        if (!eventData) {
          if (err instanceof ApiError) {
            setError(err.message);
          } else if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Erro inesperado ao carregar detalhes do evento.');
          }
        }
      }
    },
    [eventId, eventData]
  );

  const loadParticipants = React.useCallback(
    async (options?: { signal?: AbortSignal; showLoading?: boolean }) => {
      const { signal, showLoading = true } = options ?? {};
      if (showLoading) setParticipantsLoading(true);
      try {
        const response = await getEventParticipants(eventId, signal);
        setParticipants(response);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro ao carregar participantes do evento.');
        }
      } finally {
        if (showLoading) setParticipantsLoading(false);
      }
    },
    [eventId]
  );

  const loadProjects = React.useCallback(
    async (options?: { signal?: AbortSignal; showLoading?: boolean }) => {
      const { signal, showLoading = true } = options ?? {};
      if (showLoading) setProjectsLoading(true);
      try {
        const response = await getEventProjects(eventId, signal);
        setProjects(response);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        if (err instanceof ApiError) {
          setError(err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro ao carregar projetos do evento.');
        }
      } finally {
        if (showLoading) setProjectsLoading(false);
      }
    },
    [eventId]
  );

  const refreshAll = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await loadEventDetails();
      await Promise.all([
        loadParticipants({ showLoading: false }),
        loadProjects({ showLoading: false }),
      ]);
    } finally {
      setLoading(false);
    }
  }, [loadEventDetails, loadParticipants, loadProjects]);

  React.useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    (async () => {
      try {
        await loadEventDetails(controller.signal);
        await Promise.all([
          loadParticipants({ signal: controller.signal, showLoading: false }),
          loadProjects({ signal: controller.signal, showLoading: false }),
        ]);
      } finally {
        setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [eventId, loadEventDetails, loadParticipants, loadProjects]);

  React.useEffect(() => {
    setSelectedParticipants((prev) =>
      prev.filter((participantId) =>
        participants.some((participant) => participant.id === participantId)
      )
    );
  }, [participants]);

  const handleApproveParticipant = async (participantId: string) => {
    setActionError(null);
    try {
      await approveParticipant(eventId, participantId);
      setParticipants((prev) =>
        prev.map((participant) =>
          participant.id === participantId ? { ...participant, status: 'approved' } : participant
        )
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError('Não foi possível aprovar o participante.');
      }
    }
  };

  const handleRejectParticipant = async (participantId: string) => {
    setActionError(null);
    try {
      await rejectParticipant(eventId, participantId);
      setParticipants((prev) =>
        prev.map((participant) =>
          participant.id === participantId ? { ...participant, status: 'rejected' } : participant
        )
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError('Não foi possível rejeitar o participante.');
      }
    }
  };

  const handleApproveProject = async (projectId: string) => {
    setActionError(null);
    try {
      await updateProjectStatus(eventId, projectId, 'approved');
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId ? { ...project, status: 'approved' } : project
        )
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError('Erro ao aprovar o projeto.');
      }
    }
  };

  const handleRejectProject = async (projectId: string) => {
    setActionError(null);
    const reason = typeof window !== 'undefined'
      ? window.prompt('Informe o motivo da rejeição:')
      : null;
    if (!reason) {
      return;
    }

    try {
      await updateProjectStatus(eventId, projectId, 'rejected', reason);
      setProjects((prev) =>
        prev.map((project) =>
          project.id === projectId ? { ...project, status: 'rejected' } : project
        )
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError('Erro ao rejeitar o projeto.');
      }
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || selectedParticipants.length === 0) return;
    setActionError(null);
    setMessageLoading(true);

    try {
      await sendEventMessage(eventId, {
        message: messageText.trim(),
        recipients: selectedParticipants,
      });
      setMessageText('');
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError('Falha ao enviar a mensagem.');
      }
    } finally {
      setMessageLoading(false);
    }
  };

  const handleDuplicateEvent = async () => {
    setDuplicateLoading(true);
    setActionError(null);
    try {
      const duplicated = await duplicateEvent(eventId);
      setEventDetails(duplicated);
      onEdit(duplicated);
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError('Erro ao duplicar o evento.');
      }
    } finally {
      setDuplicateLoading(false);
    }
  };

  const handleExportData = async (type: 'participants' | 'projects') => {
    setDownloadType(type);
    setActionError(null);
    try {
      const blob = await exportEventData(eventId, type);
      if (typeof window !== 'undefined') {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `${eventDetails?.name || 'evento'}-${type}.csv`;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setActionError(err.message);
      } else if (err instanceof Error) {
        setActionError(err.message);
      } else {
        setActionError('Não foi possível exportar os dados.');
      }
    } finally {
      setDownloadType(null);
    }
  };

  if (isLoadingInitial) {
    return (
      <div className="min-h-screen page-background pb-24">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <GlassCard elevation="medium" className="flex flex-col items-center gap-4 py-16">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <div className="text-center space-y-1">
              <h3>Carregando detalhes do evento</h3>
              <p className="text-muted-foreground">Aguarde enquanto buscamos as informações mais recentes.</p>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen page-background pb-24">
      {/* Header */}
      <div className="glass-strong sticky top-0 z-10 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <GlassButton variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </GlassButton>
              <div>
                <h3>{currentEvent?.name || 'Evento não encontrado'}</h3>
                <small className="text-muted-foreground">
                  {currentEvent?.theme || 'Sem temática definida'}
                </small>
              </div>
            </div>
            <div className="flex gap-2">
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={handleDuplicateEvent}
                disabled={!currentEvent || duplicateLoading}
              >
                {duplicateLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">Duplicar</span>
              </GlassButton>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => currentEvent && onEdit(currentEvent)}
                disabled={!currentEvent}
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </GlassButton>
              <GlassButton variant="ghost" size="sm" disabled={!currentEvent}>
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Compartilhar</span>
              </GlassButton>
              {userRole === 'admin' && onDelete && (
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(eventId)}
                  disabled={!currentEvent}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </GlassButton>
              )}
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="glass-subtle rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-primary" />
                <small className="text-muted-foreground">Participantes</small>
              </div>
              <h3>{participantStats.totalParticipants}</h3>
              <small className="text-muted-foreground">
                {participantStats.pending} pendentes
              </small>
            </div>

            <div className="glass-subtle rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FolderKanban className="h-4 w-4 text-primary" />
                <small className="text-muted-foreground">Projetos</small>
              </div>
              <h3>{participantStats.totalProjects}</h3>
              <small className="text-muted-foreground">
                {participantStats.projectsPending} em análise
              </small>
            </div>

            <div className="glass-subtle rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <small className="text-muted-foreground">Aprovados</small>
              </div>
              <h3>{participantStats.approved}</h3>
            </div>

            <div className="glass-subtle rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-orange-600" />
                <small className="text-muted-foreground">Lista de Espera</small>
              </div>
              <h3>{participantStats.waitlist}</h3>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <GlassCard elevation="medium" className="border border-red-500/40 bg-red-500/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h4 className="text-red-500">Não foi possível carregar todos os dados</h4>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <GlassButton variant="ghost" size="sm" onClick={refreshAll} disabled={loading}>
                <Loader2 className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Tentar novamente
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Tabs Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="glass mb-6">
            <TabsTrigger value="overview">
              <Eye className="h-4 w-4 mr-2" />
              Visão Geral
            </TabsTrigger>
            <TabsTrigger value="participants">
              <Users className="h-4 w-4 mr-2" />
              Participantes
            </TabsTrigger>
            <TabsTrigger value="projects">
              <FolderKanban className="h-4 w-4 mr-2" />
              Projetos
            </TabsTrigger>
            <TabsTrigger value="communication">
              <MessageSquare className="h-4 w-4 mr-2" />
              Comunicação
            </TabsTrigger>
          </TabsList>

          {actionError && (
            <GlassCard elevation="medium" className="border border-red-500/30 bg-red-500/5 mb-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <div>
                  <h4 className="text-red-500">Ação não concluída</h4>
                  <p className="text-muted-foreground">{actionError}</p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <GlassCard elevation="medium">
              <h4 className="mb-4">Informações do Evento</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-muted-foreground mb-2">Descrição</p>
                  <p>{currentEvent?.description || 'Descrição ainda não informada.'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">Datas</p>
                  <p>
                    Início:{' '}
                    {currentEvent?.startDate
                      ? new Date(currentEvent.startDate).toLocaleDateString('pt-BR')
                      : 'não definido'}
                  </p>
                  <p>
                    Término:{' '}
                    {currentEvent?.endDate
                      ? new Date(currentEvent.endDate).toLocaleDateString('pt-BR')
                      : 'não definido'}
                  </p>
                  <p>
                    Inscrições até:{' '}
                    {currentEvent?.registrationDeadline
                      ? new Date(currentEvent.registrationDeadline).toLocaleDateString('pt-BR')
                      : 'não informado'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">Localização</p>
                  {currentEvent?.locationType && (
                    <Badge variant="outline" className="mb-2">
                      {currentEvent.locationType}
                    </Badge>
                  )}
                  <p>{currentEvent?.location || 'Local não informado'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">Configurações</p>
                  <p>Máx. participantes: {currentEvent?.maxParticipants ?? '—'}</p>
                  <p>
                    Tamanho equipe: {currentEvent?.minTeamSize ?? '—'}-
                    {currentEvent?.maxTeamSize ?? '—'}
                  </p>
                  <p>Aprovação manual: {currentEvent?.requiresApproval ? 'Sim' : 'Não'}</p>
                </div>
              </div>

              {currentEvent?.categories && currentEvent.categories.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border/50">
                  <p className="text-muted-foreground mb-2">Categorias</p>
                  <div className="flex flex-wrap gap-2">
                    {currentEvent.categories.map(cat => (
                      <Badge key={cat}>{cat}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {currentEvent?.prizes && currentEvent.prizes.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border/50">
                  <p className="text-muted-foreground mb-3">Prêmios</p>
                  <div className="space-y-2">
                    {currentEvent.prizes.map((prize, i) => (
                      <div key={i} className="glass-subtle rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <Award className="h-4 w-4 text-primary" />
                          <h4>{prize.position}</h4>
                          {prize.value && <Badge variant="outline">{prize.value}</Badge>}
                        </div>
                        <p className="text-muted-foreground mt-1">{prize.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </GlassCard>

            {currentEvent?.schedule && currentEvent.schedule.length > 0 && (
              <GlassCard elevation="medium">
                <h4 className="mb-4">Cronograma</h4>
                <div className="space-y-3">
                  {currentEvent.schedule.map((item, i) => (
                    <div key={i} className="glass-subtle rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="glass rounded-lg p-2">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4>{item.title || 'Atividade'}</h4>
                            <Badge variant="outline">
                              {item.date ? new Date(item.date).toLocaleDateString('pt-BR') : 'Data indefinida'}
                              {item.time ? ` às ${item.time}` : ''}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{item.description || 'Sem descrição cadastrada.'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </TabsContent>

          {/* Participants Tab */}
          <TabsContent value="participants" className="space-y-6">
            <GlassCard elevation="medium">
              <div className="flex items-center justify-between mb-4">
                <h4>Gestão de Participantes</h4>
                <div className="flex gap-2">
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExportData('participants')}
                    disabled={downloadType === 'participants'}
                  >
                    {downloadType === 'participants' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Exportar
                  </GlassButton>
                  <GlassButton variant="ghost" size="sm" disabled={!currentEvent}>
                    <UserPlus className="h-4 w-4" />
                    Convidar
                  </GlassButton>
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="flex-1">
                  <GlassInput
                    placeholder="Buscar por nome ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  {['all', 'pending', 'approved', 'rejected', 'waitlist'].map(status => (
                    <button
                      key={status}
                      onClick={() => setFilterStatus(status)}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        filterStatus === status
                          ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white'
                          : 'glass-subtle hover:glass'
                      }`}
                    >
                      {status === 'all' && 'Todos'}
                      {status === 'pending' && 'Pendentes'}
                      {status === 'approved' && 'Aprovados'}
                      {status === 'rejected' && 'Rejeitados'}
                      {status === 'waitlist' && 'Lista de Espera'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Participants List */}
              <div className="space-y-3">
                {participantsLoading ? (
                  <div className="glass-subtle rounded-lg p-6 flex items-center justify-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Carregando participantes...
                  </div>
                ) : filteredParticipants.length > 0 ? (
                  filteredParticipants.map(participant => (
                    <div key={participant.id} className="glass-subtle rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <Avatar className="h-10 w-10 bg-gradient-to-br from-teal-500 to-emerald-600">
                            <span className="text-white">{participant.name ? participant.name[0] : '?'}</span>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4>{participant.name || 'Participante'}</h4>
                            {!participant.profileComplete && (
                              <Badge variant="outline" className="text-orange-600">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Perfil Incompleto
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-2">{participant.email || 'Email não informado'}</p>
                          <div className="flex flex-wrap gap-1">
                            {(participant.skills ?? []).map(skill => (
                              <Badge key={skill} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                          <small className="text-muted-foreground block mt-2">
                            Inscrito em {participant.registeredAt ? new Date(participant.registeredAt).toLocaleDateString('pt-BR') : 'data não informada'}
                          </small>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {participant.status === 'pending' && (
                          <>
                            <GlassButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleApproveParticipant(participant.id)}
                            >
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              Aprovar
                            </GlassButton>
                            <GlassButton
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRejectParticipant(participant.id)}
                            >
                              <XCircle className="h-4 w-4 text-red-600" />
                              Rejeitar
                            </GlassButton>
                          </>
                        )}
                        {participant.status === 'approved' && (
                          <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Aprovado
                          </Badge>
                        )}
                        {participant.status === 'rejected' && (
                          <Badge variant="outline" className="text-red-600 border-red-500/20">
                            <XCircle className="h-3 w-3 mr-1" />
                            Rejeitado
                          </Badge>
                        )}
                        {participant.status === 'waitlist' && (
                          <Badge variant="outline" className="text-orange-600">
                            <Clock className="h-3 w-3 mr-1" />
                            Lista de Espera
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  ))
                ) : (
                  <div className="glass-subtle rounded-lg p-6 text-center text-muted-foreground">
                    Nenhum participante encontrado com os filtros atuais.
                  </div>
                )}
              </div>
            </GlassCard>
          </TabsContent>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <GlassCard elevation="medium">
              <div className="flex items-center justify-between mb-4">
                <h4>Projetos Submetidos</h4>
                <div className="flex gap-2">
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onClick={() => handleExportData('projects')}
                    disabled={downloadType === 'projects'}
                  >
                    {downloadType === 'projects' ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Exportar
                  </GlassButton>
                  <GlassButton variant="ghost" size="sm" disabled>
                    <Filter className="h-4 w-4" />
                    Filtros
                  </GlassButton>
                </div>
              </div>

              <div className="space-y-4">
                {projectsLoading ? (
                  <div className="glass-subtle rounded-lg p-6 flex items-center justify-center gap-3 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Carregando projetos...
                  </div>
                ) : projects.length > 0 ? (
                  projects.map(project => (
                    <div key={project.id} className="glass-subtle rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4>{project.title || (project as { name?: string }).name || 'Projeto'}</h4>
                            <Badge variant="outline">{project.category}</Badge>
                            {project.status === 'approved' && (
                              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                                Aprovado
                              </Badge>
                            )}
                            {project.status === 'submitted' && (
                              <Badge variant="outline" className="text-orange-600">
                                Em Análise
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3">
                            {project.description || 'Descrição não informada.'}
                          </p>

                          <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <small>
                                {project.teamName || 'Equipe'} ({project.teamMembers ?? project.members ?? 0} membros)
                              </small>
                            </div>
                            {project.submittedAt && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <small>{new Date(project.submittedAt).toLocaleDateString('pt-BR')}</small>
                              </div>
                            )}
                          </div>

                          <div className="mt-3">
                            <div className="flex items-center justify-between mb-1">
                              <small className="text-muted-foreground">Progresso</small>
                              <small className="text-primary">{clampProgress(project.progress)}%</small>
                            </div>
                            <div className="h-2 glass-subtle rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all"
                                style={{ width: `${clampProgress(project.progress)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 ml-4">
                          {project.status === 'submitted' && (
                            <>
                              <GlassButton
                                variant="ghost"
                                size="sm"
                                onClick={() => handleApproveProject(project.id)}
                              >
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                Aprovar
                              </GlassButton>
                              <GlassButton
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRejectProject(project.id)}
                              >
                                <XCircle className="h-4 w-4 text-red-600" />
                                Rejeitar
                              </GlassButton>
                            </>
                          )}
                          <GlassButton variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                            Ver Detalhes
                          </GlassButton>
                          <GlassButton variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4" />
                            Mensagem
                          </GlassButton>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="glass-subtle rounded-lg p-6 text-center text-muted-foreground">
                    Nenhum projeto cadastrado para este evento.
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Project Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <GlassCard elevation="medium">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h4>Estatísticas de Projetos</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total:</span>
                    <span>{participantStats.totalProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aprovados:</span>
                    <span className="text-green-600">{participantStats.projectsApproved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Em análise:</span>
                    <span className="text-orange-600">{participantStats.projectsPending}</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard elevation="medium">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-5 w-5 text-primary" />
                  <h4>Categorias Populares</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(projects.map(p => p.category)))
                    .filter(Boolean)
                    .map((cat) => (
                      <Badge key={cat as string}>{cat}</Badge>
                    ))}
                </div>
              </GlassCard>

              <GlassCard elevation="medium">
                <div className="flex items-center gap-3 mb-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <h4>Ações Rápidas</h4>
                </div>
                <div className="space-y-2">
                  <GlassButton variant="ghost" size="sm" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Submissões
                  </GlassButton>
                  <GlassButton variant="ghost" size="sm" className="w-full justify-start">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Mensagem para Todos
                  </GlassButton>
                </div>
              </GlassCard>
            </div>
          </TabsContent>

          {/* Communication Tab */}
          <TabsContent value="communication" className="space-y-6">
            <GlassCard elevation="medium">
              <h4 className="mb-4">Enviar Comunicado</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-muted-foreground">
                    Destinatários
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <button
                      onClick={() => setSelectedParticipants(participants.map(p => p.id))}
                      className="px-4 py-2 rounded-lg glass-subtle hover:glass"
                    >
                      Todos Participantes ({participants.length})
                    </button>
                    <button
                      onClick={() => setSelectedParticipants(participants.filter(p => p.status === 'approved').map(p => p.id))}
                      className="px-4 py-2 rounded-lg glass-subtle hover:glass"
                    >
                      Apenas Aprovados ({participantStats.approved})
                    </button>
                    <button
                      onClick={() => setSelectedParticipants(participants.filter(p => p.status === 'pending').map(p => p.id))}
                      className="px-4 py-2 rounded-lg glass-subtle hover:glass"
                    >
                      Pendentes ({participantStats.pending})
                    </button>
                  </div>
                  <small className="text-muted-foreground">
                    {selectedParticipants.length} destinatário(s) selecionado(s)
                  </small>
                </div>

                <div>
                  <label className="block mb-2 text-muted-foreground">
                    Mensagem
                  </label>
                  <textarea
                    className="w-full glass-subtle rounded-lg p-3 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Digite sua mensagem..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                  />
                </div>

                <div className="flex gap-2">
                  <GlassButton
                    variant="filled"
                    onClick={handleSendMessage}
                    disabled={!messageText.trim() || selectedParticipants.length === 0 || messageLoading}
                  >
                    {messageLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Enviar Mensagem
                  </GlassButton>
                  <GlassButton variant="ghost" disabled>
                    <Mail className="h-4 w-4" />
                    Enviar como Email
                  </GlassButton>
                </div>
              </div>
            </GlassCard>

            <GlassCard elevation="medium">
              <h4 className="mb-4">Modelos de Mensagem</h4>
              
              <div className="space-y-3">
                {[
                  {
                    title: 'Lembrete de Prazo',
                    content: 'Olá! Lembramos que o prazo para submissão de projetos termina em [DATA]. Não perca essa oportunidade!',
                  },
                  {
                    title: 'Confirmação de Inscrição',
                    content: 'Parabéns! Sua inscrição foi aprovada. Fique atento ao cronograma do evento.',
                  },
                  {
                    title: 'Mudança no Cronograma',
                    content: 'Atenção! Houve uma alteração no cronograma do evento. Confira os novos horários na plataforma.',
                  },
                ].map((template, i) => (
                  <button
                    key={i}
                    onClick={() => setMessageText(template.content)}
                    className="w-full text-left glass-subtle rounded-lg p-4 hover:glass transition-all"
                  >
                    <h4 className="mb-1">{template.title}</h4>
                    <p className="text-muted-foreground">{template.content}</p>
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard elevation="medium">
              <h4 className="mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notificações Automáticas
              </h4>
              
              <div className="space-y-3">
                {[
                  { label: 'Notificar novas inscrições', enabled: true },
                  { label: 'Lembrar prazos importantes', enabled: true },
                  { label: 'Alertar sobre projetos submetidos', enabled: true },
                  { label: 'Avisar sobre perfis incompletos', enabled: false },
                ].map((notification, i) => (
                  <div key={i} className="flex items-center justify-between glass-subtle rounded-lg p-4">
                    <span>{notification.label}</span>
                    <Switch defaultChecked={notification.enabled} />
                  </div>
                ))}
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
