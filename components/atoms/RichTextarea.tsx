"use client";

import React, { useRef } from "react";
import cn from "clsx";

/**
 * Marcações usadas:
 *  - Bold: **bold**
 *  - Italic: _italic_
 *  - Color: [color=#RRGGBB]text[/color]
 *
 * A string salva no backend será literal com essas marcações.
 */

/** Converte a string com marcações para HTML seguro (preview). */
export function renderMarkupToHtml(src: string) {
  if (!src) return "";

  // escape HTML
  const esc = (s: string) =>
    s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");

  let out = esc(src);

  // color [color=#123456]text[/color]
  out = out.replace(
    /\[color=(#?[\da-fA-F]{3,6})\](.+?)\[\/color\]/g,
    (_m, color, text) => `<span style="color:${color}">${text}</span>`
  );

  // bold **text**
  out = out.replace(/\*\*(.+?)\*\*/g, (_m, text) => `<strong>${text}</strong>`);

  // italic _text_
  out = out.replace(/_(.+?)_/g, (_m, text) => `<em>${text}</em>`);

  // preserve line breaks
  out = out.replace(/\n/g, "<br/>");

  return out;
}

function insertAtCursor(
  textarea: HTMLTextAreaElement,
  before: string,
  after = ""
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const val = textarea.value;
  const selected = val.slice(start, end);
  const newVal =
    val.slice(0, start) + before + selected + after + val.slice(end);
  textarea.value = newVal;
  // place cursor inside the inserted area if nothing selected
  const newPos =
    start + before.length + (selected ? selected.length + after.length : 0);
  textarea.selectionStart = textarea.selectionEnd = newPos;
  textarea.dispatchEvent(new Event("input", { bubbles: true }));
}

/** Atom component */
type RichTextareaProps = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  label?: string;
  placeholder?: string;
  rows?: number;
};

const RichTextarea: React.FC<RichTextareaProps> = ({
  value,
  onChange,
  className,
  label,
  placeholder,
  rows = 6,
}) => {
  const ref = useRef<HTMLTextAreaElement | null>(null);

  const applyBold = () => {
    const ta = ref.current;
    if (!ta) return;
    insertAtCursor(ta, "**", "**");
    onChange(ta.value);
    ta.focus();
  };

  const applyItalic = () => {
    const ta = ref.current;
    if (!ta) return;
    insertAtCursor(ta, "_", "_");
    onChange(ta.value);
    ta.focus();
  };

  const applyColor = (hex: string) => {
    const ta = ref.current;
    if (!ta) return;
    insertAtCursor(ta, `[color=${hex}]`, `[/color]`);
    onChange(ta.value);
    ta.focus();
  };

  return (
    <div className="w-full">
      {label && (
        <div className="text-xs text-gray-600 dark:text-gray-300 mb-2">
          {label}
        </div>
      )}
      <div className="border rounded-md bg-white dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-2 p-2 border-b dark:border-b-0">
          <button
            type="button"
            onClick={applyBold}
            className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
            aria-label="bold"
          >
            <strong>B</strong>
          </button>

          <button
            type="button"
            onClick={applyItalic}
            className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
            aria-label="italic"
          >
            <em>I</em>
          </button>

          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {[
              "#000000",
              "#C0392B",
              "#27AE60",
              "#2980B9",
              "#8E44AD",
              "#F39C12",
            ].map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`color ${c}`}
                onClick={() => applyColor(c)}
                className="w-6 h-6 rounded flex-shrink-0"
                style={{ background: c, border: "1px solid rgba(0,0,0,0.08)" }}
              />
            ))}
          </div>

          <div className="w-full sm:w-auto sm:ml-auto text-xs text-muted-foreground text-left sm:text-right mt-2 sm:mt-0">
            Use **bold**, _italic_ e [color=#rrggbb]texto[/color]
          </div>
        </div>

        <textarea
          ref={ref}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full min-w-0 box-border resize-y px-3 py-2 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none",
            className
          )}
        />
      </div>
    </div>
  );
};

export default RichTextarea;
