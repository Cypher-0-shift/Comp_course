import React from 'react'

interface TruncatedTooltipTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: string
  className?: string
  as?: React.ElementType
  maxLines?: number
}

/**
 * TruncatedTooltipText
 * Content-safe text wrapper. When text is truncated or clamped, it automatically
 * provides a browser-accessible native tooltip + aria-label so full content is never lost.
 */
export const TruncatedTooltipText: React.FC<TruncatedTooltipTextProps> = ({
  children,
  className = '',
  as: Component = 'span',
  maxLines,
  ...props
}) => {
  const lineClampStyle: React.CSSProperties | undefined = maxLines
    ? {
        display: '-webkit-box',
        WebkitLineClamp: maxLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }
    : undefined

  return (
    <Component
      title={children}
      aria-label={children}
      className={`break-words-safe min-w-0 ${maxLines ? '' : 'truncate'} ${className}`}
      style={lineClampStyle}
      {...props}
    >
      {children}
    </Component>
  )
}
