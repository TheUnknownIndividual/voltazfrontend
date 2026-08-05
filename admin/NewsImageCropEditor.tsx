import React, { useRef } from 'react';

interface NewsImageCropEditorProps {
  imageUrl: string;
  positionX: number;
  positionY: number;
  zoom: number;
  onChange: (crop: { positionX: number; positionY: number; zoom: number }) => void;
  onDelete: () => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const NewsImageCropEditor: React.FC<NewsImageCropEditorProps> = ({
  imageUrl,
  positionX,
  positionY,
  zoom,
  onChange,
  onDelete,
}) => {
  const dragRef = useRef<{ pointerX: number; pointerY: number; positionX: number; positionY: number } | null>(null);

  const updateZoom = (nextZoom: number) => {
    onChange({ positionX, positionY, zoom: Math.round(clamp(nextZoom, 1, 3) * 100) / 100 });
  };

  return (
    <div className="mt-5 space-y-5">
      <div
        className="relative aspect-video touch-none cursor-move overflow-hidden rounded-2xl bg-slate-200"
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = {
            pointerX: event.clientX,
            pointerY: event.clientY,
            positionX,
            positionY,
          };
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag) return;
          const bounds = event.currentTarget.getBoundingClientRect();
          onChange({
            positionX: Math.round(clamp(drag.positionX - ((event.clientX - drag.pointerX) / bounds.width) * 100, 0, 100)),
            positionY: Math.round(clamp(drag.positionY - ((event.clientY - drag.pointerY) / bounds.height) * 100, 0, 100)),
            zoom,
          });
        }}
        onPointerUp={() => { dragRef.current = null; }}
        onPointerCancel={() => { dragRef.current = null; }}
      >
        <img
          src={imageUrl}
          alt="Xəbər şəkli kəsim önizləməsi"
          draggable={false}
          className="absolute inset-0 h-full w-full select-none object-cover"
          style={{
            objectPosition: `${positionX}% ${positionY}%`,
            transform: `scale(${zoom})`,
            transformOrigin: `${positionX}% ${positionY}%`,
          }}
        />
        <div className="pointer-events-none absolute inset-0 border border-black/5" />
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={onDelete}
          className="absolute right-3 top-3 rounded-lg bg-red-500 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg hover:bg-red-600"
        >
          Sil
        </button>
        <div className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-950/70 px-3 py-1.5 text-[9px] font-bold text-white backdrop-blur">
          Şəkli hərəkət etdirmək üçün sürüşdürün
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-4">
        <div className="flex items-center gap-3">
          <span className="w-16 text-[9px] font-black uppercase tracking-widest text-slate-400">Ölçü</span>
          <button type="button" onClick={() => updateZoom(zoom - 0.1)} className="h-8 w-8 rounded-lg bg-slate-100 font-black text-slate-600 hover:bg-slate-200" aria-label="Şəkli kiçilt">−</button>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(event) => updateZoom(Number(event.target.value))}
            className="min-w-0 flex-1 accent-emerald-600"
          />
          <button type="button" onClick={() => updateZoom(zoom + 0.1)} className="h-8 w-8 rounded-lg bg-slate-100 font-black text-slate-600 hover:bg-slate-200" aria-label="Şəkli böyüt">+</button>
          <span className="w-11 text-right text-[10px] font-black text-slate-500">{zoom.toFixed(2)}×</span>
        </div>
        <label className="flex items-center gap-3">
          <span className="w-16 text-[9px] font-black uppercase tracking-widest text-slate-400">Üfüqi</span>
          <input type="range" min="0" max="100" value={positionX} onChange={(event) => onChange({ positionX: Number(event.target.value), positionY, zoom })} className="min-w-0 flex-1 accent-emerald-600" />
          <span className="w-9 text-right text-[10px] font-black text-slate-500">{positionX}%</span>
        </label>
        <label className="flex items-center gap-3">
          <span className="w-16 text-[9px] font-black uppercase tracking-widest text-slate-400">Şaquli</span>
          <input type="range" min="0" max="100" value={positionY} onChange={(event) => onChange({ positionX, positionY: Number(event.target.value), zoom })} className="min-w-0 flex-1 accent-emerald-600" />
          <span className="w-9 text-right text-[10px] font-black text-slate-500">{positionY}%</span>
        </label>
        <button type="button" onClick={() => onChange({ positionX: 50, positionY: 50, zoom: 1 })} className="text-[9px] font-black uppercase tracking-widest text-emerald-700 hover:text-slate-900">
          Kəsimi sıfırla
        </button>
      </div>
    </div>
  );
};

export default NewsImageCropEditor;
