import React from 'react'
import Link from 'next/link'

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  href?: string
  as?: 'button' | 'a' | typeof Link
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ href, className = '', children, variant = 'secondary', ...props }: ButtonProps) {
  let baseStyle = "inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium transition-all duration-300 text-sm "
  
  if (variant === 'primary') {
    baseStyle += "bg-zinc-100 text-zinc-950 hover:bg-white hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.5)] "
  } else if (variant === 'secondary') {
    baseStyle += "bg-white/10 text-white hover:bg-white/20 border border-white/5 "
  } else if (variant === 'ghost') {
    baseStyle += "bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 "
  }

  const finalStyle = `${baseStyle} ${className}`
  
  if (href) {
    return (
      <Link href={href} className={finalStyle}>
        {children}
      </Link>
    )
  }

  return (
    <button className={finalStyle} {...props}>
      {children}
    </button>
  )
}
