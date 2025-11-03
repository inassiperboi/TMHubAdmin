"use client"

import { useState } from "react"
import { Users, Calendar, CheckCircle, ClipboardList } from "lucide-react"
import { useRouter } from "next/navigation"
import Sidebar from "@/components/sidebar"
import UserManagement from "@/components/user-management"
import ScheduleManagement from "@/components/schedule-management"
import AttendanceValidation from "@/components/attendance-validation"
import EmployeeAttendanceData from "@/components/employee-attendance-data"
import Header from "@/components/header"
import { ProtectedLayout } from "@/components/protected-layout"

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
  const stats = [
    { title: "Total Pegawai", value: "248", icon: Users, color: "#1E4471" },
    { title: "Hadir Hari Ini", value: "186", icon: CheckCircle, color: "#2AB77A" },
    { title: "Schedule Aktif", value: "12", icon: Calendar, color: "#FFE16A" },
    { title: "Pending Validasi", value: "8", icon: ClipboardList, color: "#2AB27B" },
  ]

  const recentActivity = [
    { name: "Budi Santoso", action: "Clock In", time: "08:15 AM", status: "valid" },
    { name: "Siti Rahma", action: "Clock Out", time: "05:30 PM", status: "valid" },
    { name: "Ahmad Fauzi", action: "Clock In", time: "09:45 AM", status: "pending" },
    { name: "Dewi Lestari", action: "Clock In", time: "08:05 AM", status: "valid" },
  ]

  return (
    <div className="p-8">
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
                    <p className="text-3xl font-bold text-[#1E4471]">{stat.value}</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 border border-[#E5E7EB]">
          <h3 className="text-lg font-semibold text-[#1E4471] mb-4">Aktivitas Terbaru</h3>
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between py-3 border-b last:border-b-0 border-[#E5E7EB]"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#2AB77A] to-[#1E4471] rounded-full flex items-center justify-center text-white font-semibold text-sm">
                    {activity.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-[#1E4471] text-sm">{activity.name}</p>
                    <p className="text-xs text-[#9B9B9B]">{activity.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#9B9B9B]">{activity.time}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      activity.status === "valid" ? "bg-[#2AB77A]/10 text-[#2AB77A]" : "bg-[#FFE16A]/20 text-[#FFE16A]"
                    }`}
                  >
                    {activity.status === "valid" ? "Valid" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 border border-[#E5E7EB]">
          <h3 className="text-lg font-semibold text-[#1E4471] mb-4">Statistik Kehadiran Minggu Ini</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[#9B9B9B]">Hadir</span>
                <span className="text-sm font-semibold text-[#1E4471]">85%</span>
              </div>
              <div className="w-full bg-[#E5E7EB] rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-[#2AB77A] to-[#2AB27B] h-3 rounded-full"
                  style={{ width: "85%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[#9B9B9B]">Terlambat</span>
                <span className="text-sm font-semibold text-[#1E4471]">10%</span>
              </div>
              <div className="w-full bg-[#E5E7EB] rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-[#FFE16A] to-[#FFD700] h-3 rounded-full"
                  style={{ width: "10%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[#9B9B9B]">Tidak Hadir</span>
                <span className="text-sm font-semibold text-[#1E4471]">5%</span>
              </div>
              <div className="w-full bg-[#E5E7EB] rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-red-400 to-red-500 h-3 rounded-full"
                  style={{ width: "5%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
  