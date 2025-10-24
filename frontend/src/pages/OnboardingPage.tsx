import React from 'react';
import { GlassButton } from '../components/GlassButton';
import { GlassInput } from '../components/GlassInput';
import { GlassCard } from '../components/GlassCard';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Rocket, Users, Calendar, Shield, ChevronRight, Mail, Github } from 'lucide-react';

interface OnboardingPageProps {
  onComplete: (role: 'user' | 'organizer') => void;
  onLogin: () => void;
}

export function OnboardingPage({ onComplete, onLogin }: OnboardingPageProps) {
  const [step, setStep] = React.useState<'welcome' | 'auth' | 'profile' | 'skills'>('welcome');
  const [selectedProfile, setSelectedProfile] = React.useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = React.useState<string[]>([]);
  
  // Form validation
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<{ name?: string; email?: string; password?: string }>({});

  // Admin role is assigned by backend, not selectable during onboarding
  const profiles = [
    {
      id: 'idealizador',
      title: 'Idealizador',
      description: 'Tenho uma ideia e busco talentos para executá-la',
      icon: Rocket,
      role: 'user' as const,
    },
    {
      id: 'colaborador',
      title: 'Colaborador',
      description: 'Quero contribuir com minhas habilidades em projetos',
      icon: Users,
      role: 'user' as const,
    },
    {
      id: 'organizador',
      title: 'Organizador',
      description: 'Organizo eventos, hackathons ou programas de inovação',
      icon: Calendar,
      role: 'organizer' as const,
    },
  ];

  const skillCategories = {
    'Desenvolvimento': ['React', 'Python', 'Node.js', 'Flutter', 'Java', 'C++'],
    'Design': ['UI/UX', 'Figma', 'Prototyping', 'User Research', 'Branding'],
    'Dados & IA': ['Machine Learning', 'Data Science', 'TensorFlow', 'SQL', 'Analytics'],
    'Negócios': ['Product Management', 'Business Dev', 'Marketing', 'Sales'],
    'Outros': ['IoT', 'Blockchain', 'DevOps', 'Mobile', 'Cloud'],
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const validateAuthStep = () => {
    const newErrors: { name?: string; email?: string; password?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email inválido';
    }

    if (!password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueFromAuth = () => {
    if (validateAuthStep()) {
      setStep('profile');
    }
  };

  const handleContinueFromProfile = () => {
    if (!selectedProfile) return;

    const profile = profiles.find(p => p.id === selectedProfile);
    
    // Only show skills step for "colaborador"
    if (selectedProfile === 'colaborador') {
      setStep('skills');
    } else {
      // For idealizador and organizador, complete onboarding
      // TODO: Send data to backend
      // POST /api/auth/register
      // Body: { name, email, password, profileType: selectedProfile }
      onComplete(profile?.role || 'user');
    }
  };

  if (step === 'welcome') {
    return (
      <div className="min-h-screen page-background flex items-center justify-center p-4">
        <GlassCard elevation="high" className="max-w-md w-full text-center">
          <div className="mb-6">
            <div className="h-20 w-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <Rocket className="h-10 w-10 text-white" />
            </div>
            <h1 className="mb-2">Bem-vindo!</h1>
            <p className="text-muted-foreground">
              Plataforma de Inovação Colaborativa com IA
            </p>
          </div>

          <div className="space-y-3 mb-8">
            <div className="glass-subtle rounded-lg p-4 text-left">
              <h4 className="mb-1">🎯 Matchmaking Inteligente</h4>
              <p className="text-muted-foreground">
                IA conecta talentos aos projetos ideais
              </p>
            </div>
            <div className="glass-subtle rounded-lg p-4 text-left">
              <h4 className="mb-1">🚀 Startups & Universitários</h4>
              <p className="text-muted-foreground">
                Encontre co-fundadores e colaboradores
              </p>
            </div>
            <div className="glass-subtle rounded-lg p-4 text-left">
              <h4 className="mb-1">💡 Projetos Inovadores</h4>
              <p className="text-muted-foreground">
                De IA e robótica até fintech e saúde
              </p>
            </div>
          </div>

          <GlassButton
            variant="filled"
            size="lg"
            className="w-full"
            onClick={() => setStep('auth')}
          >
            Começar
            <ChevronRight className="h-5 w-5" />
          </GlassButton>
        </GlassCard>
      </div>
    );
  }

  if (step === 'auth') {
    return (
      <div className="min-h-screen page-background flex items-center justify-center p-4">
        <GlassCard elevation="high" className="max-w-md w-full">
          <h2 className="text-center mb-6">Criar Conta</h2>

          <div className="space-y-4 mb-6">
            <div>
              <GlassInput 
                label="Nome completo" 
                placeholder="Seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {errors.name && (
                <small className="text-red-500 dark:text-red-400 mt-1 block">{errors.name}</small>
              )}
            </div>
            
            <div>
              <GlassInput 
                label="Email" 
                type="email" 
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && (
                <small className="text-red-500 dark:text-red-400 mt-1 block">{errors.email}</small>
              )}
            </div>
            
            <div>
              <GlassInput 
                label="Senha" 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {errors.password && (
                <small className="text-red-500 dark:text-red-400 mt-1 block">{errors.password}</small>
              )}
            </div>
          </div>

          <GlassButton 
            variant="filled" 
            size="lg" 
            className="w-full mb-4" 
            onClick={handleContinueFromAuth}
          >
            Continuar
          </GlassButton>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 glass-subtle rounded-lg text-muted-foreground">ou</span>
            </div>
          </div>

          <div className="space-y-2">
            <GlassButton variant="ghost" size="lg" className="w-full">
              <Mail className="h-5 w-5" />
              Continuar com Google
            </GlassButton>
            <GlassButton variant="ghost" size="lg" className="w-full">
              <Github className="h-5 w-5" />
              Continuar com GitHub
            </GlassButton>
          </div>

          <p className="text-center mt-6 text-muted-foreground">
            Já tem conta?{' '}
            <button 
              className="text-primary hover:underline"
              onClick={onLogin}
            >
              Fazer login
            </button>
          </p>
        </GlassCard>
      </div>
    );
  }

  if (step === 'profile') {
    return (
      <div className="min-h-screen page-background p-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="mb-2">Selecione seu Perfil</h2>
            <p className="text-muted-foreground">Como você quer participar da plataforma?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {profiles.map((profile) => {
              const Icon = profile.icon;
              const isSelected = selectedProfile === profile.id;

              return (
                <GlassCard
                  key={profile.id}
                  elevation={isSelected ? 'high' : 'medium'}
                  onClick={() => setSelectedProfile(profile.id)}
                  className={`cursor-pointer transition-all ${
                    isSelected ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? 'bg-gradient-to-br from-teal-500 to-emerald-600'
                        : 'bg-gradient-to-br from-neutral-200 to-neutral-300 dark:from-neutral-700 dark:to-neutral-800'
                    }`}>
                      <Icon className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="mb-1">{profile.title}</h4>
                      <p className="text-muted-foreground">{profile.description}</p>
                    </div>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          <div className="flex gap-3">
            <GlassButton variant="ghost" size="lg" onClick={() => setStep('auth')}>
              Voltar
            </GlassButton>
            <GlassButton
              variant="filled"
              size="lg"
              className="flex-1"
              onClick={handleContinueFromProfile}
              disabled={!selectedProfile}
            >
              Continuar
              <ChevronRight className="h-5 w-5" />
            </GlassButton>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'skills') {
    const profile = profiles.find(p => p.id === selectedProfile);
    
    return (
      <div className="min-h-screen page-background p-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="mb-2">Suas Skills & Interesses</h2>
            <p className="text-muted-foreground">
              Selecione suas habilidades para receber recomendações personalizadas
            </p>
          </div>

          <GlassCard elevation="high" className="mb-6">
            <div className="space-y-6">
              {Object.entries(skillCategories).map(([category, skills]) => (
                <div key={category}>
                  <h4 className="mb-3">{category}</h4>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => {
                      const isSelected = selectedSkills.includes(skill);
                      return (
                        <button
                          key={skill}
                          onClick={() => toggleSkill(skill)}
                          className={`px-4 py-2 rounded-lg transition-all ${
                            isSelected
                              ? 'bg-gradient-to-r from-teal-500 to-emerald-600 text-white'
                              : 'glass-subtle hover:glass text-foreground'
                          }`}
                        >
                          {skill}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {selectedSkills.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-muted-foreground mb-2">
                  Selecionadas: {selectedSkills.length}
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedSkills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          <div className="flex gap-3">
            <GlassButton variant="ghost" size="lg" onClick={() => setStep('profile')}>
              Voltar
            </GlassButton>
            <GlassButton
              variant="filled"
              size="lg"
              className="flex-1"
              onClick={() => {
                // TODO: Send data to backend
                // POST /api/auth/register
                // Body: { name, email, password, profileType: 'colaborador', skills: selectedSkills }
                onComplete(profile?.role || 'user');
              }}
              disabled={selectedSkills.length === 0}
            >
              Concluir
            </GlassButton>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
