"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { queryUsers } from "../../lib/supabase/client"
import { LogIn } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const user = await queryUsers(username)

      if (!user) {
        setError("Username atau password salah")
        setLoading(false)
        return
      }

      // Simple password comparison (in production, use bcrypt)
      if (user.password !== password) {
        setError("Username atau password salah")
        setLoading(false)
        return
      }

      // Store user data in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: user.id_users,
          nama: user.nama_users,
          username: user.username,
        }),
      )

      router.push("/")
    } catch (err) {
      setError("Terjadi kesalahan saat login")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1E4471] to-[#2AB77A] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-[#1E4471] to-[#2AB77A] rounded-lg">
                <LogIn className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold text-[#1E4471]">Admin Panel</h1>
                <p className="text-sm text-[#9B9B9B]">Sistem Absensi</p>
              </div>
            </div>
            <p className="text-[#9B9B9B] text-sm mt-4">Masukkan kredensial Anda untuk masuk</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1E4471] mb-2">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2AB77A] focus:border-transparent transition"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1E4471] mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2AB77A] focus:border-transparent transition"
                disabled={loading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-[#1E4471] to-[#2AB77A] text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Sedang masuk..." : "Masuk"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[#9B9B9B] text-xs mt-6">© 2025 Admin Absensi. Semua hak dilindungi.</p>
        </div>
      </div>
    </div>
  )
}
