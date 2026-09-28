import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Card, TextField, IconButton, InputAdornment } from '@mui/material'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import { useAppDispatch } from '@/app/hooks'
import { login } from '@/features/auth/authSlice'
import { colors } from '@/app/theme'

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: colors.radiusBtn,
    bgcolor: colors.surface2,
  },
}

export default function LoginPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const submit = async () => {
    const result = await dispatch(login({ email, password }))
    if (login.fulfilled.match(result)) navigate('/')
  }

  const onKeyEnter = e => {
    if (e.key === 'Enter') submit()
  }

  return (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        p: '24px 16px',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: colors.bg,
        height: '100%',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          top: -60,
          left: -40,
          bgcolor: 'rgba(59, 130, 246, 0.35)',
          animation: 'drift 8s ease-in-out infinite alternate',
          '@keyframes drift': {
            to: { transform: 'translate(20px, 16px) scale(1.08)' },
          },
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 280,
          height: 280,
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          bottom: -80,
          right: -40,
          bgcolor: 'rgba(239, 68, 68, 0.28)',
          animation: 'drift 8s ease-in-out infinite alternate',
          animationDelay: '-3s',
        }}
      />

      <Card
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: '28px 22px 24px',
          bgcolor: colors.surface,
          border: `1px solid ${colors.stroke}`,
          borderRadius: colors.radius,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: colors.gradient,
              display: 'grid',
              placeItems: 'center',
              animation: 'pulse 2.4s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { boxShadow: '0 0 0 0 rgba(59, 130, 246, 0.4)' },
                '50%': { boxShadow: '0 0 0 10px rgba(59, 130, 246, 0)' },
              },
            }}
          >
            <FitnessCenterIcon
              sx={{
                color: '#fff',
                fontSize: 28,
                animation: 'swing 2.4s ease-in-out infinite',
                '@keyframes swing': {
                  '0%, 100%': { transform: 'rotate(-8deg)' },
                  '50%': { transform: 'rotate(8deg)' },
                },
              }}
            />
          </Box>
          <Box
            component="h1"
            sx={{
              m: 0,
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.6rem',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: colors.text,
            }}
          >
            Gym
            <Box
              component="span"
              sx={{
                background: colors.gradient,
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Trakio
            </Box>
          </Box>
        </Box>

        <Box
          component="p"
          sx={{
            m: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1.25rem',
            fontWeight: 600,
            color: colors.text,
          }}
        >
          Welcome back
        </Box>
        <Box component="p" sx={{ m: '4px 0 0', fontSize: '0.875rem', color: colors.muted }}>
          Sign in to track your training
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 2.5, mb: 2 }}>
          <TextField
            label="Email"
            placeholder="you@gymtrakio.com"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={onKeyEnter}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: colors.muted, fontSize: 20 }} />
                  </InputAdornment>
                ),
              },
            }}
            sx={fieldSx}
          />
          <TextField
            label="Password"
            placeholder="Enter your password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={onKeyEnter}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: colors.muted, fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      onClick={() => setShowPassword(v => !v)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOffOutlinedIcon fontSize="small" />
                      ) : (
                        <VisibilityOutlinedIcon fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
            sx={fieldSx}
          />
        </Box>

        <Box
          component="button"
          type="button"
          onClick={submit}
          sx={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            height: 48,
            border: 'none',
            borderRadius: colors.radiusBtn,
            background: colors.gradient,
            color: '#fff',
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'transform 0.15s ease, filter 0.15s ease',
            '&:active': { transform: 'scale(0.98)' },
            '&:hover': {
              filter: 'brightness(1.08)',
              '& .btn-icon': { transform: 'translateX(4px)' },
            },
          }}
        >
          Log In
          <ArrowForwardIcon
            className="btn-icon"
            sx={{ fontSize: 18, transition: 'transform 0.2s' }}
          />
        </Box>
      </Card>
    </Box>
  )
}
