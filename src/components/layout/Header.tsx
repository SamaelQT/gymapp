import { motion } from 'framer-motion'
import { useUserStore } from '../../store/useUserStore'
import { useAuthStore } from '../../store/useAuthStore'

interface HeaderProps {
  title: string
  subtitle?: string
  action?: { label: string; onClick: () => void }
}

export function Header({ title, subtitle, action }: HeaderProps) {
  const { profile } = useUserStore()
  const { user } = useAuthStore()
  const displayName = profile?.name || user?.name || ''

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
          <div style={{ width: 3, height: 24, borderRadius: 99, background: 'linear-gradient(180deg, #c084fc, #7c6df0)', flexShrink: 0 }} />
          <h1 style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.025em', color: '#d8d8f0' }}>
            {title}
          </h1>
        </div>
        {subtitle && (
          <p style={{ fontSize: 12, color: '#2e2e58', paddingLeft: 15 }}>{subtitle}</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {action && (
          <motion.button
            onClick={action.onClick}
            whileTap={{ scale: 0.97 }}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '9px 20px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #7c6df0 0%, #a89af8 100%)',
              boxShadow: '0 4px 18px rgba(124,109,240,0.4)',
              color: 'white', fontSize: 13, fontWeight: 700,
            }}
          >
            {action.label}
          </motion.button>
        )}
        {displayName && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 12px', borderRadius: 12,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
          }}>
            <div style={{
              width: 26, height: 26, borderRadius: 8, flexShrink: 0,
              background: 'linear-gradient(135deg, #7c6df0, #a89af8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 900, color: 'white',
            }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#4a4a80' }}>{displayName}</span>
          </div>
        )}
      </div>
    </motion.header>
  )
}
