// Mock profile data for development and testing
// This represents a logged-in user "John Doe" with complete profile

export interface UserProfile {
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

export const mockProfile: UserProfile = {
  id: 'mock-user-001',
  name: 'John Doe',
  role: 'Desenvolvedor Full Stack & Designer',
  bio: 'Apaixonado por criar soluções inovadoras que impactam positivamente a vida das pessoas. Experiência em desenvolvimento web, mobile e design de interfaces. Sempre em busca de novos desafios e oportunidades de aprendizado.',
  skills: [
    'React',
    'TypeScript',
    'Node.js',
    'Python',
    'Figma',
    'UI/UX Design',
    'PostgreSQL',
    'Docker',
    'AWS',
    'Machine Learning',
  ],
  available: true,
  location: 'São Paulo, SP',
  rating: 4.8,
  verified: true,
  portfolio: [
    {
      title: 'Plataforma de E-commerce com IA',
      description:
        'Sistema completo de recomendação de produtos usando Machine Learning, aumentando conversão em 40%.',
      url: 'https://github.com/johndoe/ecommerce-ai',
    },
    {
      title: 'App de Saúde Mental',
      description:
        'Aplicativo mobile para acompanhamento de bem-estar emocional com gamificação e IA.',
      url: 'https://github.com/johndoe/mindcare',
    },
    {
      title: 'Dashboard Analytics em Tempo Real',
      description:
        'Visualização de dados em tempo real para equipes de marketing com integração a múltiplas fontes.',
    },
    {
      title: 'Sistema de Agendamento Inteligente',
      description:
        'Plataforma SaaS para gestão de consultas e agendamentos com otimização automática de horários.',
      url: 'https://github.com/johndoe/smart-scheduler',
    },
  ],
  availability: 'Disponível 15h/semana',
};

// Mock profile for different roles
export const getMockProfileForRole = (userRole: 'user' | 'organizer' | 'admin'): UserProfile => {
  const baseProfile = { ...mockProfile };

  switch (userRole) {
    case 'organizer':
      return {
        ...baseProfile,
        role: 'Organizador de Eventos & Tech Lead',
        bio: 'Organizador de hackathons e eventos de inovação. Apaixonado por conectar talentos e promover o ecossistema de startups. Experiência em gestão de projetos técnicos e mentoria.',
        skills: [
          'Gestão de Eventos',
          'Liderança',
          'React',
          'Node.js',
          'Mentoria',
          'Scrum',
          'Design Thinking',
          'Pitch',
        ],
        portfolio: [
          {
            title: 'Hackathon Mackenzie 2024',
            description:
              'Organização de hackathon com 200+ participantes, 40 projetos e 15 empresas parceiras.',
          },
          {
            title: 'Startup Weekend São Paulo',
            description:
              'Co-organização de evento de empreendedorismo com formação de 12 startups em um fim de semana.',
          },
          {
            title: 'Programa de Mentoria Tech',
            description:
              'Criação e coordenação de programa que conectou 50 mentores a 150 iniciantes em tecnologia.',
          },
        ],
      };

    case 'admin':
      return {
        ...baseProfile,
        name: 'John Doe (Admin)',
        role: 'Administrador da Plataforma',
        bio: 'Responsável pela gestão e moderação da plataforma InnovaConnect. Garantindo qualidade, segurança e experiência excepcional para todos os usuários.',
        skills: [
          'Gestão de Plataforma',
          'Moderação',
          'Analytics',
          'DevOps',
          'Security',
          'Community Management',
          'Data Analysis',
          'Process Optimization',
        ],
        verified: true,
        portfolio: [
          {
            title: 'Sistema de Moderação Automática',
            description:
              'Desenvolvimento de sistema de IA para moderação de conteúdo e detecção de spam.',
          },
          {
            title: 'Dashboard de Analytics',
            description:
              'Criação de painéis de controle para monitoramento de KPIs da plataforma em tempo real.',
          },
          {
            title: 'Programa de Qualidade',
            description:
              'Implementação de processos de garantia de qualidade que reduziram problemas em 60%.',
          },
        ],
      };

    default:
      return baseProfile;
  }
};
