import React from 'react';
import { MobileNav } from './components/MobileNav';
import { GlassButton } from './components/GlassButton';
import { GlassCard } from './components/GlassCard';
import { OnboardingPage } from './pages/OnboardingPage';
import { LoginPage } from './pages/LoginPage';
import { FeedPage } from './pages/FeedPage';
import { SearchPage } from './pages/SearchPage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { MessagesPage } from './pages/MessagesPage';
import { CreateProjectPage } from './pages/CreateProjectPage';
import { OrganizerPage } from './pages/OrganizerPage';
import { AdminPage } from './pages/AdminPage';
import { EventsManagementPage } from './pages/EventsManagementPage';
import { CreateEventPage, EventFormData } from './pages/CreateEventPage';
import { EventDetailPage } from './pages/EventDetailPage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { Moon, Sun } from 'lucide-react';
import { DevRoleToggle } from './components/DevRoleToggle';
import { getMockProfileForRole } from './mock/mockProfile';

type Page =
  | 'onboarding'
  | 'login'
  | 'feed'
  | 'search'
  | 'project-detail'
  | 'profile'
  | 'messages'
  | 'create'
  | 'organizer'
  | 'admin'
  | 'events-management'
  | 'create-event'
  | 'event-detail'
  | 'architecture';

type UserRole = 'user' | 'organizer' | 'admin';

export default function App() {
  const [currentPage, setCurrentPage] = React.useState<Page>('feed');
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = React.useState<string | null>(null);
  const [eventToEdit, setEventToEdit] = React.useState<EventFormData | undefined>(undefined);
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(false);

  // TODO: Get auth status and user role from backend
  // const { isLoggedIn, userRole } = await checkAuth();
  // GET /api/auth/me - Returns { user: {...}, role: 'user' | 'organizer' | 'admin' }
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  
  // TODO: Get role from backend. Use DevRoleToggle for testing different views
  const [userRole, setUserRole] = React.useState<UserRole>('user');

  // Get mock profile based on current role (for dev mode only)
  const mockProfile = React.useMemo(() => {
    return isLoggedIn ? getMockProfileForRole(userRole) : undefined;
  }, [isLoggedIn, userRole]);

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // TODO: Replace with actual backend integration
  // Microservices endpoints:
  // - GET /api/auth/status - Check if user is logged in
  // - GET /api/auth/me - Get user info and role
  // - GET /api/projects - Fetch projects list
  // - GET /api/projects/:id - Fetch project details
  // - GET /api/profile - Fetch user profile
  // - GET /api/messages - Fetch messages
  // - POST /api/projects - Create new project
  // - GET /api/search - Search projects
  // - GET /api/admin/* - Admin endpoints (requires admin role)
  // - GET /api/events/* - Events management endpoints (requires organizer/admin role)
  // - GET /api/events/:id/projects - Get projects for specific event
  // - POST /api/events - Create new event (requires organizer/admin role)
  // - PUT /api/events/:id - Update event (requires organizer/admin role)
  // - DELETE /api/events/:id - Delete event (requires admin role)

  const handleProjectClick = (projectId: string) => {
    setSelectedProjectId(projectId);
    setCurrentPage('project-detail');
  };

  const handleNavigation = (page: string) => {
    if (page === 'feed') setCurrentPage('feed');
    else if (page === 'search') setCurrentPage('search');
    else if (page === 'create') setCurrentPage('create');
    else if (page === 'messages') setCurrentPage('messages');
    else if (page === 'profile') setCurrentPage('profile');
  };

  // Show onboarding or login if requested
  if (showOnboarding) {
    return (
      <OnboardingPage
        onComplete={(role) => {
          setShowOnboarding(false);
          setIsLoggedIn(true);
          setUserRole(role);
          setCurrentPage('feed');
          // TODO: Set user role from backend response after registration
          // POST /api/auth/register returns { user, token, role }
        }}
        onLogin={() => {
          setShowOnboarding(false);
          setCurrentPage('login');
        }}
      />
    );
  }

  if (currentPage === 'login') {
    return (
      <LoginPage
        onLogin={() => {
          setIsLoggedIn(true);
          setCurrentPage('feed');
          // TODO: Set user role from backend response after login
          // POST /api/auth/login returns { user, token, role }
          // setUserRole(response.role);
        }}
        onCreateAccount={() => {
          setShowOnboarding(true);
        }}
        onBack={() => setCurrentPage('feed')}
      />
    );
  }

  // Main pages that should show mobile nav
  const showMobileNav = ['feed', 'search', 'create', 'messages', 'profile'].includes(currentPage);

  return (
    <div className="relative min-h-screen">
      {/* Floating Dark Mode Toggle - Only on Feed Page */}
      {currentPage === 'feed' && (
        <div className="fixed top-4 right-4 z-50">
          <GlassButton
            variant="ghost"
            size="sm"
            onClick={() => setDarkMode(!darkMode)}
            className="shadow-lg"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </GlassButton>
        </div>
      )}

      {/* Dev Role Toggle - Set enabled={false} in production */}
      <DevRoleToggle 
        currentRole={userRole} 
        onRoleChange={setUserRole}
        isLoggedIn={isLoggedIn}
        onLoginToggle={setIsLoggedIn}
        enabled={true} // TODO: Set to false for production or use env variable
      />

      {/* Page Content */}
      <main className="min-h-screen">
        {currentPage === 'onboarding' && (
          <OnboardingPage 
            onComplete={() => {
              setIsLoggedIn(true);
              setCurrentPage('feed');
            }} 
          />
        )}
        
        {currentPage === 'feed' && (
          <FeedPage 
            onProjectClick={handleProjectClick}
            onCreateProject={() => setCurrentPage('create')}
            // TODO: Pass projects from backend
            // projects={projects}
          />
        )}

        {currentPage === 'search' && (
          <SearchPage 
            onProjectClick={handleProjectClick}
            // TODO: Pass search results from backend
            // projects={searchResults}
          />
        )}
        
        {currentPage === 'project-detail' && selectedProjectId && (
          <ProjectDetailPage
            projectId={selectedProjectId}
            onBack={() => setCurrentPage('feed')}
            onApply={() => setCurrentPage('messages')}
            // TODO: Pass project from backend
            // project={project}
          />
        )}
        
        {currentPage === 'profile' && (
          <ProfilePage 
            isOwnProfile={true}
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            onLogin={() => setCurrentPage('login')}
            onCreateAccount={() => setShowOnboarding(true)}
            onManageEvents={() => setCurrentPage('events-management')}
            profile={mockProfile} // Dev mode: use mock profile when logged in
            // TODO: Pass real profile from backend
            // profile={profile}
          />
        )}
        
        {currentPage === 'messages' && (
          <MessagesPage
            // TODO: Pass messages from backend
            // threads={threads}
            // messages={messages}
            // invites={invites}
          />
        )}
        
        {currentPage === 'create' && (
          <CreateProjectPage
            onComplete={() => setCurrentPage('feed')}
            onCancel={() => setCurrentPage('feed')}
          />
        )}
        
        {currentPage === 'organizer' && (
          <OrganizerPage
            // TODO: Pass organizer data from backend
            // eventData={eventData}
            // teams={teams}
            // skillsHeatmap={skillsHeatmap}
          />
        )}
        
        {currentPage === 'admin' && (
          <AdminPage
            // TODO: Pass admin data from backend
            // stats={stats}
            // pendingProjects={pendingProjects}
            // pendingProfiles={pendingProfiles}
            // skillsTags={skillsTags}
          />
        )}

        {currentPage === 'events-management' && (
          <EventsManagementPage
            userRole={userRole === 'admin' ? 'admin' : 'organizer'}
            onBack={() => setCurrentPage('profile')}
            onCreateEvent={() => {
              setEventToEdit(undefined);
              setCurrentPage('create-event');
            }}
            onViewEvent={(eventId) => {
              setSelectedEventId(eventId);
              setCurrentPage('event-detail');
            }}
            // TODO: Pass events data from backend microservice
            // GET /api/events/management - Returns { stats, events }
            // GET /api/events/:eventId/projects - Returns projects for each event
            // stats={eventsStats}
            // events={events}
            // projects={eventProjects}
          />
        )}

        {currentPage === 'create-event' && (
          <CreateEventPage
            onComplete={(eventData) => {
              // TODO: Send to backend
              // POST /api/events (if new) or PUT /api/events/:id (if editing)
              console.log('Event created/updated:', eventData);
              setCurrentPage('events-management');
            }}
            onCancel={() => setCurrentPage('events-management')}
            eventToEdit={eventToEdit}
          />
        )}

        {currentPage === 'event-detail' && selectedEventId && (
          <EventDetailPage
            eventId={selectedEventId}
            userRole={userRole === 'admin' ? 'admin' : 'organizer'}
            onBack={() => setCurrentPage('events-management')}
            onEdit={() => {
              // TODO: Fetch event data from backend
              // GET /api/events/:id
              // setEventToEdit(eventData);
              setCurrentPage('create-event');
            }}
            onDelete={userRole === 'admin' ? () => {
              // TODO: DELETE /api/events/:id
              console.log('Delete event:', selectedEventId);
              setCurrentPage('events-management');
            } : undefined}
            // TODO: Pass event data from backend
            // eventData={eventData}
          />
        )}
        
        {currentPage === 'architecture' && <ArchitecturePage />}
      </main>

      {/* Mobile Bottom Navigation */}
      {showMobileNav && (
        <MobileNav currentPage={currentPage} onNavigate={handleNavigation} />
      )}
    </div>
  );
}
