import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import App from './App'
import { supabase } from './lib/supabaseClient'

// Mock supabase
vi.mock('./lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      })),
    },
  },
}))

// Mock components
vi.mock('./components/LoginPage', () => ({
  default: () => <div>Login Page</div>,
}))

vi.mock('./components/AttendancePage', () => ({
  default: ({ session }) => <div>Attendance Page - {session?.user?.email}</div>,
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state while checking session', () => {
    // Mock a delayed response
    supabase.auth.getSession.mockReturnValue(
      new Promise(() => {}) // Never resolves
    )

    render(<App />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should render LoginPage when user is not authenticated', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/login page/i)).toBeInTheDocument()
    })
  })

  it('should render AttendancePage when user is authenticated', async () => {
    const mockSession = {
      user: {
        email: 'test@example.com',
      },
    }

    supabase.auth.getSession.mockResolvedValue({
      data: { session: mockSession },
    })

    render(<App />)

    await waitFor(() => {
      expect(screen.getByText(/attendance page/i)).toBeInTheDocument()
      expect(screen.getByText(/test@example.com/i)).toBeInTheDocument()
    })
  })

  it('should set up auth state change listener on mount', async () => {
    supabase.auth.getSession.mockResolvedValue({
      data: { session: null },
    })

    render(<App />)

    await waitFor(() => {
      expect(supabase.auth.onAuthStateChange).toHaveBeenCalled()
    })
  })
})
