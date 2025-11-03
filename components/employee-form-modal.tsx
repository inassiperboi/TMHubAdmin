// "use client"

// import type React from "react"

// import { useState, useEffect } from "react"
// import { Loader2 } from "lucide-react"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
//   DialogClose,
// } from "@/components/ui/dialog"
// import type { Employee } from "@/lib/supabase/employee-client"

// interface EmployeeFormModalProps {
//   open: boolean
//   onOpenChange: (open: boolean) => void
//   employee?: Employee | null
//   onSubmit: (formData: {
//     nama_user: string
//     alamat: string
//     no_telp: string
//     no_karyawan: string
//     jabatan: string
//   }) => Promise<void>
//   loading?: boolean
// }

// export function EmployeeFormModal({ open, onOpenChange, employee, onSubmit, loading = false }: EmployeeFormModalProps) {
//   const [formData, setFormData] = useState({
//     nama_user: "",
//     alamat: "",
//     no_telp: "",
//     no_karyawan: "",
//     jabatan: "",
//   })
//   const [error, setError] = useState("")
//   const [submitting, setSubmitting] = useState(false)

//   useEffect(() => {
//     if (employee) {
//       setFormData({
//         nama_user: employee.nama_user,
//         alamat: employee.alamat,
//         no_telp: String(employee.no_telp),
//         no_karyawan: employee.no_karyawan,
//         jabatan: employee.jabatan,
//       })
//     } else {
//       setFormData({
//         nama_user: "",
//         alamat: "",
//         no_telp: "",
//         no_karyawan: "",
//         jabatan: "",
//       })
//     }
//     setError("")
//   }, [employee, open])

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()

//     if (!formData.nama_user || !formData.alamat || !formData.no_telp || !formData.no_karyawan || !formData.jabatan) {
//       setError("Semua field harus diisi")
//       return
//     }

//     if (isNaN(Number(formData.no_telp))) {
//       setError("Nomor telepon harus berupa angka")
//       return
//     }

//     setSubmitting(true)
//     try {
//       await onSubmit(formData)
//       onOpenChange(false)
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Terjadi kesalahan")
//     } finally {
//       setSubmitting(false)
//     }
//   }

//   const isEditing = !!employee

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[500px]">
//         <DialogHeader>
//           <DialogTitle className="text-xl font-bold text-foreground">
//             {isEditing ? "Edit Pegawai" : "Tambah Pegawai Baru"}
//           </DialogTitle>
//           <DialogDescription>
//             {isEditing ? "Ubah informasi pegawai" : "Isi formulir untuk menambahkan pegawai baru"}
//           </DialogDescription>
//         </DialogHeader>

//         <form onSubmit={handleSubmit} className="space-y-4">
//           {error && <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>}

//           <div>
//             <label className="block text-sm font-medium text-foreground mb-1.5">Nama Pegawai</label>
//             <input
//               type="text"
//               placeholder="Masukkan nama pegawai"
//               value={formData.nama_user}
//               onChange={(e) => setFormData({ ...formData, nama_user: e.target.value })}
//               className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-[#1E4471] focus:ring-1 focus:ring-[#1E4471]"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-foreground mb-1.5">No. Karyawan</label>
//             <input
//               type="text"
//               placeholder="Masukkan nomor karyawan"
//               value={formData.no_karyawan}
//               onChange={(e) => setFormData({ ...formData, no_karyawan: e.target.value })}
//               className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-[#1E4471] focus:ring-1 focus:ring-[#1E4471]"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-foreground mb-1.5">Jabatan</label>
//             <input
//               type="text"
//               placeholder="Masukkan jabatan"
//               value={formData.jabatan}
//               onChange={(e) => setFormData({ ...formData, jabatan: e.target.value })}
//               className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-[#1E4471] focus:ring-1 focus:ring-[#1E4471]"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-foreground mb-1.5">No. Telepon</label>
//             <input
//               type="text"
//               placeholder="Masukkan nomor telepon"
//               value={formData.no_telp}
//               onChange={(e) => setFormData({ ...formData, no_telp: e.target.value })}
//               className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-[#1E4471] focus:ring-1 focus:ring-[#1E4471]"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-foreground mb-1.5">Alamat</label>
//             <textarea
//               placeholder="Masukkan alamat lengkap"
//               value={formData.alamat}
//               onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
//               className="w-full px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-foreground placeholder-muted focus:outline-none focus:border-[#1E4471] focus:ring-1 focus:ring-[#1E4471] min-h-20 resize-none"
//             />
//           </div>

//           <div className="flex gap-3 pt-4">
//             <button
//               type="submit"
//               disabled={submitting || loading}
//               className="flex-1 px-4 py-2 bg-[#2AB77A] text-white rounded-lg hover:bg-[#229A65] transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
//               {isEditing ? "Update" : "Simpan"}
//             </button>
//             <DialogClose asChild>
//               <button
//                 type="button"
//                 disabled={submitting || loading}
//                 className="flex-1 px-4 py-2 bg-[#E5E7EB] text-foreground rounded-lg hover:bg-[#D1D5DB] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 Batal
//               </button>
//             </DialogClose>
//           </div>
//         </form>
//       </DialogContent>
//     </Dialog>
//   )
// }
