import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from './LoginPage'

// Mock supabase
const mockSignInWithOtp = vi.fn()
vi.mock('../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      get signInWithOtp() {
        return mockSignInWithOtp
      },
    },
  },
}))

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSignInWithOtp.mockClear()
  })

  it('should render login form with email input and submit button', () => {
    render(<LoginPage />)

    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in with email/i })).toBeInTheDocument()
    expect(screen.getByText(/attendance tracker/i)).toBeInTheDocument()
  })

  it('should display success message when email is sent successfully', async () => {
    const user = userEvent.setup()
    mockSignInWithOtp.mockResolvedValue({ error: null })

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/you@example.com/i)
    const submitButton = screen.getByRole('button', { name: /sign in with email/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/check your email for the magic link/i)).toBeInTheDocument()
    })

    expect(mockSignInWithOtp).toHaveBeenCalledWith({
      email: 'test@example.com',
      options: {
        emailRedirectTo: expect.any(String),
      },
    })
  })

  it('should display error message when sign in fails', async () => {
    const user = userEvent.setup()
    const errorMessage = 'Invalid email address'

    // Mock the signInWithOtp to return an error
    mockSignInWithOtp.mockResolvedValue({
      error: { message: errorMessage },
      data: null,
    })

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/you@example.com/i)
    const submitButton = screen.getByRole('button', { name: /sign in with email/i })

    // Use a valid email format to pass HTML5 validation, but Supabase will return an error
    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    // Wait for the mock to be called and error to appear
    await waitFor(
      () => {
        expect(mockSignInWithOtp).toHaveBeenCalled()
        // Check for error container with red background
        const errorDiv = document.querySelector('.bg-red-100')
        expect(errorDiv).toBeInTheDocument()
        expect(errorDiv?.textContent).toContain(errorMessage)
      },
      { timeout: 3000 }
    )
  })

  it('should disable submit button while loading', async () => {
    const user = userEvent.setup()
    // Create a promise that we can control
    let resolvePromise
    const promise = new Promise((resolve) => {
      resolvePromise = resolve
    })
    mockSignInWithOtp.mockReturnValue(promise)

    render(<LoginPage />)

    const emailInput = screen.getByPlaceholderText(/you@example.com/i)
    const submitButton = screen.getByRole('button', { name: /sign in with email/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    // Button should show loading state
    expect(screen.getByText(/sending/i)).toBeInTheDocument()
    expect(submitButton).toBeDisabled()

    // Resolve the promise
    resolvePromise({ error: null })
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })
})
