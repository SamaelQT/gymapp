import type { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'purple'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'default', size = 'sm' }: BadgeProps) {
  const variants = {
    default: 'bg-[#161625] text-[#7777aa] border border-[#1e1e30]',
    success: 'bg-[#00b894]/12 text-[#00b894] border border-[#00b894]/25',
    warning: 'bg-[#fdcb6e]/12 text-[#fdcb6e] border border-[#fdcb6e]/25',
    danger:  'bg-[#e17055]/12 text-[#e17055] border border-[#e17055]/25',
    accent:  'bg-[#6c5ce7]/12 text-[#a29bfe] border border-[#6c5ce7]/25',
    purple:  'bg-gradient-to-r from-[#6c5ce7]/20 to-[#a29bfe]/20 text-[#a29bfe] border border-[#6c5ce7]/30',
  }
  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  )
}
