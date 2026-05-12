import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/useAuthStore'

const navItems = [
  { path: '/', label: 'Dashboard', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  )},
  { path: '/live', label: 'Live AI', badge: 'AI', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]">
      <circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="11" strokeDasharray="2 4"/>
    </svg>
  )},
  { path: '/workout', label: 'Bài Tập', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]">
      <path d="M6 4v16M18 4v16M6 12h12M3 8h3M18 8h3M3 16h3M18 16h3"/>
    </svg>
  )},
  { path: '/nutrition', label: 'Dinh Dưỡng', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]">
      <path d="M12 2a8 8 0 1 0 0 16A8 8 0 0 0 12 2z"/><path d="M12 6v6l4 2"/><path d="M4.93 4.93l14.14 14.14" strokeWidth={1.2}/>
    </svg>
  )},
  { path: '/progress', label: 'Tiến Độ', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  )},
  { path: '/profile', label: 'Hồ Sơ', icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-[18px] h-[18px]">
      <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  )},
]

export function Sidebar() {
  const { user, logout } = useAuthStore()

  return (
    <aside className="fixed left-0 top-0 h-full w-[220px] flex flex-col z-40"
      style={{
        background: 'linear-gradient(180deg, rgba(10,10,22,0.98) 0%, rgba(6,6,15,0.99) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
      }}>

      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 glow-sm"
            style={{ background: 'linear-gradient(135deg, #7c6df0, #a89af8)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" className="w-5 h-5">
              <path d="M6 4v16M18 4v16M6 12h12M3 8h3M18 8h3M3 16h3M18 16h3"/>
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-[17px] font-black tracking-tight">
              <span style={{ color: '#e8e8f8' }}>Fit</span>
              <span className="grad-text">Forge</span>
            </div>
            <div className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: 'var(--c-accent)' }}>
              AI Powered
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-4 space-y-0.5 overflow-y-auto">
        <p className="text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-2 mb-1" style={{ color: 'var(--c-faint)' }}>
          Điều hướng
        </p>

        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
          >
            {({ isActive }) => (
              <motion.div
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium relative cursor-pointer ${isActive ? 'nav-active' : ''}`}
                style={{
                  color: isActive ? '#e8e8f8' : 'var(--c-muted)',
                }}
                whileHover={{ x: isActive ? 0 : 3 }}
                transition={{ duration: 0.15 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-indicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r-full"
                    style={{ background: 'var(--c-accent)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span style={{ color: isActive ? 'var(--c-accent2)' : 'var(--c-faint)' }}
                  className="transition-colors duration-200">
                  {item.icon}
                </span>
                <span className="flex-1">{item.label}</span>
                {'badge' in item && item.badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                    style={{ background: 'rgba(124,109,240,0.2)', color: 'var(--c-accent2)', border: '1px solid rgba(124,109,240,0.3)' }}>
                    {item.badge}
                  </span>
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom separator */}
      <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)', margin: '0 16px' }} />

      {/* User area */}
      {user && (
        <div className="p-3">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl mb-1"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-black text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c6df0, #a89af8)' }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: '#e8e8f8' }}>{user.name}</p>
              <p className="text-[10px] truncate" style={{ color: 'var(--c-faint)' }}>{user.email}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200"
            style={{ color: 'var(--c-faint)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#fca5a5'; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(248,113,113,0.08)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--c-faint)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Đăng xuất
          </button>
        </div>
      )}
    </aside>
  )
}
