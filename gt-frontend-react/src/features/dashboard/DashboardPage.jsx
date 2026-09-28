import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Box,
  Avatar,
  Tooltip,
  IconButton,
  Tabs,
  Tab,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  InputAdornment,
} from '@mui/material'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutlined'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import AddIcon from '@mui/icons-material/Add'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { colors } from '@/app/theme'
import { selectIsAdmin, selectUser } from '@/features/auth/authSlice'
import { enterSettings } from '@/features/settings/settingsSlice'
import { snack } from '@/features/ui/uiSlice'
import {
  loadDashboard,
  toggleWorkout,
  deleteWorkout,
  deleteSplit,
  setActiveSplit,
  addSplit,
  addWorkout,
  renameSplit,
  renameWorkout,
  resetProgress,
  openWorkout,
  selectWorkouts,
  selectSplits,
  selectActiveSplit,
  selectActiveSplitId,
  selectProgress,
} from '@/features/dashboard/dashboardSlice'
import ProgressRing from '@/features/dashboard/ProgressRing'
import WorkoutCard from '@/features/dashboard/WorkoutCard'
import SplitCard from '@/features/dashboard/SplitCard'

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
        minWidth: 88,
        height: 40,
        px: 2.5,
        border: 'none',
        borderRadius: colors.radiusBtn,
        background: colors.gradient,
        color: '#fff',
        fontFamily: "'Space Grotesk', sans-serif",
        fontWeight: 600,
        cursor: 'pointer',
        '&:active': { transform: 'scale(0.97)' },
        ...sx,
      }}
    >
      {children}
    </Box>
  )
}

export default function DashboardPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector(selectUser)
  const isAdmin = useAppSelector(selectIsAdmin)
  const workouts = useAppSelector(selectWorkouts)
  const splits = useAppSelector(selectSplits)
  const activeSplit = useAppSelector(selectActiveSplit)
  const activeSplitId = useAppSelector(selectActiveSplitId)
  const progress = useAppSelector(selectProgress)

  const [tab, setTab] = useState('workouts')
  const [addOpen, setAddOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [editOpen, setEditOpen] = useState(false)
  const [editId, setEditId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editKind, setEditKind] = useState('workout')

  useEffect(() => {
    dispatch(loadDashboard())
  }, [dispatch])

  const closeAdd = () => {
    setAddOpen(false)
    setNewTitle('')
  }

  const openAdd = () => {
    if (tab === 'workouts' && !activeSplit) {
      dispatch(snack.warning('Create a split first'))
      setTab('splits')
      return
    }
    setNewTitle('')
    setAddOpen(true)
  }

  const submitAdd = async () => {
    if (tab === 'splits') {
      const result = await dispatch(addSplit(newTitle))
      if (addSplit.fulfilled.match(result)) closeAdd()
      return
    }

    const result = await dispatch(addWorkout(newTitle))
    if (addWorkout.rejected.match(result) && result.payload === 'need-split') {
      closeAdd()
      setTab('splits')
      return
    }
    if (addWorkout.fulfilled.match(result)) closeAdd()
  }

  const openEditWorkout = id => {
    const w = workouts.find(x => x.id === id)
    if (!w) return
    setEditKind('workout')
    setEditId(id)
    setEditTitle(w.title)
    setEditOpen(true)
  }

  const openEditSplit = id => {
    const s = splits.find(x => x.id === id)
    if (!s) return
    setEditKind('split')
    setEditId(id)
    setEditTitle(s.title)
    setEditOpen(true)
  }

  const closeEdit = () => {
    setEditOpen(false)
    setEditId(null)
    setEditTitle('')
    setEditKind('workout')
  }

  const saveEdit = async () => {
    const result =
      editKind === 'split'
        ? await dispatch(renameSplit({ id: editId, title: editTitle }))
        : await dispatch(renameWorkout({ id: editId, title: editTitle }))
    if (renameSplit.fulfilled.match(result) || renameWorkout.fulfilled.match(result)) closeEdit()
  }

  const selectSplit = async id => {
    const result = await dispatch(setActiveSplit(id))
    if (setActiveSplit.fulfilled.match(result)) setTab('workouts')
  }

  const handleOpenWorkout = async id => {
    const result = await dispatch(openWorkout(id))
    if (openWorkout.fulfilled.match(result)) navigate(`/workout/${id}`)
  }

  const handleSettings = async () => {
    const result = await dispatch(enterSettings())
    if (enterSettings.fulfilled.match(result)) navigate('/settings')
  }

  return (
    <Box sx={{ bgcolor: colors.bg, minHeight: '100%' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{
          bgcolor: colors.surface,
          borderBottom: `1px solid ${colors.stroke}`,
          height: 64,
        }}
      >
        <Toolbar sx={{ px: 1, minHeight: '64px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: colors.gradient,
                display: 'grid',
                placeItems: 'center',
                color: '#fff',
              }}
            >
              <FitnessCenterIcon sx={{ fontSize: 18 }} />
            </Box>
            <Box
              component="span"
              sx={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '1.05rem',
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
          <Box sx={{ flex: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title={user.name} placement="bottom">
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  background: colors.gradient,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {user.avatar}
              </Avatar>
            </Tooltip>
            {isAdmin && (
              <IconButton
                size="small"
                aria-label="Users"
                onClick={() => navigate('/users')}
                sx={{ color: colors.text }}
              >
                <PeopleOutlineIcon />
              </IconButton>
            )}
            <IconButton
              size="small"
              aria-label="Settings"
              onClick={handleSettings}
              className="gear"
              sx={{
                color: colors.text,
                '&:hover .spin-hover': { transform: 'rotate(90deg)' },
              }}
            >
              <SettingsOutlinedIcon className="spin-hover" sx={{ transition: 'transform 0.4s' }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, maxWidth: 1100, mx: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            p: 2,
            mb: 1.5,
            bgcolor: colors.surface,
            border: `1px solid ${colors.stroke}`,
            borderRadius: colors.radius,
          }}
        >
          <ProgressRing percent={progress.percent} size={76} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              component="p"
              sx={{
                m: 0,
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: colors.muted,
              }}
            >
              Workout progress
            </Box>
            <Box
              component="p"
              sx={{
                m: '4px 0 0',
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: '0.95rem',
                fontWeight: 600,
                color: colors.text,
              }}
            >
              {activeSplit ? (
                <>
                  <Box
                    component="span"
                    sx={{ fontFamily: "'JetBrains Mono', monospace", color: colors.blue }}
                  >
                    {progress.done}
                  </Box>{' '}
                  of{' '}
                  <Box
                    component="span"
                    sx={{ fontFamily: "'JetBrains Mono', monospace", color: colors.blue }}
                  >
                    {progress.total}
                  </Box>{' '}
                  workouts completed
                </>
              ) : (
                'Create a split to track progress'
              )}
            </Box>
          </Box>
          <IconButton
            size="small"
            aria-label="Reset progress"
            onClick={() => dispatch(resetProgress())}
            sx={{
              alignSelf: 'flex-start',
              color: colors.muted,
              '&:hover': {
                color: colors.blue,
                '& .reset-icon': { transform: 'rotate(-180deg)' },
              },
            }}
          >
            <RefreshIcon className="reset-icon" sx={{ transition: 'transform 0.35s' }} />
          </IconButton>
        </Box>

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{ mb: 1.5 }}
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab value="workouts" label="Workouts" sx={{ textTransform: 'none', fontWeight: 600 }} />
          <Tab value="splits" label="Splits" sx={{ textTransform: 'none', fontWeight: 600 }} />
        </Tabs>

        <Box sx={{ minHeight: 120 }}>
          {tab === 'workouts' && (
            <>
              {!activeSplit && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 1,
                    p: '28px 20px',
                    bgcolor: colors.surface,
                    border: `1px dashed ${colors.stroke}`,
                    borderRadius: colors.radius,
                  }}
                >
                  <Box
                    component="p"
                    sx={{
                      m: 0,
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: colors.text,
                    }}
                  >
                    No active split
                  </Box>
                  <Box component="p" sx={{ m: '0 0 8px', fontSize: '0.9rem', color: colors.muted }}>
                    Create a split first, then add workouts.
                  </Box>
                  <GradientButton onClick={() => setTab('splits')}>Go to Splits</GradientButton>
                </Box>
              )}
              {activeSplit && workouts.length === 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 1,
                    p: '28px 20px',
                    bgcolor: colors.surface,
                    border: `1px dashed ${colors.stroke}`,
                    borderRadius: colors.radius,
                  }}
                >
                  <Box
                    component="p"
                    sx={{
                      m: 0,
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: colors.text,
                    }}
                  >
                    No workouts yet
                  </Box>
                  <Box component="p" sx={{ m: '0 0 8px', fontSize: '0.9rem', color: colors.muted }}>
                    Add a workout to &quot;{activeSplit.title}&quot;.
                  </Box>
                </Box>
              )}
              {activeSplit && workouts.length > 0 && (
                <Grid container spacing={2}>
                  {workouts.map(w => (
                    <Grid key={w.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <WorkoutCard
                        workout={w}
                        onToggle={id => dispatch(toggleWorkout(id))}
                        onOpen={handleOpenWorkout}
                        onEdit={openEditWorkout}
                        onDelete={id => dispatch(deleteWorkout(id))}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}

          {tab === 'splits' && (
            <>
              {splits.length === 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 1,
                    p: '28px 20px',
                    bgcolor: colors.surface,
                    border: `1px dashed ${colors.stroke}`,
                    borderRadius: colors.radius,
                  }}
                >
                  <Box
                    component="p"
                    sx={{
                      m: 0,
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: colors.text,
                    }}
                  >
                    No splits yet
                  </Box>
                  <Box component="p" sx={{ m: '0 0 8px', fontSize: '0.9rem', color: colors.muted }}>
                    Create your first split to organize workouts.
                  </Box>
                </Box>
              )}
              {splits.length > 0 && (
                <Grid container spacing={2}>
                  {splits.map(s => (
                    <Grid key={s.id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <SplitCard
                        split={s}
                        active={s.id === activeSplitId}
                        onSelect={selectSplit}
                        onEdit={openEditSplit}
                        onDelete={id => dispatch(deleteSplit(id))}
                      />
                    </Grid>
                  ))}
                </Grid>
              )}
            </>
          )}
        </Box>
      </Box>

      <Box
        component="button"
        type="button"
        aria-label={tab === 'splits' ? 'Add split' : 'Add workout'}
        onClick={openAdd}
        sx={{
          position: 'fixed',
          right: 20,
          bottom: 'calc(20px + env(safe-area-inset-bottom))',
          zIndex: 20,
          width: 58,
          height: 58,
          border: 'none',
          borderRadius: '50%',
          background: colors.gradient,
          color: '#fff',
          display: 'grid',
          placeItems: 'center',
          boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)',
          cursor: 'pointer',
          animation: 'fab-in 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transition: 'transform 0.2s ease',
          '&:hover': { transform: 'scale(1.08) rotate(90deg)' },
          '&:active': { transform: 'scale(0.95)' },
          '@keyframes fab-in': {
            from: { transform: 'scale(0)', opacity: 0 },
            to: { transform: 'scale(1)', opacity: 1 },
          },
        }}
      >
        <AddIcon sx={{ fontSize: 28 }} />
      </Box>

      <Dialog open={addOpen} onClose={closeAdd} maxWidth="xs" fullWidth>
        <Box
          sx={{
            bgcolor: colors.surface,
            border: `1px solid ${colors.stroke}`,
            borderRadius: colors.radius,
          }}
        >
          <DialogTitle sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
            {tab === 'splits' ? 'Add split' : 'Add workout'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              label={tab === 'splits' ? 'Split name' : 'Workout title'}
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submitAdd()}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <FitnessCenterIcon sx={{ color: colors.muted, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ ...fieldSx, mt: 0.5 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={closeAdd}
              sx={{ borderColor: colors.stroke, color: colors.muted }}
            >
              Cancel
            </Button>
            <GradientButton onClick={submitAdd}>Add</GradientButton>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={editOpen} onClose={closeEdit} maxWidth="xs" fullWidth>
        <Box
          sx={{
            bgcolor: colors.surface,
            border: `1px solid ${colors.stroke}`,
            borderRadius: colors.radius,
          }}
        >
          <DialogTitle sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
            {editKind === 'split' ? 'Rename split' : 'Rename workout'}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              label={editKind === 'split' ? 'Split name' : 'Workout title'}
              value={editTitle}
              onChange={e => setEditTitle(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveEdit()}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EditOutlinedIcon sx={{ color: colors.muted, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ ...fieldSx, mt: 0.5 }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={closeEdit}
              sx={{ borderColor: colors.stroke, color: colors.muted }}
            >
              Cancel
            </Button>
            <GradientButton onClick={saveEdit}>Save</GradientButton>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}
