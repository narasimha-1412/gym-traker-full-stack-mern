import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  TextField,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  InputAdornment,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import SearchIcon from '@mui/icons-material/Search'
import CloseIcon from '@mui/icons-material/Close'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import StarIcon from '@mui/icons-material/Star'
import LockResetIcon from '@mui/icons-material/LockReset'
import PersonOffIcon from '@mui/icons-material/PersonOff'
import PersonIcon from '@mui/icons-material/Person'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { colors } from '@/app/theme'
import {
  fetchUsers,
  setUserSearch,
  clearUserSearch,
  createUserAction,
  createFormSet,
  toggleUserStatus,
  resetUserPassword,
  deleteUserAction,
  copyText,
  selectGeneratedEmail,
  DEFAULT_PASSWORD,
} from '@/features/users/usersSlice'

const fieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: colors.radiusBtn,
    bgcolor: colors.surface2,
  },
}

export default function UsersPage() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const name = useAppSelector(s => s.users.name)
  const password = useAppSelector(s => s.users.password)
  const list = useAppSelector(s => s.users.list)
  const search = useAppSelector(s => s.users.search)
  const searching = useAppSelector(s => s.users.searching)
  const generatedEmail = useAppSelector(selectGeneratedEmail)

  const [menuAnchor, setMenuAnchor] = useState(null)
  const [menuUserId, setMenuUserId] = useState(null)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  const menuUser = list.find(u => u.id === menuUserId)

  return (
    <Box sx={{ bgcolor: colors.bg, minHeight: '100%' }}>
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: colors.surface, borderBottom: `1px solid ${colors.stroke}`, height: 56 }}
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
            Users
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        sx={{
          p: 2,
          maxWidth: 480,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.75,
        }}
      >
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
            Create user
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 1.75 }}>
            <TextField
              label="Name"
              placeholder="e.g. Rahul Kumar"
              value={name}
              onChange={e => dispatch(createFormSet({ name: e.target.value }))}
              onKeyDown={e => e.key === 'Enter' && dispatch(createUserAction())}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutlineIcon sx={{ color: colors.muted, fontSize: 20 }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={fieldSx}
            />
            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Email"
                type="email"
                placeholder="Email"
                value={generatedEmail}
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
              <IconButton
                size="small"
                aria-label="Copy email"
                onClick={() =>
                  dispatch(
                    copyText({
                      text: generatedEmail,
                      successMsg: 'Email copied',
                      emptyMsg: 'Enter a name first',
                    })
                  )
                }
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                }}
              >
                <ContentCopyIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
            <Box sx={{ position: 'relative' }}>
              <TextField
                label="Password"
                placeholder="At least 4 characters"
                type="text"
                value={password}
                onChange={e => dispatch(createFormSet({ password: e.target.value }))}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ color: colors.muted, fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  },
                }}
                sx={fieldSx}
              />
              <IconButton
                size="small"
                aria-label="Copy password"
                onClick={() =>
                  dispatch(
                    copyText({
                      text: DEFAULT_PASSWORD,
                      successMsg: 'Default password copied',
                      emptyMsg: '',
                    })
                  )
                }
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1,
                }}
              >
                <ContentCopyIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
            <Box
              component="p"
              sx={{ m: '-6px 0 0', fontSize: '0.75rem', lineHeight: 1.3, color: colors.muted }}
            >
              Min 4 characters
            </Box>
          </Box>
          <Box
            component="button"
            type="button"
            onClick={() => dispatch(createUserAction())}
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
            }}
          >
            Create
          </Box>
        </Box>

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
            All users
          </Box>
          <TextField
            label="Search users"
            placeholder="Search by name or email"
            value={search}
            onChange={e => dispatch(setUserSearch(e.target.value))}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: colors.muted, fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      aria-label="Clear search"
                      onClick={() => dispatch(clearUserSearch())}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
            sx={{ ...fieldSx, mb: 1.75 }}
          />

          {searching ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 72,
                color: colors.blue,
              }}
              aria-live="polite"
              aria-busy="true"
            >
              <CircularProgress size={28} thickness={2} color="primary" />
            </Box>
          ) : (
            <Box
              component="ul"
              sx={{
                listStyle: 'none',
                m: 0,
                p: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: 1.25,
              }}
            >
              {list.map(u => (
                <Box
                  key={u.id}
                  component="li"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    p: 1.5,
                    bgcolor: colors.surface2,
                    borderRadius: colors.radiusBtn,
                  }}
                >
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Box
                      component="p"
                      sx={{
                        m: 0,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.5,
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: colors.text,
                      }}
                    >
                      {u.name}
                      {u.status === 'disabled' && (
                        <Box
                          component="span"
                          aria-label="Disabled"
                          title="Disabled"
                          sx={{
                            display: 'inline-block',
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: colors.red,
                            flexShrink: 0,
                          }}
                        />
                      )}
                      {u.role === 'admin' && (
                        <StarIcon sx={{ fontSize: 16, color: colors.blue }} aria-label="Admin" />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, mt: 0.25 }}>
                      <Box
                        component="p"
                        sx={{
                          m: 0,
                          fontSize: '0.8rem',
                          color: colors.muted,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {u.email}
                      </Box>
                      <IconButton
                        size="small"
                        aria-label="Copy email"
                        onClick={() =>
                          dispatch(
                            copyText({
                              text: u.email,
                              successMsg: 'Email copied',
                              emptyMsg: '',
                            })
                          )
                        }
                      >
                        <ContentCopyIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  </Box>
                  <IconButton
                    size="small"
                    aria-label="User actions"
                    sx={{ flexShrink: 0 }}
                    onClick={e => {
                      setMenuUserId(u.id)
                      setMenuAnchor(e.currentTarget)
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => {
          setMenuAnchor(null)
          setMenuUserId(null)
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { minWidth: 160 } } }}
      >
        <MenuItem
          onClick={() => {
            const id = menuUserId
            setMenuAnchor(null)
            if (id) dispatch(resetUserPassword(id))
          }}
        >
          <ListItemIcon>
            <LockResetIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reset password</ListItemText>
        </MenuItem>
        {menuUser && menuUser.role !== 'admin' && (
          <MenuItem
            onClick={() => {
              const id = menuUserId
              setMenuAnchor(null)
              if (id) dispatch(toggleUserStatus(id))
            }}
          >
            <ListItemIcon>
              {menuUser.status === 'active' ? (
                <PersonOffIcon fontSize="small" />
              ) : (
                <PersonIcon fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>{menuUser.status === 'active' ? 'Disable' : 'Enable'}</ListItemText>
          </MenuItem>
        )}
        {menuUser && menuUser.role !== 'admin' && (
          <MenuItem
            onClick={() => {
              const id = menuUserId
              setMenuAnchor(null)
              if (id) dispatch(deleteUserAction(id))
            }}
          >
            <ListItemIcon>
              <DeleteOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </Box>
  )
}
