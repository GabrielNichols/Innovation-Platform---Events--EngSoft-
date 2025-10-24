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
  Link2
} from 'lucide-react';
import { EventFormData } from './CreateEventPage';

interface EventDetailPageProps {
  eventId: string;
  eventData?: EventFormData;
  userRole: 'organizer' | 'admin';
  onBack: () => void;
  onEdit: () => void;
  onDelete?: () => void;
}

interface Participant {
  id: string;
  name: string;
  email: string;
  skills: string[];
  status: 'pending' | 'approved' | 'rejected' | 'waitlist';
  registeredAt: string;
  profileComplete: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  teamName: string;
  teamMembers: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  category: string;
  submittedAt?: string;
  progress: number;
}

export function EventDetailPage({ eventId, eventData, userRole, onBack, onEdit, onDelete }: EventDetailPageProps) {
  const [activeTab, setActiveTab] = React.useState('overview');
  const [selectedParticipants, setSelectedParticipants] = React.useState<string[]>([]);
  const [filterStatus, setFilterStatus] = React.useState<string>('all');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [messageText, setMessageText] = React.useState('');

  // Mock data - TODO: Replace with backend data
  const [participants, setParticipants] = React.useState<Participant[]>([
    {
      id: '1',
      name: 'Ana Silva',
      email: 'ana@email.com',
      skills: ['React', 'UI/UX'],
      status: 'pending',
      registeredAt: '2025-01-15',
      profileComplete: true,
    },
    {
      id: '2',
      name: 'Carlos Santos',
      email: 'carlos@email.com',
      skills: ['Python', 'ML'],
      status: 'approved',
      registeredAt: '2025-01-14',
      profileComplete: true,
    },
    {
      id: '3',
      name: 'Beatriz Costa',
      email: 'beatriz@email.com',
      skills: ['Node.js', 'Docker'],
      status: 'approved',
      registeredAt: '2025-01-13',
      profileComplete: false,
    },
  ]);

  const [projects, setProjects] = React.useState<Project[]>([
    {
      id: '1',
      name: 'HealthAI',
      description: 'Plataforma de diagnóstico assistido por IA',
      teamName: 'Team Alpha',
      teamMembers: 4,
      status: 'submitted',
      category: 'Saúde',
      submittedAt: '2025-01-16',
      progress: 60,
    },
    {
      id: '2',
      name: 'EduConnect',
      description: 'Rede social educacional gamificada',
      teamName: 'Team Beta',
      teamMembers: 3,
      status: 'approved',
      category: 'Educação',
      submittedAt: '2025-01-15',
      progress: 80,
    },
  ]);

  const stats = {
    totalParticipants: participants.length,
    pending: participants.filter(p => p.status === 'pending').length,
    approved: participants.filter(p => p.status === 'approved').length,
    waitlist: participants.filter(p => p.status === 'waitlist').length,
    totalProjects: projects.length,
    projectsApproved: projects.filter(p => p.status === 'approved').length,
    projectsPending: projects.filter(p => p.status === 'submitted').length,
  };

  const handleApproveParticipant = (participantId: string) => {
    // TODO: POST /api/events/:eventId/participants/:participantId/approve
    setParticipants(participants.map(p =>
      p.id === participantId ? { ...p, status: 'approved' } : p
    ));
  };

  const handleRejectParticipant = (participantId: string) => {
    // TODO: POST /api/events/:eventId/participants/:participantId/reject
    setParticipants(participants.map(p =>
      p.id === participantId ? { ...p, status: 'rejected' } : p
    ));
  };

  const handleApproveProject = (projectId: string) => {
    // TODO: POST /api/events/:eventId/projects/:projectId/approve
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, status: 'approved' } : p
    ));
  };

  const handleRejectProject = (projectId: string) => {
    // TODO: POST /api/events/:eventId/projects/:projectId/reject
    setProjects(projects.map(p =>
      p.id === projectId ? { ...p, status: 'rejected' } : p
    ));
  };

  const handleSendMessage = () => {
    if (!messageText.trim()) return;

    // TODO: POST /api/events/:eventId/messages
    // Body: { message: messageText, recipients: selectedParticipants }
    console.log('Sending message:', messageText, 'to:', selectedParticipants);
    setMessageText('');
  };

  const handleDuplicateEvent = () => {
    // TODO: POST /api/events/:eventId/duplicate
    console.log('Duplicating event:', eventId);
  };

  const handleExportData = (type: 'participants' | 'projects') => {
    // TODO: GET /api/events/:eventId/export/:type
    console.log('Exporting:', type);
  };

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
                <h3>{eventData?.name || 'Carregando...'}</h3>
                <small className="text-muted-foreground">{eventData?.theme}</small>
              </div>
            </div>
            <div className="flex gap-2">
              <GlassButton variant="ghost" size="sm" onClick={handleDuplicateEvent}>
                <Copy className="h-4 w-4" />
                <span className="hidden sm:inline">Duplicar</span>
              </GlassButton>
              <GlassButton variant="ghost" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Editar</span>
              </GlassButton>
              <GlassButton variant="ghost" size="sm">
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Compartilhar</span>
              </GlassButton>
              {userRole === 'admin' && onDelete && (
                <GlassButton variant="ghost" size="sm" onClick={onDelete}>
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
              <h3>{stats.totalParticipants}</h3>
              <small className="text-muted-foreground">
                {stats.pending} pendentes
              </small>
            </div>

            <div className="glass-subtle rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <FolderKanban className="h-4 w-4 text-primary" />
                <small className="text-muted-foreground">Projetos</small>
              </div>
              <h3>{stats.totalProjects}</h3>
              <small className="text-muted-foreground">
                {stats.projectsPending} em análise
              </small>
            </div>

            <div className="glass-subtle rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <small className="text-muted-foreground">Aprovados</small>
              </div>
              <h3>{stats.approved}</h3>
            </div>

            <div className="glass-subtle rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-orange-600" />
                <small className="text-muted-foreground">Lista de Espera</small>
              </div>
              <h3>{stats.waitlist}</h3>
            </div>
          </div>
        </div>
      </div>

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

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <GlassCard elevation="medium">
              <h4 className="mb-4">Informações do Evento</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-muted-foreground mb-2">Descrição</p>
                  <p>{eventData?.description}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">Datas</p>
                  <p>Início: {eventData?.startDate && new Date(eventData.startDate).toLocaleDateString('pt-BR')}</p>
                  <p>Término: {eventData?.endDate && new Date(eventData.endDate).toLocaleDateString('pt-BR')}</p>
                  <p>Inscrições até: {eventData?.registrationDeadline && new Date(eventData.registrationDeadline).toLocaleDateString('pt-BR')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">Localização</p>
                  <Badge variant="outline" className="mb-2">{eventData?.locationType}</Badge>
                  <p>{eventData?.location}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-2">Configurações</p>
                  <p>Máx. participantes: {eventData?.maxParticipants}</p>
                  <p>Tamanho equipe: {eventData?.minTeamSize}-{eventData?.maxTeamSize}</p>
                  <p>Aprovação manual: {eventData?.requiresApproval ? 'Sim' : 'Não'}</p>
                </div>
              </div>

              {eventData?.categories && eventData.categories.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border/50">
                  <p className="text-muted-foreground mb-2">Categorias</p>
                  <div className="flex flex-wrap gap-2">
                    {eventData.categories.map(cat => (
                      <Badge key={cat}>{cat}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {eventData?.prizes && eventData.prizes.length > 0 && (
                <div className="mt-6 pt-6 border-t border-border/50">
                  <p className="text-muted-foreground mb-3">Prêmios</p>
                  <div className="space-y-2">
                    {eventData.prizes.map((prize, i) => (
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

            {eventData?.schedule && eventData.schedule.length > 0 && (
              <GlassCard elevation="medium">
                <h4 className="mb-4">Cronograma</h4>
                <div className="space-y-3">
                  {eventData.schedule.map((item, i) => (
                    <div key={i} className="glass-subtle rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="glass rounded-lg p-2">
                          <Clock className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4>{item.title}</h4>
                            <Badge variant="outline">
                              {new Date(item.date).toLocaleDateString('pt-BR')} às {item.time}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground">{item.description}</p>
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
                  <GlassButton variant="ghost" size="sm" onClick={() => handleExportData('participants')}>
                    <Download className="h-4 w-4" />
                    Exportar
                  </GlassButton>
                  <GlassButton variant="ghost" size="sm">
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
                {filteredParticipants.map(participant => (
                  <div key={participant.id} className="glass-subtle rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Avatar className="h-10 w-10 bg-gradient-to-br from-teal-500 to-emerald-600">
                          <span className="text-white">{participant.name[0]}</span>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4>{participant.name}</h4>
                            {!participant.profileComplete && (
                              <Badge variant="outline" className="text-orange-600">
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Perfil Incompleto
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-2">{participant.email}</p>
                          <div className="flex flex-wrap gap-1">
                            {participant.skills.map(skill => (
                              <Badge key={skill} variant="secondary">{skill}</Badge>
                            ))}
                          </div>
                          <small className="text-muted-foreground block mt-2">
                            Inscrito em {new Date(participant.registeredAt).toLocaleDateString('pt-BR')}
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
                ))}

                {filteredParticipants.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum participante encontrado
                  </p>
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
                  <GlassButton variant="ghost" size="sm" onClick={() => handleExportData('projects')}>
                    <Download className="h-4 w-4" />
                    Exportar
                  </GlassButton>
                  <GlassButton variant="ghost" size="sm">
                    <Filter className="h-4 w-4" />
                    Filtros
                  </GlassButton>
                </div>
              </div>

              <div className="space-y-4">
                {projects.map(project => (
                  <div key={project.id} className="glass-subtle rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4>{project.name}</h4>
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
                        <p className="text-muted-foreground mb-3">{project.description}</p>
                        
                        <div className="flex items-center gap-4 text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <small>{project.teamName} ({project.teamMembers} membros)</small>
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
                            <small className="text-primary">{project.progress}%</small>
                          </div>
                          <div className="h-2 glass-subtle rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all"
                              style={{ width: `${project.progress}%` }}
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
                ))}

                {projects.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum projeto submetido ainda
                  </p>
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
                    <span>{stats.totalProjects}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aprovados:</span>
                    <span className="text-green-600">{stats.projectsApproved}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Em análise:</span>
                    <span className="text-orange-600">{stats.projectsPending}</span>
                  </div>
                </div>
              </GlassCard>

              <GlassCard elevation="medium">
                <div className="flex items-center gap-3 mb-2">
                  <Award className="h-5 w-5 text-primary" />
                  <h4>Categorias Populares</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(new Set(projects.map(p => p.category))).map(cat => (
                    <Badge key={cat}>{cat}</Badge>
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
                      Apenas Aprovados ({stats.approved})
                    </button>
                    <button
                      onClick={() => setSelectedParticipants(participants.filter(p => p.status === 'pending').map(p => p.id))}
                      className="px-4 py-2 rounded-lg glass-subtle hover:glass"
                    >
                      Pendentes ({stats.pending})
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
                  <GlassButton variant="filled" onClick={handleSendMessage} disabled={!messageText.trim() || selectedParticipants.length === 0}>
                    <Send className="h-4 w-4" />
                    Enviar Mensagem
                  </GlassButton>
                  <GlassButton variant="ghost">
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
