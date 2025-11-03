"use client"

import { useState, useMemo, useEffect } from "react"
import { ChevronLeft, ChevronRight, X, Calendar, Users, TrendingUp, Loader2 } from "lucide-react"
import { fetchAttendanceData, getStatusColor, getStatusLabel } from "@/lib/supabase/attendance-calendar-client"

interface DetailSchedule {
  id_detail_schedule: number
  status: string
  tanggal: string
  id_user: number
  nama_user: string
  id_schedule: number
  keterangan: string
  created_at: string
}

interface DayAttendance {
  date: string
  attendances: DetailSchedule[]
}

export default function AttendanceCalendar() {
  const [attendanceData, setAttendanceData] = useState<DetailSchedule[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date(2025, 9, 1))
  const [selectedDayDetails, setSelectedDayDetails] = useState<DayAttendance | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const data = await fetchAttendanceData()
        setAttendanceData(data)
      } catch (err) {
        console.error("[v0] Error loading attendance data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`
      days.push(dateStr)
    }

    return days
  }, [currentDate])

  const attendanceByDate = useMemo(() => {
    const grouped: Record<string, DetailSchedule[]> = {}

    attendanceData.forEach((record) => {
      const dateStr = record.tanggal
      if (!grouped[dateStr]) {
        grouped[dateStr] = []
      }
      grouped[dateStr].push(record)
    })

    return grouped
  }, [attendanceData])

  const getAttendanceCountForDay = (date: string | null) => {
    if (!date) return 0
    return attendanceByDate[date]?.length || 0
  }

  const getAttendanceStats = (date: string | null) => {
    if (!date) return { hadir: 0, telat: 0, absen: 0 }

    const records = attendanceByDate[date] || []
    return {
      hadir: records.filter((r) => r.status?.toLowerCase().includes("hadir")).length,
      telat: records.filter((r) => r.status?.toLowerCase().includes("telat")).length,
      absen: records.filter((r) => r.status?.toLowerCase().includes("absen")).length,
    }
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const handleDayClick = (date: string | null) => {
    if (!date || !attendanceByDate[date]) return

    setSelectedDayDetails({
      date,
      attendances: attendanceByDate[date],
    })
  }

  const monthName = currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"]

  if (loading) {
    return (
      <div className="p-8 bg-[#F8F9FA] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#2AB77A] animate-spin mx-auto mb-4" />
          <p className="text-[#1E4471] font-semibold">Memuat data absensi...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-[#F8F9FA] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="w-8 h-8 text-[#2AB77A]" />
            <h1 className="text-3xl font-bold text-[#1E4471]">Data Absensi Per Bulan</h1>
          </div>
          <p className="text-[#9B9B9B] mt-1 ml-11">Kelompokkan absensi berdasarkan bulan dan lihat detail harian</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md border border-[#E5E7EB] p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handlePrevMonth}
                  className="p-2 hover:bg-[#F0F0F0] rounded-lg transition-colors"
                  title="Bulan sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5 text-[#1E4471]" />
                </button>

                <h2 className="text-xl font-semibold text-[#1E4471] capitalize flex-1 text-center">{monthName}</h2>

                <button
                  onClick={handleNextMonth}
                  className="p-2 hover:bg-[#F0F0F0] rounded-lg transition-colors"
                  title="Bulan berikutnya"
                >
                  <ChevronRight className="w-5 h-5 text-[#1E4471]" />
                </button>
              </div>

              {/* Day Names */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {dayNames.map((day) => (
                  <div key={day} className="text-center font-semibold text-[#1E4471] text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-2">
                {calendarDays.map((date, idx) => {
                  const count = getAttendanceCountForDay(date)
                  const stats = getAttendanceStats(date)
                  const hasData = count > 0

                  return (
                    <div
                      key={idx}
                      onClick={() => date && handleDayClick(date)}
                      className={`
                        aspect-square rounded-lg border-2 p-2 flex flex-col justify-between transition-all
                        ${!date ? "bg-[#F8F9FA] border-[#E5E7EB]" : ""}
                        ${date && !hasData ? "bg-white border-[#E5E7EB] hover:border-[#1E4471] hover:shadow-md cursor-pointer" : ""}
                        ${date && hasData ? "bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] border-[#2AB77A] cursor-pointer shadow-md hover:shadow-lg" : ""}
                      `}
                    >
                      {date && (
                        <>
                          <div className="text-sm font-bold text-[#1E4471]">{new Date(date).getDate()}</div>
                          {hasData && (
                            <div className="text-xs space-y-0.5">
                              {stats.hadir > 0 && (
                                <div className="text-green-700 font-semibold text-[11px]">{stats.hadir}Hadir</div>
                              )}
                              {stats.telat > 0 && (
                                <div className="text-yellow-700 font-semibold text-[11px]">{stats.telat}Telat</div>
                              )}
                              {stats.absen > 0 && (
                                <div className="text-red-700 font-semibold text-[11px]">{stats.absen}Absen</div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                <div className="text-sm text-[#1E4471] font-semibold mb-3">Keterangan:</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9] border-2 border-[#2AB77A]"></div>
                    <span className="text-sm text-[#9B9B9B]">Ada Presensi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-white border-2 border-[#E5E7EB]"></div>
                    <span className="text-sm text-[#9B9B9B]">Tidak Ada Data</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Summary Card 1 */}
            <div className="bg-white rounded-lg shadow-md border border-[#E5E7EB] p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <Users className="w-5 h-5 text-[#2AB77A]" />
                <h3 className="font-semibold text-[#1E4471]">Ringkasan Bulan</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-[#E5E7EB]">
                  <span className="text-[#9B9B9B] text-sm">Total Presensi:</span>
                  <span className="font-bold text-[#1E4471] text-lg">
                    {Object.values(attendanceByDate).flat().length}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-[#E5E7EB]">
                  <span className="text-[#9B9B9B] text-sm">Total Hari Kerja:</span>
                  <span className="font-bold text-[#1E4471] text-lg">{Object.keys(attendanceByDate).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#9B9B9B] text-sm">Rata-rata per Hari:</span>
                  <span className="font-bold text-[#1E4471] text-lg">
                    {Object.keys(attendanceByDate).length > 0
                      ? Math.round(Object.values(attendanceByDate).flat().length / Object.keys(attendanceByDate).length)
                      : 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Card 2 */}
            <div className="bg-gradient-to-br from-[#1E4471] to-[#163855] rounded-lg shadow-md p-6 text-white hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-5 h-5 text-[#2AB77A]" />
                <div className="text-sm text-white/80">Bulan Aktif</div>
              </div>
              <div className="text-2xl font-bold capitalize">{monthName}</div>
              <div className="text-xs text-white/60 mt-2">Klik tanggal untuk detail</div>
            </div>
          </div>
        </div>

        {selectedDayDetails && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-[#1E4471] to-[#2AB77A] text-white p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Detail Absensi
                  </h3>
                  <p className="text-white/80 text-sm mt-1">
                    {new Date(selectedDayDetails.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedDayDetails(null)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {selectedDayDetails.attendances.map((record) => (
                  <div
                    key={record.id_detail_schedule}
                    className="border-2 border-[#E5E7EB] rounded-lg p-4 hover:border-[#2AB77A] hover:bg-[#F8F9FA] transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-[#1E4471] text-base">{record.nama_user}</h4>
                        <p className="text-sm text-[#9B9B9B] mt-1">{record.keterangan || "Tidak ada keterangan"}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(record.status)}`}>
                        {getStatusLabel(record.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="bg-[#F8F9FA] border-t border-[#E5E7EB] p-4 text-center">
                <div className="text-sm font-semibold text-[#1E4471]">
                  Total Presensi: {selectedDayDetails.attendances.length} Pegawai
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
