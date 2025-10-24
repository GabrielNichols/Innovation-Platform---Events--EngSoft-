# ✅ Gestão de Eventos - Implementação Final

## Visão Geral

O módulo de gestão de eventos foi implementado seguindo o princípio de que **todos os usuários veem a mesma interface base**, mas **organizadores e admins têm acesso adicional** às funcionalidades de gestão.

## Fluxo de Navegação

```
┌─────────────────────────────────────────────────────┐
│  TODOS OS USUÁRIOS                                  │
│  ↓                                                   │
│  Feed → Search → Create → Messages → Profile        │
│                                          ↓           │
│                              Se role = organizer    │
│                              ou admin:              │
│                              [Gerenciar Eventos]    │
│                                          ↓           │
│                          EventsManagementPage       │
└─────────────────────────────────────────────────────┘
```

## Acesso à Gestão de Eventos

### Via Perfil (Implementado)

Quando o usuário tem role `organizer` ou `admin`:
1. Abre a aba **Perfil**
2. Vê um botão adicional:
   - **"Gerenciar Eventos"** (para organizers)
   - **"Painel Admin"** (para admins)
3. Clica no botão
4. É navegado para `EventsManagementPage`

### Código

**App.tsx**:
```typescript
const [userRole, setUserRole] = React.useState<UserRole>('user');
// Para testar: mude para 'organizer' ou 'admin'
```

**ProfilePage.tsx**:
```tsx
{(userRole === 'organizer' || userRole === 'admin') && (
  <GlassButton 
    variant="filled"
    onClick={onManageEvents}
  >
    {userRole === 'admin' ? 'Painel Admin' : 'Gerenciar Eventos'}
  </GlassButton>
)}
```

## Diferenças por Role

### `user` (Usuário Comum)
- ✅ Acesso ao Feed, Search, Profile, Messages, Create
- ❌ **Não vê** botão de gestão de eventos no perfil
- Pode participar de eventos e criar projetos

### `organizer` (Organizador)
- ✅ Tudo que user tem
- ✅ **Vê** botão "Gerenciar Eventos" no perfil
- ✅ Acesso à `EventsManagementPage`
- Funcionalidades na gestão:
  - Ver próprios eventos
  - Criar/editar próprios eventos
  - Aprovar/rejeitar projetos dos próprios eventos
  - Ver estatísticas dos eventos

### `admin` (Administrador)
- ✅ Tudo que organizer tem
- ✅ Vê botão "Painel Admin" no perfil
- Funcionalidades adicionais:
  - Ver **todos** os eventos da plataforma
  - Editar **qualquer** evento
  - **Deletar** eventos
  - Aprovar/rejeitar **qualquer** projeto
  - Acesso completo a estatísticas

## EventsManagementPage - 100% Plug & Play

A página está completamente preparada para integração com backend **SEM dados mock**.

### Props

```typescript
interface EventsManagementPageProps {
  stats?: EventStats;
  events?: Event[];
  projects?: EventProject[];
  userRole?: 'admin' | 'organizer';
  onBack?: () => void;
}
```

### Integração Backend

**1. Carregar dados:**

```typescript
// No App.tsx ou em um hook customizado
React.useEffect(() => {
  if (userRole === 'organizer' || userRole === 'admin') {
    const loadEventsData = async () => {
      const response = await fetch('/api/events/management', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      
      setEventsStats(data.stats);
      setEvents(data.events);
      
      // Carregar projetos de cada evento
      const allProjects = [];
      for (const event of data.events) {
        const projectsRes = await fetch(`/api/events/${event.id}/projects`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const eventProjects = await projectsRes.json();
        allProjects.push(...eventProjects);
      }
      setProjects(allProjects);
    };
    
    loadEventsData();
  }
}, [userRole]);
```

**2. Passar para componente:**

```tsx
<EventsManagementPage
  userRole={userRole === 'admin' ? 'admin' : 'organizer'}
  stats={eventsStats}
  events={events}
  projects={projects}
  onBack={() => setCurrentPage('profile')}
/>
```

### Estados Vazios

Quando não há dados do backend, a página mostra:
- **Sem eventos**: EmptyState com mensagem "Comece criando seu primeiro evento"
- **Sem projetos**: EmptyState com mensagem "Quando os participantes submeterem projetos..."

## Endpoints Backend Necessários

Ver documentação completa em `/EVENTS_MICROSERVICE_INTEGRATION.md`.

### Essenciais

1. **GET `/api/auth/me`**
   - Retorna: `{ user: {...}, role: 'user'|'organizer'|'admin', authenticated: true }`
   - Usado para: Controlar acesso e exibir botões corretos

2. **GET `/api/events/management`**
   - Headers: `Authorization: Bearer <token>`
   - Permissions: organizer, admin
   - Retorna: `{ stats: EventStats, events: Event[] }`
   - Comportamento:
     - Se organizer: retorna apenas eventos do organizador
     - Se admin: retorna todos os eventos

3. **GET `/api/events/:eventId/projects`**
   - Retorna: `EventProject[]`
   - Lista projetos de um evento específico

4. **POST `/api/events`**
   - Headers: `Authorization: Bearer <token>`
   - Permissions: organizer, admin
   - Body: Event data
   - Cria novo evento

5. **PUT `/api/events/:eventId`**
   - Headers: `Authorization: Bearer <token>`
   - Permissions: organizer (own events), admin (all events)
   - Atualiza evento

6. **DELETE `/api/events/:eventId`**
   - Headers: `Authorization: Bearer <token>`
   - Permissions: **admin only**
   - Deleta evento (soft delete)

7. **PATCH `/api/events/:eventId/projects/:projectId/status`**
   - Headers: `Authorization: Bearer <token>`
   - Permissions: organizer (own events), admin (all events)
   - Body: `{ status: 'approved'|'rejected', reason?: string }`
   - Aprova/rejeita projeto

## Como Testar

### 1. Testar como Organizador

No `App.tsx`, linha 42:

```typescript
const [userRole, setUserRole] = React.useState<UserRole>('organizer');
```

1. Navegue para **Perfil**
2. Veja o botão **"Gerenciar Eventos"** ao lado de "Editar"
3. Clique no botão
4. Veja a página de gestão (sem dados se backend não conectado)
5. Clique em "← Voltar" para retornar ao perfil

### 2. Testar como Admin

No `App.tsx`, linha 42:

```typescript
const [userRole, setUserRole] = React.useState<UserRole>('admin');
```

1. Navegue para **Perfil**
2. Veja o botão **"Painel Admin"**
3. Clique no botão
4. Na página de gestão, veja que botões de deletar aparecem nos eventos
5. Role diferencial visual

### 3. Testar como User

No `App.tsx`, linha 42:

```typescript
const [userRole, setUserRole] = React.useState<UserRole>('user');
```

1. Navegue para **Perfil**
2. **Não vê** nenhum botão de gestão
3. Interface normal de perfil

## Product Backlog Implementado

Das tarefas do seu time, o frontend já está preparado para:

### Épico 1: Gestão de Eventos ✅
- ✅ Criar evento (botão + preparado para form)
- ✅ Editar evento (botão + preparado para modal)
- ✅ Cancelar/encerrar evento (status management)
- ⏳ Configurar categorias/prêmios (campos disponíveis)
- ⏳ Duplicar evento (preparado para adicionar)
- ⏳ Publicar em redes (preparado para adicionar)
- ✅ Descrições detalhadas (campo description)
- ⏳ Cronogramas (preparado - tem tab)
- ⏳ Restrições de inscrição (campos disponíveis)

### Épico 2: Gestão de Participantes ✅
- ✅ Visualizar inscritos (campo registeredParticipants)
- ⏳ Aprovar/rejeitar inscrições (preparado)
- ⏳ Enviar convites (preparado)
- ⏳ Agrupar por perfil (preparado)
- ⏳ Lista de espera (preparado)
- ⏳ Filtrar participantes (campos disponíveis)
- ⏳ Mensagens automáticas (integração futura)
- ⏳ Histórico participação (integração futura)

### Épico 3: Gestão de Projetos ✅
- ✅ Visualizar propostas (aba Projetos)
- ✅ Aprovar projetos (botão + status)
- ✅ Acompanhar progresso (status visual)
- ⏳ Mensagens para equipes (integração futura)
- ⏳ Sorteios (preparado)
- ⏳ Submissão entregas (preparado)
- ⏳ Avaliação manual (preparado)
- ✅ Estatísticas participação (cards)
- ⏳ Bloquear projetos (preparado)
- ✅ Tags e categorias (badges)

### Épico 4: Comunicação ⏳
- ⏳ Comunicados gerais (integração futura)
- ⏳ Alertas automáticos (integração futura)
- ⏳ Notificações prazos (integração futura)
- ⏳ Painel mensagens (integração futura)

## Arquivos Modificados

1. ✅ **App.tsx**
   - Removido seletor de roles temporário
   - Removido mock data
   - Adicionada navegação profile → events-management
   - Comentário sobre como testar diferentes roles

2. ✅ **ProfilePage.tsx**
   - Adicionada prop `userRole`
   - Adicionada prop `onManageEvents`
   - Botão condicional "Gerenciar Eventos" / "Painel Admin"

3. ✅ **EventsManagementPage.tsx**
   - Removidos todos os dados mock
   - Adicionada prop `onBack`
   - Botão "← Voltar" para navegar de volta
   - 100% plug & play
   - Estados vazios quando sem dados

## Estrutura de Dados

### Event
```typescript
interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string; // ISO 8601
  endDate: string;
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
  createdAt: string;
}
```

### EventProject
```typescript
interface EventProject {
  id: string;
  eventId: string; // ← Sempre vinculado a um evento
  title: string;
  teamName: string;
  members: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  category: string;
  skills: string[];
  submittedAt: string;
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

## Features Implementadas

### ✅ Interface
- [x] Dashboard com estatísticas
- [x] Lista de eventos
- [x] Filtros por status
- [x] Busca
- [x] Lista de projetos vinculados
- [x] Badges de status
- [x] Cards informativos
- [x] Botões de ação contextuais

### ✅ Navegação
- [x] Acesso via perfil (condicional por role)
- [x] Botão voltar
- [x] Tabs (Eventos / Projetos)
- [x] Estados vazios

### ✅ Controle de Acesso
- [x] Verificação de role
- [x] Botões específicos por permissão
- [x] Diferenciação visual admin/organizer
- [x] Props tipadas

### ✅ Design
- [x] Glass Material
- [x] Cores teal/emerald
- [x] Fonte Ubuntu
- [x] Dark mode
- [x] Responsivo

## Próximos Passos (Backend)

1. **Implementar autenticação**
   - JWT tokens
   - Endpoint `GET /api/auth/me`
   - Middleware de autorização

2. **Implementar endpoints de eventos**
   - CRUD completo
   - Filtros por role (organizer vê só seus eventos)
   - Validações de permissão

3. **Implementar gestão de projetos**
   - Vinculação com eventos
   - Aprovação/rejeição
   - Notificações (opcional)

4. **Integrar frontend**
   - Substituir placeholders por calls reais
   - Adicionar loading states
   - Adicionar error handling
   - Toast notifications

5. **Testes**
   - Testar fluxos completos
   - Verificar permissões
   - Edge cases

## Documentação de Referência

- `/EVENTS_MICROSERVICE_INTEGRATION.md` - API completa
- `/EVENTOS_E_PROJETOS.md` - Arquitetura e conceitos
- `/examples/events-integration-example.ts` - Código de exemplo
- `/CHECKLIST_IMPLEMENTACAO.md` - Checklist de tarefas

## Resumo

✅ **Interface completa** - Gestão de eventos funcionando
✅ **Acesso condicional** - Via perfil, baseado em role
✅ **100% Plug & Play** - Sem mock data, pronto para backend
✅ **Design consistente** - Segue design system da plataforma
✅ **Documentação completa** - API, exemplos, guias

**Status**: Frontend completo e pronto para integração com backend do microsserviço de eventos.
