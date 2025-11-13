// app/page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Users, Calendar, CheckCircle, ClipboardList } from "lucide-react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import UserManagement from "@/components/user-management"
import ScheduleManagement from "@/components/schedule-management"
import AttendanceValidation from "@/components/attendance-validation"
import EmployeeAttendanceData from "@/components/employee-attendance-data"
import Header from "@/components/header"
import { ProtectedLayout } from "@/components/protected-layout"
import { getTotalEmployees } from "@/lib/supabase/employee-client"
import { getApprovedAttendanceCount, getTodayAttendanceCount, getApprovedIjinCount, getMonthlyAttendanceCounts, getPendingStatusCount } from "@/lib/supabase/detail-schedule-client"
import { addNotification } from "@/lib/supabase/notification-client"

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/login")
  }

  const renderContent = () => {
    switch (activeTab) {
      case "users":
        return <UserManagement />
      case "schedules":
        return <ScheduleManagement />
      case "attendance-validation":
        return <AttendanceValidation />
      case "attendance-data":
        return <EmployeeAttendanceData />
      default:
        return <OverviewDashboard />
    }
  }

  return (
    <ProtectedLayout>
      <div className="flex h-screen bg-[#F8F9FA]">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-auto">{renderContent()}</main>
        </div>
      </div>
    </ProtectedLayout>
  )
}

function OverviewDashboard() {
  const [totalPegawai, setTotalPegawai] = useState<number | null>(null)
  const [approvedToday, setApprovedToday] = useState<number | null>(null)
  const [pendingToday, setPendingToday] = useState<number | null>(null)
  const [ijinApprovedToday, setIjinApprovedToday] = useState<number | null>(null)
  const [monthlyStats, setMonthlyStats] = useState<Array<{ label: string; count: number }>>([])
  const [formTitle, setFormTitle] = useState("")
  const [formKeterangan, setFormKeterangan] = useState("")
  const [submittingForm, setSubmittingForm] = useState(false)
  const [formSuccess, setFormSuccess] = useState("")
  const [todayDate, setTodayDate] = useState("")

  // Set today's date
  useEffect(() => {
    const today = new Date()
    const formattedDate = today.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
    setTodayDate(formattedDate)
  }, [])

  // fetchData extracted so it can be called on mount and when detail_schedule changes
  async function fetchData() {
    const [total, approved, pending, ijinApproved] = await Promise.all([
      getTotalEmployees(),
      getApprovedAttendanceCount(),
      getPendingStatusCount(),
      getApprovedIjinCount(),
    ])
    setTotalPegawai(total)
    setApprovedToday(approved)
    setPendingToday(pending)
    setIjinApprovedToday(ijinApproved)

    // ambil statistik bulanan (6 bulan terakhir) untuk 'Hadir Telah Disetujui'
    const data = await getMonthlyAttendanceCounts(6)
    setMonthlyStats(data)
  }

  useEffect(() => {
    fetchData()

    const handler = () => {
      // when detail_schedule is updated elsewhere, refresh counts
      fetchData()
    }

    window.addEventListener('detailScheduleUpdated', handler)
    return () => window.removeEventListener('detailScheduleUpdated', handler)
  }, [])

  const stats = [
  { title: "Total Pegawai", value: totalPegawai ?? "Loading...", icon: Users, color: "#1E4471" },
  { title: "Hadir Telah Disetujui", value: approvedToday ?? "Loading...", icon: CheckCircle, color: "#2AB77A" },
  { title: "Ijin Telah Disetujui", value: ijinApprovedToday ?? "Loading...", icon: ClipboardList, color: "#2AB27B" },
  { title: "Menunggu Validasi", value: pendingToday ?? "Loading...", icon: Calendar, color: "#FFE16A" },

  ]

  return (
    <div className="p-8">
      {/* --- Header dengan tanggal --- */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1E4471] mb-2">Dashboard Administrasi</h1>
        <p className="text-[#9B9B9B]">{todayDate}</p>
      </div>

      {/* --- Statistik Atas --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={idx}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-all border border-[#E5E7EB] overflow-hidden"
            >
              <div className="h-1 bg-gradient-to-r from-[#2AB77A] to-[#1E4471]"></div>
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#9B9B9B] text-sm mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-[#1E4471]">
                      {stat.value === "Loading..." ? "..." : stat.value}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg" style={{ backgroundColor: stat.color + "20" }}>
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* --- Aktivitas Terbaru & Statistik Mingguan --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-[#E5E7EB]">
          <h3 className="text-lg font-semibold text-[#1E4471] mb-4">Statistik Kehadiran Bulanan</h3>
          <div>
            <MonthlyAttendanceChart data={monthlyStats} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-[#E5E7EB]">
          <h3 className="text-lg font-semibold text-[#1E4471] mb-4">Berita untuk Pegawai</h3>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setFormSuccess("")
              if (!formTitle.trim()) {
                setFormSuccess("Judul wajib diisi")
                return
              }
              setSubmittingForm(true)
              try {
                const res = await addNotification({ judul: formTitle, keterangan: formKeterangan })
                if (res.success) {
                  setFormSuccess('Berita berhasil dikirim')
                  setFormTitle("")
                  setFormKeterangan("")
                  setTimeout(() => setFormSuccess(""), 3000)
                } else {
                  setFormSuccess('Gagal mengirim berita: ' + (res.error || ''))
                }
              } catch (err) {
                setFormSuccess('Gagal mengirim berita')
              } finally {
                setSubmittingForm(false)
              }
            }}
          >
            {formSuccess && (
              <div className="mb-4 p-3 rounded bg-[#2AB77A]/10 text-[#2AB77A]">{formSuccess}</div>
            )}

            <div className="mb-4">
              <label className="block text-sm text-[#1E4471] mb-2">Judul</label>
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1E4471]"
                placeholder="Masukkan judul"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-[#1E4471] mb-2">Keterangan</label>
              <textarea
                value={formKeterangan}
                onChange={(e) => setFormKeterangan(e.target.value)}
                className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1E4471]"
                placeholder="Masukkan keterangan"
                rows={4}
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="submit"
                disabled={submittingForm}
                className="px-4 py-2 bg-[#1E4471] text-white rounded-lg hover:bg-[#163855] disabled:opacity-60"
              >
                {submittingForm ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function ProgressBar({ label, percentage, colorFrom, colorTo }: any) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-sm text-[#9B9B9B]">{label}</span>
        <span className="text-sm font-semibold text-[#1E4471]">{percentage}%</span>
      </div>
      <div className="w-full bg-[#E5E7EB] rounded-full h-3">
        <div
          className="h-3 rounded-full"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(to right, ${colorFrom}, ${colorTo})`,
          }}
        ></div>
      </div>
    </div>
  )
}

function MonthlyAttendanceChart({ data }: { data: Array<{ label: string; count: number }> }) {
  // improved responsive single-series SVG bar chart for 'Hadir Telah Disetujui'
  const max = data.reduce((m, d) => (d.count > m ? d.count : m), 0) || 1

  // layout constants
  const leftMargin = 40
  const rightMargin = 20
  const topMargin = 10
  const bottomMargin = 44
  const chartHeight = 120

  const containerRef = useRef<HTMLDivElement | null>(null)
  const [containerWidth, setContainerWidth] = useState(640)

  useEffect(() => {
    const update = () => {
      const w = containerRef.current?.clientWidth || 640
      setContainerWidth(w)
    }
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [data.length])

  const chartWidth = Math.max(320, containerWidth)
  const groupGap = data.length > 0 ? (chartWidth - leftMargin - rightMargin) / data.length : 0
  const barWidth = Math.min(48, Math.max(12, groupGap * 0.6))

  return (
    <div ref={containerRef} className="w-full overflow-auto">
      {data.length === 0 ? (
        <p className="text-sm text-[#9B9B9B] mt-2">Tidak ada data</p>
      ) : (
        <svg width="100%" height={chartHeight + topMargin + bottomMargin} viewBox={`0 0 ${chartWidth} ${chartHeight + topMargin + bottomMargin}`} preserveAspectRatio="xMinYMin meet" role="img" aria-label="Statistik Kehadiran Bulanan">
          {/* y axis labels */}
          <line x1={leftMargin} x2={chartWidth - rightMargin} y1={topMargin} y2={topMargin} stroke="#E5E7EB" />
          <line x1={leftMargin} x2={leftMargin} y1={topMargin} y2={topMargin + chartHeight} stroke="#E5E7EB" />
          <text x={8} y={topMargin + 12} fontSize={11} fill="#9B9B9B">{max}</text>
          <text x={8} y={topMargin + chartHeight} fontSize={11} fill="#9B9B9B">0</text>

          {data.map((d, i) => {
            const groupX = leftMargin + i * groupGap + (groupGap - barWidth) / 2
            const barHeight = (d.count / max) * chartHeight
            const x = groupX
            const y = topMargin + (chartHeight - barHeight)
            return (
              <g key={d.label}>
                <rect x={x} y={y} width={barWidth} height={barHeight} rx={6} fill="#2AB77A" fillOpacity={0.95} />
                <text x={x + barWidth / 2} y={y - 6} fontSize={11} textAnchor="middle" fill="#1E4471">{d.count}</text>
                <text x={x + barWidth / 2} y={topMargin + chartHeight + 18} fontSize={12} textAnchor="middle" fill="#1E4471">
                  {d.label}
                </text>
              </g>
            )
          })}

          {/* x-axis baseline */}
          <line x1={leftMargin} x2={chartWidth - rightMargin} y1={topMargin + chartHeight} y2={topMargin + chartHeight} stroke="#E5E7EB" />
        </svg>
      )}
    </div>
  )
}
