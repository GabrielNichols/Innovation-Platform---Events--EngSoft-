import React from 'react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { Badge } from './ui/badge';
import { Calendar, MapPin, Users, Briefcase, ArrowRight } from 'lucide-react';

interface EventCardProps {
  event: {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    location: string;
    status: 'draft' | 'published' | 'active' | 'finished';
    registeredParticipants: number;
    submittedProjects: number;
    categories: string[];
    tags?: string[];
  };
  onViewDetails?: (eventId: string) => void;
  onRegister?: (eventId: string) => void;
  isRegistered?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

export function EventCard({
  event,
  onViewDetails,
  onRegister,
  isRegistered = false,
  showActions = true,
  compact = false,
}: EventCardProps) {
  const getStatusBadge = (status: EventCardProps['event']['status']) => {
    const statusConfig = {
      draft: {
        label: 'Rascunho',
        className: 'bg-slate-500/20 text-slate-600 dark:text-slate-400',
      },
      published: {
        label: 'Inscrições Abertas',
        className: 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/50',
      },
      active: {
        label: 'Em Andamento',
        className: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/50',
      },
      finished: {
        label: 'Finalizado',
        className: 'bg-slate-500/20 text-slate-600 dark:text-slate-400',
      },
    };

    const config = statusConfig[status];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (compact) {
    return (
      <GlassCard 
        elevation="medium" 
        className="cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => onViewDetails?.(event.id)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="truncate">{event.name}</h4>
              {getStatusBadge(event.status)}
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <small>{event.startDate}</small>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <small>{event.registeredParticipants}</small>
              </div>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground shrink-0" />
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard elevation="high">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3>{event.name}</h3>
              {getStatusBadge(event.status)}
            </div>
            <p className="text-muted-foreground line-clamp-2">{event.description}</p>
          </div>
        </div>

        {/* Event Info */}
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
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <h4>{event.registeredParticipants}</h4>
              <p className="text-muted-foreground">Participantes</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-emerald-500" />
            <div>
              <h4>{event.submittedProjects}</h4>
              <p className="text-muted-foreground">Projetos</p>
            </div>
          </div>
        </div>

        {/* Categories */}
        {event.categories && event.categories.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-border/50">
            {event.categories.map((category) => (
              <Badge key={category} variant="outline" className="hover:bg-primary/10">
                {category}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-4 border-t border-border/50">
            <GlassButton
              variant="ghost"
              className="flex-1"
              onClick={() => onViewDetails?.(event.id)}
            >
              Ver Detalhes
            </GlassButton>
            {event.status === 'published' && !isRegistered && (
              <GlassButton
                variant="filled"
                className="flex-1"
                onClick={() => onRegister?.(event.id)}
              >
                Inscrever-se
              </GlassButton>
            )}
            {event.status === 'published' && isRegistered && (
              <GlassButton variant="filled" className="flex-1 bg-green-500/20 text-green-700 dark:text-green-400" disabled>
                Inscrito ✓
              </GlassButton>
            )}
            {event.status === 'active' && isRegistered && (
              <GlassButton
                variant="filled"
                className="flex-1"
                onClick={() => onViewDetails?.(event.id)}
              >
                Criar Projeto
              </GlassButton>
            )}
          </div>
        )}
      </div>
    </GlassCard>
  );
}
