/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Centralized API client for InnovaConnect frontend.
 * Handles authentication headers, JSON parsing, typed responses and error normalization.
 */

export type UserRole = 'user' | 'organizer' | 'admin';

export interface AuthStatusResponse {
  isAuthenticated: boolean;
  userId: string | null;
}

export interface AuthMeResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  authenticated: boolean;
}

export interface EventStats {
  totalEvents: number;
  activeEvents: number;
  totalProjects: number;
  totalParticipants: number;
}

export type EventStatus = 'draft' | 'published' | 'active' | 'finished';

export interface Event {
  id: string;
  name: string;
  description: string;
  theme?: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  location: string;
  locationType?: 'presencial' | 'online' | 'hibrido';
  status: EventStatus;
  maxTeams?: number;
  maxParticipants?: number;
  minTeamSize?: number;
  maxTeamSize?: number;
  registeredParticipants: number;
  submittedProjects: number;
  formedTeams: number;
  organizer: string;
  categories: string[];
  tags: string[];
  prizes?: Prize[];
  restrictions?: EventRestriction[];
  schedule?: ScheduleItem[];
  socialLinks?: SocialLink[];
  requiresApproval?: boolean;
  allowsWaitlist?: boolean;
  isPublished?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Prize {
  position: string;
  description: string;
  value?: string;
}

export interface EventRestriction {
  type: 'age' | 'experience' | 'location' | 'custom';
  description: string;
}

export interface ScheduleItem {
  date: string;
  time: string;
  title: string;
  description: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export type ProjectStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

export interface EventProject {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  teamName: string;
  members: number;
  teamMembers?: number;
  status: ProjectStatus;
  category: string;
  skills: string[];
  submittedAt: string;
  progress?: number;
}

export type ParticipantStatus = 'pending' | 'approved' | 'rejected' | 'waitlist';

export interface EventParticipant {
  id: string;
  name: string;
  email: string;
  skills: string[];
  status: ParticipantStatus;
  registeredAt: string;
  profileComplete: boolean;
}

export interface EventsManagementResponse {
  stats: EventStats;
  events: Event[];
}

export interface EventProjectsResponse {
  projects: EventProject[];
}

export interface EventParticipantsResponse {
  participants: EventParticipant[];
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiErrorPayload {
  error?: {
    code?: string;
    message?: string;
    details?: unknown;
  };
  message?: string;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.PUBLIC_API_BASE_URL ||
  'http://localhost:8080/api';

const isBrowser = typeof window !== 'undefined';

export function getAuthToken(): string | null {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem('authToken');
  } catch (error) {
    console.warn('Unable to access auth token from localStorage', error);
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  if (!isBrowser) return;
  try {
    if (token) {
      window.localStorage.setItem('authToken', token);
    } else {
      window.localStorage.removeItem('authToken');
    }
  } catch (error) {
    console.warn('Unable to persist auth token to localStorage', error);
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: any;
  query?: Record<string, string | number | boolean | undefined | null>;
  rawResponse?: boolean;
}

function buildQueryString(query?: RequestOptions['query']): string {
  if (!query) return '';
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    params.append(key, String(value));
  });
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, query, rawResponse, ...rest } = options;

  const url = `${API_BASE_URL}${path}${buildQueryString(query)}`;

  const token = getAuthToken();

  const finalHeaders = new Headers({
    Accept: 'application/json',
    ...headers,
  });

  let preparedBody: BodyInit | undefined;

  if (body !== undefined) {
    if (body instanceof FormData || body instanceof Blob || body instanceof ArrayBuffer) {
      preparedBody = body as BodyInit;
    } else if (typeof body === 'string') {
      preparedBody = body;
      if (!finalHeaders.has('Content-Type')) {
        finalHeaders.set('Content-Type', 'application/json');
      }
    } else {
      preparedBody = JSON.stringify(body);
      finalHeaders.set('Content-Type', 'application/json');
    }
  }

  if (token && !finalHeaders.has('Authorization')) {
    finalHeaders.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body: preparedBody,
    credentials: rest.credentials ?? 'include',
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | string | undefined;
    const contentType = response.headers.get('content-type') ?? '';

    try {
      if (contentType.includes('application/json')) {
        payload = (await response.json()) as ApiErrorPayload;
      } else {
        payload = await response.text();
      }
    } catch {
      payload = undefined;
    }

    // Extract detailed validation errors from FastAPI
    let message = '';
    let errorDetails: any = undefined;
    
    if (typeof payload === 'object' && payload !== null) {
      // FastAPI returns validation errors in 'detail' array for 422 errors
      if (response.status === 422 && Array.isArray((payload as any).detail)) {
        errorDetails = (payload as any).detail;
        const errors = errorDetails.map((err: any) => {
          const field = err.loc?.slice(1).join('.') || 'unknown'; // Remove 'body' from loc
          const msg = err.msg || 'Invalid value';
          const type = err.type || '';
          return `${field}: ${msg}${type ? ` (${type})` : ''}`;
        });
        message = errors.join(', ');
      } else if (payload.error?.details) {
        // Alternative error format
        errorDetails = payload.error.details;
        if (Array.isArray(errorDetails)) {
          const errors = errorDetails.map((err: any) => {
            const field = err.loc?.join('.') || 'unknown';
            const msg = err.msg || 'Invalid value';
            return `${field}: ${msg}`;
          });
          message = errors.join(', ');
        } else {
          message = JSON.stringify(errorDetails);
        }
      }
      message = message || payload.error?.message || (payload as any).message || `HTTP ${response.status}`;
    } else if (typeof payload === 'string') {
      message = payload || `HTTP ${response.status}`;
    } else {
      message = `HTTP ${response.status}`;
    }

    const error = new ApiError(
      response.status,
      message,
      typeof payload === 'object' && payload !== null ? payload.error?.code : undefined,
      errorDetails || (typeof payload === 'object' && payload !== null ? payload.error?.details : undefined)
    );

    throw error;
  }

  if (rawResponse) {
    return response as unknown as T;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseType = response.headers.get('content-type') ?? '';
  if (responseType.includes('application/json')) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

export async function getAuthStatus(signal?: AbortSignal): Promise<AuthStatusResponse> {
  return request<AuthStatusResponse>('/auth/status', { method: 'GET', signal });
}

export async function getCurrentUser(signal?: AbortSignal): Promise<AuthMeResponse> {
  return request<AuthMeResponse>('/auth/me', { method: 'GET', signal });
}

export interface CreateEventPayload {
  name: string;
  description: string;
  theme?: string;
  startDate: string;
  endDate: string;
  registrationDeadline?: string;
  location: string;
  locationType?: 'presencial' | 'online' | 'hibrido';
  maxParticipants?: number;
  minTeamSize?: number;
  maxTeamSize?: number;
  categories: string[];
  tags?: string[];
  prizes?: Prize[];
  restrictions?: EventRestriction[];
  schedule?: ScheduleItem[];
  socialLinks?: SocialLink[];
  requiresApproval?: boolean;
  allowsWaitlist?: boolean;
  isPublished?: boolean;
}

export interface UpdateEventPayload extends Partial<CreateEventPayload> {
  status?: EventStatus;
}

export async function loadEventsManagement(
  signal?: AbortSignal
): Promise<EventsManagementResponse> {
  return request<EventsManagementResponse>('/events/management', { method: 'GET', signal });
}

export async function getEvent(eventId: string, signal?: AbortSignal): Promise<Event> {
  return request<Event>(`/events/${eventId}`, { method: 'GET', signal });
}

export async function createEvent(payload: CreateEventPayload): Promise<Event> {
  // Transform frontend payload (camelCase) to backend format (snake_case)
  // Convert dates to ISO datetime strings (backend expects datetime with timezone)
  const convertToISO = (dateStr: string, isEndDate: boolean = false): string => {
    if (!dateStr) return '';
    
    // If already in ISO format with time, use as is
    if (dateStr.includes('T') && (dateStr.includes('Z') || dateStr.includes('+'))) {
      return dateStr;
    }
    
    // If has time but no timezone, add Z
    if (dateStr.includes('T')) {
      return dateStr.endsWith('Z') ? dateStr : `${dateStr}Z`;
    }
    
    // If just date (YYYY-MM-DD), convert to ISO datetime
    const time = isEndDate ? '23:59:59' : '00:00:00';
    return `${dateStr}T${time}Z`;
  };
  
  const startDateISO = convertToISO(payload.startDate, false);
  const endDateISO = convertToISO(payload.endDate, true);
  
  // Ensure categories is not empty (required field)
  const categories = payload.categories && payload.categories.length > 0 
    ? payload.categories 
    : ['geral']; // Default category if none provided
  
  const backendPayload = {
    name: payload.name,
    description: payload.description,
    start_date: startDateISO,
    end_date: endDateISO,
    location: payload.location,
    categories: categories,
    tags: payload.tags || [],
    max_participants: payload.maxParticipants || 100,
    max_teams: Math.max(1, Math.floor((payload.maxParticipants || 100) / Math.max(1, payload.minTeamSize || 1))),
    status: payload.isPublished ? 'published' : 'draft',
  };
  
  return request<Event>('/events', {
    method: 'POST',
    body: backendPayload,
  });
}

export async function updateEvent(eventId: string, payload: UpdateEventPayload): Promise<Event> {
  // Transform frontend payload (camelCase) to backend format (snake_case)
  const backendPayload: Record<string, any> = {};
  
  if (payload.name !== undefined) backendPayload.name = payload.name;
  if (payload.description !== undefined) backendPayload.description = payload.description;
  if (payload.startDate !== undefined) {
    backendPayload.start_date = payload.startDate.includes('T')
      ? payload.startDate
      : `${payload.startDate}T00:00:00Z`;
  }
  if (payload.endDate !== undefined) {
    backendPayload.end_date = payload.endDate.includes('T')
      ? payload.endDate
      : `${payload.endDate}T23:59:59Z`;
  }
  if (payload.location !== undefined) backendPayload.location = payload.location;
  if (payload.categories !== undefined) backendPayload.categories = payload.categories;
  if (payload.tags !== undefined) backendPayload.tags = payload.tags;
  if (payload.maxParticipants !== undefined) backendPayload.max_participants = payload.maxParticipants;
  if (payload.maxParticipants !== undefined && payload.minTeamSize !== undefined) {
    backendPayload.max_teams = Math.floor(payload.maxParticipants / payload.minTeamSize) || 10;
  }
  if (payload.status !== undefined) backendPayload.status = payload.status;
  
  return request<Event>(`/events/${eventId}`, {
    method: 'PUT',
    body: backendPayload,
  });
}

export async function deleteEvent(eventId: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/events/${eventId}`, {
    method: 'DELETE',
  });
}

export async function updateEventStatus(
  eventId: string,
  status: EventStatus
): Promise<Event> {
  return request<Event>(`/events/${eventId}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function getAvailableEvents(signal?: AbortSignal): Promise<Event[]> {
  const data = await request<{ events: Event[] } | Event[]>(
    '/events/available',
    { method: 'GET', signal }
  );

  if (Array.isArray(data)) {
    return data;
  }

  if ('events' in data && Array.isArray(data.events)) {
    return data.events;
  }

  return [];
}

export async function getEventProjects(
  eventId: string,
  signal?: AbortSignal
): Promise<EventProject[]> {
  try {
    const data = await request<EventProjectsResponse | EventProject[]>(`/events/${eventId}/projects`, {
      method: 'GET',
      signal,
    });

    if (Array.isArray(data)) {
      return data;
    }

    if ('projects' in data && Array.isArray(data.projects)) {
      return data.projects;
    }

    return [];
  } catch (err) {
    // 404 means no projects yet or event doesn't exist - return empty list
    if (err instanceof ApiError && err.status === 404) {
      return [];
    }
    // Re-throw other errors
    throw err;
  }
}

export interface CreateEventProjectPayload {
  title: string;
  description?: string;
  category: string;
  teamName: string;
  skills: string[];
  members?: number; // Total number of team members
}

export async function createEventProject(
  eventId: string,
  payload: CreateEventProjectPayload
): Promise<EventProject> {
  // Transform frontend payload (camelCase) to backend format (snake_case)
  const backendPayload = {
    title: payload.title.trim(),
    description: payload.description || '',
    category: payload.category.trim(),
    team_name: payload.teamName.trim(),
    skills: payload.skills,
    members: payload.members || 1, // Default to 1 if not provided
  };
  
  return request<EventProject>(`/events/${eventId}/projects`, {
    method: 'POST',
    body: backendPayload,
  });
}

export async function updateProjectStatus(
  eventId: string,
  projectId: string,
  status: Exclude<ProjectStatus, 'draft' | 'submitted'>,
  reason?: string
): Promise<EventProject> {
  return request<EventProject>(`/events/${eventId}/projects/${projectId}/status`, {
    method: 'PATCH',
    body: { status, reason },
  });
}

export async function getEventParticipants(
  eventId: string,
  signal?: AbortSignal
): Promise<EventParticipant[]> {
  try {
    const data = await request<EventParticipantsResponse | EventParticipant[]>(
      `/events/${eventId}/participants`,
      { method: 'GET', signal }
    );

    if (Array.isArray(data)) {
      return data;
    }

    if ('participants' in data && Array.isArray(data.participants)) {
      return data.participants;
    }

    return [];
  } catch (err) {
    // 404 means no participants yet or event doesn't exist - return empty list
    if (err instanceof ApiError && err.status === 404) {
      return [];
    }
    // Re-throw other errors
    throw err;
  }
}

export async function approveParticipant(
  eventId: string,
  participantId: string
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(
    `/events/${eventId}/participants/${participantId}/approve`,
    { method: 'POST' }
  );
}

export async function rejectParticipant(
  eventId: string,
  participantId: string,
  reason?: string
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(
    `/events/${eventId}/participants/${participantId}/reject`,
    {
      method: 'POST',
      body: reason ? { reason } : undefined,
    }
  );
}

export async function registerForEvent(eventId: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/events/${eventId}/register`, {
    method: 'POST',
  });
}

export interface SendEventMessagePayload {
  message: string;
  recipients: string[];
}

export async function sendEventMessage(
  eventId: string,
  payload: SendEventMessagePayload
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/events/${eventId}/messages`, {
    method: 'POST',
    body: payload,
  });
}

export interface UpdateNotificationSettingsPayload {
  notifyNewRegistrations?: boolean;
  notifyDeadlines?: boolean;
  notifySubmittedProjects?: boolean;
  notifyIncompleteProfiles?: boolean;
}

export async function updateNotificationSettings(
  eventId: string,
  payload: UpdateNotificationSettingsPayload
): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(`/events/${eventId}/notifications`, {
    method: 'PUT',
    body: payload,
  });
}

export async function duplicateEvent(eventId: string): Promise<Event> {
  return request<Event>(`/events/${eventId}/duplicate`, {
    method: 'POST',
  });
}

export async function exportEventData(
  eventId: string,
  type: 'participants' | 'projects'
): Promise<Blob> {
  const response = await request<Response>(`/events/${eventId}/export/${type}`, {
    method: 'GET',
    rawResponse: true,
  });
  return response.blob();
}

export async function getEventStats(
  eventId: string,
  signal?: AbortSignal
): Promise<{
  registeredParticipants: number;
  submittedProjects: number;
  formedTeams: number;
  skillsHeatmap: Array<{ skill: string; count: number }>;
}> {
  return request(`/events/${eventId}/stats`, { method: 'GET', signal });
}

export async function getEventsOverviewStats(
  signal?: AbortSignal
): Promise<EventStats> {
  return request<EventStats>('/events/stats/overview', { method: 'GET', signal });
}

export const api = {
  getAuthStatus,
  getCurrentUser,
  loadEventsManagement,
  getEventsOverviewStats,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventStatus,
  getAvailableEvents,
  duplicateEvent,
  exportEventData,
  getEventProjects,
  createEventProject,
  updateProjectStatus,
  getEventParticipants,
  approveParticipant,
  rejectParticipant,
  registerForEvent,
  sendEventMessage,
  updateNotificationSettings,
  getEventStats,
};

export default api;
