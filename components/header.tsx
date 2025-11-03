"use client"

import { Bell, Search, LogOut } from "lucide-react"

export default function Header() {
  return (
    <header className="h-20 bg-white shadow-sm border-b border-[#2AB77A]/20 flex items-center justify-between px-8">
      <div>
        <h2 className="text-2xl font-bold text-[#1E4471]">Dashboard Administrasi</h2>
        <p className="text-xs text-[#9B9B9B] mt-1">
          {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="relative hidden md:block">
        <Search className="w-5 h-5 absolute left-3 top-2.5 text-[#9B9B9B]" />
        <input
          type="text"
          placeholder="Cari..."
          className="pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2AB77A] text-sm bg-[#F3F4F6]"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
          <Bell className="w-6 h-6 text-[#1E4471]" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-[#FFE16A] rounded-full"></span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#2AB77A] to-[#1E4471] rounded-full flex items-center justify-center text-white font-bold text-sm">
            AD
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-semibold text-[#1E4471]">Admin User</p>
            <p className="text-xs text-[#9B9B9B]">Administrator</p>
          </div>
        </div>

        <button className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors text-[#1E4471]">
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  )
}
