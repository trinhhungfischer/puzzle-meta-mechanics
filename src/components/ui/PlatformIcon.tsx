
import React from 'react'
import { Monitor, Smartphone, Apple, Gamepad2, Globe, Bot } from 'lucide-react'

export function PlatformIcon({ name, className = '' }: { name: string, className?: string }) {
  const lower = name.toLowerCase();
  
  if (lower.includes('pc') || lower.includes('windows') || lower.includes('steam')) {
    return <Monitor className={className} />
  }
  if (lower.includes('ios') || lower.includes('apple') || lower.includes('mac')) {
    return <Apple className={className} />
  }
  if (lower.includes('android')) {
    return <Bot className={className} />
  }
  if (lower.includes('web') || lower.includes('browser')) {
    return <Globe className={className} />
  }
  // Console/PlayStation/Xbox/Switch
  return <Gamepad2 className={className} />
}
