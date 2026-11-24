import {
  useLayoutEffect,
  useRef,
  type ClipboardEvent,
  type CompositionEvent,
  type FocusEvent,
  type FormEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from 'react';
import { useCms } from '../../context/CmsContext';

type TextTag = 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'div';

interface EditableTextProps {
  value: string;
  onChange: (nextValue: string) => void;
  as?: TextTag;
  className?: string;
  singleLine?: boolean;
  ariaLabel?: string;
}

export function EditableText({
  value,
  onChange,
  as = 'span',
  className = '',
  singleLine = false,
  ariaLabel,
}: EditableTextProps) {
  const { editMode } = useCms();
  const ref = useRef<HTMLElement>(null);
  const isComposingRef = useRef(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!editMode || !el) return;
    if (document.activeElement !== el && el.textContent !== value) {
      el.textContent = value;
    }
  }, [value, editMode]);

  const Tag = as;

  if (!editMode) {
    return (
      <Tag key="view" className={className}>
        {value}
      </Tag>
    );
  }

  const readLiveValue = (el: HTMLElement): string => {
    const raw = (el.textContent ?? '').replace(/\u00a0/g, ' ');
    return singleLine ? raw.replace(/[\r\n]+/g, ' ') : raw;
  };

  const commitLive = (el: HTMLElement) => {
    const next = readLiveValue(el);
    if (next.trim().length > 0 && next !== value) {
      onChange(next);
    }
  };

  const handleInput = (e: FormEvent<HTMLElement>) => {
    if (isComposingRef.current) return;
    commitLive(e.currentTarget);
  };

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionEnd = (e: CompositionEvent<HTMLElement>) => {
    isComposingRef.current = false;
    commitLive(e.currentTarget);
  };

  const handlePaste = (e: ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    const raw = e.clipboardData.getData('text/plain');
    const sanitized = singleLine ? raw.replace(/[\r\n]+/g, ' ') : raw;
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(sanitized);
      range.insertNode(textNode);
      range.setStartAfter(textNode);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      if (!isComposingRef.current) {
        commitLive(e.currentTarget);
      }
    }
  };

  const handleBlur = (e: FocusEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const trimmed = readLiveValue(el).trim();
    if (trimmed.length > 0) {
      if (trimmed !== value) {
        onChange(trimmed);
      }
      if (el.textContent !== trimmed) {
        el.textContent = trimmed;
      }
    } else {
      el.textContent = value;
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    // Allow global Save / Edit Mode shortcuts to bubble up
    if ((e.ctrlKey || e.metaKey) && ['s', 'e'].includes(e.key.toLowerCase())) {
      return;
    }
    e.stopPropagation();
    if (singleLine && e.key === 'Enter') {
      e.preventDefault();
      e.currentTarget.blur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.currentTarget.textContent = value;
      e.currentTarget.blur();
    }
  };

  const stopInteractivePropagation = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  const stopPointerPropagation = (e: PointerEvent<HTMLElement>) => {
    e.stopPropagation();
  };

  return (
    <Tag
      key="edit"
      ref={ref as never}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={ariaLabel ?? 'Editable text'}
      onClick={stopInteractivePropagation}
      onMouseDown={stopInteractivePropagation}
      onPointerDown={stopPointerPropagation}
      onInput={handleInput}
      onPaste={handlePaste}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`${className} select-text cursor-text rounded-sm outline-dashed outline-1 outline-transparent transition-[outline-color,background-color] duration-150 hover:outline-[#E5A93C]/85 hover:bg-[#E5A93C]/10 focus:outline-2 focus:outline-[#E5A93C] focus:bg-zinc-950/65`}
    />
  );
}
