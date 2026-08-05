import React, { useCallback, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Minus, Plus, X } from 'lucide-react';

type Props = {
  source: string;
  sourceType: string;
  fileName: string;
  variant: 'desktop' | 'mobile';
  onCancel: () => void;
  onDone: (file: File, preview: string) => void;
};

const createCroppedFile = async (
  source: string,
  crop: Area,
  sourceType: string,
  fileName: string,
) => {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = reject;
    element.src = source;
  });

  const canvas = document.createElement('canvas');
  canvas.width = crop.width;
  canvas.height = crop.height;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas context was not available');

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  const outputType = sourceType === 'image/png' ? 'image/png' : 'image/jpeg';
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      result => result ? resolve(result) : reject(new Error('Image export failed')),
      outputType,
      outputType === 'image/jpeg' ? 0.98 : undefined,
    );
  });
  const extension = outputType === 'image/png' ? 'png' : 'jpg';
  const baseName = fileName.replace(/\.[^.]+$/, '') || 'slider';
  return new File([blob], `${baseName}-cropped.${extension}`, { type: outputType });
};

const SliderImageCropper: React.FC<Props> = ({
  source,
  sourceType,
  fileName,
  variant,
  onCancel,
  onDone,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pixels, setPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const finish = useCallback(async () => {
    if (!pixels || saving) return;
    setSaving(true);
    try {
      const file = await createCroppedFile(source, pixels, sourceType, fileName);
      const preview = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      onDone(file, preview);
    } finally {
      setSaving(false);
    }
  }, [fileName, onDone, pixels, saving, source, sourceType]);

  return (
    <div className="fixed inset-0 z-[12000] flex items-center justify-center p-4">
      <button type="button" aria-label="Kəsimi bağla" className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-5xl overflow-hidden rounded-[2rem] bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 text-white">
          <div>
            <h3 className="text-sm font-black uppercase tracking-widest">Şəkli uyğunlaşdır</h3>
            <p className="mt-1 text-[10px] font-bold text-white/50">{variant === 'desktop' ? 'Desktop görünüşü · 16:7' : 'Mobil görünüş · 1:1'}</p>
          </div>
          <button type="button" onClick={onCancel} className="rounded-full p-2 transition hover:bg-white/10" aria-label="Bağla"><X className="h-5 w-5" /></button>
        </div>

        <div className={`relative mx-auto w-full bg-black ${variant === 'desktop' ? 'aspect-[16/7]' : 'aspect-square max-h-[65vh] max-w-[65vh]'}`}>
          <Cropper
            image={source}
            crop={crop}
            zoom={zoom}
            minZoom={1}
            maxZoom={4}
            aspect={variant === 'desktop' ? 16 / 7 : 1}
            showGrid
            objectFit="cover"
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={(_, areaPixels) => setPixels(areaPixels)}
          />
        </div>

        <div className="flex flex-col gap-4 border-t border-white/10 px-5 py-5 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 text-white">
            <Minus className="h-4 w-4" />
            <input type="range" min={1} max={4} step={0.01} value={zoom} onChange={event => setZoom(Number(event.target.value))} className="w-full accent-[#9ac21d]" aria-label="Şəkil ölçüsü" />
            <Plus className="h-4 w-4" />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="rounded-xl border border-white/15 px-6 py-3 text-[10px] font-black uppercase tracking-widest text-white">Ləğv et</button>
            <button type="button" onClick={() => void finish()} disabled={!pixels || saving} className="rounded-xl bg-[#9ac21d] px-8 py-3 text-[10px] font-black uppercase tracking-widest text-slate-950 disabled:opacity-50">{saving ? 'Hazırlanır…' : 'Hazırdır'}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SliderImageCropper;
