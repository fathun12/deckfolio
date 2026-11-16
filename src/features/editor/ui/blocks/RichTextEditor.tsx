"use client";

import { useEffect, useRef } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import type { Editor, JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Code, Italic, List, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorProps } from "./types";

// Hanya fitur yang bisa ditampilkan viewer yang diaktifkan.
// Opsi `underline` hanya ada di Tiptap v3, jadi disisipkan lewat spread.
const extensions = [
  StarterKit.configure({
    heading: false,
    blockquote: false,
    codeBlock: false,
    horizontalRule: false,
    strike: false,
    ...({ underline: false } as object),
  }),
];

function Toolbar({ editor }: { editor: Editor }) {
  const active = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      bold: current?.isActive("bold") ?? false,
      italic: current?.isActive("italic") ?? false,
      code: current?.isActive("code") ?? false,
      bulletList: current?.isActive("bulletList") ?? false,
      orderedList: current?.isActive("orderedList") ?? false,
    }),
  });

  const items = [
    {
      key: "bold",
      label: "Bold",
      icon: Bold,
      on: active.bold,
      run: () => editor.chain().focus().toggleBold().run(),
    },
    {
      key: "italic",
      label: "Italic",
      icon: Italic,
      on: active.italic,
      run: () => editor.chain().focus().toggleItalic().run(),
    },
    {
      key: "code",
      label: "Inline code",
      icon: Code,
      on: active.code,
      run: () => editor.chain().focus().toggleCode().run(),
    },
    {
      key: "bullet",
      label: "Bullet list",
      icon: List,
      on: active.bulletList,
      run: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      key: "ordered",
      label: "Numbered list",
      icon: ListOrdered,
      on: active.orderedList,
      run: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  return (
    <div className="mb-2 flex flex-wrap gap-1">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <button
            key={item.key}
            type="button"
            aria-label={item.label}
            aria-pressed={item.on}
            className={cn("btn-sm", item.on && "border-accent text-accent")}
            onClick={item.run}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}

export function RichTextEditor({ block, onChange }: EditorProps<"text">) {
  // Selalu pakai block dan onChange terbaru di dalam event Tiptap
  const latest = useRef({ block, onChange });
  useEffect(() => {
    latest.current = { block, onChange };
  });

  const editor = useEditor({
    extensions,
    content: (block.content ?? undefined) as JSONContent | undefined,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "rich-editor", "aria-label": "Text content" },
    },
    onUpdate: ({ editor: current }) => {
      const { block: currentBlock, onChange: emit } = latest.current;
      emit({ ...currentBlock, content: current.getJSON() });
    },
  });

  if (!editor) {
    return <p className="label-mono text-muted">Loading editor...</p>;
  }

  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}