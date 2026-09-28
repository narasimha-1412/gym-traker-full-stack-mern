import { Box, Radio, IconButton, Menu, MenuItem, ListItemIcon, ListItemText } from '@mui/material'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import { useState } from 'react'
import { colors } from '@/app/theme'

export default function SplitCard({ split, active, onSelect, onEdit, onDelete }) {
  const [menuAnchor, setMenuAnchor] = useState(null)

  const workoutLabel = `${split.workoutCount} workout${split.workoutCount === 1 ? '' : 's'}`

  return (
    <Box
      role="button"
      tabIndex={0}
      onClick={() => onSelect(split.id)}
      onKeyDown={e => {
        if (e.key === 'Enter') onSelect(split.id)
      }}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        position: 'relative',
        overflow: 'hidden',
        minHeight: 72,
        p: '12px 8px 12px 18px',
        bgcolor: colors.surface,
        border: `1px solid ${colors.stroke}`,
        borderRadius: colors.radius,
        cursor: 'pointer',
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        WebkitTapHighlightColor: 'transparent',
        '&:active': { transform: 'scale(0.98)' },
        '@media (hover: hover)': {
          '&:hover': {
            transform: 'translateY(-3px)',
            borderColor: 'rgba(59, 130, 246, 0.45)',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            '& .menu-btn': { color: `${colors.text} !important` },
          },
        },
        ...(active && {
          borderColor: 'rgba(59, 130, 246, 0.55)',
          boxShadow: '0 0 0 1px rgba(59, 130, 246, 0.25)',
          '& .split-title': { color: colors.blue },
        }),
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: colors.gradient,
        }}
      />
      <Box sx={{ flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <Radio
          checked={active}
          color="primary"
          onChange={(_, checked) => {
            if (checked) onSelect(split.id)
          }}
          onClick={e => e.stopPropagation()}
        />
      </Box>
      <Box sx={{ flex: 1, minWidth: 0, pl: 0.5 }}>
        <Box
          className="split-title"
          component="p"
          sx={{
            m: 0,
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: '1rem',
            fontWeight: 600,
            color: colors.text,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {split.title}
        </Box>
        <Box component="p" sx={{ m: '2px 0 0', fontSize: '0.8rem', color: colors.muted }}>
          {workoutLabel}
        </Box>
      </Box>
      <Box sx={{ flexShrink: 0 }} onClick={e => e.stopPropagation()}>
        <IconButton
          className="menu-btn"
          size="small"
          aria-label="Split actions"
          sx={{ color: colors.muted }}
          onClick={e => {
            e.stopPropagation()
            setMenuAnchor(e.currentTarget)
          }}
        >
          <MoreVertIcon sx={{ fontSize: 20 }} />
        </IconButton>
        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          slotProps={{
            paper: {
              sx: {
                bgcolor: colors.surface2,
                border: `1px solid ${colors.stroke}`,
                minWidth: 140,
              },
            },
          }}
        >
          <MenuItem
            onClick={() => {
              setMenuAnchor(null)
              onEdit(split.id)
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
              setMenuAnchor(null)
              onDelete(split.id)
            }}
          >
            <ListItemIcon>
              <DeleteOutlineIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  )
}
