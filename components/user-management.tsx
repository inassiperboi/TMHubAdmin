"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Trash2, Edit2, Plus, AlertCircle, Search, Eye, EyeOff } from "lucide-react"
import {
  fetchEmployees,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  type Employee,
} from "@/lib/supabase/employee-client"

export default function UserManagement() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [search, setSearch] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [filterJabatan, setFilterJabatan] = useState("")
  const [uniqueJabatan, setUniqueJabatan] = useState<string[]>([])

  const [formData, setFormData] = useState({
    nama_user: "",
    email: "",
    password: "",
    alamat: "",
    no_telp: "",
    no_karyawan: "",
    jabatan: "",
    no_rekening: "",
  })

  useEffect(() => {
    loadEmployees()
  }, [search, filterJabatan])

  const loadEmployees = async () => {
    setLoading(true)
    setError("")
    const result = await fetchEmployees(1, 100, search)
    if (result.data.length > 0 || result.total === 0) {
      // Filter berdasarkan jabatan jika ada filter yang dipilih
      const filteredData = filterJabatan
        ? result.data.filter((emp: Employee) => emp.jabatan === filterJabatan)
        : result.data
      
      setEmployees(filteredData)
      
      // Mengumpulkan daftar jabatan unik
      const jabatanList = Array.from(new Set(result.data.map((emp: Employee) => emp.jabatan)))
      setUniqueJabatan(jabatanList as string[])
    } else {
      setError("Gagal memuat data pegawai")
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validasi required fields
    if (!formData.nama_user.trim() || !formData.jabatan.trim()) {
      setError("Nama dan Jabatan harus diisi")
      return
    }

    // Validasi email dan password hanya untuk tambah baru
    if (!editingId) {
      if (!formData.email.trim()) {
        setError("Email harus diisi untuk pegawai baru")
        return
      }
      if (!formData.password.trim()) {
        setError("Password harus diisi untuk pegawai baru")
        return
      }
    }

    try {
      if (editingId) {
        // Untuk update, hanya kirim field yang bisa diubah (tidak termasuk email dan password)
        const updatePayload = {
          nama_user: formData.nama_user,
          alamat: formData.alamat,
          no_telp: formData.no_telp ? Number(formData.no_telp) : 0,
          no_karyawan: formData.no_karyawan,
          jabatan: formData.jabatan,
          no_rekening: formData.no_rekening,
        }

        const result = await updateEmployee(editingId, updatePayload)
        if (result.success) {
          setSuccessMessage("Data pegawai berhasil diperbarui")
          setTimeout(() => setSuccessMessage(""), 3000)
          setEditingId(null)
          resetForm()
          loadEmployees()
        } else {
          setError(result.error || "Gagal memperbarui data pegawai")
        }
      } else {
        // Untuk tambah baru, kirim semua data termasuk email dan password
        const payload = {
          nama_user: formData.nama_user,
          email: formData.email,
          password: formData.password,
          alamat: formData.alamat,
          no_telp: formData.no_telp ? Number(formData.no_telp) : 0,
          no_karyawan: formData.no_karyawan,
          jabatan: formData.jabatan,
          no_rekening: formData.no_rekening,
        }

        const result = await addEmployee(payload)
        if (result.success) {
          setSuccessMessage("Data pegawai berhasil ditambahkan")
          setTimeout(() => setSuccessMessage(""), 3000)
          resetForm()
          loadEmployees()
        } else {
          setError(result.error || "Gagal menambahkan data pegawai")
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan data pegawai")
      console.error("Form submission error:", err)
    }
  }

  const handleEdit = (employee: Employee) => {
    setFormData({
      nama_user: employee.nama_user,
      email: employee.email,
      password: "********", // Placeholder untuk menunjukkan password tidak bisa diubah
      alamat: employee.alamat,
      no_telp: employee.no_telp ? employee.no_telp.toString() : "",
      no_karyawan: employee.no_karyawan,
      jabatan: employee.jabatan,
      no_rekening: employee.no_rekening,
    })
    setEditingId(employee.id_user)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data pegawai ini?")) return

    setError("")
    const result = await deleteEmployee(id)

    if (result.success) {
      setSuccessMessage("Data pegawai berhasil dihapus")
      setTimeout(() => setSuccessMessage(""), 3000)
      loadEmployees()
    } else {
      setError(result.error || "Gagal menghapus data pegawai")
    }
  }

  const resetForm = () => {
    setFormData({
      nama_user: "",
      email: "",
      password: "",
      alamat: "",
      no_telp: "",
      no_karyawan: "",
      jabatan: "",
      no_rekening: "",
    })
    setEditingId(null)
    setShowForm(false)
    setShowPassword(false)
  }

  return (
    <div className="p-8 bg-[#F8F9FA] min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#1E4471]">Kelola User</h1>
            <p className="text-[#9B9B9B] mt-1">Kelola data karyawan dan user sistem</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
            className="flex items-center gap-2 px-6 py-3 bg-[#1E4471] text-white rounded-lg hover:bg-[#163855] transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Tambah User
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

        {/* Search and Filter Bar */}
        <div className="mb-6 flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[#9B9B9B]" />
            <input
              type="text"
              placeholder="Cari nama, email, no karyawan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1E4471] focus:ring-1 focus:ring-[#1E4471] text-[#1E4471]"
            />
          </div>
          <div className="w-64">
            <select
              value={filterJabatan}
              onChange={(e) => setFilterJabatan(e.target.value)}
              className="w-full px-4 py-2 bg-white border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1E4471] focus:ring-1 focus:ring-[#1E4471] text-[#1E4471]"
            >
              <option value="">Semua Jabatan</option>
              {uniqueJabatan.map((jabatan) => (
                <option key={jabatan} value={jabatan}>
                  {jabatan}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] p-8 mb-8">
            <h2 className="text-xl font-semibold text-[#1E4471] mb-6">
              {editingId ? "Edit Data User" : "Tambah User Baru"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-[#1E4471] mb-2">Nama Lengkap *</label>
                  <input
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={formData.nama_user}
                    onChange={(e) => setFormData({ ...formData, nama_user: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1E4471] focus:ring-1 focus:ring-[#1E4471] text-[#1E4471]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#1E4471] mb-2">
                    Email {!editingId && "*"}
                  </label>
                  <input
                    type="email"
                    placeholder="contoh: user@company.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!!editingId}
                    className={`w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1E4471] focus:ring-1 focus:ring-[#1E4471] text-[#1E4471] ${
                      editingId ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                    required={!editingId}
                  />
                  {editingId && (
                    <p className="text-xs text-[#9B9B9B] mt-1">Email tidak dapat diubah</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E4471] mb-2">
                    Password {!editingId && "*"}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        editingId 
                          ? "Password tidak dapat diubah" 
                          : "Masukkan password"
                      }
                      value={formData.password}
                      onChange={(e) => {
                        if (!editingId) {
                          setFormData({ ...formData, password: e.target.value })
                        }
                      }}
                      disabled={!!editingId}
                      className={`w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1E4471] focus:ring-1 focus:ring-[#1E4471] text-[#1E4471] ${
                        editingId ? "bg-gray-100 cursor-not-allowed" : ""
                      }`}
                      required={!editingId}
                    />
                    {!editingId && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9B9B9B] hover:text-[#1E4471]"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    )}
                  </div>
                  {editingId && (
                    <p className="text-xs text-[#9B9B9B] mt-1">Password tidak dapat diubah</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E4471] mb-2">Jabatan *</label>
                  <input
                    type="text"
                    placeholder="contoh: Manager, Staff, Admin"
                    value={formData.jabatan}
                    onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1E4471] focus:ring-1 focus:ring-[#1E4471] text-[#1E4471]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E4471] mb-2">Nomor Karyawan</label>
                  <input
                    type="text"
                    placeholder="Masukkan nomor karyawan"
                    value={formData.no_karyawan}
                    onChange={(e) => setFormData({ ...formData, no_karyawan: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1E4471] focus:ring-1 focus:ring-[#1E4471] text-[#1E4471]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E4471] mb-2">Nomor Telepon</label>
                  <input
                    type="tel"
                    placeholder="contoh: 081234567890"
                    value={formData.no_telp}
                    onChange={(e) => setFormData({ ...formData, no_telp: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1E4471] focus:ring-1 focus:ring-[#1E4471] text-[#1E4471]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1E4471] mb-2">Nomor Rekening</label>
                  <input
                    type="text"
                    placeholder="Masukkan nomor rekening"
                    value={formData.no_rekening}
                    onChange={(e) => setFormData({ ...formData, no_rekening: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1E4471] focus:ring-1 focus:ring-[#1E4471] text-[#1E4471]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#1E4471] mb-2">Alamat</label>
                  <input
                    type="text"
                    placeholder="Masukkan alamat lengkap"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg focus:outline-none focus:border-[#1E4471] focus:ring-1 focus:ring-[#1E4471] text-[#1E4471]"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#2AB77A] text-white rounded-lg hover:bg-[#239068] transition-colors font-medium"
                >
                  {editingId ? "Perbarui" : "Simpan"} Data User
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

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-[#9B9B9B]">Memuat data user...</div>
          </div>
        ) : employees.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-[#E5E7EB]">
            <p className="text-[#9B9B9B] text-lg">
              {search ? "Tidak ada user yang sesuai dengan pencarian." : "Belum ada data user. Tambah user baru untuk memulai."}
            </p>
          </div>
        ) : (
          /* Users Table */
          <div className="bg-white rounded-lg shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-[#2AB77A]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">No</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Nama User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">No. Karyawan</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Jabatan</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">No. Telepon</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-white">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee, index) => (
                    <tr
                      key={employee.id_user}
                      className="border-b border-[#E5E7EB] hover:bg-[#F8F9FA] transition-colors"
                    >
                      <td className="px-6 py-4 text-sm text-[#1E4471] font-medium">{index + 1}</td>
                      <td className="px-6 py-4 text-sm text-[#1E4471] font-medium">{employee.nama_user}</td>
                      <td className="px-6 py-4 text-sm text-[#1E4471]">{employee.email}</td>
                      <td className="px-6 py-4 text-sm text-[#1E4471]">{employee.no_karyawan}</td>
                      <td className="px-6 py-4 text-sm text-[#1E4471]">{employee.jabatan}</td>
                      <td className="px-6 py-4 text-sm text-[#1E4471]">{employee.no_telp || "-"}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEdit(employee)}
                            className="p-2 text-[#1E4471] hover:bg-[#1E4471]/10 rounded-lg transition-colors"
                            title="Edit user"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(employee.id_user)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stats Footer */}
        {!loading && employees.length > 0 && (
          <div className="mt-6 flex items-center justify-between text-sm text-[#9B9B9B]">
            <span>Total: {employees.length} user</span>
            {search && <span>Hasil pencarian untuk: "{search}"</span>}
          </div>
        )}
      </div>
    </div>
  )
}
