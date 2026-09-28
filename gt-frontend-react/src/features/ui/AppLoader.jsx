import { useEffect, useState } from 'react'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import SportsGymnasticsIcon from '@mui/icons-material/SportsGymnastics'
import { Box } from '@mui/material'
import { useAppSelector } from '@/app/hooks'
import { selectLoaderActive } from './uiSlice'
import { colors } from '@/app/theme'

const ICONS = [FitnessCenterIcon, SportsGymnasticsIcon, FitnessCenterIcon]

export default function AppLoader() {
  const active = useAppSelector(selectLoaderActive)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (!active) return undefined
    const timer = setInterval(() => {
      setIndex(i => (i + 1) % ICONS.length)
    }, 900)
    return () => {
      clearInterval(timer)
      setIndex(0)
    }
  }, [active])

  if (!active) return null

  const Icon = ICONS[index]

  return (
    <Box
      role="status"
      aria-live="polite"
      aria-label="Loading"
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'grid',
        placeItems: 'center',
        pointerEvents: 'all',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(10, 12, 17, 0.72)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: 88,
          height: 88,
          display: 'grid',
          placeItems: 'center',
          borderRadius: '50%',
          background: `linear-gradient(${colors.surface}, ${colors.surface}) padding-box, ${colors.gradient} border-box`,
          border: '2px solid transparent',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(59, 130, 246, 0.35) 0%, rgba(59, 130, 246, 0.08) 55%, transparent 70%)',
            animation: 'pulse-ring 1.6s ease-in-out infinite',
          },
          '@keyframes pulse-ring': {
            '0%, 100%': { transform: 'scale(0.88)', opacity: 0.7 },
            '50%': { transform: 'scale(1.12)', opacity: 1 },
          },
        }}
      >
        <Icon
          sx={{
            position: 'relative',
            zIndex: 1,
            fontSize: 36,
            color: colors.text,
            filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.35))',
          }}
        />
      </Box>
    </Box>
  )
}
