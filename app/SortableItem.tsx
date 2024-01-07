import React from 'react';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItem from '@mui/material/ListItem';
import { IconButton } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

export const SortableItem = (props: { id: number }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: props.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ListItem
        disablePadding
        secondaryAction={
          <div
            style={{
              cursor: 'grab',
            }}
            {...listeners}
          >
            <IconButton edge="end">
              <DragIndicatorIcon />
            </IconButton>
          </div>
        }
      >
        <ListItemButton>
          <ListItemText primary={'kek'} />
        </ListItemButton>
      </ListItem>
    </div>
  );
};
