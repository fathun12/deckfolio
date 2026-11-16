"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorSlide } from "@/core/types/editor";

type SlideRowProps = {
  slide: EditorSlide;
  index: number;
  selected: boolean;
  onSelect: () => void;
};

function SlideRow({ slide, index, selected, onSelect }: SlideRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: slide.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        "flex items-center gap-1 border bg-paper",
        selected ? "border-accent" : "border-line",
        isDragging && "relative z-10 opacity-60"
      )}
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        className="cursor-grab touch-none p-2 text-muted"
        {...attributes}
        {...listeners}
      >
        <GripVertical size={16} />
      </button>
      <button
        type="button"
        onClick={onSelect}
        aria-current={selected ? "true" : undefined}
        className="flex min-w-0 flex-1 items-baseline gap-2 py-2 pr-3 text-left"
      >
        <span className="label-mono text-muted">{String(index + 1).padStart(2, "0")}</span>
        <span className="truncate text-sm font-medium">{slide.title}</span>
      </button>
    </li>
  );
}

type SlideGroupProps = {
  groupId: string;
  slides: EditorSlide[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (orderedIds: string[]) => void;
};

export function SlideGroup({ groupId, slides, selectedId, onSelect, onReorder }: SlideGroupProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const ids = slides.map((s) => s.id);
    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from < 0 || to < 0) return;
    onReorder(arrayMove(ids, from, to));
  }

  if (slides.length === 0) {
    return <p className="label-mono py-2 text-muted">No slides</p>;
  }

  return (
    // id tetap supaya tidak ada hydration mismatch dari dnd-kit
    <DndContext
      id={groupId}
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={slides.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-1">
          {slides.map((slide, index) => (
            <SlideRow
              key={slide.id}
              slide={slide}
              index={index}
              selected={slide.id === selectedId}
              onSelect={() => onSelect(slide.id)}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}