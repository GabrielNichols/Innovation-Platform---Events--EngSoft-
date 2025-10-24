import React from 'react';
import { Home, Search, PlusCircle, MessageCircle, User } from 'lucide-react';

interface MobileNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function MobileNav({ currentPage, onNavigate }: MobileNavProps) {
  const navItems = [
    { id: 'feed', icon: Home, label: 'Início' },
    { id: 'search', icon: Search, label: 'Buscar' },
    { id: 'create', icon: PlusCircle, label: 'Criar' },
    { id: 'messages', icon: MessageCircle, label: 'Mensagens' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-strong border-t border-border/50 safe-area-bottom h-16">
      <div className="flex items-center justify-between h-full max-w-screen-sm mx-auto px-4">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const isCenter = index === 2; // "Criar" é o terceiro item (índice 2)

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-0.5 rounded-lg transition-colors min-w-[60px] min-h-[44px] flex-shrink-0 ${
                isCenter ? 'relative -top-2' : ''
              } ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isCenter ? (
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 dark:from-teal-400 dark:to-emerald-500 flex items-center justify-center shadow-lg">
                  <Icon className="h-6 w-6 text-white dark:text-slate-900 flex-shrink-0" />
                </div>
              ) : (
                <>
                  <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'fill-current' : ''}`} />
                  <span className="text-xs leading-tight whitespace-nowrap">{item.label}</span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
