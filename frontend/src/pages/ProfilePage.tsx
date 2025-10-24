import React from 'react';
import { GlassButton } from '../components/GlassButton';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { MapPin, Star, CheckCircle2, Edit, Sparkles, ExternalLink, User } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  role: string;
  bio: string;
  skills: string[];
  available: boolean;
  location: string;
  rating?: number;
  verified?: boolean;
  portfolio: {
    title: string;
    description: string;
    url?: string;
  }[];
  availability: string;
}

interface ProfilePageProps {
  profileId?: string;
  isOwnProfile?: boolean;
  profile?: UserProfile; // Backend data will be passed here
  isLoggedIn?: boolean; // TODO: Get from auth context/backend
  userRole?: 'user' | 'organizer' | 'admin'; // TODO: Get from backend GET /api/auth/me
  onLogin?: () => void;
  onCreateAccount?: () => void;
  onManageEvents?: () => void; // Navigate to events management
}

export function ProfilePage({ 
  profileId, 
  isOwnProfile = true, 
  profile, 
  isLoggedIn = false,
  userRole = 'user',
  onLogin,
  onCreateAccount,
  onManageEvents,
}: ProfilePageProps) {
  // TODO: Fetch profile from backend
  // const profile = await fetchProfile(profileId);
  // const isLoggedIn = await checkAuthStatus();

  const handleLogin = () => {
    // TODO: Navigate to login or trigger auth flow
    // POST /api/auth/login
    if (onLogin) {
      onLogin();
    } else {
      console.log('Navigate to login');
    }
  };

  const handleCreateAccount = () => {
    // TODO: Navigate to create account or trigger auth flow
    // POST /api/auth/register
    if (onCreateAccount) {
      onCreateAccount();
    } else {
      console.log('Navigate to create account');
    }
  };

  const handleLogout = () => {
    // TODO: Call logout API
    // POST /api/auth/logout
    console.log('Logout user');
  };

  // Not logged in - show login prompt
  if (isOwnProfile && !isLoggedIn) {
    return (
      <div className="min-h-screen page-background pb-24">
        <div className="max-w-screen-lg mx-auto px-4 py-6">
          <GlassCard elevation="high" className="text-center py-16">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mx-auto mb-6">
              <User className="h-10 w-10 text-white" />
            </div>
            <h2 className="mb-3">Entre para ver seu perfil</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Faça login para acessar seu perfil, gerenciar projetos e conectar-se com outros talentos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <GlassButton variant="filled" onClick={handleLogin}>
                Fazer Login
              </GlassButton>
              <GlassButton variant="ghost" onClick={handleCreateAccount}>
                Criar Conta
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  // Logged in but no profile data
  if (!profile) {
    return (
      <div className="min-h-screen page-background pb-24">
        <div className="max-w-screen-lg mx-auto px-4 py-6">
          <GlassCard elevation="medium" className="text-center py-12">
            <h3 className="mb-2">Perfil não encontrado</h3>
            <p className="text-muted-foreground mb-6">
              {isOwnProfile 
                ? 'Complete seu perfil para começar a receber recomendações personalizadas.'
                : 'Este perfil não existe ou foi removido.'}
            </p>
            {isOwnProfile && (
              <GlassButton variant="filled">
                Completar Perfil
              </GlassButton>
            )}
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen page-background pb-24">
      <div className="max-w-screen-lg mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <GlassCard elevation="high">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-gradient-to-br from-teal-400 to-emerald-500 text-white text-2xl">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2>{profile.name}</h2>
                    {profile.verified && (
                      <CheckCircle2 className="h-5 w-5 text-teal-500" />
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2">{profile.role}</p>
                </div>
                {isOwnProfile && (
                  <div className="flex gap-2">
                    <GlassButton variant="ghost">
                      <Edit className="h-4 w-4" />
                      Editar
                    </GlassButton>
                    {/* Show Events Management button if user is organizer or admin */}
                    {(userRole === 'organizer' || userRole === 'admin') && (
                      <GlassButton 
                        variant="filled"
                        onClick={onManageEvents}
                      >
                        {userRole === 'admin' ? 'Painel Admin' : 'Gerenciar Eventos'}
                      </GlassButton>
                    )}
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{profile.location}</span>
                </div>
                {profile.rating && (
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    <span>{profile.rating.toFixed(1)}</span>
                  </div>
                )}
              </div>

              <Badge
                variant={profile.available ? 'default' : 'secondary'}
                className={
                  profile.available
                    ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                    : ''
                }
              >
                {profile.available ? `Disponível - ${profile.availability}` : profile.availability}
              </Badge>
            </div>
          </div>
        </GlassCard>

        {/* Bio */}
        <GlassCard elevation="medium">
          <div className="flex items-start justify-between gap-4 mb-3">
            <h3>Sobre</h3>
            {isOwnProfile && (
              <GlassButton variant="ghost" size="sm">
                <Sparkles className="h-4 w-4" />
                Sugerir bio
              </GlassButton>
            )}
          </div>
          <p className="text-muted-foreground">
            {profile.bio || 'Nenhuma descrição adicionada ainda.'}
          </p>
        </GlassCard>

        {/* Skills */}
        <GlassCard elevation="medium">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h3>Skills</h3>
            {isOwnProfile && (
              <GlassButton variant="ghost" size="sm">
                <Sparkles className="h-4 w-4" />
                Sugerir skills
              </GlassButton>
            )}
          </div>
          {profile.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, idx) => (
                <Badge key={idx} variant="secondary" className="glass-subtle">
                  {skill}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">Nenhuma skill adicionada ainda.</p>
          )}
        </GlassCard>

        {/* Portfolio */}
        <GlassCard elevation="medium">
          <h3 className="mb-4">Portfólio</h3>
          {profile.portfolio.length > 0 ? (
            <div className="space-y-3">
              {profile.portfolio.map((item, idx) => (
                <div
                  key={idx}
                  className="glass-subtle rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h4 className="mb-1">{item.title}</h4>
                      <p className="text-muted-foreground">{item.description}</p>
                    </div>
                    {item.url && (
                      <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground mb-4">Nenhum projeto no portfólio ainda.</p>
          )}

          {isOwnProfile && (
            <GlassButton variant="ghost" className="w-full mt-4">
              Adicionar Projeto
            </GlassButton>
          )}
        </GlassCard>

        {/* Badges & Achievements */}
        <GlassCard elevation="medium">
          <h3 className="mb-4">Conquistas</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* TODO: Load achievements from backend */}
            <div className="glass-subtle rounded-lg p-3 text-center opacity-50">
              <div className="text-3xl mb-2">🏆</div>
              <small className="text-muted-foreground">Em breve</small>
            </div>
            <div className="glass-subtle rounded-lg p-3 text-center opacity-50">
              <div className="text-3xl mb-2">🎯</div>
              <small className="text-muted-foreground">Em breve</small>
            </div>
            <div className="glass-subtle rounded-lg p-3 text-center opacity-50">
              <div className="text-3xl mb-2">⭐</div>
              <small className="text-muted-foreground">Em breve</small>
            </div>
            <div className="glass-subtle rounded-lg p-3 text-center opacity-50">
              <div className="text-3xl mb-2">🚀</div>
              <small className="text-muted-foreground">Em breve</small>
            </div>
          </div>
        </GlassCard>

        {/* Actions for other profiles */}
        {!isOwnProfile && (
          <div className="flex gap-2">
            <GlassButton variant="filled" className="flex-1">
              Enviar Mensagem
            </GlassButton>
            <GlassButton variant="ghost" className="flex-1">
              Convidar para Projeto
            </GlassButton>
          </div>
        )}

        {/* Logout for own profile */}
        {isOwnProfile && (
          <GlassCard elevation="medium">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="mb-1">Conta</h4>
                <p className="text-muted-foreground">Gerenciar configurações da conta</p>
              </div>
              <GlassButton variant="ghost" onClick={handleLogout}>
                Sair
              </GlassButton>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
