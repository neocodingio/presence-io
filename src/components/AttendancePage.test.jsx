import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AttendancePage from './AttendancePage'
import { supabase } from '../lib/supabaseClient'
import { subjects } from '../data/subjects'

// Mock supabase
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => ({
            data: [],
            error: null,
          })),
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            eq: vi.fn(() => ({
              error: null,
            })),
          })),
        })),
        insert: vi.fn(() => ({
          error: null,
        })),
      })),
    })),
    auth: {
      signOut: vi.fn(),
    },
  },
}))

// Mock confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}))

describe('AttendancePage', () => {
  const mockSession = {
    user: {
      email: 'test@example.com',
    },
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render loading state initially', () => {
    // Mock a delayed response
    const mockQuery = {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => new Promise(() => { })), // Never resolves
        })),
      })),
    }
    supabase.from.mockReturnValue(mockQuery)

    render(<AttendancePage session={mockSession} />)

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should render all subjects with attendance buttons', async () => {
    const mockQuery = {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    }
    supabase.from.mockReturnValue(mockQuery)

    render(<AttendancePage session={mockSession} />)

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Check that all subjects are rendered
    subjects.forEach((subject) => {
      expect(screen.getByText(subject.name)).toBeInTheDocument()
      expect(screen.getByText(new RegExp(subject.day, 'i'))).toBeInTheDocument()
    })

    // Check that Present and Absent buttons are rendered for each subject
    const presentButtons = screen.getAllByRole('button', { name: /present/i })
    const absentButtons = screen.getAllByRole('button', { name: /absent/i })

    expect(presentButtons).toHaveLength(subjects.length)
    expect(absentButtons).toHaveLength(subjects.length)
  })

  it('should calculate and display attendance statistics correctly', async () => {
    const mockAttendanceData = [
      {
        id: 1,
        student_email: 'test@example.com',
        subject: 'devops',
        status: 'present',
        created_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 2,
        student_email: 'test@example.com',
        subject: 'devops',
        status: 'present',
        created_at: '2024-01-02T00:00:00Z',
      },
      {
        id: 3,
        student_email: 'test@example.com',
        subject: 'devops',
        status: 'absent',
        created_at: '2024-01-03T00:00:00Z',
      },
    ]

    const mockQuery = {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: mockAttendanceData, error: null })),
        })),
      })),
    }
    supabase.from.mockReturnValue(mockQuery)

    render(<AttendancePage session={mockSession} />)

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Check that statistics are displayed
    // 2 present out of 3 total = 66% (rounded)
    const percentageElements = screen.getAllByText(/66%|67%/i)
    expect(percentageElements.length).toBeGreaterThan(0)

    // Check that streak is calculated (should be 0 since last record is absent)
    const streakElements = screen.getAllByText(/0/i)
    expect(streakElements.length).toBeGreaterThan(0)
  })

  it('should handle marking attendance as present', async () => {
    const user = userEvent.setup()
    const mockQuery = {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ error: null })),
        })),
      })),
      insert: vi.fn(() => Promise.resolve({ error: null })),
    }
    supabase.from.mockReturnValue(mockQuery)

    render(<AttendancePage session={mockSession} />)

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    const presentButtons = screen.getAllByRole('button', { name: /present/i })
    await user.click(presentButtons[0])

    await waitFor(() => {
      expect(screen.getByText(/great! you're all set/i)).toBeInTheDocument()
    })
  })

  it('should have red background color on the main page', async () => {
    const mockQuery = {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => Promise.resolve({ data: [], error: null })),
        })),
      })),
    }
    supabase.from.mockReturnValue(mockQuery)

    const { container } = render(<AttendancePage session={mockSession} />)

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
    })

    // Find the main container div with min-h-screen
    const mainContainer = container.querySelector('.min-h-screen.bg-red-500')
    expect(mainContainer).toBeInTheDocument()
    expect(mainContainer?.className).toContain('bg-red-500')
  })

  it('should have red background color on the loading state', () => {
    // Mock a delayed response
    const mockQuery = {
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          order: vi.fn(() => new Promise(() => { })), // Never resolves
        })),
      })),
    }
    supabase.from.mockReturnValue(mockQuery)

    const { container } = render(<AttendancePage session={mockSession} />)

    // Find the loading container div
    const loadingContainer = container.querySelector('.min-h-screen.bg-red-500')
    expect(loadingContainer).toBeInTheDocument()
    expect(loadingContainer?.className).toContain('bg-red-500')
  })
})
