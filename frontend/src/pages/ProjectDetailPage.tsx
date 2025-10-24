import React from 'react';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { ArrowLeft, MapPin, Users, Sparkles, Send, UserPlus } from 'lucide-react';

interface ProjectDetails {
  id: string;
  title: string;
  description: string;
  skills: string[];
  status: 'Recrutando' | 'Em Andamento' | 'Completo';
  team: { name: string; avatar?: string }[];
  location: string;
  openSpots: number;
  category: string;
  matchScore?: number;
  aiInsight?: string;
  details: {
    problem: string;
    goals: string;
    requirements: string;
  };
  openPositions: {
    role: string;
    skills: string[];
    spots: number;
  }[];
}

interface ProjectDetailPageProps {
  projectId: string;
  onBack: () => void;
  onApply: () => void;
  project?: ProjectDetails; // Backend data will be passed here
}

export function ProjectDetailPage({ projectId, onBack, onApply, project }: ProjectDetailPageProps) {
  // TODO: Fetch project from backend using projectId
  // const project = await fetchProject(projectId);

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <GlassCard>
          <div className="text-center py-8">
            <h3 className="mb-2">Projeto não encontrado</h3>
            <p className="text-muted-foreground mb-4">
              O projeto que você está procurando não existe ou foi removido.
            </p>
            <GlassButton variant="filled" onClick={onBack}>
              Voltar
            </GlassButton>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-background pb-24">
      {/* Header */}
      <div className="glass-strong sticky top-0 z-40 border-b border-border/50">
        <div className="max-w-screen-lg mx-auto px-4 py-4">
          <GlassButton variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
            Voltar
          </GlassButton>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-4 py-6 space-y-6">
        {/* Project Header */}
        <GlassCard elevation="high">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="mb-2">{project.title}</h1>
              <p className="text-muted-foreground">{project.description}</p>
            </div>
            <Badge
              className={
                project.status === 'Recrutando'
                  ? 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30'
                  : project.status === 'Em Andamento'
                  ? 'bg-teal-500/20 text-teal-700 dark:text-teal-400 border-teal-500/30'
                  : 'bg-neutral-500/20 text-neutral-700 dark:text-neutral-400 border-neutral-500/30'
              }
            >
              {project.status}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{project.location}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{project.openSpots} vaga{project.openSpots > 1 ? 's' : ''} abertas</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.skills.map((skill, idx) => (
              <Badge key={idx} variant="secondary" className="glass-subtle">
                {skill}
              </Badge>
            ))}
          </div>

          <div className="flex gap-2">
            <GlassButton variant="filled" className="flex-1" onClick={onApply}>
              <Send className="h-5 w-5" />
              Candidatar-se
            </GlassButton>
            <GlassButton variant="ghost">
              <UserPlus className="h-5 w-5" />
              Convidar
            </GlassButton>
          </div>
        </GlassCard>

        {/* AI Insights - Only show if available */}
        {project.matchScore && project.aiInsight && (
          <GlassCard
            elevation="medium"
            className="bg-gradient-to-r from-blue-500/10 to-purple-500/10"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="mb-2">Insights da IA</h3>
                <div className="glass-subtle rounded-lg p-4 mb-3">
                  <p className="mb-2">Match Score: {project.matchScore}%</p>
                  <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-emerald-600"
                      style={{ width: `${project.matchScore}%` }}
                    />
                  </div>
                </div>
                <p className="text-muted-foreground">{project.aiInsight}</p>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Project Details */}
        <GlassCard elevation="medium">
          <h3 className="mb-4">Sobre o Projeto</h3>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2">Problema</h4>
              <p className="text-muted-foreground">{project.details.problem}</p>
            </div>
            <div>
              <h4 className="mb-2">Objetivos</h4>
              <p className="text-muted-foreground">{project.details.goals}</p>
            </div>
            <div>
              <h4 className="mb-2">Requisitos</h4>
              <p className="text-muted-foreground">{project.details.requirements}</p>
            </div>
          </div>
        </GlassCard>

        {/* Open Positions */}
        {project.openPositions.length > 0 && (
          <GlassCard elevation="medium">
            <h3 className="mb-4">Vagas Abertas</h3>
            <div className="space-y-3">
              {project.openPositions.map((position, idx) => (
                <div
                  key={idx}
                  className="glass-subtle rounded-lg p-4 flex items-start justify-between gap-4"
                >
                  <div className="flex-1">
                    <h4 className="mb-2">{position.role}</h4>
                    <div className="flex flex-wrap gap-1">
                      {position.skills.map((skill, skillIdx) => (
                        <Badge key={skillIdx} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Badge variant="secondary">{position.spots} vaga{position.spots > 1 ? 's' : ''}</Badge>
                </div>
              ))}
            </div>
          </GlassCard>
        )}

        {/* Team */}
        {project.team.length > 0 && (
          <GlassCard elevation="medium">
            <h3 className="mb-4">Equipe Atual</h3>
            <div className="flex flex-wrap gap-3">
              {project.team.map((member, idx) => (
                <div key={idx} className="flex items-center gap-2 glass-subtle rounded-lg px-3 py-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-500 text-white text-xs">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <span>{member.name}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
