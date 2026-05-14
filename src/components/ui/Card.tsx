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
  return (
    <motion.div
      className={`rounded-2xl p-5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        background: 'rgba(10,10,22,0.92)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: glow ? '0 0 30px rgba(124,109,240,0.14)' : 'none',
      }}
      onClick={onClick as any}
      initial={anim ? { opacity: 0, y: 16 } : false}
      animate={anim ? { opacity: 1, y: 0 } : undefined}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={
        hover || onClick
          ? { y: -3, borderColor: 'rgba(124,109,240,0.3)', boxShadow: '0 8px 28px rgba(124,109,240,0.14)' } as never
          : undefined
      }
    >
      {children}
    </motion.div>
  )
}
