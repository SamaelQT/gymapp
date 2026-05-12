import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  name: string
  email: string
}

interface AuthState {
  user: AuthUser | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

// Simple local auth — stores hashed-ish credentials in localStorage
// Replace with Supabase auth when configured
function hashPassword(pw: string): string {
  let h = 0
  for (let i = 0; i < pw.length; i++) h = Math.imul(31, h) + pw.charCodeAt(i) | 0
  return `${h}`
}

function getUsers(): Record<string, { name: string; hash: string }> {
  try { return JSON.parse(localStorage.getItem('fitforge-users') || '{}') } catch { return {} }
}

function saveUsers(users: Record<string, { name: string; hash: string }>) {
  localStorage.setItem('fitforge-users', JSON.stringify(users))
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,

      register: async (name, email, password) => {
        const users = getUsers()
        const key = email.toLowerCase()
        if (users[key]) throw new Error('Email này đã được đăng ký')
        if (password.length < 6) throw new Error('Mật khẩu phải có ít nhất 6 ký tự')
        users[key] = { name, hash: hashPassword(password) }
        saveUsers(users)
        set({ user: { id: key, name, email: key } })
      },

      login: async (email, password) => {
        const users = getUsers()
        const key = email.toLowerCase()
        const record = users[key]
        if (!record) throw new Error('Email không tồn tại')
        if (record.hash !== hashPassword(password)) throw new Error('Mật khẩu không đúng')
        set({ user: { id: key, name: record.name, email: key } })
      },

      logout: () => set({ user: null }),
    }),
    { name: 'fitforge-auth', partialize: (s) => ({ user: s.user }) }
  )
)
