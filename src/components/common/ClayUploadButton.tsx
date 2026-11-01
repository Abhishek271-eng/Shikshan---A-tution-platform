import React, { useRef, useState } from 'react';
import { Camera, Trash2, RefreshCw, UploadCloud, User } from 'lucide-react';

interface ClayUploadButtonProps {
  currentPhotoUrl?: string | null;
  onPhotoSelected: (base64Photo: string) => void;
  onPhotoRemoved?: () => void;
  label?: string;
  subLabel?: string;
  size?: 'md' | 'lg';
  isUploading?: boolean;
  className?: string;
}

export const ClayUploadButton: React.FC<ClayUploadButtonProps> = ({
  currentPhotoUrl,
  onPhotoSelected,
  onPhotoRemoved,
  label = 'Profile Photo',
  subLabel = 'JPG, PNG or WebP (Max 2MB)',
  size = 'lg',
  isUploading = false,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const [error, setError] = useState<string | null>(null);

  // Sync if prop changes externally
  React.useEffect(() => {
    setPreviewUrl(currentPhotoUrl || null);
  }, [currentPhotoUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setError('Please select a valid JPG, PNG, or WebP image.');
      return;
    }

    // Validate size (< 4MB raw)
    if (file.size > 4 * 1024 * 1024) {
      setError('Selected image is too large. Max size is 4MB.');
      return;
    }

    // Read and compress via Canvas to ~40-80KB max 500x500 WebP/JPEG
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIM = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          setPreviewUrl(compressedDataUrl);
          onPhotoSelected(compressedDataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onPhotoRemoved) {
      onPhotoRemoved();
    }
  };

  const sizeClasses = {
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-4 text-left ${className}`}>
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/jpg"
        className="hidden"
        aria-label="Upload profile photo"
      />

      {/* 3D Circular Clay Avatar Container */}
      <div className="relative group">
        <div
          className={`${sizeClasses[size]} rounded-full p-1 bg-gradient-to-br from-white to-[#EDE9FE] border-2 border-white shadow-clay-card flex items-center justify-center overflow-hidden flex-shrink-0 transition-transform active:scale-95 cursor-pointer`}
          onClick={() => fileInputRef.current?.click()}
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Profile Preview"
              className="w-full h-full rounded-full object-cover shadow-inner"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-[#EDE9FE] to-[#DDD6FE] flex items-center justify-center text-[#7C3AED]">
              <User className="w-10 h-10 stroke-[1.8]" />
            </div>
          )}

          {/* Uploading Overlay */}
          {isUploading && (
            <div className="absolute inset-0 rounded-full bg-[#1C1938]/50 backdrop-blur-xs flex items-center justify-center text-white">
              <RefreshCw className="w-6 h-6 animate-spin text-white" />
            </div>
          )}
        </div>

        {/* Small Floating Camera Badge */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Change photo"
          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#6D28D9] text-white flex items-center justify-center shadow-button-primary border-2 border-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Text & Action Controls */}
      <div className="space-y-1 text-center sm:text-left">
        <div>
          <h4 className="text-xs font-bold text-[#1C1938]">{label}</h4>
          <p className="text-[11px] text-[#686487]">{subLabel}</p>
        </div>

        {error && <p className="text-[11px] font-bold text-[#DC2626]">{error}</p>}

        <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1.5 rounded-xl bg-white border border-[#E5DFF8] shadow-clay-sm text-[11px] font-bold text-[#7C3AED] hover:bg-[#FAF9FE] flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{previewUrl ? 'Change Photo' : 'Upload Photo'}</span>
          </button>

          {previewUrl && (
            <button
              type="button"
              onClick={handleRemove}
              className="px-2.5 py-1.5 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[11px] font-bold text-[#DC2626] hover:bg-red-100 flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
              title="Remove Photo"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
