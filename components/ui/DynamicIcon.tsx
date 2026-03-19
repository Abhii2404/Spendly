import {
  UtensilsCrossed, Car, ShoppingBag, Heart, Tv, Zap, Plane, BookOpen, RefreshCw, MoreHorizontal,
  Briefcase, Laptop, TrendingUp, Home, Gift, Wallet, PiggyBank, Coffee, Music, Gamepad2,
  Bus, Bike, Train, Fuel, Phone, Wifi, Shield, CircleDot, AlertCircle
} from 'lucide-react'
import { LucideIcon } from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  UtensilsCrossed, Car, ShoppingBag, Heart, Tv, Zap, Plane, BookOpen, RefreshCw, MoreHorizontal,
  Briefcase, Laptop, TrendingUp, Home, Gift, Wallet, PiggyBank, Coffee, Music, Gamepad2,
  Bus, Bike, Train, Fuel, Phone, Wifi, Shield, AlertCircle
}
import React from 'react'

export default React.memo(function DynamicIcon({ name, size = 20, color = 'currentColor', className = '' }: {
  name: string
  size?: number
  color?: string
  className?: string
}) {
  const Icon = iconMap[name] || CircleDot
  return <Icon size={size} color={color} className={className} />
})
