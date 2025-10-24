/**
 * Exemplo de Integração Frontend-Backend
 * Microsserviço de Eventos
 * 
 * Este arquivo mostra exemplos práticos de como integrar
 * o frontend com o backend do microsserviço de eventos.
 */

// =============================================================================
// 1. TIPOS E INTERFACES (já definidos no frontend)
// =============================================================================

interface Event {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  status: 'draft' | 'published' | 'active' | 'finished';
  maxTeams?: number;
  maxParticipants?: number;
  registeredParticipants: number;
  submittedProjects: number;
  formedTeams: number;
  organizer: string;
  categories: string[];
  tags: string[];
  createdAt: string;
}

interface EventProject {
  id: string;
  eventId: string;
  title: string;
  teamName: string;
  members: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  category: string;
  skills: string[];
  submittedAt: string;
}

interface EventStats {
  totalEvents: number;
  activeEvents: number;
  totalProjects: number;
  totalParticipants: number;
}

// =============================================================================
// 2. CONFIGURAÇÃO DA API
// =============================================================================

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// Helper para fazer requests autenticados
async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('authToken'); // TODO: Usar sistema de auth real
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// =============================================================================
// 3. FUNÇÕES DE INTEGRAÇÃO - AUTENTICAÇÃO
// =============================================================================

/**
 * Obtém informações do usuário autenticado incluindo role
 */
export async function getCurrentUser(): Promise<{
  user: { id: string; name: string; email: string; role: 'user' | 'organizer' | 'admin' };
  authenticated: boolean;
}> {
  return fetchWithAuth('/auth/me');
}

// Exemplo de uso:
// const { user, authenticated } = await getCurrentUser();
// if (authenticated && ['organizer', 'admin'].includes(user.role)) {
//   // Mostrar página de gestão de eventos
// }

// =============================================================================
// 4. FUNÇÕES DE INTEGRAÇÃO - GESTÃO DE EVENTOS
// =============================================================================

/**
 * Carrega eventos e estatísticas para a página de gestão
 * Requer: organizer ou admin
 */
export async function loadEventsManagement(): Promise<{
  stats: EventStats;
  events: Event[];
}> {
  return fetchWithAuth('/events/management');
}

// Exemplo de uso no React:
/*
const EventsManagementContainer = () => {
  const [data, setData] = useState<{ stats: EventStats; events: Event[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await loadEventsManagement();
        setData(result);
      } catch (error) {
        console.error('Erro ao carregar eventos:', error);
        toast.error('Erro ao carregar eventos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div>Carregando...</div>;
  if (!data) return <div>Erro ao carregar</div>;

  return <EventsManagementPage stats={data.stats} events={data.events} />;
};
*/

/**
 * Cria um novo evento
 * Requer: organizer ou admin
 */
export async function createEvent(eventData: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  categories: string[];
  tags: string[];
  maxTeams?: number;
  maxParticipants?: number;
}): Promise<Event> {
  return fetchWithAuth('/events', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
}

// Exemplo de uso:
/*
const handleCreateEvent = async (formData) => {
  try {
    const newEvent = await createEvent({
      name: formData.name,
      description: formData.description,
      startDate: formData.startDate,
      endDate: formData.endDate,
      location: formData.location,
      categories: formData.categories,
      tags: formData.tags,
    });
    
    toast.success('Evento criado com sucesso!');
    // Atualizar lista de eventos
    refreshEvents();
  } catch (error) {
    toast.error(`Erro ao criar evento: ${error.message}`);
  }
};
*/

/**
 * Atualiza um evento existente
 * Requer: organizer (próprio evento) ou admin (qualquer evento)
 */
export async function updateEvent(
  eventId: string,
  updates: Partial<Event>
): Promise<Event> {
  return fetchWithAuth(`/events/${eventId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * Deleta um evento
 * Requer: admin apenas
 */
export async function deleteEvent(eventId: string): Promise<{ success: boolean }> {
  return fetchWithAuth(`/events/${eventId}`, {
    method: 'DELETE',
  });
}

/**
 * Muda o status de um evento
 * Requer: organizer (próprio evento) ou admin
 */
export async function updateEventStatus(
  eventId: string,
  status: 'draft' | 'published' | 'active' | 'finished'
): Promise<Event> {
  return fetchWithAuth(`/events/${eventId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

// Exemplo de uso:
/*
const handlePublishEvent = async (eventId: string) => {
  try {
    await updateEventStatus(eventId, 'published');
    toast.success('Evento publicado! Inscrições abertas.');
    refreshEvents();
  } catch (error) {
    toast.error(`Erro ao publicar evento: ${error.message}`);
  }
};
*/

// =============================================================================
// 5. FUNÇÕES DE INTEGRAÇÃO - PROJETOS DE EVENTOS
// =============================================================================

/**
 * Lista projetos de um evento específico
 */
export async function getEventProjects(eventId: string): Promise<EventProject[]> {
  const response = await fetchWithAuth(`/events/${eventId}/projects`);
  return response.projects;
}

/**
 * Cria um projeto vinculado a um evento
 * Requer: usuário inscrito no evento
 */
export async function createEventProject(
  eventId: string,
  projectData: {
    title: string;
    description: string;
    category: string;
    teamName: string;
    skills: string[];
  }
): Promise<EventProject> {
  return fetchWithAuth(`/events/${eventId}/projects`, {
    method: 'POST',
    body: JSON.stringify(projectData),
  });
}

/**
 * Aprova um projeto
 * Requer: organizer (próprio evento) ou admin
 */
export async function approveProject(
  eventId: string,
  projectId: string
): Promise<EventProject> {
  return fetchWithAuth(`/events/${eventId}/projects/${projectId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'approved' }),
  });
}

/**
 * Rejeita um projeto com justificativa
 * Requer: organizer (próprio evento) ou admin
 */
export async function rejectProject(
  eventId: string,
  projectId: string,
  reason: string
): Promise<EventProject> {
  return fetchWithAuth(`/events/${eventId}/projects/${projectId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'rejected', reason }),
  });
}

// Exemplo de uso:
/*
const handleApproveProject = async (eventId: string, projectId: string) => {
  if (!confirm('Aprovar este projeto?')) return;
  
  try {
    await approveProject(eventId, projectId);
    toast.success('Projeto aprovado!');
    // TODO: Notificar equipe
    refreshProjects();
  } catch (error) {
    toast.error(`Erro ao aprovar projeto: ${error.message}`);
  }
};

const handleRejectProject = async (eventId: string, projectId: string) => {
  const reason = prompt('Motivo da rejeição:');
  if (!reason) return;
  
  try {
    await rejectProject(eventId, projectId, reason);
    toast.success('Projeto rejeitado. Equipe foi notificada.');
    refreshProjects();
  } catch (error) {
    toast.error(`Erro ao rejeitar projeto: ${error.message}`);
  }
};
*/

// =============================================================================
// 6. FUNÇÕES DE INTEGRAÇÃO - PARTICIPAÇÃO EM EVENTOS
// =============================================================================

/**
 * Lista eventos disponíveis para inscrição
 */
export async function getAvailableEvents(): Promise<Event[]> {
  const response = await fetchWithAuth('/events/available');
  return response.events;
}

/**
 * Inscreve usuário em um evento
 * Requer: autenticação
 */
export async function registerForEvent(eventId: string): Promise<{ success: boolean }> {
  return fetchWithAuth(`/events/${eventId}/register`, {
    method: 'POST',
  });
}

/**
 * Obtém detalhes de um evento
 */
export async function getEventDetails(eventId: string): Promise<Event> {
  return fetchWithAuth(`/events/${eventId}`);
}

// =============================================================================
// 7. EXEMPLO COMPLETO - COMPONENTE REACT
// =============================================================================

/*
import React, { useState, useEffect } from 'react';
import { EventsManagementPage } from '../pages/EventsManagementPage';
import { toast } from 'sonner';

export const EventsManagementContainer: React.FC = () => {
  const [stats, setStats] = useState<EventStats | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [projects, setProjects] = useState<EventProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'organizer' | 'admin'>('organizer');

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Verificar autenticação e role
        const { user, authenticated } = await getCurrentUser();
        
        if (!authenticated || !['organizer', 'admin'].includes(user.role)) {
          toast.error('Acesso negado');
          return;
        }

        setUserRole(user.role as 'organizer' | 'admin');

        // 2. Carregar eventos e estatísticas
        const { stats, events } = await loadEventsManagement();
        setStats(stats);
        setEvents(events);

        // 3. Carregar projetos de todos os eventos
        const allProjects: EventProject[] = [];
        for (const event of events) {
          const eventProjects = await getEventProjects(event.id);
          allProjects.push(...eventProjects);
        }
        setProjects(allProjects);

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Erro ao carregar dados');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <EventsManagementPage
      stats={stats}
      events={events}
      projects={projects}
      userRole={userRole}
    />
  );
};
*/

// =============================================================================
// 8. EXEMPLO DE TRATAMENTO DE ERROS
// =============================================================================

/*
// Wrapper com tratamento de erros
export async function safeApiCall<T>(
  apiFunction: () => Promise<T>,
  errorMessage: string = 'Erro ao processar requisição'
): Promise<T | null> {
  try {
    return await apiFunction();
  } catch (error) {
    if (error instanceof Error) {
      // Erros específicos
      if (error.message.includes('401')) {
        toast.error('Sessão expirada. Faça login novamente.');
        // Redirecionar para login
        window.location.href = '/login';
      } else if (error.message.includes('403')) {
        toast.error('Você não tem permissão para esta ação.');
      } else if (error.message.includes('404')) {
        toast.error('Recurso não encontrado.');
      } else {
        toast.error(`${errorMessage}: ${error.message}`);
      }
    } else {
      toast.error(errorMessage);
    }
    return null;
  }
}

// Exemplo de uso:
const result = await safeApiCall(
  () => createEvent(eventData),
  'Erro ao criar evento'
);

if (result) {
  toast.success('Evento criado com sucesso!');
}
*/

// =============================================================================
// 9. VALIDAÇÕES DO LADO DO CLIENTE
// =============================================================================

/**
 * Valida dados de criação de evento
 */
export function validateEventData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.name || data.name.length < 5) {
    errors.push('Nome do evento deve ter pelo menos 5 caracteres');
  }

  if (!data.description || data.description.length < 20) {
    errors.push('Descrição deve ter pelo menos 20 caracteres');
  }

  if (!data.startDate || !data.endDate) {
    errors.push('Datas de início e fim são obrigatórias');
  }

  if (new Date(data.startDate) >= new Date(data.endDate)) {
    errors.push('Data de início deve ser anterior à data de fim');
  }

  if (!data.location || data.location.length < 3) {
    errors.push('Localização é obrigatória');
  }

  if (!data.categories || data.categories.length === 0) {
    errors.push('Selecione pelo menos uma categoria');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Exemplo de uso:
/*
const handleSubmit = async (formData) => {
  const { valid, errors } = validateEventData(formData);
  
  if (!valid) {
    errors.forEach(error => toast.error(error));
    return;
  }

  // Prosseguir com a criação
  await createEvent(formData);
};
*/

// =============================================================================
// 10. HOOKS CUSTOMIZADOS (React)
// =============================================================================

/*
import { useState, useEffect, useCallback } from 'react';

// Hook para carregar eventos
export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async () => {
    try {
      setLoading(true);
      const data = await loadEventsManagement();
      setEvents(data.events);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  return { events, loading, error, refresh: loadEvents };
}

// Hook para carregar projetos de um evento
export function useEventProjects(eventId: string) {
  const [projects, setProjects] = useState<EventProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getEventProjects(eventId);
        setProjects(data);
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      load();
    }
  }, [eventId]);

  return { projects, loading };
}

// Uso nos componentes:
const MyComponent = () => {
  const { events, loading, refresh } = useEvents();
  
  if (loading) return <div>Carregando...</div>;
  
  return (
    <div>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
      <button onClick={refresh}>Atualizar</button>
    </div>
  );
};
*/

// =============================================================================
// FIM DO ARQUIVO DE EXEMPLOS
// =============================================================================

export {};
