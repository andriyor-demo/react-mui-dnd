"use client"

import React, {useEffect, useRef, useState} from 'react';

import {
  Active,
  Announcements,
  closestCenter,
  CollisionDetection,
  DndContext,
  DropAnimation,
  KeyboardSensor,
  KeyboardCoordinateGetter,
  Modifiers,
  MouseSensor,
  MeasuringConfiguration,
  PointerActivationConstraint,
  ScreenReaderInstructions,
  TouchSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  useSortable,
  SortableContext,
  sortableKeyboardCoordinates,
  SortingStrategy,
  rectSortingStrategy,
  AnimateLayoutChanges,
  NewIndexGetter,
} from '@dnd-kit/sortable';



import {createRange} from "@/app/createRange";
import {List} from "@/app/List";
import {Wrapper} from "@/app/Wrapper";
import {Item} from "@/app/Item";

export interface Props {
  collisionDetection?: CollisionDetection;
  Container?: any; // To-do: Fix me
  handle?: boolean;
  itemCount?: number;
  items?: UniqueIdentifier[];
  removable?: boolean;
  reorderItems?: typeof arrayMove;
  strategy?: SortingStrategy;
  style?: React.CSSProperties;
  useDragOverlay?: boolean;
  getItemStyles?(args: {
    id: UniqueIdentifier;
    index: number;
    isSorting: boolean;
    isDragOverlay: boolean;
    overIndex: number;
    isDragging: boolean;
  }): React.CSSProperties;
  wrapperStyle?(args: {
    active: Pick<Active, 'id'> | null;
    index: number;
    isDragging: boolean;
    id: UniqueIdentifier;
  }): React.CSSProperties;
  isDisabled?(id: UniqueIdentifier): boolean;
}

const screenReaderInstructions: ScreenReaderInstructions = {
  draggable: `
    To pick up a sortable item, press the space bar.
    While sorting, use the arrow keys to move the item.
    Press space again to drop the item in its new position, or press escape to cancel.
  `,
};

export function Sortable({
                           Container = List,
                           collisionDetection = closestCenter,
                           getItemStyles = () => ({}),
                           handle = false,
                           itemCount = 16,
                           items: initialItems,
                           isDisabled = () => false,
                           removable,
                           reorderItems = arrayMove,
                           strategy = rectSortingStrategy,
                           style,
                           wrapperStyle = () => ({}),
                         }: Props) {
  const [items, setItems] = useState<UniqueIdentifier[]>(
    () =>
      initialItems ??
      createRange<UniqueIdentifier>(itemCount, (index) => index + 1)
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const isFirstAnnouncement = useRef(true);
  const getIndex = (id: UniqueIdentifier) => items.indexOf(id);
  const getPosition = (id: UniqueIdentifier) => getIndex(id) + 1;
  const activeIndex = activeId ? getIndex(activeId) : -1;
  const handleRemove = removable
    ? (id: UniqueIdentifier) =>
      setItems((items) => items.filter((item) => item !== id))
    : undefined;
  const announcements: Announcements = {
    onDragStart({active: {id}}) {
      return `Picked up sortable item ${String(
        id
      )}. Sortable item ${id} is in position ${getPosition(id)} of ${
        items.length
      }`;
    },
    onDragOver({active, over}) {
      // In this specific use-case, the picked up item's `id` is always the same as the first `over` id.
      // The first `onDragOver` event therefore doesn't need to be announced, because it is called
      // immediately after the `onDragStart` announcement and is redundant.
      if (isFirstAnnouncement.current === true) {
        isFirstAnnouncement.current = false;
        return;
      }

      if (over) {
        return `Sortable item ${
          active.id
        } was moved into position ${getPosition(over.id)} of ${items.length}`;
      }

      return;
    },
    onDragEnd({active, over}) {
      if (over) {
        return `Sortable item ${
          active.id
        } was dropped at position ${getPosition(over.id)} of ${items.length}`;
      }

      return;
    },
    onDragCancel({active: {id}}) {
      return `Sorting was cancelled. Sortable item ${id} was dropped and returned to position ${getPosition(
        id
      )} of ${items.length}.`;
    },
  };

  useEffect(() => {
    if (!activeId) {
      isFirstAnnouncement.current = true;
    }
  }, [activeId]);

  return (
    <DndContext
      accessibility={{
        announcements,
        screenReaderInstructions,
      }}
      collisionDetection={collisionDetection}
      onDragStart={({active}) => {
        if (!active) {
          return;
        }

        setActiveId(active.id);
      }}
      onDragEnd={({over}) => {
        setActiveId(null);

        if (over) {
          const overIndex = getIndex(over.id);
          if (activeIndex !== overIndex) {
            setItems((items) => reorderItems(items, activeIndex, overIndex));
          }
        }
      }}
      onDragCancel={() => setActiveId(null)}
    >
      <Wrapper style={style} center>
        <SortableContext items={items} strategy={strategy}>
          <Container>
            {items.map((value, index) => (
              <SortableItem
                key={value}
                id={value}
                handle={handle}
                index={index}
                style={getItemStyles}
                wrapperStyle={wrapperStyle}
                disabled={isDisabled(value)}
                onRemove={handleRemove}
              />
            ))}
          </Container>
        </SortableContext>
      </Wrapper>
    </DndContext>
  );
}

interface SortableItemProps {
  disabled?: boolean;
  id: UniqueIdentifier;
  index: number;
  handle: boolean;
  onRemove?(id: UniqueIdentifier): void;
  style(values: any): React.CSSProperties;
  wrapperStyle: Props['wrapperStyle'];
}

export function SortableItem({
                               disabled,
                               handle,
                               id,
                               index,
                               onRemove,
                               style,
                               wrapperStyle,
                             }: SortableItemProps) {
  const {
    active,
    attributes,
    isDragging,
    isSorting,
    listeners,
    overIndex,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({
    id,
    disabled,
  });

  return (
    <Item
      ref={setNodeRef}
      value={id}
      disabled={disabled}
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={
        handle
          ? {
            ref: setActivatorNodeRef,
          }
          : undefined
      }
      index={index}
      style={style({
        index,
        id,
        isDragging,
        isSorting,
        overIndex,
      })}
      onRemove={onRemove ? () => onRemove(id) : undefined}
      transform={transform}
      transition={transition}
      wrapperStyle={wrapperStyle?.({index, isDragging, active, id})}
      listeners={listeners}
      data-index={index}
      data-id={id}
      {...attributes}
    />
  );
}
