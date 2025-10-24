import React from 'react';
import { GlassCard } from './GlassCard';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Users, MapPin, Clock } from 'lucide-react';

export interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  skills: string[];
  status: 'Recrutando' | 'Em Andamento' | 'Completo';
  team: { name: string; avatar: string }[];
  location: string;
  openSpots: number;
  onClick?: () => void;
}

export function ProjectCard({
  title,
  description,
  skills,
  status,
  team,
  location,
  openSpots,
  onClick,
}: ProjectCardProps) {
  const statusColors = {
    'Recrutando': 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
    'Em Andamento': 'bg-teal-500/20 text-teal-700 dark:text-teal-400 border-teal-500/30',
    'Completo': 'bg-neutral-500/20 text-neutral-700 dark:text-neutral-400 border-neutral-500/30',
  };

  return (
    <GlassCard elevation="medium" onClick={onClick} className="hover:shadow-xl transition-all">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h3 className="mb-1">{title}</h3>
            <p className="text-muted-foreground line-clamp-2">{description}</p>
          </div>
          <Badge className={statusColors[status]}>{status}</Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          {skills.slice(0, 4).map((skill, idx) => (
            <Badge key={idx} variant="secondary" className="glass-subtle">
              {skill}
            </Badge>
          ))}
          {skills.length > 4 && (
            <Badge variant="secondary" className="glass-subtle">
              +{skills.length - 4}
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <small>{openSpots} vaga{openSpots > 1 ? 's' : ''}</small>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <small>{location}</small>
            </div>
          </div>

          <div className="flex -space-x-2">
            {team.slice(0, 3).map((member, idx) => (
              <Avatar key={idx} className="h-8 w-8 border-2 border-background">
                <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-500 text-white text-xs">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
        </div>
      </div>
    </GlassCard>
  );
}
