import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { subjects } from '../data/subjects'
import confetti from 'canvas-confetti'

export default function AttendancePage({ session }) {
  const [attendanceData, setAttendanceData] = useState({})
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [stats, setStats] = useState({})

  const fetchAttendance = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('attendance')
        .select('*')
        .eq('student_email', session.user.email)
        .order('created_at', { ascending: true })

      if (error) throw error

      // Convert to object for easier lookup: { subjectId: status }
      const dataMap = {}
      const statsMap = {}

      subjects.forEach((subject) => {
        const subjectRecords = data.filter((record) => record.subject === subject.id)
        const presentCount = subjectRecords.filter((r) => r.status === 'present').length
        const totalCount = subjectRecords.length

        statsMap[subject.id] = {
          present: presentCount,
          total: totalCount,
          percentage: totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0,
          streak: calculateStreak(subjectRecords),
        }

        // Get latest status
        if (subjectRecords.length > 0) {
          dataMap[subject.id] = subjectRecords[subjectRecords.length - 1].status
        }
      })

      setAttendanceData(dataMap)
      setStats(statsMap)
    } catch (error) {
      console.error('Error fetching attendance:', error)
    } finally {
      setLoading(false)
    }
  }, [session.user.email])

  // Fetch current attendance records on mount
  useEffect(() => {
    fetchAttendance()
  }, [fetchAttendance])

  const calculateStreak = (records) => {
    if (records.length === 0) return 0

    let streak = 0
    for (let i = records.length - 1; i >= 0; i--) {
      if (records[i].status === 'present') {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  const handleAttendance = async (subjectId, status) => {
    setSuccessMessage('')

    try {
      const currentStatus = attendanceData[subjectId]

      if (currentStatus) {
        // Update existing record
        const { error } = await supabase
          .from('attendance')
          .update({ status, updated_at: new Date() })
          .eq('student_email', session.user.email)
          .eq('subject', subjectId)

        if (error) throw error
      } else {
        // Insert new record
        const { error } = await supabase
          .from('attendance')
          .insert([
            {
              student_email: session.user.email,
              subject: subjectId,
              status,
            },
          ])

        if (error) throw error
      }

      // Update local state
      setAttendanceData((prev) => ({
        ...prev,
        [subjectId]: status,
      }))

      // Update stats
      setStats((prev) => {
        const newStats = { ...prev }
        const oldStatus = attendanceData[subjectId]

        if (status === 'present') {
          newStats[subjectId].present += oldStatus === 'present' ? 0 : 1
          newStats[subjectId].present -= oldStatus === 'absent' ? 1 : 0
        } else {
          newStats[subjectId].present -= oldStatus === 'present' ? 1 : 0
        }

        newStats[subjectId].total = Math.max(newStats[subjectId].total, 1)
        newStats[subjectId].percentage = Math.round(
          (newStats[subjectId].present / newStats[subjectId].total) * 100
        )
        newStats[subjectId].streak =
          status === 'present' ? (newStats[subjectId].streak || 0) + 1 : 0

        return newStats
      })

      // Show success message with confetti if marked present
      if (status === 'present') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
        setSuccessMessage('🎉 Great! You\'re all set for this class!')
      } else {
        setSuccessMessage('✓ Absence recorded')
      }

      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Error updating attendance:', error)
      setSuccessMessage('✗ Error updating attendance')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-500">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-red-500 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-5xl font-bold text-white flex items-center gap-3">
              🏆 Attendance Tracker
            </h1>
            <p className="text-red-100 mt-2 text-lg">{session.user.email}</p>
          </div>
          <button
            onClick={() => supabase.auth.signOut()}
            className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition font-semibold shadow-lg"
          >
            Sign Out
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-8 p-4 bg-green-100 border-2 border-green-400 text-green-700 rounded-xl text-center font-bold text-lg animate-bounce shadow-lg">
            {successMessage}
          </div>
        )}

        {/* Subjects Grid - Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {subjects.map((subject) => {
            const currentStatus = attendanceData[subject.id]
            const subjectStats = stats[subject.id] || {
              present: 0,
              total: 0,
              percentage: 0,
              streak: 0,
            }

            return (
              <div
                key={subject.id}
                className={`rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition transform hover:scale-105 border-2 ${subject.borderColor}`}
              >
                {/* Gradient Header with Icon */}
                <div className={`bg-gradient-to-r ${subject.color} p-10 text-white`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="text-7xl mb-4">{subject.icon}</div>
                      <h2 className="text-4xl font-bold mb-2">{subject.name}</h2>
                      <p className="text-white/90 text-lg font-medium">
                        📅 {subject.day}
                      </p>
                      <p className="text-white/90 text-lg font-medium">
                        🕐 {subject.time}
                      </p>
                    </div>
                    {currentStatus && (
                      <div
                        className={`px-6 py-3 rounded-2xl text-sm font-bold text-xl whitespace-nowrap ml-4 ${currentStatus === 'present'
                          ? 'bg-green-400 text-white shadow-lg'
                          : 'bg-red-400 text-white shadow-lg'
                          }`}
                      >
                        {currentStatus === 'present' ? '✓ Present' : '✗ Absent'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className={`p-8 ${subject.bgColor}`}>
                  {/* Stats Row - 3 columns */}
                  <div className="grid grid-cols-3 gap-4 mb-8">
                    {/* Attendance Percentage */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-blue-200 text-center hover:shadow-lg transition hover:scale-105">
                      <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mb-2">
                        📊 Attendance
                      </p>
                      <p className="text-4xl font-bold text-blue-600">
                        {subjectStats.percentage}%
                      </p>
                    </div>

                    {/* Classes Attended */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-green-200 text-center hover:shadow-lg transition hover:scale-105">
                      <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mb-2">
                        ✓ Classes
                      </p>
                      <p className="text-4xl font-bold text-green-600">
                        {subjectStats.present}/{subjectStats.total}
                      </p>
                    </div>

                    {/* Streak */}
                    <div className="bg-white p-6 rounded-2xl shadow-md border-2 border-orange-200 text-center hover:shadow-lg transition hover:scale-105">
                      <p className="text-xs text-gray-600 font-bold uppercase tracking-widest mb-2">
                        🔥 Streak
                      </p>
                      <p className="text-4xl font-bold text-orange-600">
                        {subjectStats.streak}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-bold text-gray-700">Overall Progress</p>
                      <p className="text-sm font-bold text-gray-600 bg-white px-3 py-1 rounded-lg">
                        {subjectStats.percentage}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-4 overflow-hidden shadow-md">
                      <div
                        className={`bg-gradient-to-r ${subject.color} h-4 rounded-full transition-all duration-500`}
                        style={{ width: `${subjectStats.percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAttendance(subject.id, 'present')}
                      className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition transform hover:scale-105 shadow-lg ${currentStatus === 'present'
                        ? `bg-gradient-to-r from-green-400 to-green-500 text-white`
                        : 'bg-white text-green-600 border-2 border-green-300 hover:bg-green-50'
                        }`}
                    >
                      ✓ Present
                    </button>
                    <button
                      onClick={() => handleAttendance(subject.id, 'absent')}
                      className={`flex-1 py-4 px-6 rounded-2xl font-bold text-lg transition transform hover:scale-105 shadow-lg ${currentStatus === 'absent'
                        ? `bg-gradient-to-r from-red-400 to-red-500 text-white`
                        : 'bg-white text-red-600 border-2 border-red-300 hover:bg-red-50'
                        }`}
                    >
                      ✗ Absent
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="text-center text-white/70 text-sm">
          <p>Keep up the great work! Track your attendance and improve your grades 📈</p>
        </div>
      </div>
    </div>
  )
}