import React from 'react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { CheckCircle2, Star } from 'lucide-react';

export interface ProfileBadgeProps {
  name: string;
  role: string;
  skills: string[];
  available: boolean;
  verified?: boolean;
  rating?: number;
  onClick?: () => void;
}

export function ProfileBadge({
  name,
  role,
  skills,
  available,
  verified = false,
  rating,
  onClick,
}: ProfileBadgeProps) {
  return (
    <div
      className="glass rounded-[var(--radius-md)] p-4 hover:shadow-lg transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-500 text-white">
            {name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 mb-1">
            <h4 className="truncate">{name}</h4>
            {verified && <CheckCircle2 className="h-4 w-4 text-teal-500 flex-shrink-0" />}
          </div>
          <p className="text-muted-foreground mb-2">{role}</p>

          <div className="flex flex-wrap gap-1 mb-2">
            {skills.slice(0, 3).map((skill, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
          </div>

          <div className="flex items-center justify-between">
            <Badge
              variant={available ? 'default' : 'secondary'}
              className={available ? 'bg-green-500/20 text-green-700 dark:text-green-400' : ''}
            >
              {available ? 'Disponível' : 'Ocupado'}
            </Badge>
            {rating && (
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                <small>{rating.toFixed(1)}</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
