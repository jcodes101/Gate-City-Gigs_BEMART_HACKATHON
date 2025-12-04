import React from 'react'

/**
 * GradientOverlay - A reusable gradient fade overlay component
 * @param {Object} props
 * @param {number} props.intensity - Darkness intensity (0-1), where 0 is transparent and 1 is fully dark
 * @param {string} props.direction - Gradient direction: 'bottom', 'top', 'left', 'right', 'center'
 * @param {string} props.className - Additional CSS classes
 */
export default function GradientOverlay({ 
  intensity = 0.8, 
  direction = 'bottom',
  className = ''
}) {
  // Calculate opacity values based on intensity
  const maxOpacity = Math.min(1, Math.max(0, intensity)) // Clamp between 0 and 1
  const midOpacity = maxOpacity * 0.6
  const startOpacity = maxOpacity * 0.3

  // Generate gradient based on direction
  const getGradient = () => {
    switch (direction) {
      case 'top':
        return `linear-gradient(to top, transparent 0%, rgba(0, 0, 0, ${startOpacity}) 30%, rgba(0, 0, 0, ${maxOpacity}) 100%)`
      case 'bottom':
        return `linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, ${startOpacity}) 30%, rgba(0, 0, 0, ${midOpacity}) 60%, rgba(0, 0, 0, ${maxOpacity}) 100%)`
      case 'left':
        return `linear-gradient(to left, transparent 0%, rgba(0, 0, 0, ${startOpacity}) 30%, rgba(0, 0, 0, ${maxOpacity}) 100%)`
      case 'right':
        return `linear-gradient(to right, transparent 0%, rgba(0, 0, 0, ${startOpacity}) 30%, rgba(0, 0, 0, ${maxOpacity}) 100%)`
      case 'center':
        return `radial-gradient(ellipse at center, transparent 0%, rgba(0, 0, 0, ${startOpacity}) 40%, rgba(0, 0, 0, ${maxOpacity}) 100%)`
      default:
        return `linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, ${startOpacity}) 30%, rgba(0, 0, 0, ${maxOpacity}) 100%)`
    }
  }

  return (
    <div 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{
        background: getGradient()
      }}
    />
  )
}

