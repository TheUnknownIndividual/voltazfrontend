import React, { useEffect, useRef, useState } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

const toolbarButton = 'rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[10px] font-black text-slate-600 hover:border-emerald-400 hover:text-emerald-700';

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, onImageUpload }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const savedRangeRef = useRef<Range | null>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    const editor = editorRef.current;
    if (editor && editor.innerHTML !== value && document.activeElement !== editor) {
      editor.innerHTML = value || '';
    }
  }, [value]);

  useEffect(() => {
    const rememberSelection = () => {
      const editor = editorRef.current;
      const selection = window.getSelection();
      if (!editor || !selection?.rangeCount) return;
      const range = selection.getRangeAt(0);
      if (editor.contains(range.commonAncestorContainer)) {
        savedRangeRef.current = range.cloneRange();
        setIsToolbarVisible(true);
      }
    };

    document.addEventListener('selectionchange', rememberSelection);
    return () => document.removeEventListener('selectionchange', rememberSelection);
  }, []);

  const restoreSelection = () => {
    const selection = window.getSelection();
    if (!selection || !savedRangeRef.current) return;
    selection.removeAllRanges();
    selection.addRange(savedRangeRef.current);
  };

  const emitChange = () => onChange(editorRef.current?.innerHTML || '');

  const runCommand = (command: string, commandValue?: string) => {
    editorRef.current?.focus();
    restoreSelection();
    document.execCommand(command, false, commandValue);
    emitChange();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardHtml = event.clipboardData.getData('text/html');
    const clipboardText = event.clipboardData.getData('text/plain');
    if (!clipboardHtml && !clipboardText) return;

    event.preventDefault();
    const parsedContent = clipboardHtml || marked.parse(clipboardText, {
      async: false,
      breaks: true,
      gfm: true,
    });
    const safeHtml = DOMPurify.sanitize(parsedContent);
    runCommand('insertHTML', safeHtml);
  };

  const addLink = () => {
    const url = window.prompt('Keçid URL-i');
    if (url) runCommand('createLink', url);
  };

  const handleInlineImage = async (file?: File) => {
    if (!file || !onImageUpload) return;
    setIsUploadingImage(true);
    try {
      const imageUrl = await onImageUpload(file);
      if (imageUrl) runCommand('insertImage', imageUrl);
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  };

  return (
    <div ref={containerRef} className="relative rounded-2xl border border-slate-200 bg-slate-50 focus-within:border-emerald-500 focus-within:bg-white">
      {isToolbarVisible && (
        <div
          className="sticky top-2 z-20 m-2 flex flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
          onMouseDown={(event) => {
            if ((event.target as HTMLElement).closest('button')) event.preventDefault();
          }}
        >
          <select className={toolbarButton} defaultValue="p" onChange={(event) => runCommand('formatBlock', event.target.value)} aria-label="Mətn formatı">
            <option value="p">Normal</option>
            <option value="h2">Başlıq 2</option>
            <option value="h3">Başlıq 3</option>
            <option value="h4">Başlıq 4</option>
            <option value="blockquote">Sitat</option>
            <option value="pre">Kod</option>
          </select>
          <select className={toolbarButton} defaultValue="3" onChange={(event) => runCommand('fontSize', event.target.value)} aria-label="Mətn ölçüsü">
            <option value="1">Kiçik</option>
            <option value="3">Normal</option>
            <option value="5">Böyük</option>
            <option value="7">Çox böyük</option>
          </select>
          <button type="button" className={toolbarButton} onClick={() => runCommand('undo')}>Geri al</button>
          <button type="button" className={toolbarButton} onClick={() => runCommand('redo')}>Təkrar et</button>
          <button type="button" className={toolbarButton} onClick={() => runCommand('bold')}>B</button>
          <button type="button" className={`${toolbarButton} italic`} onClick={() => runCommand('italic')}>I</button>
          <button type="button" className={`${toolbarButton} underline`} onClick={() => runCommand('underline')}>U</button>
          <button type="button" className={`${toolbarButton} line-through`} onClick={() => runCommand('strikeThrough')}>S</button>
          <button type="button" className={toolbarButton} onClick={() => runCommand('subscript')}>X₂</button>
          <button type="button" className={toolbarButton} onClick={() => runCommand('superscript')}>X²</button>
          <button type="button" className={toolbarButton} onClick={() => runCommand('insertUnorderedList')}>• Siyahı</button>
          <button type="button" className={toolbarButton} onClick={() => runCommand('insertOrderedList')}>1. Siyahı</button>
          <button type="button" className={toolbarButton} onClick={() => runCommand('justifyLeft')}>Sol</button>
          <button type="button" className={toolbarButton} onClick={() => runCommand('justifyCenter')}>Mərkəz</button>
          <button type="button" className={toolbarButton} onClick={() => runCommand('justifyRight')}>Sağ</button>
          <button type="button" className={toolbarButton} onClick={() => runCommand('justifyFull')}>Tam düzlə</button>
          <button type="button" className={toolbarButton} onClick={() => runCommand('outdent')}>Girintini azalt</button>
          <button type="button" className={toolbarButton} onClick={() => runCommand('indent')}>Girintini artır</button>
          <button type="button" className={toolbarButton} onClick={() => runCommand('insertHorizontalRule')}>Ayırıcı</button>
          <button type="button" className={toolbarButton} onClick={addLink}>Keçid</button>
          <button type="button" className={toolbarButton} onClick={() => runCommand('unlink')}>Keçidi sil</button>
          {onImageUpload && (
            <button type="button" className={toolbarButton} disabled={isUploadingImage} onClick={() => imageInputRef.current?.click()}>
              {isUploadingImage ? 'Yüklənir…' : 'Şəkil əlavə et'}
            </button>
          )}
          <label className={`${toolbarButton} flex cursor-pointer items-center gap-1`}>
            Mətn <input type="color" className="h-4 w-5" onChange={(event) => runCommand('foreColor', event.target.value)} />
          </label>
          <label className={`${toolbarButton} flex cursor-pointer items-center gap-1`}>
            Fon <input type="color" className="h-4 w-5" onChange={(event) => runCommand('hiliteColor', event.target.value)} />
          </label>
          <button type="button" className={toolbarButton} onClick={() => runCommand('removeFormat')}>Formatı təmizlə</button>
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => void handleInlineImage(event.target.files?.[0])} />
        </div>
      )}

      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setIsToolbarVisible(true)}
        onBlur={() => window.setTimeout(() => {
          if (!containerRef.current?.contains(document.activeElement)) setIsToolbarVisible(false);
        }, 120)}
        onInput={emitChange}
        onPaste={handlePaste}
        className="service-rich-editor min-h-72 px-6 py-5 text-sm leading-relaxed text-slate-700 outline-none"
        data-placeholder="Səhifənin mətnini daxil edin…"
      />
    </div>
  );
};

export default RichTextEditor;
