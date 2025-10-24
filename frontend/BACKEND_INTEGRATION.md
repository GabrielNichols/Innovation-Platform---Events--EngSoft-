# Backend Integration Guide - InnovaConnect

Este documento descreve os endpoints e estruturas de dados esperados pelo frontend para integração com os microserviços backend.

## Arquitetura

O frontend é **plug & play** e está preparado para consumir APIs REST. Todos os componentes possuem props tipadas e comentários `TODO` indicando onde os dados do backend devem ser inseridos.

### Microsserviços

A plataforma é composta por múltiplos microsserviços independentes:

1. **Autenticação e Usuários** - Gestão de contas e permissões
2. **Eventos** - Gestão de eventos e projetos vinculados ⭐ **(Seu grupo)**
3. **Perfis e Talentos** - Perfis de usuários e habilidades
4. **Projetos** - CRUD de projetos (vinculados a eventos)
5. **Mensagens e Convites** - Comunicação entre usuários
6. **IA e Matchmaking** - Recomendações inteligentes
7. **Busca e Filtros** - Motor de busca avançado

### Controle de Acesso (Roles)

O sistema possui 3 tipos de usuários:

- **`user`** - Participante comum (cria projetos, participa de eventos)
- **`organizer`** - Organizador de eventos (cria e gerencia eventos)
- **`admin`** - Administrador da plataforma (acesso total)

O role é retornado pelo endpoint `GET /api/auth/me` e controla o acesso a funcionalidades específicas.

## Endpoints Necessários

### 1. Autenticação (`/api/auth`)

#### POST /api/auth/register
Cria uma nova conta de usuário.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "talent" | "organizer" | "admin"
}
```

**Response:**
```json
{
  "userId": "string",
  "token": "string",
  "profile": { /* UserProfile */ }
}
```

#### POST /api/auth/login
Autentica usuário existente.

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "userId": "string",
  "token": "string",
  "profile": { /* UserProfile */ }
}
```

#### POST /api/auth/logout
Invalida a sessão do usuário.

**Response:**
```json
{
  "success": boolean
}
```

#### GET /api/auth/status
Verifica se o usuário está autenticado.

**Response:**
```json
{
  "isAuthenticated": boolean,
  "userId": "string" | null
}
```

#### GET /api/auth/me
Retorna informações do usuário autenticado incluindo role.

**Response:**
```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "user" | "organizer" | "admin"
  },
  "authenticated": true
}
```

---

### 2. Eventos (`/api/events`) ⭐ **MICROSSERVIÇO DO SEU GRUPO**

> **IMPORTANTE**: Os projetos ficam DENTRO de eventos. Todo projeto deve ter um `eventId`.
> Consulte `/EVENTOS_E_PROJETOS.md` e `/EVENTS_MICROSERVICE_INTEGRATION.md` para detalhes completos.

#### GET /api/events/available
Lista eventos disponíveis para inscrição (status: published ou active).

**Response:**
```typescript
{
  events: {
    id: string;
    name: string;
    description: string;
    startDate: string; // ISO 8601
    endDate: string;
    location: string;
    status: "published" | "active";
    registeredParticipants: number;
    submittedProjects: number;
    categories: string[];
    tags: string[];
    maxParticipants?: number;
    isUserRegistered?: boolean; // Se o usuário autenticado já está inscrito
  }[];
}
```

#### GET /api/events/:eventId
Detalhes de um evento específico.

**Response:**
```typescript
{
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: "draft" | "published" | "active" | "finished";
  registeredParticipants: number;
  submittedProjects: number;
  formedTeams: number;
  organizer: {
    id: string;
    name: string;
  };
  categories: string[];
  tags: string[];
  maxTeams?: number;
  maxParticipants?: number;
  isUserRegistered?: boolean;
  createdAt: string;
  updatedAt: string;
}
```

#### POST /api/events/:eventId/register
Inscreve o usuário autenticado em um evento.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Inscrição realizada com sucesso"
}
```

#### GET /api/events/:eventId/projects
Lista todos os projetos de um evento específico.

**Response:**
```typescript
{
  projects: {
    id: string;
    eventId: string;
    title: string;
    description: string;
    teamName: string;
    members: number;
    status: "draft" | "submitted" | "approved" | "rejected";
    category: string;
    skills: string[];
    submittedAt: string;
  }[];
}
```

#### POST /api/events/:eventId/projects
Cria um novo projeto vinculado a um evento.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```typescript
{
  title: string;
  description: string;
  category: string; // Deve estar em event.categories
  teamName: string;
  skills: string[];
}
```

**Response:**
```typescript
{
  id: string;
  eventId: string;
  title: string;
  // ... resto do projeto
}
```

#### GET /api/events/management
Lista eventos gerenciados pelo organizador/admin autenticado.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** organizer, admin

**Response:**
```typescript
{
  stats: {
    totalEvents: number;
    activeEvents: number;
    totalProjects: number;
    totalParticipants: number;
  };
  events: Event[]; // Array completo de eventos
}
```

#### POST /api/events
Cria um novo evento.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** organizer, admin

**Request Body:**
```typescript
{
  name: string;
  description: string;
  startDate: string; // ISO 8601
  endDate: string;
  location: string;
  categories: string[];
  tags: string[];
  maxTeams?: number;
  maxParticipants?: number;
}
```

**Response:**
```typescript
Event // Objeto do evento criado
```

#### PUT /api/events/:eventId
Atualiza um evento.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** organizer (own events), admin (all events)

**Request Body:** `Partial<Event>`

#### DELETE /api/events/:eventId
Deleta um evento (soft delete).

**Headers:** `Authorization: Bearer <token>`
**Permissions:** admin only

**Response:**
```json
{
  "success": true
}
```

#### PATCH /api/events/:eventId/projects/:projectId/status
Aprova ou rejeita um projeto de um evento.

**Headers:** `Authorization: Bearer <token>`
**Permissions:** organizer (own events), admin (all events)

**Request Body:**
```typescript
{
  status: "approved" | "rejected";
  reason?: string; // Obrigatório se status = "rejected"
}
```

**Response:**
```typescript
EventProject // Projeto atualizado
```

---

### 3. Perfis de Usuário (`/api/profile`)

#### GET /api/profile
Retorna o perfil do usuário autenticado.

**Response:**
```typescript
{
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
```

#### GET /api/profile/:userId
Retorna o perfil de outro usuário.

#### PUT /api/profile
Atualiza o perfil do usuário autenticado.

**Request Body:** (Mesma estrutura do GET)

---

### 4. Projetos (`/api/projects`)

> **NOTA**: Projetos agora ficam vinculados a eventos através do campo `eventId`.
> Para criar um projeto, use `POST /api/events/:eventId/projects` (ver seção de Eventos).

#### GET /api/projects
Lista todos os projetos disponíveis (com paginação e filtros).

**Query Params:**
- `page`: number
- `limit`: number
- `stacks[]`: string[]
- `status[]`: string[]
- `location[]`: string[]

**Response:**
```typescript
{
  projects: {
    id: string;
    title: string;
    description: string;
    organization: string;
    status: "Recrutando" | "Em Andamento" | "Completo";
    tags: string[];
    members: {
      name: string;
      role: string;
      avatarUrl?: string;
    }[];
    openings: number;
    location: string;
    commitment: string;
    matchScore?: number; // 0-100, calculado pela IA
  }[];
  total: number;
  page: number;
  limit: number;
}
```

#### GET /api/projects/:projectId
Retorna detalhes completos de um projeto.

**Response:**
```typescript
{
  id: string;
  title: string;
  description: string;
  organization: string;
  organizerId: string;
  status: string;
  tags: string[];
  members: {
    id: string;
    name: string;
    role: string;
    avatarUrl?: string;
  }[];
  openRoles: {
    title: string;
    description: string;
    skills: string[];
    slots: number;
    commitment: string;
  }[];
  location: string;
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
  matchScore?: number;
  timeline: {
    phase: string;
    description: string;
    startDate: string;
    endDate?: string;
    completed: boolean;
  }[];
}
```

#### POST /api/projects
Cria um novo projeto.

**Request Body:**
```typescript
{
  title: string;
  description: string;
  organization: string;
  tags: string[];
  openRoles: {
    title: string;
    description: string;
    skills: string[];
    slots: number;
    commitment: string;
  }[];
  location: string;
  startDate?: string;
  endDate?: string;
}
```

#### PUT /api/projects/:projectId
Atualiza um projeto existente.

#### DELETE /api/projects/:projectId
Remove um projeto.

#### POST /api/projects/:projectId/apply
Candidata-se a um projeto.

**Request Body:**
```typescript
{
  roleId: string;
  message?: string;
}
```

---

### 4. Busca (`/api/search`)

#### GET /api/search
Busca projetos com filtros e IA.

**Query Params:**
- `q`: string (query de busca)
- `stacks[]`: string[]
- `skills[]`: string[]
- `location[]`: string[]
- `commitment[]`: string[]

**Response:**
```typescript
{
  results: ProjectCardProps[];
  total: number;
}
```

#### GET /api/search/filters
Retorna opções de filtros disponíveis.

**Response:**
```typescript
{
  stacks: string[];
  skills: string[];
  location: string[];
  commitment: string[];
}
```

#### GET /api/search/trending
Retorna buscas em alta.

**Response:**
```typescript
{
  trending: string[];
}
```

---

### 5. Mensagens (`/api/messages`)

#### GET /api/messages/threads
Lista todas as conversas do usuário.

**Response:**
```typescript
{
  threads: {
    id: string;
    participantName: string;
    participantAvatar?: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
  }[];
}
```

#### GET /api/messages/thread/:threadId
Retorna mensagens de uma conversa específica.

**Response:**
```typescript
{
  messages: {
    id: string;
    senderId: string;
    content: string;
    timestamp: string;
    read: boolean;
  }[];
}
```

#### POST /api/messages/thread/:threadId
Envia uma mensagem em uma conversa.

**Request Body:**
```typescript
{
  content: string;
}
```

#### GET /api/messages/invites
Lista convites de projeto recebidos.

**Response:**
```typescript
{
  invites: {
    id: string;
    projectId: string;
    projectTitle: string;
    role: string;
    message: string;
    timestamp: string;
    status: "pending" | "accepted" | "rejected";
  }[];
}
```

#### POST /api/messages/invites/:inviteId/accept
Aceita um convite.

#### POST /api/messages/invites/:inviteId/reject
Rejeita um convite.

---

### 6. IA/Matchmaking (`/api/ai`)

#### GET /api/ai/recommendations
Retorna projetos recomendados com base no perfil do usuário.

**Response:**
```typescript
{
  recommendations: {
    project: ProjectCardProps;
    matchScore: number; // 0-100
    reasons: string[]; // Ex: "Match de skills: React, Python"
  }[];
}
```

#### POST /api/ai/suggest-bio
Sugere uma bio baseada no perfil do usuário.

**Response:**
```typescript
{
  bio: string;
}
```

#### POST /api/ai/suggest-skills
Sugere skills baseadas no histórico do usuário.

**Response:**
```typescript
{
  skills: string[];
}
```

---

### 7. Organizador (`/api/organizer`)

#### GET /api/organizer/events/:eventId
Retorna dados de um evento.

**Response:**
```typescript
{
  id: string;
  name: string;
  participantsCount: number;
  projectsCount: number;
  teamsFormed: number;
  status: string;
}
```

#### GET /api/organizer/events/:eventId/teams
Lista times formados em um evento.

#### GET /api/organizer/events/:eventId/skills-heatmap
Retorna heatmap de skills disponíveis.

**Response:**
```typescript
{
  skills: {
    name: string;
    count: number;
  }[];
}
```

---

### 8. Admin (`/api/admin`)

#### GET /api/admin/stats
Retorna estatísticas gerais da plataforma.

**Response:**
```typescript
{
  totalUsers: number;
  activeProjects: number;
  totalMatches: number;
  successRate: number;
}
```

#### GET /api/admin/projects/pending
Lista projetos aguardando aprovação.

#### POST /api/admin/projects/:projectId/approve
Aprova um projeto.

#### POST /api/admin/projects/:projectId/reject
Rejeita um projeto.

#### GET /api/admin/skills/tags
Lista todas as tags de skills.

**Response:**
```typescript
{
  tags: {
    id: string;
    name: string;
    category: string;
    usageCount: number;
  }[];
}
```

#### POST /api/admin/skills/tags
Cria uma nova tag de skill.

---

## Autenticação

Todos os endpoints protegidos devem exigir um token de autenticação no header:

```
Authorization: Bearer {token}
```

## CORS

O backend deve permitir requisições do domínio do frontend:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Formato de Erro

Todos os erros devem seguir o formato:

```typescript
{
  error: {
    code: string; // Ex: "AUTH_FAILED", "NOT_FOUND"
    message: string; // Mensagem legível
    details?: any; // Informações adicionais opcionais
  }
}
```

## Paginação

Para endpoints que retornam listas, use o padrão:

**Query Params:**
- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response:**
```typescript
{
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
}
```

## WebSockets (Opcional)

Para mensagens em tempo real:

**Endpoint:** `ws://api.example.com/ws`

**Eventos:**
- `message:new` - Nova mensagem recebida
- `invite:new` - Novo convite recebido
- `notification:new` - Nova notificação

---

## Começando a Integração

1. **Identifique os TODOs:** Procure por comentários `// TODO:` nos arquivos de páginas
2. **Substitua dados mockados:** Remova arrays vazios e adicione chamadas de API
3. **Configure axios/fetch:** Crie um cliente HTTP centralizado
4. **Adicione loading states:** Use React hooks para gerenciar estados de carregamento
5. **Trate erros:** Implemente feedback visual para erros de API

## Exemplo de Integração

```typescript
// pages/FeedPage.tsx (ANTES)
export function FeedPage({ onProjectClick, projects = [] }: FeedPageProps) {
  // TODO: Fetch projects from backend
  // ...
}

// pages/FeedPage.tsx (DEPOIS)
export function FeedPage({ onProjectClick }: FeedPageProps) {
  const [projects, setProjects] = React.useState<ProjectCardProps[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchProjects() {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        setProjects(data.projects);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  // ... resto do componente
}
```

---

## Contato

Para dúvidas sobre a integração, consulte os arquivos de tipo TypeScript nos componentes ou crie uma issue no repositório.
