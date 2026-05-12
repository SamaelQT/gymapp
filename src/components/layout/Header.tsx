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
      className="flex items-start justify-between mb-7"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div>
        <h1 className="text-2xl font-black tracking-tight" style={{ color: '#e8e8f8' }}>{title}</h1>
        {subtitle && (
          <p className="text-sm mt-0.5 font-medium" style={{ color: 'var(--c-muted)' }}>{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        {action && (
          <motion.button
            onClick={action.onClick}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white btn-primary"
            whileTap={{ scale: 0.97 }}
          >
            {action.label}
          </motion.button>
        )}
        {displayName && (
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-white"
              style={{ background: 'linear-gradient(135deg, #7c6df0, #a89af8)' }}>
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs font-semibold" style={{ color: 'var(--c-muted)' }}>{displayName}</span>
          </div>
        )}
      </div>
    </motion.header>
  )
}
