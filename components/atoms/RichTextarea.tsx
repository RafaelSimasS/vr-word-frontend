"use client";

import React, { useCallback, useEffect, useRef } from "react";
import cn from "clsx";
import { Undo, Redo } from "lucide-react";

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

  out = out.replace(
    /\[color=(#?[\da-fA-F]{3,6})\](.+?)\[\/color\]/g,
    (_m, color, text) => `<span style="color:${color}">${text}</span>`,
  );

  // bold **text**
  out = out.replace(/\*\*(.+?)\*\*/g, (_m, text) => `<strong>${text}</strong>`);

  // italic _text_
  out = out.replace(/_(.+?)_/g, (_m, text) => `<em>${text}</em>`);

  // preserve line breaks
  out = out.replace(/\n/g, "<br/>");

  return out;
}

/**
 * Insere texto na posição do cursor (ou envolvendo seleção).
 * OBS: removi o dispatchEvent dentro desta função para que o fluxo
 * de histórico fique controlado centralmente pelo componente (evita duplicidade).
 */
function insertAtCursor(
  textarea: HTMLTextAreaElement,
  before: string,
  after = "",
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

type HistoryEntry = {
  value: string;
  start: number;
  end: number;
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

  const historyRef = useRef<HistoryEntry[]>([
    { value: value ?? "", start: 0, end: 0 },
  ]);
  const idxRef = useRef<number>(0);

  const pushHistory = useCallback((entry: HistoryEntry) => {
    const hist = historyRef.current;
    const idx = idxRef.current;
    if (hist[idx] && hist[idx].value === entry.value) {
      hist[idx] = entry;
      return;
    }
    if (idx < hist.length - 1) {
      hist.splice(idx + 1);
    }
    hist.push(entry);
    idxRef.current = hist.length - 1;
  }, []);

  const handleInternalChange = useCallback(
    (opts?: {
      value?: string;
      start?: number;
      end?: number;
      replace?: boolean;
    }) => {
      const ta = ref.current;
      const val = opts?.value ?? (ta ? ta.value : (value ?? ""));
      const start = opts?.start ?? (ta ? ta.selectionStart : val.length);
      const end = opts?.end ?? (ta ? ta.selectionEnd : start);

      const entry: HistoryEntry = { value: val, start, end };

      if (opts?.replace) {
        // substitui o estado atual (útil para correções finas)
        historyRef.current[idxRef.current] = entry;
      } else {
        pushHistory(entry);
      }

      // notifica parent
      onChange(val);
    },
    [onChange, pushHistory, value],
  );

  const undo = useCallback(() => {
    if (idxRef.current > 0) {
      idxRef.current -= 1;
      const entry = historyRef.current[idxRef.current];
      if (ref.current) {
        ref.current.value = entry.value;
        try {
          ref.current.selectionStart = entry.start;
          ref.current.selectionEnd = entry.end;
        } catch {}
      }
      onChange(entry.value);
    }
  }, [onChange]);

  const redo = useCallback(() => {
    const hist = historyRef.current;
    if (idxRef.current < hist.length - 1) {
      idxRef.current += 1;
      const entry = historyRef.current[idxRef.current];
      if (ref.current) {
        ref.current.value = entry.value;
        try {
          ref.current.selectionStart = entry.start;
          ref.current.selectionEnd = entry.end;
        } catch {}
      }
      onChange(entry.value);
    }
  }, [onChange]);

  useEffect(() => {
    const cur = historyRef.current[idxRef.current];
    if (!cur || cur.value !== value) {
      historyRef.current = [{ value: value ?? "", start: 0, end: 0 }];
      idxRef.current = 0;

      if (ref.current) {
        ref.current.value = value ?? "";
        try {
          const len = (value ?? "").length;
          ref.current.selectionStart = ref.current.selectionEnd = len;
        } catch {}
      }
    }
  }, [value]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const isMac =
        typeof navigator !== "undefined" &&
        /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (!mod) return;

      const key = e.key.toLowerCase();

      if (key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if (key === "y" && !isMac) {
        // Ctrl+Y é redo no Windows
        e.preventDefault();
        redo();
      }
    },
    [redo, undo],
  );

  const applyBold = useCallback(() => {
    const ta = ref.current;
    if (!ta) return;
    insertAtCursor(ta, "**", "**");
    handleInternalChange();
    ta.focus();
  }, [handleInternalChange]);

  const applyItalic = useCallback(() => {
    const ta = ref.current;
    if (!ta) return;
    insertAtCursor(ta, "_", "_");
    handleInternalChange();
    ta.focus();
  }, [handleInternalChange]);

  const applyColor = useCallback(
    (hex: string) => {
      const ta = ref.current;
      if (!ta) return;
      insertAtCursor(ta, `[color=${hex}]`, `[/color]`);
      handleInternalChange();
      ta.focus();
    },
    [handleInternalChange],
  );

  const onTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const ta = e.target;
      handleInternalChange({
        value: ta.value,
        start: ta.selectionStart,
        end: ta.selectionEnd,
      });
    },
    [handleInternalChange],
  );

  // Render
  return (
    <div className="w-full">
      {label && (
        <div className="text-xs text-gray-600 dark:text-gray-300 mb-2 ">
          {label}
        </div>
      )}
      <div className="border rounded-md bg-white dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-2 p-2 border-b dark:border-b-0">
          <button
            type="button"
            onClick={applyBold}
            className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0"
            aria-label="bold"
          >
            <strong>B</strong>
          </button>

          <button
            type="button"
            onClick={applyItalic}
            className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0"
            aria-label="italic"
          >
            <em>I</em>
          </button>

          <button
            type="button"
            onClick={undo}
            className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0"
            aria-label="undo"
          >
            <Undo size={16} />
          </button>

          <button
            type="button"
            onClick={redo}
            className="px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 shrink-0"
            aria-label="redo"
          >
            <Redo size={16} />
          </button>

          <div className="flex items-center gap-1 ml-2 shrink-0">
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
                className="w-6 h-6 rounded shrink-0"
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
          onChange={onTextareaChange}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className={cn(
            "w-full min-w-0 box-border resize-y px-3 py-2 text-sm bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none",
            className,
          )}
        />
      </div>
    </div>
  );
};

export default RichTextarea;
