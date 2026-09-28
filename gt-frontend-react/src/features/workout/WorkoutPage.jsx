import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  Checkbox,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  InputAdornment,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import ChevronUpIcon from '@mui/icons-material/KeyboardArrowUp'
import ChevronDownIcon from '@mui/icons-material/KeyboardArrowDown'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun'
import ScaleIcon from '@mui/icons-material/Scale'
import NotesIcon from '@mui/icons-material/Notes'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { colors } from '@/app/theme'
import { snack } from '@/features/ui/uiSlice'
import {
  loadDraft,
  toggleExercise,
  saveExercise,
  deleteExercise,
  clearDraft,
  selectDraft,
  sanitizeWeight,
} from '@/features/workout/workoutSlice'

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
        minWidth: 96,
        height: 40,
        px: 2.75,
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

export default function WorkoutPage() {
  const { workoutId } = useParams()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const draft = useAppSelector(selectDraft)

  const [expandedId, setExpandedId] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState('add')
  const [form, setForm] = useState({
    id: null,
    name: '',
    weight: '',
    weightUnit: 'kg',
    description: '',
  })
  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuExId, setMenuExId] = useState(null)

  useEffect(() => {
    const load = async () => {
      const id = String(workoutId || '')
      setExpandedId(null)
      const result = await dispatch(loadDraft(id))
      if (loadDraft.rejected.match(result)) {
        dispatch(snack.error('Workout not found'))
        navigate('/', { replace: true })
      }
    }
    load()
    return () => dispatch(clearDraft())
  }, [workoutId, dispatch, navigate])

  const goBack = () => {
    dispatch(clearDraft())
    navigate('/')
  }

  const toggleExpand = exId => {
    setExpandedId(prev => (prev === exId ? null : exId))
  }

  const openAdd = () => {
    setDialogMode('add')
    setForm({ id: null, name: '', weight: '', weightUnit: 'kg', description: '' })
    setDialogOpen(true)
  }

  const openEdit = ex => {
    setDialogMode('edit')
    setForm({
      id: ex.id,
      name: ex.name,
      weight: sanitizeWeight(ex.weight),
      weightUnit: ex.weightUnit === 'lb' ? 'lb' : 'kg',
      description: ex.description || '',
    })
    setDialogOpen(true)
  }

  const closeDialog = () => setDialogOpen(false)

  const setWeight = value => {
    setForm(f => ({ ...f, weight: sanitizeWeight(value) }))
  }

  const onWeightKeydown = e => {
    const allow = [
      'Backspace',
      'Delete',
      'Tab',
      'Escape',
      'Enter',
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      'Home',
      'End',
    ]
    if (allow.includes(e.key)) return
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return
    if (/^\d$/.test(e.key)) return
    if (e.key === '.' && !String(form.weight ?? '').includes('.')) return
    e.preventDefault()
  }

  const handleSaveExercise = async () => {
    const result = await dispatch(saveExercise({ mode: dialogMode, form }))
    if (saveExercise.fulfilled.match(result)) closeDialog()
  }

  const handleDeleteExercise = async exId => {
    const result = await dispatch(deleteExercise(exId))
    if (deleteExercise.fulfilled.match(result) && expandedId === exId) setExpandedId(null)
  }

  if (!draft || draft.id !== workoutId) return null

  return (
    <Box sx={{ bgcolor: colors.bg, display: 'flex', flexDirection: 'column', minHeight: '100%' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.stroke}`, height: 56 }}
      >
        <Toolbar sx={{ minHeight: '56px !important' }}>
          <IconButton
            aria-label="Back"
            onClick={goBack}
            sx={{
              color: colors.text,
              '&:hover .back-icon': { transform: 'translateX(-3px)' },
            }}
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
            {draft.title}
          </Typography>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: 1, p: '12px 16px', maxWidth: 900, width: '100%', mx: 'auto' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            mb: 1.5,
            p: '12px 14px',
            bgcolor: colors.surface,
            border: `1px solid ${colors.stroke}`,
            borderRadius: colors.radius,
          }}
        >
          <Box
            component="span"
            sx={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '0.85rem',
              fontWeight: 600,
              color: colors.muted,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            Exercises
          </Box>
          <Box
            component="span"
            sx={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '1.25rem',
              fontWeight: 700,
              color: colors.text,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {draft.exercises.length}
          </Box>
        </Box>

        <Box
          sx={{
            bgcolor: colors.surface,
            border: `1px solid ${colors.stroke}`,
            borderRadius: colors.radius,
            overflow: 'hidden',
          }}
        >
          {draft.exercises.length === 0 ? (
            <Box sx={{ p: '48px 20px', textAlign: 'center', color: colors.muted }}>
              <FitnessCenterIcon
                sx={{
                  fontSize: 40,
                  opacity: 0.5,
                  animation: 'float 2.5s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-6px)' },
                  },
                }}
              />
              <Box
                component="p"
                sx={{
                  m: '12px 0 4px',
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 600,
                  color: colors.text,
                }}
              >
                No exercises yet
              </Box>
              <Box component="span" sx={{ fontSize: '0.85rem' }}>
                Tap + to get started
              </Box>
            </Box>
          ) : (
            <Box sx={{ width: '100%' }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '40px minmax(0, 1fr) 64px 50px',
                    md: '44px minmax(0, 1fr) 80px 54px',
                  },
                  gap: { xs: 1, md: 1.5 },
                  alignItems: 'center',
                  minHeight: 40,
                  px: { xs: 1.5, md: 1.75 },
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: colors.muted,
                  borderBottom: `1px solid ${colors.stroke}`,
                  bgcolor: colors.surface2,
                }}
              >
                <span aria-hidden="true" />
                <span>Exercise</span>
                <span>Weight</span>
                <Box component="span" sx={{ textAlign: 'right' }}>
                  Actions
                </Box>
              </Box>

              {draft.exercises.map(ex => {
                const open = expandedId === ex.id
                return (
                  <Box
                    key={ex.id}
                    sx={{
                      borderBottom: `1px solid ${colors.stroke}`,
                      '&:last-child': { borderBottom: 'none' },
                      ...(ex.done && {
                        '& .ex-name': { textDecoration: 'line-through', color: colors.muted },
                      }),
                      ...(open && {
                        '& .detail': { borderTop: `1px solid ${colors.stroke}` },
                        '& .chevron': { color: colors.blue },
                      }),
                    }}
                  >
                    <Box
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleExpand(ex.id)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          toggleExpand(ex.id)
                        }
                      }}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '40px minmax(0, 1fr) 64px 50px',
                          md: '44px minmax(0, 1fr) 80px 54px',
                        },
                        gap: { xs: 1, md: 1.5 },
                        alignItems: 'center',
                        minHeight: 52,
                        px: { xs: 1.5, md: 1.75 },
                        cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                        '&:active': { bgcolor: 'rgba(59, 130, 246, 0.05)' },
                      }}
                    >
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onClick={e => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={!!ex.done}
                          color="success"
                          size="small"
                          slotProps={{ input: { 'aria-label': 'Mark exercise done' } }}
                          onChange={() => dispatch(toggleExercise(ex.id))}
                        />
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 0.75,
                          overflow: 'hidden',
                          minWidth: 0,
                        }}
                      >
                        <Box
                          className="ex-name"
                          component="p"
                          sx={{
                            m: 0,
                            flex: 1,
                            minWidth: 0,
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            color: colors.text,
                          }}
                        >
                          {ex.name}
                        </Box>
                        {open ? (
                          <ChevronUpIcon
                            className="chevron"
                            sx={{ fontSize: 18, color: colors.muted, flexShrink: 0 }}
                          />
                        ) : (
                          <ChevronDownIcon
                            className="chevron"
                            sx={{ fontSize: 18, color: colors.muted, flexShrink: 0 }}
                          />
                        )}
                      </Box>
                      <Box
                        component="p"
                        sx={{
                          m: 0,
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          color: colors.text,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ex.weight ? `${ex.weight} ${ex.weightUnit === 'lb' ? 'lb' : 'kg'}` : '—'}
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                        }}
                        onClick={e => e.stopPropagation()}
                      >
                        <IconButton
                          size="small"
                          aria-label="Exercise actions"
                          sx={{ color: colors.muted }}
                          onClick={e => {
                            setMenuExId(ex.id)
                            setMenuAnchor(e.currentTarget)
                          }}
                        >
                          <MoreVertIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                      </Box>
                    </Box>
                    {open && (
                      <Box
                        className="detail"
                        sx={{
                          p: '10px 14px 14px',
                          bgcolor: colors.surface2,
                          animation: 'expand-in 0.18s ease',
                          '@keyframes expand-in': {
                            from: { opacity: 0, transform: 'translateY(-4px)' },
                            to: { opacity: 1, transform: 'translateY(0)' },
                          },
                        }}
                      >
                        <Box
                          component="p"
                          sx={{
                            m: '0 0 4px',
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: colors.muted,
                          }}
                        >
                          Description
                        </Box>
                        <Box
                          component="p"
                          sx={{
                            m: 0,
                            fontSize: '0.875rem',
                            lineHeight: 1.45,
                            color: colors.text,
                            whiteSpace: 'pre-line',
                          }}
                        >
                          {ex.description || 'No description'}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )
              })}
            </Box>
          )}
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null)
          setMenuExId(null)
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: { bgcolor: colors.surface2, border: `1px solid ${colors.stroke}` },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            const ex = draft.exercises.find(e => e.id === menuExId)
            setMenuAnchor(null)
            if (ex) openEdit(ex)
          }}
        >
          <ListItemIcon>
            <EditOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem
          sx={{ color: colors.red, '& .MuiListItemIcon-root': { color: colors.red } }}
          onClick={() => {
            const id = menuExId
            setMenuAnchor(null)
            if (id) handleDeleteExercise(id)
          }}
        >
          <ListItemIcon>
            <DeleteOutlineIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Box
        component="button"
        type="button"
        aria-label="Add exercise"
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

      <Dialog open={dialogOpen} onClose={closeDialog} maxWidth="xs" fullWidth>
        <Box
          sx={{
            bgcolor: colors.surface,
            border: `1px solid ${colors.stroke}`,
            borderRadius: colors.radius,
          }}
        >
          <DialogTitle sx={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }}>
            {dialogMode === 'edit' ? 'Edit exercise' : 'Add exercise'}
          </DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <TextField
              label="Name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <DirectionsRunIcon sx={{ color: colors.muted, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={fieldSx}
            />
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <TextField
                label="Weight"
                value={form.weight}
                onChange={e => setWeight(e.target.value)}
                onKeyDown={onWeightKeydown}
                slotProps={{
                  input: {
                    inputMode: 'decimal',
                    startAdornment: (
                      <InputAdornment position="start">
                        <ScaleIcon sx={{ color: colors.muted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={{ ...fieldSx, flex: 1, minWidth: 0 }}
              />
              <Box
                role="group"
                aria-label="Weight unit"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: 0.75,
                  flexShrink: 0,
                  width: 96,
                  pt: '2px',
                }}
              >
                {['kg', 'lb'].map(unit => (
                  <Box
                    key={unit}
                    component="button"
                    type="button"
                    onClick={() => setForm(f => ({ ...f, weightUnit: unit }))}
                    sx={{
                      height: 40,
                      border: `1px solid ${form.weightUnit === unit ? colors.blue : colors.stroke}`,
                      borderRadius: colors.radiusBtn,
                      bgcolor:
                        form.weightUnit === unit ? 'rgba(59, 130, 246, 0.12)' : colors.surface2,
                      color: form.weightUnit === unit ? colors.text : colors.muted,
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, color 0.15s, background 0.15s',
                      '&:hover': form.weightUnit !== unit ? { color: colors.text } : {},
                    }}
                  >
                    {unit}
                  </Box>
                ))}
              </Box>
            </Box>
            <TextField
              label="Description"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              multiline
              minRows={3}
              maxRows={6}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1.5 }}>
                      <NotesIcon sx={{ color: colors.muted, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={fieldSx}
            />
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 2, gap: 1 }}>
            <Button
              variant="outlined"
              onClick={closeDialog}
              sx={{ borderColor: colors.stroke, color: colors.muted }}
            >
              Cancel
            </Button>
            <GradientButton onClick={handleSaveExercise}>
              {dialogMode === 'edit' ? 'Update' : 'Add'}
            </GradientButton>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}
