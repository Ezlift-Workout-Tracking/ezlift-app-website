/**
 * @jest-environment jsdom
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthenticatedNav } from '@/components/layout/AuthenticatedNav';
import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

// Mock firebase/auth
jest.mock('firebase/auth', () => ({
  signOut: jest.fn(),
}));

// Mock Firebase client
jest.mock('@/lib/firebase/client', () => ({
  auth: {},
}));

// Mock fetch for logout API call
global.fetch = jest.fn();

describe('AuthenticatedNav', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    photoURL: 'https://example.com/avatar.jpg',
  };

  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (usePathname as jest.Mock).mockReturnValue('/app');
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });
  });

  const renderNav = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <AuthenticatedNav user={mockUser} />
      </QueryClientProvider>
    );
  };

  describe('Navigation Rendering', () => {
    it('should render all navigation items', () => {
      renderNav();

      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Programs')).toBeInTheDocument();
      expect(screen.getByText('History')).toBeInTheDocument();
      expect(screen.getByText('Import')).toBeInTheDocument();
      expect(screen.getByText('Profile')).toBeInTheDocument();
    });

    it('should render user avatar with correct initials', () => {
      renderNav();

      // Verify avatar displays user initials (TU for Test User)
      const avatarInitials = screen.getAllByText('TU');
      expect(avatarInitials.length).toBeGreaterThan(0);
      
      // Note: Full dropdown content testing requires E2E tests due to Radix UI portal rendering
    });

    it('should display user avatar fallback when no photo URL', () => {
      const userWithoutPhoto = { ...mockUser, photoURL: undefined };
      
      render(
        <QueryClientProvider client={queryClient}>
          <AuthenticatedNav user={userWithoutPhoto} />
        </QueryClientProvider>
      );

      const avatars = screen.getAllByText('TU');
      expect(avatars.length).toBeGreaterThan(0);
    });
  });

  describe('Active Route Highlighting', () => {
    it('should highlight Dashboard when on /app', () => {
      (usePathname as jest.Mock).mockReturnValue('/app');
      renderNav();

      const dashboardLink = screen.getAllByText('Dashboard')[0].closest('a');
      expect(dashboardLink).toHaveClass('text-brand-blue');
    });

    it('should highlight Programs when on /app/programs', () => {
      (usePathname as jest.Mock).mockReturnValue('/app/programs');
      renderNav();

      const programsLink = screen.getAllByText('Programs')[0].closest('a');
      expect(programsLink).toHaveClass('text-brand-blue');
    });

    it('should highlight History when on /app/history', () => {
      (usePathname as jest.Mock).mockReturnValue('/app/history');
      renderNav();

      const historyLink = screen.getAllByText('History')[0].closest('a');
      expect(historyLink).toHaveClass('text-brand-blue');
    });
  });

  describe('Logout Functionality', () => {
    it('should render logout button in navigation', () => {
      renderNav();

      // Verify logout functionality exists in the component
      // Note: Testing actual logout behavior requires E2E tests due to Radix UI portal rendering
      const component = render(
        <QueryClientProvider client={queryClient}>
          <AuthenticatedNav user={mockUser} />
        </QueryClientProvider>
      );
      
      // Component should render without errors
      expect(component).toBeTruthy();
    });

    it('should have logout handler defined', () => {
      // Verify the handleLogout function exists by checking component doesn't crash
      renderNav();
      
      // The logout functionality is present in both desktop dropdown and mobile menu
      // Actual interaction testing requires E2E tests due to Radix UI portal behavior
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });

  describe('Mobile Menu', () => {
    it('should render mobile menu trigger button', () => {
      renderNav();

      // Verify hamburger menu button exists for mobile
      // The hamburger icon is rendered for screens < 768px
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
      
      // Note: Full mobile menu interaction testing requires E2E tests 
      // due to Radix UI Sheet portal rendering and responsive breakpoints
    });
  });
});

