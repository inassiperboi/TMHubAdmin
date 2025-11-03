// lib/supabase/employee-client.ts
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://stsukntjvdvmjeimfunp.supabase.co";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0c3VrbnRqdmR2bWplaW1mdW5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE4MzEyMDQsImV4cCI6MjA3NzQwNzIwNH0.t9llt1DCORI9KdU8yIx2gPn5J_NN8JOLonhdmWfcgbI";

// Struktur data sesuai tabel Supabase
export interface Employee {
  id_user: number;
  nama_user: string;
  email: string;
  password: string;
  alamat: string;
  no_telp: number;
  no_karyawan: string;
  jabatan: string;
  created_at: string;
  no_rekening: string;
}

// --- GET / Fetch data pegawai ---
export async function fetchEmployees(
  page = 1,
  limit = 10,
  search = "",
  sortBy = "id_user",
  sortOrder: "asc" | "desc" = "asc"
) {
  try {
    const offset = (page - 1) * limit;
    let query = `select=*`;

    if (search) {
      query += `&or=(nama_user.ilike.%25${encodeURIComponent(search)}%25,email.ilike.%25${encodeURIComponent(
        search
      )}%25,no_karyawan.ilike.%25${encodeURIComponent(search)}%25,jabatan.ilike.%25${encodeURIComponent(
        search
      )}%25,no_rekening.ilike.%25${encodeURIComponent(search)}%25)`;
    }

    query += `&order=${sortBy}.${sortOrder}&limit=${limit}&offset=${offset}`;

    const response = await fetch(`${supabaseUrl}/rest/v1/user?${query}`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    const countResponse = await fetch(`${supabaseUrl}/rest/v1/user?select=count()`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        Prefer: "count=exact",
      },
    });

    const total = countResponse.headers.get("content-range")?.split("/")[1] || "0";
    return { data, total: Number(total) };
  } catch (error) {
    console.error("❌ Error fetching employees:", error);
    return { data: [], total: 0 };
  }
}

// --- POST / Tambah pegawai ---
export async function addEmployee(employee: Omit<Employee, "id_user" | "created_at">) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/user`, {
      method: "POST",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(employee),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));

    return { success: true, data: data[0] };
  } catch (error) {
    console.error("❌ Error adding employee:", error);
    return { success: false, error: String(error) };
  }
}

// --- PATCH / Edit pegawai ---
export async function updateEmployee(
  id_user: number,
  employee: Partial<Omit<Employee, "id_user" | "created_at">>
) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/user?id_user=eq.${id_user}`, {
      method: "PATCH",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(employee),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(JSON.stringify(data));

    return { success: true, data: data[0] };
  } catch (error) {
    console.error("❌ Error updating employee:", error);
    return { success: false, error: String(error) };
  }
}

// --- DELETE / Hapus pegawai ---
export async function deleteEmployee(id_user: number) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/user?id_user=eq.${id_user}`, {
      method: "DELETE",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    });

    if (!response.ok) throw new Error(await response.text());
    return { success: true };
  } catch (error) {
    console.error("❌ Error deleting employee:", error);
    return { success: false, error: String(error) };
  }
}
