"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Trash2, Edit2, Plus, AlertCircle } from "lucide-react"
import {
  fetchSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
  type Schedule,
} from "@/lib/supabase/schedule-client"

export default function ScheduleManagement() {
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState("")

  const [filters, setFilters] = useState({
    day: "", // nama_hari
    month: "", // month number
    year: "", // year number
  })

  const [formData, setFormData] = useState({
    nama_hari: "",
    tanggal: "",
    di_user: null as string | null,
  })

  useEffect(() => {
    loadSchedules()
  }, [])

  const loadSchedules = async () => {
    setLoading(true)
    setError("")
    const result = await fetchSchedules(1, 100)
    if (result.data.length > 0 || result.total === 0) {
      setSchedules(result.data)
    } else {
      setError("Gagal memuat jadwal")
    }
    setLoading(false)
  }

  const getFilteredSchedules = () => {
    return schedules.filter((schedule) => {
      // Filter by day name (nama_hari)
      if (filters.day && schedule.nama_hari.toLowerCase() !== filters.day.toLowerCase()) {
        return false
      }

      // Filter by month and year
      if (filters.month || filters.year) {
        const scheduleDate = new Date(schedule.tanggal)
        const scheduleMonth = (scheduleDate.getMonth() + 1).toString()
        const scheduleYear = scheduleDate.getFullYear().toString()

        if (filters.month && scheduleMonth !== filters.month) {
          return false
        }

        if (filters.year && scheduleYear !== filters.year) {
          return false
        }
      }

      return true
    })
  }

  const getFilterOptions = () => {
    const days = new Set<string>()
    const months = new Set<string>()
    const years = new Set<string>()

    schedules.forEach((schedule) => {
      days.add(schedule.nama_hari)

      const date = new Date(schedule.tanggal)
      const month = (date.getMonth() + 1).toString().padStart(2, "0")
      const year = date.getFullYear().toString()

      months.add(month)
      years.add(year)
    })

    return {
      days: Array.from(days).sort(),
      months: Array.from(months).sort(),
      years: Array.from(years).sort().reverse(),
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.nama_hari.trim() || !formData.tanggal.trim()) {
      setError("Nama hari dan tanggal harus diisi")
      return
    }

    try {
      if (editingId) {
        const result = await updateSchedule(editingId, {
          nama_hari: formData.nama_hari,
          tanggal: formData.tanggal,
          di_user: formData.di_user,
        })

        if (result.success) {
          setSuccessMessage("Jadwal berhasil diperbarui")
          setTimeout(() => setSuccessMessage(""), 3000)
          setEditingId(null)
          resetForm()
          loadSchedules()
        } else {
          setError(result.error || "Gagal memperbarui jadwal")
        }
      } else {
        const result = await createSchedule({
          nama_hari: formData.nama_hari,
          tanggal: formData.tanggal,
          di_user: formData.di_user,
        })

        if (result.success) {
          setSuccessMessage("Jadwal berhasil ditambahkan")
          setTimeout(() => setSuccessMessage(""), 3000)
          resetForm()
          loadSchedules()
        } else {
          setError(result.error || "Gagal menambahkan jadwal")
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan jadwal")
      console.error("[v0] Form submission error:", err)
    }
  }

  const handleEdit = (schedule: Schedule) => {
    setFormData({
      nama_hari: schedule.nama_hari,
      tanggal: schedule.tanggal,
      di_user: schedule.di_user,
    })
    setEditingId(schedule.id_schedule)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus jadwal ini?")) return

    setError("")
    const result = await deleteSchedule(id)

    if (result.success) {
      setSuccessMessage("Jadwal berhasil dihapus")
      setTimeout(() => setSuccessMessage(""), 3000)
      loadSchedules()
    } else {
      setError(result.error || "Gagal menghapus jadwal")
    }
  }

  const resetForm = () => {
    setFormData({ nama_hari: "", tanggal: "", di_user: null })
    setEditingId(null)
    setShowForm(false)
  }

  const clearFilters = () => {
    setFilters({ day: "", month: "", year: "" })
  }

  const filteredSchedules = getFilteredSchedules()
  const filterOptions = getFilterOptions()

  return (
    <div className="p-8 bg-[#F8F9FA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1E4471]">Kelola Jadwal</h1>
            <p className="text-[#9B9B9B] mt-1">Kelola jadwal kerja karyawan</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#1E4471] text-white rounded-lg hover:bg-[#163855] transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Tambah Jadwal
          </button>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-[#2AB77A]/10 border border-[#2AB77A] rounded-lg text-[#2AB77A]">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-8 mb-8">
            <h2 className="text-xl font-semibold text-[#1E4471] mb-6">
              {editingId ? "Edit Jadwal" : "Tambah Jadwal Baru"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#1E4471] mb-2">Nama Hari</label>
                  <input
                    type="text"
                    placeholder="contoh: Senin, Selasa, Jum'at"
                    value={formData.nama_hari}
                    onChange={(e) => setFormData({ ...formData, nama_hari: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1E4471] focus:ring-1 focus:ring-[#1E4471] text-[#1E4471]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1E4471] mb-2">Tanggal</label>
                  <input
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1E4471] focus:ring-1 focus:ring-[#1E4471] text-[#1E4471]"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#2AB77A] text-white rounded-lg hover:bg-[#239068] transition-colors font-medium"
                >
                  {editingId ? "Perbarui" : "Simpan"} Jadwal
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 bg-[#E5E7EB] text-[#1E4471] rounded-lg hover:bg-[#D1D5DB] transition-colors font-medium"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        )}

        {!loading && schedules.length > 0 && (
          <>
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Day Filter */}
              <div>
                <select
                  value={filters.day}
                  onChange={(e) => setFilters({ ...filters, day: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1E4471] text-foreground"
                >
                  <option value="">Semua Hari</option>
                  {filterOptions.days.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month Filter */}
              <div>
                <select
                  value={filters.month}
                  onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1E4471] text-foreground"
                >
                  <option value="">Semua Bulan</option>
                  {filterOptions.months.map((month) => {
                    const monthName = new Date(2025, Number.parseInt(month) - 1).toLocaleDateString("id-ID", {
                      month: "long",
                    })
                    return (
                      <option key={month} value={month}>
                        {monthName}
                      </option>
                    )
                  })}
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <select
                  value={filters.year}
                  onChange={(e) => setFilters({ ...filters, year: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1E4471] text-foreground"
                >
                  <option value="">Semua Tahun</option>
                  {filterOptions.years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(filters.day || filters.month || filters.year) && (
              <div className="mb-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="text-sm px-4 py-2 text-[#1E4471] hover:bg-[#1E4471]/10 rounded transition-colors"
                >
                  Hapus Filter
                </button>
              </div>
            )}
          </>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-[#9B9B9B]">Memuat jadwal...</div>
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-[#E5E7EB]">
            <p className="text-[#9B9B9B] text-lg">Belum ada jadwal. Buat jadwal baru untuk memulai.</p>
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-[#E5E7EB]">
            <p className="text-[#9B9B9B] text-lg">Tidak ada jadwal yang sesuai dengan filter.</p>
          </div>
        ) : (
          /* Schedules Table */
          <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#F8F9FA]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E4471]">No</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E4471]">Nama Hari</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E4471]">Tanggal</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E4471]">Dibuat</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#1E4471]">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map((schedule, index) => {
                    const createdDate = new Date(schedule.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                    return (
                      <tr
                        key={schedule.id_schedule}
                        className="border-b border-[#E5E7EB] hover:bg-[#F8F9FA] transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-[#1E4471] font-medium">{index + 1}</td>
                        <td className="px-6 py-4 text-sm text-[#1E4471]">{schedule.nama_hari}</td>
                        <td className="px-6 py-4 text-sm text-[#1E4471]">{schedule.tanggal}</td>
                        <td className="px-6 py-4 text-sm text-[#9B9B9B]">{createdDate}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <button
                              onClick={() => handleEdit(schedule)}
                              className="p-2 text-[#1E4471] hover:bg-[#1E4471]/10 rounded-lg transition-colors"
                              title="Edit jadwal"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(schedule.id_schedule)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Hapus jadwal"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Footer */}
        {!loading && schedules.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-sm text-[#9B9B9B]">
            <span>
              Ditampilkan: {filteredSchedules.length} dari {schedules.length} jadwal
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
