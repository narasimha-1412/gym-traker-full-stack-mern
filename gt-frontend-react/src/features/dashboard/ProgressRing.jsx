import { useId } from 'react'
import { Box } from '@mui/material'
import { colors } from '@/app/theme'

const r = 30
const circumference = 2 * Math.PI * r

export default function ProgressRing({ percent = 0, size = 72 }) {
  const gradId = useId().replace(/:/g, '')
  const offset = circumference - (percent / 100) * circumference

  return (
    <Box
      sx={{
        position: 'relative',
        flexShrink: 0,
        width: size,
        height: size,
        '& svg': {
          transform: 'rotate(-90deg)',
          display: 'block',
        },
      }}
    >
      <svg width={size} height={size} viewBox="0 0 72 72">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#7c5cf0" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>
        </defs>
        <circle cx="36" cy="36" r={r} fill="none" stroke={colors.stroke} strokeWidth={6} />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={6}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      <Box
        component="span"
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          placeItems: 'center',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.85rem',
          fontWeight: 600,
          color: colors.text,
        }}
      >
        {percent}%
      </Box>
    </Box>
  )
}
