import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import LoginPage from './components/LoginPage'
import AttendancePage from './components/AttendancePage'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session)
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-green-500">Loading...</div>
  }

  return (
    <>
      {!session ? (
        <LoginPage />
      ) : (
        <AttendancePage session={session} />
      )}
    </>
  )
}

export default App
