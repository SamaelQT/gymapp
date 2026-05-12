import { motion } from 'framer-motion'
import type { ReactNode, MouseEventHandler } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: MouseEventHandler<HTMLDivElement>
  hover?: boolean
  glow?: boolean
  animate?: boolean
  delay?: number
}

export function Card({ children, className = '', onClick, hover, glow, animate: anim = true, delay = 0 }: CardProps) {
  const base = {
    background: 'rgba(14,14,28,0.7)',
    border: '1px solid rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    boxShadow: glow ? '0 0 30px rgba(124,109,240,0.12)' : undefined,
  }

  return (
    <motion.div
      className={`rounded-2xl p-5 ${hover || onClick ? 'card-hover cursor-pointer' : ''} ${className}`}
      style={base}
      onClick={onClick as any}
      initial={anim ? { opacity: 0, y: 16 } : false}
      animate={anim ? { opacity: 1, y: 0 } : undefined}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover || onClick ? { y: -3 } : undefined}
    >
      {children}
    </motion.div>
  )
}
