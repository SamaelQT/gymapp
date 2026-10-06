import type { ReactNode } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Sidebar } from './components/layout/Sidebar'
import { useAuthStore } from './store/useAuthStore'
import { useUserStore } from './store/useUserStore'
import Auth from './pages/Auth'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import LiveAI from './pages/LiveAI'
import Workout from './pages/Workout'
import Nutrition from './pages/Nutrition'
import Progress from './pages/Progress'
import Profile from './pages/Profile'
import Roadmap from './pages/Roadmap'

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: '#080810' }}>
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-y-auto" style={{ marginLeft: '230px' }}>
        <div className="max-w-5xl mx-auto px-6 py-7">
          {children}
        </div>
      </main>
    </div>
  )
}

export default function App() {
  const { user } = useAuthStore()
  const { onboardingCompleted } = useUserStore()

  if (!user) return (
    <BrowserRouter>
      <Auth />
    </BrowserRouter>
  )

  if (!onboardingCompleted) return (
    <BrowserRouter>
      <Onboarding />
    </BrowserRouter>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"           element={<Layout><Dashboard /></Layout>} />
        <Route path="/live"       element={<Layout><LiveAI /></Layout>} />
        <Route path="/workout"    element={<Layout><Workout /></Layout>} />
        <Route path="/nutrition"  element={<Layout><Nutrition /></Layout>} />
        <Route path="/progress"   element={<Layout><Progress /></Layout>} />
        <Route path="/profile"    element={<Layout><Profile /></Layout>} />
        <Route path="/roadmap"    element={<Layout><Roadmap /></Layout>} />
      </Routes>
    </BrowserRouter>
  )
}
