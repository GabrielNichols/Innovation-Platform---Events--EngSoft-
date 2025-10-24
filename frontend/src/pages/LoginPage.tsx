import React from 'react';
import { GlassButton } from '../components/GlassButton';
import { GlassInput } from '../components/GlassInput';
import { GlassCard } from '../components/GlassCard';
import { Mail, Github, ArrowLeft } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
  onCreateAccount: () => void;
  onBack?: () => void;
}

export function LoginPage({ onLogin, onCreateAccount, onBack }: LoginPageProps) {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleLogin = async () => {
    // TODO: Integrate with backend
    // POST /api/auth/login
    // Body: { email, password }
    // Response: { user, token, role }
    
    if (!email || !password) {
      alert('Por favor, preencha todos os campos');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    // TODO: Integrate with backend OAuth
    // GET /api/auth/${provider}
    setIsLoading(true);
    
    setTimeout(() => {
      setIsLoading(false);
      onLogin();
    }, 1000);
  };

  return (
    <div className="min-h-screen page-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </button>
        )}

        <GlassCard elevation="high">
          <div className="text-center mb-8">
            <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center">
              <Mail className="h-8 w-8 text-white" />
            </div>
            <h2 className="mb-2">Entrar na Plataforma</h2>
            <p className="text-muted-foreground">
              Bem-vindo de volta!
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <GlassInput 
              label="Email" 
              type="email" 
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <GlassInput 
              label="Senha" 
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            <button className="text-primary hover:underline w-full text-right">
              Esqueceu a senha?
            </button>
          </div>

          <GlassButton 
            variant="filled" 
            size="lg" 
            className="w-full mb-4"
            onClick={handleLogin}
            disabled={isLoading || !email || !password}
          >
            {isLoading ? 'Entrando...' : 'Entrar'}
          </GlassButton>

          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-2 glass-subtle rounded-lg text-muted-foreground">ou</span>
            </div>
          </div>

          <div className="space-y-2 mb-6">
            <GlassButton 
              variant="ghost" 
              size="lg" 
              className="w-full"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
            >
              <Mail className="h-5 w-5" />
              Continuar com Google
            </GlassButton>
            <GlassButton 
              variant="ghost" 
              size="lg" 
              className="w-full"
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
            >
              <Github className="h-5 w-5" />
              Continuar com GitHub
            </GlassButton>
          </div>

          <div className="border-t border-border/50 pt-6">
            <p className="text-center text-muted-foreground">
              Não tem uma conta?{' '}
              <button 
                className="text-primary hover:underline"
                onClick={onCreateAccount}
              >
                Criar conta
              </button>
            </p>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
