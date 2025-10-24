import React from 'react';
import { GlassCard } from './GlassCard';
import { Badge } from './ui/badge';
import { Code, User, Calendar, Shield, LogIn, LogOut } from 'lucide-react';
import { Switch } from './ui/switch';

type UserRole = 'user' | 'organizer' | 'admin';

interface DevRoleToggleProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isLoggedIn: boolean;
  onLoginToggle: (isLoggedIn: boolean) => void;
  enabled?: boolean; // Set to false in production
}

export function DevRoleToggle({ 
  currentRole, 
  onRoleChange, 
  isLoggedIn,
  onLoginToggle,
  enabled = true 
}: DevRoleToggleProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Don't render if disabled (for production)
  if (!enabled) return null;

  const roles = [
    {
      value: 'user' as UserRole,
      label: 'Usuário',
      icon: User,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-500/10 hover:bg-blue-500/20',
      description: 'Visualização normal',
    },
    {
      value: 'organizer' as UserRole,
      label: 'Organizador',
      icon: Calendar,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-500/10 hover:bg-emerald-500/20',
      description: 'Gerenciar eventos',
    },
    {
      value: 'admin' as UserRole,
      label: 'Admin',
      icon: Shield,
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-500/10 hover:bg-purple-500/20',
      description: 'Acesso total',
    },
  ];

  const currentRoleData = roles.find((r) => r.value === currentRole);
  const CurrentIcon = currentRoleData?.icon || User;

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2 glass-strong rounded-full px-4 py-2 shadow-lg transition-all hover:scale-105 active:scale-95"
        title="Dev Mode: Config"
      >
        <Code className="h-4 w-4 text-muted-foreground" />
        {isLoggedIn ? (
          <LogIn className="h-4 w-4 text-green-600 dark:text-green-400" />
        ) : (
          <LogOut className="h-4 w-4 text-red-600 dark:text-red-400" />
        )}
        <CurrentIcon className={`h-4 w-4 ${currentRoleData?.color}`} />
        <span className="text-xs font-medium">{currentRoleData?.label}</span>
      </button>

      {/* Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Role Selector Panel */}
          <div className="fixed bottom-32 right-4 z-50 w-80">
            <GlassCard elevation="high" className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-primary" />
                  <h4>Dev Mode</h4>
                </div>
                <Badge variant="outline" className="text-xs">
                  v1.0
                </Badge>
              </div>

              {/* Login Toggle */}
              <div className="glass-subtle rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isLoggedIn ? (
                      <LogIn className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                    <div>
                      <p className="font-medium">
                        {isLoggedIn ? 'Logado como John Doe' : 'Deslogado'}
                      </p>
                      <small className="text-muted-foreground">
                        {isLoggedIn ? 'Perfil mock ativo' : 'Mostrar tela de login'}
                      </small>
                    </div>
                  </div>
                  <Switch
                    checked={isLoggedIn}
                    onCheckedChange={onLoginToggle}
                  />
                </div>
              </div>

              <p className="text-muted-foreground mb-4">
                Selecione um role para testar diferentes visualizações:
              </p>

              <div className="space-y-2">
                {roles.map((role) => {
                  const Icon = role.icon;
                  const isActive = currentRole === role.value;

                  return (
                    <button
                      key={role.value}
                      onClick={() => {
                        onRoleChange(role.value);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isActive
                          ? `${role.bgColor} border-2 border-current ${role.color}`
                          : 'glass-subtle hover:glass'
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? role.color : 'text-muted-foreground'}`} />
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${isActive ? role.color : ''}`}>
                            {role.label}
                          </span>
                          {isActive && (
                            <Badge variant="default" className="text-xs bg-primary/20 text-primary border-primary/30">
                              Ativo
                            </Badge>
                          )}
                        </div>
                        <small className="text-muted-foreground">{role.description}</small>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-border/50">
                <small className="text-muted-foreground block text-center">
                  💡 Em produção: defina <code className="text-xs bg-muted px-1 py-0.5 rounded">enabled=false</code>
                </small>
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </>
  );
}
