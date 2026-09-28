import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  InputAdornment,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import LogoutIcon from '@mui/icons-material/Logout'
import AccountOutlineIcon from '@mui/icons-material/PersonOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import LockPlusOutlinedIcon from '@mui/icons-material/LockReset'
import LockCheckOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined'
import ViewSplitHorizontalIcon from '@mui/icons-material/ViewColumn'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { colors } from '@/app/theme'
import { selectIsAdmin, selectUser, selectLimits } from '@/features/auth/authSlice'
import {
  syncProfileFromUser,
  loadSettingsConfigs,
  configsFromLimits,
  profileFormSet,
  pwFormSet,
  configsFormSet,
  bulkJsonSet,
  saveProfile,
  changePassword,
  saveConfigs,
  logoutFromSettings,
  copyBulkPrompt,
  submitBulkImport,
} from '@/features/settings/settingsSlice'

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: colors.radiusBtn,
    bgcolor: colors.surface2,
  },
}

function GradientButton({ children, onClick, sx }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        width: '100%',
        height: 44,
        border: 'none',
        borderRadius: colors.radiusBtn,
        background: colors.gradient,
        color: '#fff',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'filter 0.15s, transform 0.15s',
        '&:active': { transform: 'scale(0.98)' },
        '&:hover': { filter: 'brightness(1.08)' },
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

function OutlineButton({ children, onClick }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        width: '100%',
        height: 44,
        border: `1px solid ${colors.stroke}`,
        borderRadius: colors.radiusBtn,
        bgcolor: colors.surface2,
        color: colors.text,
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'filter 0.15s, transform 0.15s',
        '&:active': { transform: 'scale(0.98)' },
        '&:hover': { filter: 'brightness(1.05)' },
      }}
    >
      {children}
    </Box>
  )
}

export default function SettingsPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectUser)
  const isAdmin = useAppSelector(selectIsAdmin)
  const limits = useAppSelector(selectLimits)
  const profile = useAppSelector(s => s.settings.profile)
  const pw = useAppSelector(s => s.settings.pw)
  const configs = useAppSelector(s => s.settings.configs)
  const bulkJson = useAppSelector(s => s.settings.bulkJson)

  const [tab, setTab] = useState('profile')
  const [show, setShow] = useState({ current: false, next: false, confirm: false })
  const [bulkOpen, setBulkOpen] = useState(false)

  useEffect(() => {
    setTab('profile')
    setShow({ current: false, next: false, confirm: false })
    setBulkOpen(false)
    dispatch(bulkJsonSet(''))
    dispatch(syncProfileFromUser(user))
    if (isAdmin) {
      dispatch(loadSettingsConfigs())
    } else {
      dispatch(configsFromLimits(limits))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount init like Vue onMounted
  }, [])

  const toggleShow = key => setShow(s => ({ ...s, [key]: !s[key] }))

  const updatePassword = async () => {
    const result = await dispatch(changePassword(pw))
    if (changePassword.fulfilled.match(result)) {
      setShow({ current: false, next: false, confirm: false })
    }
  }

  const setConfigField = (key, value) => {
    const cleaned = String(value ?? '').replace(/\D/g, '')
    dispatch(configsFormSet({ [key]: cleaned === '' ? '' : Number(cleaned) }))
  }

  const openBulk = () => {
    dispatch(bulkJsonSet(''))
    setBulkOpen(true)
  }

  const closeBulk = () => {
    setBulkOpen(false)
    dispatch(bulkJsonSet(''))
  }

  const submitBulk = async () => {
    const result = await dispatch(submitBulkImport(bulkJson))
    if (submitBulkImport.fulfilled.match(result)) closeBulk()
  }

  const handleLogout = async () => {
    const result = await dispatch(logoutFromSettings())
    if (logoutFromSettings.fulfilled.match(result)) navigate('/login')
  }

  return (
    <Box sx={{ bgcolor: colors.bg, minHeight: '100%' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: colors.surface,
          borderBottom: `1px solid ${colors.stroke}`,
          height: 56,
          pr: 1.5,
        }}
      >
        <Toolbar sx={{ minHeight: '56px !important' }}>
          <IconButton
            aria-label="Back"
            onClick={() => navigate('/')}
            sx={{ color: colors.text, '&:hover .back-icon': { transform: 'translateX(-3px)' } }}
          >
            <ArrowBackIcon className="back-icon" sx={{ transition: 'transform 0.2s' }} />
          </IconButton>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: '1.05rem',
              color: colors.text,
            }}
          >
            Settings
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Box
            component="button"
            type="button"
            onClick={handleLogout}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              height: 36,
              px: 1.75,
              border: 'none',
              borderRadius: colors.radiusBtn,
              bgcolor: colors.red,
              color: '#fff',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'filter 0.15s, transform 0.15s',
              '&:hover': {
                filter: 'brightness(1.1)',
                '& .logout-icon': { transform: 'translateX(2px)' },
              },
              '&:active': { transform: 'scale(0.97)' },
            }}
          >
            <LogoutIcon
              className="logout-icon"
              sx={{ fontSize: 18, transition: 'transform 0.2s' }}
            />
            Log out
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, maxWidth: 480, mx: 'auto' }}>
        <Box
          role="tablist"
          sx={{
            display: 'grid',
            gridTemplateColumns: isAdmin ? '1fr 1fr 1fr' : '1fr 1fr',
            gap: 0.75,
            mb: 1.75,
            p: 0.5,
            bgcolor: colors.surface,
            border: `1px solid ${colors.stroke}`,
            borderRadius: colors.radiusBtn,
          }}
        >
          {[
            { id: 'profile', label: 'Profile' },
            { id: 'password', label: 'Change password' },
            ...(isAdmin ? [{ id: 'configs', label: 'Configs' }] : []),
          ].map(t => (
            <Box
              key={t.id}
              component="button"
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              sx={{
                height: 38,
                border: 'none',
                borderRadius: '10px',
                bgcolor: tab === t.id ? colors.surface2 : 'transparent',
                color: tab === t.id ? colors.text : colors.muted,
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.15s, color 0.15s',
                '&:hover': tab !== t.id ? { color: colors.text } : {},
              }}
            >
              {t.label}
            </Box>
          ))}
        </Box>

        {tab === 'profile' && (
          <Box
            sx={{
              p: '20px 16px',
              bgcolor: colors.surface,
              border: `1px solid ${colors.stroke}`,
              borderRadius: colors.radius,
            }}
          >
            <Box
              component="p"
              sx={{
                m: '0 0 14px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.95rem',
                fontWeight: 600,
                color: colors.text,
              }}
            >
              Profile
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.75 }}>
              <TextField
                label="Username"
                value={profile.name}
                onChange={e => dispatch(profileFormSet({ name: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && dispatch(saveProfile(profile.name))}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountOutlineIcon sx={{ color: colors.muted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={fieldSx}
              />
              <TextField
                label="Email"
                value={profile.email}
                disabled
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
            </Box>
            <GradientButton onClick={() => dispatch(saveProfile(profile.name))}>
              Save profile
            </GradientButton>

            <Box
              component="p"
              sx={{
                m: '22px 0 14px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.95rem',
                fontWeight: 600,
                color: colors.text,
              }}
            >
              Plan import
            </Box>
            <Box
              component="p"
              sx={{ m: '-6px 0 14px', fontSize: '0.82rem', lineHeight: 1.4, color: colors.muted }}
            >
              Bulk-add splits, workouts, and exercises from JSON.
            </Box>
            <OutlineButton onClick={openBulk}>Bulk add splits</OutlineButton>
          </Box>
        )}

        {tab === 'password' && (
          <Box
            sx={{
              p: '20px 16px',
              bgcolor: colors.surface,
              border: `1px solid ${colors.stroke}`,
              borderRadius: colors.radius,
            }}
          >
            <Box
              component="p"
              sx={{
                m: '0 0 14px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.95rem',
                fontWeight: 600,
                color: colors.text,
              }}
            >
              Change password
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.75 }}>
              {[
                { key: 'current', label: 'Current password', icon: LockOutlinedIcon },
                { key: 'next', label: 'New password', icon: LockPlusOutlinedIcon },
                { key: 'confirm', label: 'Confirm new password', icon: LockCheckOutlinedIcon },
              ].map(({ key, label, icon: Icon }) => (
                <TextField
                  key={key}
                  label={label}
                  type={show[key] ? 'text' : 'password'}
                  value={pw[key]}
                  onChange={e => dispatch(pwFormSet({ [key]: e.target.value }))}
                  onKeyDown={e => key === 'confirm' && e.key === 'Enter' && updatePassword()}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Icon sx={{ color: colors.muted, fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={() => toggleShow(key)} edge="end">
                            {show[key] ? (
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
              ))}
            </Box>
            <GradientButton onClick={updatePassword}>Update password</GradientButton>
          </Box>
        )}

        {tab === 'configs' && isAdmin && (
          <Box
            sx={{
              p: '20px 16px',
              bgcolor: colors.surface,
              border: `1px solid ${colors.stroke}`,
              borderRadius: colors.radius,
            }}
          >
            <Box
              component="p"
              sx={{
                m: '0 0 14px',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.95rem',
                fontWeight: 600,
                color: colors.text,
              }}
            >
              Configs
            </Box>
            <Box
              component="p"
              sx={{ m: '-6px 0 14px', fontSize: '0.82rem', lineHeight: 1.4, color: colors.muted }}
            >
              Applies to all users. Existing items over a lower limit are kept; new ones are
              blocked.
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.75 }}>
              <TextField
                label="Max splits"
                value={configs.maxSplits}
                onChange={e => setConfigField('maxSplits', e.target.value)}
                slotProps={{
                  input: {
                    inputMode: 'numeric',
                    startAdornment: (
                      <InputAdornment position="start">
                        <ViewSplitHorizontalIcon sx={{ color: colors.muted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                helperText="1–100"
                sx={fieldSx}
              />
              <TextField
                label="Max workouts per split"
                value={configs.maxWorkoutsPerSplit}
                onChange={e => setConfigField('maxWorkoutsPerSplit', e.target.value)}
                slotProps={{
                  input: {
                    inputMode: 'numeric',
                    startAdornment: (
                      <InputAdornment position="start">
                        <FitnessCenterIcon sx={{ color: colors.muted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                helperText="1–100"
                sx={fieldSx}
              />
              <TextField
                label="Max exercises per workout"
                value={configs.maxExercisesPerWorkout}
                onChange={e => setConfigField('maxExercisesPerWorkout', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && dispatch(saveConfigs(configs))}
                slotProps={{
                  input: {
                    inputMode: 'numeric',
                    startAdornment: (
                      <InputAdornment position="start">
                        <DirectionsRunIcon sx={{ color: colors.muted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                helperText="1–100"
                sx={fieldSx}
              />
            </Box>
            <GradientButton onClick={() => dispatch(saveConfigs(configs))}>
              Save configs
            </GradientButton>
          </Box>
        )}
      </Box>

      <Dialog open={bulkOpen} onClose={closeBulk} maxWidth="sm" fullWidth>
        <Box sx={{ bgcolor: colors.surface, color: colors.text, borderRadius: colors.radius }}>
          <DialogTitle sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
            Bulk add splits
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box
              component="ol"
              sx={{
                m: 0,
                pl: '1.2rem',
                fontSize: '0.85rem',
                lineHeight: 1.45,
                '& li + li': { mt: 0.5 },
              }}
            >
              <li>Copy the example prompt and paste it into any AI chat.</li>
              <li>Replace the notes section with your plan; ask the AI for JSON only.</li>
              <li>Paste that JSON below and submit.</li>
            </Box>
            <Box
              component="p"
              sx={{ m: 0, fontSize: '0.82rem', lineHeight: 1.4, color: colors.muted }}
            >
              Split names must be new (case-insensitive). Matching an existing split rejects the
              whole import. Workouts and exercises are created under each new split (duplicate names
              allowed). If any limit would be exceeded, nothing is imported. Active split is not
              changed.
            </Box>
            <OutlineButton onClick={() => dispatch(copyBulkPrompt())}>
              Copy example prompt
            </OutlineButton>
            <TextField
              label="Paste JSON"
              value={bulkJson}
              onChange={e => dispatch(bulkJsonSet(e.target.value))}
              multiline
              rows={8}
              sx={{
                ...fieldSx,
                mt: 0.5,
                '& textarea': { maxHeight: 180, height: '180px !important', overflowY: 'auto' },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={closeBulk}
              sx={{ borderColor: colors.stroke, color: colors.text }}
            >
              Cancel
            </Button>
            <GradientButton sx={{ width: 'auto', minWidth: 110, px: 2.25 }} onClick={submitBulk}>
              Submit
            </GradientButton>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}
