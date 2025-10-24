import React from 'react';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { GlassInput } from '../components/GlassInput';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { EmptyState } from '../components/EmptyState';
import { Shield, Users, Briefcase, Tag, Check, X, AlertTriangle, Search, Inbox } from 'lucide-react';

interface AdminStats {
  activeUsers: number;
  totalProjects: number;
  pendingItems: number;
  totalTags: number;
}

interface PendingItem {
  id: string;
  title: string;
  creator: string;
  category?: string;
  submittedAt: string;
  reason: string;
}

interface SkillTag {
  name: string;
  count: number;
  active: boolean;
}

interface AdminPageProps {
  stats?: AdminStats;
  pendingProjects?: PendingItem[];
  pendingProfiles?: PendingItem[];
  skillsTags?: SkillTag[];
}

export function AdminPage({
  stats,
  pendingProjects = [],
  pendingProfiles = [],
  skillsTags = []
}: AdminPageProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  // TODO: Fetch from backend
  // const { stats, pendingProjects, pendingProfiles, skillsTags } = await fetchAdminData();

  const displayStats = {
    activeUsers: stats?.activeUsers || 0,
    totalProjects: stats?.totalProjects || 0,
    pendingItems: stats?.pendingItems || 0,
    totalTags: stats?.totalTags || 0,
  };

  const statsData = [
    { label: 'Usuários Ativos', value: displayStats.activeUsers.toString(), icon: Users, color: 'text-teal-500' },
    { label: 'Projetos', value: displayStats.totalProjects.toString(), icon: Briefcase, color: 'text-emerald-500' },
    { label: 'Pendentes', value: displayStats.pendingItems.toString(), icon: AlertTriangle, color: 'text-orange-500' },
    { label: 'Skills/Tags', value: displayStats.totalTags.toString(), icon: Tag, color: 'text-green-500' },
  ];

  return (
    <div className="min-h-screen page-background pb-24">
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h2>Painel Administrativo</h2>
            <p className="text-muted-foreground">Moderação & Gestão da Plataforma</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsData.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <GlassCard key={idx} elevation="medium">
                <div className="flex items-center gap-3">
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                  <div>
                    <h3>{stat.value}</h3>
                    <p className="text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        <Tabs defaultValue="projects" className="w-full">
          <TabsList className="glass w-full md:w-auto">
            <TabsTrigger value="projects">
              Projetos
              {pendingProjects.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingProjects.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="profiles">
              Perfis
              {pendingProfiles.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingProfiles.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="tags">Tags & Skills</TabsTrigger>
          </TabsList>

          <TabsContent value="projects" className="mt-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3>Projetos Pendentes de Aprovação</h3>
              <GlassInput
                placeholder="Buscar projetos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
            </div>

            {pendingProjects.length > 0 ? (
              pendingProjects.map((project) => (
                <GlassCard key={project.id} elevation="medium">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4>{project.title}</h4>
                        {project.category && <Badge variant="outline">{project.category}</Badge>}
                      </div>
                      <p className="text-muted-foreground mb-1">
                        Criado por: {project.creator}
                      </p>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertTriangle className="h-4 w-4" />
                        <small>{project.reason} • {project.submittedAt}</small>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <GlassButton variant="ghost">Ver Detalhes</GlassButton>
                      <GlassButton variant="filled" className="bg-gradient-to-r from-green-500 to-green-600">
                        <Check className="h-4 w-4" />
                        Aprovar
                      </GlassButton>
                      <GlassButton variant="ghost" className="text-red-500 hover:bg-red-500/10">
                        <X className="h-4 w-4" />
                      </GlassButton>
                    </div>
                  </div>
                </GlassCard>
              ))
            ) : (
              <EmptyState
                icon={Check}
                title="Tudo em dia!"
                description="Não há projetos pendentes de aprovação"
              />
            )}
          </TabsContent>

          <TabsContent value="profiles" className="mt-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3>Perfis Pendentes de Revisão</h3>
              <GlassInput
                placeholder="Buscar perfis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-xs"
              />
            </div>

            {pendingProfiles.length > 0 ? (
              pendingProfiles.map((profile) => (
                <GlassCard key={profile.id} elevation="medium">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <h4 className="mb-1">{profile.title}</h4>
                      <p className="text-muted-foreground mb-1">{profile.creator}</p>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertTriangle className="h-4 w-4" />
                        <small>{profile.reason} • {profile.submittedAt}</small>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <GlassButton variant="ghost">Ver Perfil</GlassButton>
                      <GlassButton variant="filled" className="bg-gradient-to-r from-green-500 to-green-600">
                        <Check className="h-4 w-4" />
                        Verificar
                      </GlassButton>
                      <GlassButton variant="ghost" className="text-red-500 hover:bg-red-500/10">
                        <X className="h-4 w-4" />
                      </GlassButton>
                    </div>
                  </div>
                </GlassCard>
              ))
            ) : (
              <EmptyState
                icon={Check}
                title="Tudo em dia!"
                description="Não há perfis pendentes de revisão"
              />
            )}
          </TabsContent>

          <TabsContent value="tags" className="mt-6">
            <GlassCard elevation="high">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="mb-1">Gestão de Tags & Skills</h3>
                  <p className="text-muted-foreground">
                    Gerenciar taxonomia da plataforma
                  </p>
                </div>
                <GlassButton variant="filled">
                  <Tag className="h-4 w-4" />
                  Adicionar Tag
                </GlassButton>
              </div>

              <div className="mb-6">
                <GlassInput
                  placeholder="Buscar tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {skillsTags.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {skillsTags.map((tag) => (
                      <div
                        key={tag.name}
                        className="glass-subtle rounded-lg p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="flex items-center gap-2">
                            <Tag className="h-4 w-4 text-muted-foreground" />
                            <h4>{tag.name}</h4>
                          </div>
                          <Badge variant="secondary">{tag.count} usos</Badge>
                          <Badge
                            variant={tag.active ? 'default' : 'outline'}
                            className={
                              tag.active
                                ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                                : ''
                            }
                          >
                            {tag.active ? 'Ativa' : 'Inativa'}
                          </Badge>
                        </div>
                        <div className="flex gap-2">
                          <GlassButton variant="ghost" size="sm">
                            Editar
                          </GlassButton>
                          <GlassButton
                            variant="ghost"
                            size="sm"
                            className={tag.active ? '' : 'text-green-500'}
                          >
                            {tag.active ? 'Desativar' : 'Ativar'}
                          </GlassButton>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-border/50">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="glass-subtle rounded-lg p-4 text-center">
                        <h3>{skillsTags.length}</h3>
                        <p className="text-muted-foreground">Total de Tags</p>
                      </div>
                      <div className="glass-subtle rounded-lg p-4 text-center">
                        <h3>{skillsTags.filter(t => t.active).length}</h3>
                        <p className="text-muted-foreground">Tags Ativas</p>
                      </div>
                      <div className="glass-subtle rounded-lg p-4 text-center">
                        <h3>{skillsTags.reduce((acc, t) => acc + t.count, 0)}</h3>
                        <p className="text-muted-foreground">Usos Totais</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={Tag}
                  title="Nenhuma tag cadastrada"
                  description="Adicione tags para organizar skills e categorias na plataforma"
                  actionLabel="Adicionar Primeira Tag"
                  onAction={() => console.log('Add tag')}
                />
              )}
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
