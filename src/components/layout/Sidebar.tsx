import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/useAuthStore'

/* ─── Nav items ─────────────────────────────────── */
const navItems = [
  {
    path: '/', label: 'Dashboard', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" style={{ width: 17, height: 17 }}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    )
  },
  {
    path: '/live', label: 'Live AI', badge: 'AI', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" style={{ width: 17, height: 17 }}>
        <circle cx="12" cy="12" r="3" /><circle cx="12" cy="12" r="7" /><circle cx="12" cy="12" r="11" strokeDasharray="2 4" />
      </svg>
    )
  },
  {
    path: '/workout', label: 'Bài Tập', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" style={{ width: 17, height: 17 }}>
        <path d="M6 4v16M18 4v16M6 12h12M3 8h3M18 8h3M3 16h3M18 16h3" />
      </svg>
    )
  },
  {
    path: '/nutrition', label: 'Dinh Dưỡng', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" style={{ width: 17, height: 17 }}>
        <path d="M12 2a8 8 0 1 0 0 16A8 8 0 0 0 12 2z" /><path d="M12 6v6l4 2" />
      </svg>
    )
  },
  {
    path: '/progress', label: 'Tiến Độ', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" style={{ width: 17, height: 17 }}>
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    )
  },
  {
    path: '/profile', label: 'Hồ Sơ', icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" style={{ width: 17, height: 17 }}>
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    )
  },
]

/* ─── Sidebar ───────────────────────────────────── */
export function Sidebar() {
  const { user, logout } = useAuthStore()

  return (
    <aside
      style={{
        position: 'fixed', left: 0, top: 0, height: '100%', width: 220,
        display: 'flex', flexDirection: 'column', zIndex: 40,
        background: 'linear-gradient(180deg, rgba(8,8,18,0.99) 0%, rgba(6,6,14,1) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Top purple glow */}
      <div style={{
        position: 'absolute', top: -40, left: -20, width: 200, height: 200,
        borderRadius: '50%', background: 'rgba(124,109,240,0.12)', filter: 'blur(60px)',
        pointerEvents: 'none',
      }} />

      {/* ── Logo ── */}
      <div style={{ padding: '22px 18px 18px', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 11, flexShrink: 0,
            background: 'linear-gradient(135deg, #7c6df0, #a89af8)',
            boxShadow: '0 0 20px rgba(124,109,240,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" style={{ width: 17, height: 17 }}>
              <path d="M6 4v16M18 4v16M6 12h12M3 8h3M18 8h3M3 16h3M18 16h3" />
            </svg>
          </div>
          <div style={{ lineHeight: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 900, letterSpacing: '-0.02em', display: 'flex' }}>
              <span style={{ color: '#e8e8f8' }}>Fit</span>
              <span style={{ background: 'linear-gradient(135deg, #a89af8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Forge</span>
            </div>
            <div style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.22em', color: '#7c6df0', textTransform: 'uppercase', marginTop: 2 }}>
              AI Powered
            </div>
          </div>
        </div>

        {/* Separator */}
        <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)', marginTop: 18 }} />
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '4px 10px', overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#1e1e40', padding: '6px 10px 8px' }}>
          Menu
        </div>

        {navItems.map(item => (
          <NavLink key={item.path} to={item.path} end={item.path === '/'}>
            {({ isActive }) => (
              <motion.div
                whileHover={{ x: isActive ? 0 : 2, transition: { duration: 0.12 } }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 12, marginBottom: 2,
                  cursor: 'pointer', position: 'relative',
                  background: isActive ? 'rgba(124,109,240,0.14)' : 'transparent',
                  border: isActive ? '1px solid rgba(124,109,240,0.25)' : '1px solid transparent',
                  boxShadow: isActive ? '0 0 16px rgba(124,109,240,0.1)' : 'none',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
              >
                {/* Left accent bar */}
                {isActive && (
                  <motion.div
                    layoutId="nav-bar"
                    style={{
                      position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                      width: 3, height: 18, borderRadius: 99,
                      background: 'linear-gradient(180deg, #c084fc, #7c6df0)',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}

                <span style={{
                  color: isActive ? '#a89af8' : '#28285a',
                  transition: 'color 0.15s', flexShrink: 0,
                }}>
                  {item.icon}
                </span>

                <span style={{
                  flex: 1, fontSize: 13, fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#d8d8f0' : '#38386a',
                  transition: 'color 0.15s',
                }}>
                  {item.label}
                </span>

                {'badge' in item && item.badge && (
                  <span style={{
                    fontSize: 8, fontWeight: 800, padding: '2px 6px', borderRadius: 6,
                    background: 'rgba(124,109,240,0.2)', color: '#a89af8',
                    border: '1px solid rgba(124,109,240,0.3)', letterSpacing: '0.06em',
                  }}>
                    {item.badge}
                  </span>
                )}
              </motion.div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Bottom separator ── */}
      <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 14px', flexShrink: 0 }} />

      {/* ── User section ── */}
      {user && (
        <div style={{ padding: '12px 10px 16px', position: 'relative', zIndex: 1 }}>
          {/* User card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 12,
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
            marginBottom: 4,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #7c6df0, #a89af8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 900, color: 'white',
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#c0c0e0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 10, color: '#25255a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1 }}>
                {user.email}
              </div>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'transparent', color: '#28284e', fontSize: 12, fontWeight: 500,
              transition: 'color 0.15s, background 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#fca5a5'; e.currentTarget.style.background = 'rgba(248,113,113,0.07)' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#28284e'; e.currentTarget.style.background = 'transparent' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Đăng xuất
          </button>
        </div>
      )}
    </aside>
  )
}
