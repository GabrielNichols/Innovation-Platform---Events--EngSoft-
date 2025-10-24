# Relação entre Eventos e Projetos

## Visão Geral

Na plataforma de Inovação Colaborativa, **os projetos ficam dentro de eventos**. Esta é uma decisão arquitetural fundamental que estrutura toda a plataforma.

## Por que Projetos ficam dentro de Eventos?

### Contexto Real

No ecossistema universitário e de startups:

1. **Hackathons** → Equipes criam projetos durante o evento
2. **Desafios de Robótica** → Times desenvolvem soluções específicas
3. **Startup Weekends** → Grupos criam startups durante o fim de semana
4. **Competições de Plano de Negócio** → Equipes apresentam propostas

### Benefícios da Estrutura

```
┌──────────────────────────────────────┐
│ Hackathon Mackenzie 2025             │
│                                       │
│ ┌─────────────────────────────────┐  │
│ │ Projeto: SmartPark              │  │
│ │ Equipe: Innovators Tech         │  │
│ │ Status: Aprovado                │  │
│ └─────────────────────────────────┘  │
│                                       │
│ ┌─────────────────────────────────┐  │
│ │ Projeto: EcoTrack               │  │
│ │ Equipe: Green Coders            │  │
│ │ Status: Em revisão              │  │
│ └─────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Vantagens**:
- ✅ Organização clara por competição/evento
- ✅ Regras e prazos específicos por evento
- ✅ Facilita avaliação e premiação
- ✅ Estatísticas separadas por evento
- ✅ Gestão independente por organizador

## Arquitetura de Dados

### Modelo Conceitual

```sql
-- Eventos
CREATE TABLE events (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status VARCHAR CHECK (status IN ('draft', 'published', 'active', 'finished')),
  organizer_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Projetos (sempre vinculados a um evento)
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  title VARCHAR NOT NULL,
  description TEXT,
  status VARCHAR CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
  team_id UUID REFERENCES teams(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT projects_must_have_event CHECK (event_id IS NOT NULL)
);

-- Participação em eventos
CREATE TABLE event_participants (
  event_id UUID REFERENCES events(id),
  user_id UUID REFERENCES users(id),
  role VARCHAR CHECK (role IN ('participant', 'judge', 'mentor')),
  registered_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (event_id, user_id)
);

-- Equipes formadas dentro de eventos
CREATE TABLE teams (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  event_id UUID REFERENCES events(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Regras de Integridade

1. **Projeto sem evento = INVÁLIDO**
   - Todo projeto DEVE ter um `event_id`
   - Se o evento for deletado, os projetos associados são arquivados

2. **Equipes dentro de eventos**
   - Equipes são formadas no contexto de um evento específico
   - Uma equipe pode ter apenas UM projeto por evento

3. **Status do projeto vinculado ao status do evento**
   - Projetos só podem ser submetidos se o evento está 'active'
   - Quando evento vira 'finished', submissões são bloqueadas

## Fluxos de Usuário

### 1. Organizador cria evento

```
Organizador/Admin
  ↓
Acessa "Gestão de Eventos"
  ↓
Clica "Criar Evento"
  ↓
Preenche:
  - Nome: "Hackathon Mackenzie 2025"
  - Descrição
  - Datas: 15/03 a 17/03
  - Categorias: [IA, IoT, Mobile]
  - Status: draft
  ↓
Salva evento
  ↓
Publica evento (status: published)
```

### 2. Usuário se inscreve no evento e cria projeto

```
Usuário participante
  ↓
Navega no Feed/Busca
  ↓
Vê eventos publicados
  ↓
Clica em "Hackathon Mackenzie 2025"
  ↓
Se inscreve no evento
  ↓
Forma ou entra em equipe
  ↓
Equipe cria projeto vinculado ao evento:
  - Título: "SmartPark"
  - Categoria: IoT (deve estar nas categorias do evento)
  - Skills necessárias
  - event_id: "uuid-do-hackathon"
  ↓
Submete projeto quando evento está 'active'
```

### 3. Organizador gerencia projetos do evento

```
Organizador
  ↓
Acessa "Gestão de Eventos"
  ↓
Seleciona "Hackathon Mackenzie 2025"
  ↓
Aba "Projetos" mostra todos os projetos deste evento
  ↓
Filtra por status: 'submitted'
  ↓
Revisa projeto "SmartPark"
  ↓
Aprova ou Rejeita
  ↓
Equipe é notificada
```

## Diferenças entre Visualizações

### Usuário Comum (`user`)

**Feed/Busca**:
- Vê eventos publicados/ativos
- Vê projetos de eventos onde participa
- Pode se inscrever em eventos
- Pode criar projetos dentro de eventos que participa

**Criar Projeto**:
- **IMPORTANTE**: Deve primeiro selecionar o evento
- Wizard mostra: "Qual evento?" → resto do formulário
- Categorias e regras vêm do evento selecionado

### Organizador (`organizer`)

**Gestão de Eventos** (`/events-management`):
- Lista SEUS eventos (eventos que criou)
- Estatísticas de cada evento
- Lista de projetos vinculados aos seus eventos
- Pode aprovar/rejeitar projetos

**Não pode**:
- Editar/deletar eventos de outros organizadores
- Ver projetos de eventos que não organizou

### Administrador (`admin`)

**Gestão de Eventos** (`/events-management`):
- Lista TODOS os eventos da plataforma
- Pode criar, editar, deletar qualquer evento
- Vê todos os projetos de todos os eventos
- Pode aprovar/rejeitar qualquer projeto
- Acesso completo a estatísticas

**Diferencial visual**:
- Botão de deletar eventos aparece
- Pode moderar qualquer conteúdo
- Badge "Admin" visível

## Adaptações no Frontend

### CreateProjectPage

Precisa ser adaptado para:

```typescript
// Adicionar seleção de evento
const [selectedEvent, setSelectedEvent] = useState<string | null>(null);

// Step 0: Selecionar Evento (novo)
{step === 0 && (
  <div>
    <h3>Para qual evento é este projeto?</h3>
    <div className="grid gap-4">
      {availableEvents.map(event => (
        <GlassCard 
          key={event.id}
          onClick={() => {
            setSelectedEvent(event.id);
            setStep(1);
          }}
        >
          <h4>{event.name}</h4>
          <p>{event.startDate} - {event.endDate}</p>
          <Badge>{event.location}</Badge>
        </GlassCard>
      ))}
    </div>
  </div>
)}

// Step 1: Agora usa categorias do evento selecionado
{step === 1 && selectedEvent && (
  // Categorias vêm do evento, não são fixas
  <div>
    <label>Categoria (do evento {events.find(e => e.id === selectedEvent)?.name})</label>
    {/* Usar event.categories */}
  </div>
)}
```

### FeedPage

Mostrar eventos ativos e permitir navegação:

```typescript
// Seção de eventos em destaque
<GlassCard>
  <h3>Eventos Ativos</h3>
  {activeEvents.map(event => (
    <EventCard 
      key={event.id}
      event={event}
      onClick={() => navigateToEvent(event.id)}
    />
  ))}
</GlassCard>

// Projetos agrupados por evento
{projects.map(project => (
  <ProjectCard 
    project={project}
    eventName={events.find(e => e.id === project.eventId)?.name}
  />
))}
```

### SearchPage

Filtrar por eventos:

```typescript
const [eventFilter, setEventFilter] = useState<string>('all');

// Novo filtro
<div>
  <h4>Filtrar por Evento</h4>
  <Select value={eventFilter} onChange={setEventFilter}>
    <option value="all">Todos os eventos</option>
    {events.map(event => (
      <option key={event.id} value={event.id}>
        {event.name}
      </option>
    ))}
  </Select>
</div>
```

## Endpoints Necessários

```typescript
// Eventos que o usuário pode submeter projetos
GET /api/events/available
Response: Event[] // Eventos publicados/ativos

// Projetos do usuário agrupados por evento
GET /api/user/projects
Response: {
  [eventId: string]: Project[]
}

// Criar projeto para um evento específico
POST /api/events/:eventId/projects
Body: {
  title: string,
  description: string,
  category: string, // Deve estar em event.categories
  skills: string[]
}

// Feed com projetos de eventos
GET /api/feed
Response: {
  activeEvents: Event[],
  projects: Array<{
    ...Project,
    event: Event
  }>
}
```

## Variável de Controle

No `App.tsx`, já existe:

```typescript
const [userRole, setUserRole] = useState<UserRole>('user');

// TODO: Get from backend
// GET /api/auth/me
// Response: { user: {...}, role: 'user' | 'organizer' | 'admin' }
```

Esta variável controla:
- Quais páginas o usuário pode acessar
- Quais ações pode executar
- O que vê na interface

## Exemplo Completo de Fluxo

### Hackathon do Começo ao Fim

```
1. [Admin] Configura plataforma
   - Adiciona tags/skills gerais

2. [Organizador] Cria evento
   POST /api/events
   {
     name: "Hackathon Mackenzie 2025",
     startDate: "2025-03-15",
     endDate: "2025-03-17",
     categories: ["IA", "IoT", "Mobile"],
     status: "published"
   }

3. [Usuários] Descobrem evento
   - Veem no feed
   - Buscam por categoria
   - Se inscrevem

4. [Organizador] Ativa evento
   PATCH /api/events/uuid/status
   { status: "active" }

5. [Equipes] Criam projetos
   POST /api/events/uuid/projects
   {
     title: "SmartPark",
     category: "IoT", // Validado contra event.categories
     teamName: "Innovators Tech",
     skills: ["Python", "React", "Arduino"]
   }

6. [Organizador] Revisa projetos
   - Acessa /events-management
   - Vê lista de projetos do evento
   - Aprova/rejeita

7. [Organizador] Finaliza evento
   PATCH /api/events/uuid/status
   { status: "finished" }

8. [Todos] Visualizam resultados
   - Projetos aprovados ficam visíveis
   - Estatísticas do evento disponíveis
```

## Isolamento entre Eventos

Cada evento é isolado:
- Projetos de um evento não aparecem em outro
- Estatísticas são separadas
- Equipes são específicas por evento
- Organizadores gerenciam apenas seus eventos

## Conclusão

A estrutura **Eventos → Projetos** reflete o mundo real de competições e hackathons, onde:
- Todo projeto nasce no contexto de uma competição
- Organizadores gerenciam seus eventos de forma independente
- Participantes colaboram dentro do escopo de um evento específico
- A plataforma funciona como um hub que conecta múltiplos eventos simultâneos

Esta arquitetura permite que **seu grupo de microsserviços de eventos** funcione de forma independente, gerenciando todo o ciclo de vida de eventos e projetos vinculados, enquanto outros grupos cuidam de perfis, mensagens, IA, etc.
