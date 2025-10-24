# Integração do Microsserviço de Eventos

## Visão Geral

Este documento descreve a integração entre o frontend e o **microsserviço de eventos** responsável pela gestão de eventos e projetos vinculados.

## Arquitetura

```
┌─────────────────┐
│   Frontend      │
│  (React/TS)     │
└────────┬────────┘
         │
         │ API REST
         │
┌────────▼────────┐
│  Microsserviço  │
│    de Eventos   │
│                 │
│  - Gestão de    │
│    Eventos      │
│  - Vinculação   │
│    Projetos     │
│  - Estatísticas │
└─────────────────┘
```

## Relação Eventos ↔ Projetos

**IMPORTANTE**: Os **projetos ficam dentro de eventos**. Um projeto sempre pertence a um evento específico.

```
Evento (Hackathon Mackenzie 2025)
  ├── Projeto 1 (SmartPark)
  ├── Projeto 2 (EcoTrack)
  └── Projeto 3 (HealthAI)
```

## Controle de Acesso por Role

O sistema possui 3 tipos de usuários:

1. **`user`** - Usuário comum (participante)
   - Pode visualizar eventos públicos
   - Pode criar projetos dentro de eventos
   - Pode participar de equipes

2. **`organizer`** - Organizador de eventos
   - Pode criar e gerenciar eventos próprios
   - Pode aprovar/rejeitar projetos do evento
   - Pode visualizar estatísticas do evento
   - Acesso à página `/events-management`

3. **`admin`** - Administrador da plataforma
   - Pode criar, editar e deletar qualquer evento
   - Pode aprovar/rejeitar qualquer projeto
   - Pode moderar conteúdo
   - Acesso total à página `/events-management`

### Verificação de Role

O role do usuário é retornado pelo endpoint de autenticação:

```typescript
// GET /api/auth/me
{
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "organizer" | "admin" | "user"
  },
  "authenticated": true
}
```

## Endpoints da API

### Autenticação

```
GET /api/auth/me
Response: { user: User, authenticated: boolean, role: 'user' | 'organizer' | 'admin' }
```

### Gestão de Eventos

```
GET /api/events/management
Headers: Authorization: Bearer <token>
Permissions: organizer, admin
Response: {
  stats: EventStats,
  events: Event[]
}

GET /api/events/:eventId
Response: Event

POST /api/events
Headers: Authorization: Bearer <token>
Permissions: organizer, admin
Body: {
  name: string,
  description: string,
  startDate: string,
  endDate: string,
  location: string,
  categories: string[],
  tags: string[],
  maxTeams?: number,
  maxParticipants?: number
}
Response: Event

PUT /api/events/:eventId
Headers: Authorization: Bearer <token>
Permissions: organizer (own events), admin (all events)
Body: Partial<Event>
Response: Event

DELETE /api/events/:eventId
Headers: Authorization: Bearer <token>
Permissions: admin only
Response: { success: boolean }

PATCH /api/events/:eventId/status
Headers: Authorization: Bearer <token>
Permissions: organizer (own events), admin (all events)
Body: { status: 'draft' | 'published' | 'active' | 'finished' }
Response: Event
```

### Projetos de Eventos

```
GET /api/events/:eventId/projects
Response: EventProject[]

GET /api/events/:eventId/projects/:projectId
Response: EventProject

POST /api/events/:eventId/projects
Headers: Authorization: Bearer <token>
Body: {
  title: string,
  description: string,
  category: string,
  teamName: string,
  skills: string[]
}
Response: EventProject

PATCH /api/events/:eventId/projects/:projectId/status
Headers: Authorization: Bearer <token>
Permissions: organizer (own events), admin (all events)
Body: { status: 'approved' | 'rejected', reason?: string }
Response: EventProject

DELETE /api/events/:eventId/projects/:projectId
Headers: Authorization: Bearer <token>
Permissions: admin, project owner
Response: { success: boolean }
```

### Estatísticas

```
GET /api/events/:eventId/stats
Response: {
  registeredParticipants: number,
  submittedProjects: number,
  formedTeams: number,
  skillsHeatmap: Array<{ skill: string, count: number }>
}

GET /api/events/stats/overview
Headers: Authorization: Bearer <token>
Permissions: organizer, admin
Response: {
  totalEvents: number,
  activeEvents: number,
  totalProjects: number,
  totalParticipants: number
}
```

## Modelos de Dados

### Event

```typescript
interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string; // ISO 8601
  endDate: string; // ISO 8601
  location: string;
  status: 'draft' | 'published' | 'active' | 'finished';
  maxTeams?: number;
  maxParticipants?: number;
  registeredParticipants: number;
  submittedProjects: number;
  formedTeams: number;
  organizer: string; // User ID
  categories: string[];
  tags: string[];
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### EventProject

```typescript
interface EventProject {
  id: string;
  eventId: string; // Foreign key para Event
  title: string;
  description: string;
  teamName: string;
  members: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  category: string;
  skills: string[];
  submittedAt: string; // ISO 8601
  createdBy: string; // User ID
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}
```

### EventStats

```typescript
interface EventStats {
  totalEvents: number;
  activeEvents: number;
  totalProjects: number;
  totalParticipants: number;
}
```

## Fluxos de Integração

### 1. Carregamento da Página de Gestão

```typescript
// Quando userRole é 'organizer' ou 'admin'
const loadEventsManagement = async () => {
  // 1. Verificar autenticação
  const auth = await fetch('/api/auth/me');
  const { user, role } = await auth.json();
  
  if (!['organizer', 'admin'].includes(role)) {
    // Redirecionar para página principal
    return;
  }

  // 2. Carregar estatísticas gerais
  const statsRes = await fetch('/api/events/stats/overview', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const stats = await statsRes.json();

  // 3. Carregar eventos
  const eventsRes = await fetch('/api/events/management', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const { events } = await eventsRes.json();

  // 4. Carregar projetos de todos os eventos (ou do evento selecionado)
  const projectsRes = await fetch('/api/events/projects/all', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const projects = await projectsRes.json();

  return { stats, events, projects };
};
```

### 2. Criação de Evento

```typescript
const createEvent = async (eventData) => {
  const response = await fetch('/api/events', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(eventData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const newEvent = await response.json();
  return newEvent;
};
```

### 3. Aprovação/Rejeição de Projeto

```typescript
const approveProject = async (eventId: string, projectId: string) => {
  const response = await fetch(`/api/events/${eventId}/projects/${projectId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'approved' })
  });

  return await response.json();
};

const rejectProject = async (eventId: string, projectId: string, reason: string) => {
  const response = await fetch(`/api/events/${eventId}/projects/${projectId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: 'rejected', reason })
  });

  return await response.json();
};
```

### 4. Filtros e Busca

```typescript
const searchEvents = async (query: string, status?: string) => {
  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (status && status !== 'all') params.append('status', status);

  const response = await fetch(`/api/events/management?${params}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return await response.json();
};
```

## Componentes Frontend

### EventsManagementPage

**Localização**: `/pages/EventsManagementPage.tsx`

**Props**:
```typescript
interface EventsManagementPageProps {
  stats?: EventStats;
  events?: Event[];
  projects?: EventProject[];
  userRole?: 'admin' | 'organizer';
}
```

**Responsabilidades**:
- Exibir estatísticas gerais (total de eventos, participantes, projetos)
- Listar eventos com filtros (status, busca)
- Listar projetos vinculados aos eventos
- Aprovar/rejeitar projetos
- Criar, editar e deletar eventos (conforme permissões)

### Hooks para Integração

```typescript
// hooks/useEventsManagement.ts
export const useEventsManagement = (userRole: UserRole) => {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<EventProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!['organizer', 'admin'].includes(userRole)) return;

    const loadData = async () => {
      try {
        const data = await loadEventsManagement();
        setStats(data.stats);
        setEvents(data.events);
        setProjects(data.projects);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userRole]);

  return { stats, events, projects, loading };
};
```

## Validações e Regras de Negócio

### Criação de Evento

- **Nome**: obrigatório, mín. 5 caracteres
- **Descrição**: obrigatória, mín. 20 caracteres
- **Datas**: startDate deve ser menor que endDate
- **Localização**: obrigatória
- **Status inicial**: 'draft'
- **Organizador**: automaticamente o usuário autenticado

### Submissão de Projeto

- **Evento ativo**: projeto só pode ser submetido em eventos com status 'active'
- **Título**: obrigatório, mín. 5 caracteres
- **Categoria**: deve estar na lista de categorias do evento
- **Skills**: mínimo 1 skill
- **Status inicial**: 'draft'
- **Vinculação**: projeto sempre vinculado a um eventId

### Aprovação de Projeto

- **Permissões**: 
  - Organizador pode aprovar projetos dos próprios eventos
  - Admin pode aprovar qualquer projeto
- **Status válido**: apenas projetos 'submitted' podem ser aprovados
- **Notificação**: equipe deve ser notificada sobre aprovação/rejeição

## Tratamento de Erros

```typescript
// Exemplo de tratamento no frontend
try {
  const event = await createEvent(eventData);
  toast.success('Evento criado com sucesso!');
} catch (error) {
  if (error.status === 401) {
    toast.error('Você precisa estar autenticado');
  } else if (error.status === 403) {
    toast.error('Você não tem permissão para criar eventos');
  } else if (error.status === 400) {
    toast.error(error.message || 'Dados inválidos');
  } else {
    toast.error('Erro ao criar evento. Tente novamente.');
  }
}
```

## Estados Vazios

O frontend já possui componentes `EmptyState` para:
- Nenhum evento encontrado
- Nenhum projeto submetido
- Filtros sem resultados

## Próximos Passos

1. ✅ Frontend - Página de gestão criada
2. ⏳ Backend - Implementar endpoints da API
3. ⏳ Backend - Implementar autenticação e autorização
4. ⏳ Backend - Implementar validações
5. ⏳ Integração - Conectar frontend com backend
6. ⏳ Testes - Testar fluxos completos

## Notas Importantes

- **Projetos dependem de eventos**: Um projeto nunca pode existir sem estar vinculado a um evento
- **Controle de acesso**: O backend deve validar as permissões em TODOS os endpoints
- **Notificações**: Quando um projeto é aprovado/rejeitado, a equipe deve ser notificada
- **Logs**: Todas as ações de criar/editar/deletar eventos devem ser registradas para auditoria
- **Soft delete**: Eventos e projetos devem ser marcados como deletados, não removidos do banco
