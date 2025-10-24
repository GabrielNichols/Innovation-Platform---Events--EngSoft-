import React from 'react';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { EmptyState } from '../components/EmptyState';
import { Calendar, Users, TrendingUp, Award, Download, Inbox } from 'lucide-react';

interface EventData {
  name: string;
  date: string;
  participants: number;
  teams: number;
  submissions: number;
}

interface Team {
  id: string;
  name: string;
  members: number;
  project: string;
  skills: string[];
  status: string;
}

interface SkillHeatmap {
  skill: string;
  count: number;
}

interface OrganizerPageProps {
  eventData?: EventData;
  teams?: Team[];
  skillsHeatmap?: SkillHeatmap[];
}

export function OrganizerPage({
  eventData,
  teams = [],
  skillsHeatmap = []
}: OrganizerPageProps) {
  // TODO: Fetch from backend
  // const { eventData, teams, skillsHeatmap } = await fetchOrganizerData();

  const maxCount = skillsHeatmap.length > 0 
    ? Math.max(...skillsHeatmap.map(s => s.count))
    : 1;

  return (
    <div className="min-h-screen page-background pb-24">
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="mb-2">Painel do Organizador</h2>
          <p className="text-muted-foreground">
            {eventData?.name || 'Carregando evento...'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <GlassCard elevation="medium" className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
            <h3>{eventData?.participants || 0}</h3>
            <p className="text-muted-foreground">Participantes</p>
          </GlassCard>
          <GlassCard elevation="medium" className="text-center">
            <Users className="h-8 w-8 mx-auto mb-2 text-purple-500" />
            <h3>{eventData?.teams || 0}</h3>
            <p className="text-muted-foreground">Equipes</p>
          </GlassCard>
          <GlassCard elevation="medium" className="text-center">
            <Award className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <h3>{eventData?.submissions || 0}</h3>
            <p className="text-muted-foreground">Submissões</p>
          </GlassCard>
          <GlassCard elevation="medium" className="text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 text-orange-500" />
            <p className="text-muted-foreground mb-1">Data</p>
            <h4>{eventData?.date || '-'}</h4>
          </GlassCard>
        </div>

        <Tabs defaultValue="teams" className="w-full">
          <TabsList className="glass w-full">
            <TabsTrigger value="teams" className="flex-1">Equipes</TabsTrigger>
            <TabsTrigger value="heatmap" className="flex-1">Skills</TabsTrigger>
            <TabsTrigger value="schedule" className="flex-1">Cronograma</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="mt-6 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3>Equipes Inscritas</h3>
              <GlassButton variant="ghost">
                <Download className="h-4 w-4" />
                Exportar
              </GlassButton>
            </div>

            {teams.length > 0 ? (
              teams.map((team) => (
                <GlassCard key={team.id} elevation="medium">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4>{team.name}</h4>
                        <Badge
                          variant={team.status === 'Submetido' ? 'default' : 'secondary'}
                          className={
                            team.status === 'Submetido'
                              ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                              : ''
                          }
                        >
                          {team.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{team.project}</p>
                      <div className="flex flex-wrap gap-1">
                        {team.skills.map((skill, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-muted-foreground">Membros</p>
                        <h4>{team.members}</h4>
                      </div>
                      <GlassButton variant="ghost">Ver Detalhes</GlassButton>
                    </div>
                  </div>
                </GlassCard>
              ))
            ) : (
              <EmptyState
                icon={Inbox}
                title="Nenhuma equipe inscrita"
                description="Quando equipes se inscreverem no evento, elas aparecerão aqui"
              />
            )}
          </TabsContent>

          <TabsContent value="heatmap" className="mt-6">
            <GlassCard elevation="high">
              <h3 className="mb-4">Heatmap de Formação</h3>
              <p className="text-muted-foreground mb-6">
                Distribuição de skills entre os participantes
              </p>

              {skillsHeatmap.length > 0 ? (
                <>
                  <div className="space-y-3">
                    {skillsHeatmap.map((item) => (
                      <div key={item.skill}>
                        <div className="flex items-center justify-between mb-1">
                          <span>{item.skill}</span>
                          <span className="text-muted-foreground">{item.count} pessoas</span>
                        </div>
                        <div className="h-8 rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-600 transition-all duration-500 flex items-center justify-end px-2"
                            style={{ width: `${(item.count / maxCount) * 100}%` }}
                          >
                            {(item.count / maxCount) * 100 > 20 && (
                              <span className="text-white text-sm">{item.count}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-border/50">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass-subtle rounded-lg p-3 text-center">
                        <TrendingUp className="h-6 w-6 mx-auto mb-1 text-green-500" />
                        <p className="text-muted-foreground">Mais buscada</p>
                        <h4>{skillsHeatmap[0]?.skill || '-'}</h4>
                      </div>
                      <div className="glass-subtle rounded-lg p-3 text-center">
                        <TrendingUp className="h-6 w-6 mx-auto mb-1 text-orange-500" />
                        <p className="text-muted-foreground">Total</p>
                        <h4>{skillsHeatmap.reduce((acc, s) => acc + s.count, 0)}</h4>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <EmptyState
                  icon={TrendingUp}
                  title="Dados insuficientes"
                  description="O heatmap será gerado quando houver participantes inscritos no evento"
                />
              )}
            </GlassCard>
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <GlassCard elevation="high">
              <h3 className="mb-6">Cronograma do Evento</h3>

              <div className="space-y-4">
                {/* TODO: Load schedule from backend */}
                <EmptyState
                  icon={Calendar}
                  title="Cronograma não configurado"
                  description="Configure o cronograma do evento para visualizá-lo aqui"
                  actionLabel="Configurar Cronograma"
                  onAction={() => console.log('Configure schedule')}
                />
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
