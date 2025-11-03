"use client"

import { useState } from "react"
import { Home, Users, Calendar, CheckCircle, ClipboardList, LogOut, Menu, X } from "lucide-react"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  onLogout: () => void
}

export default function Sidebar({ activeTab, setActiveTab, onLogout }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems = [
    { id: "overview", label: "Dashboard", icon: Home },
    { id: "users", label: "Kelola User", icon: Users },
    { id: "schedules", label: "Kelola Jadwal", icon: Calendar },
    { id: "attendance-validation", label: "Validasi Absensi", icon: CheckCircle },
    { id: "attendance-data", label: "Data Absensi", icon: ClipboardList },
  ]

  return (
    <div
      className={`${isCollapsed ? "w-20" : "w-64"} bg-[#1E4471] text-white transition-all duration-300 flex flex-col shadow-lg`}
    >
      <div className="flex items-center justify-between p-6 border-b border-[#2AB77A]">
        {!isCollapsed && (
          <div>
            <h1 className="text-2xl font-bold text-white">trustmedis</h1>
            <p className="text-white text-xs mt-1">Sistem Absensi</p>
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-[#2AB77A] hover:text-white rounded-lg transition-colors text-white"
        >
          {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2 mt-6">
        {menuItems.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                activeTab === item.id
                  ? "bg-[#2AB77A] text-white border-l-4 border-[#2AB77A] shadow-md font-semibold"
                  : "bg-white text-black hover:bg-[#F5F5F5] hover:shadow-sm"
              }`}
            >
              <Icon className="w-5 h-5" />
              {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      <div className="p-4 border-t border-[#2AB77A]">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-[#F5F5F5] transition-colors font-medium text-sm"
        >
          <LogOut className="w-4 h-4" />
          {!isCollapsed && "Logout"}
        </button>
      </div>
    </div>
  )
}
