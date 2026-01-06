/**
 * REUSABLE IMAGE UPLOAD FIELD
 * Handles file selection, preview rendering, and base64 conversion for quick CMS updates.
 */

import { forwardRef, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { Upload, X } from 'lucide-react';
import { Button } from './ui/button';
import { resolveCmsAssetUrl } from '../../lib/asset';

interface ImageUploadFieldProps {
  label: string;
  description?: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  accept?: string;
  error?: string;
}

const fileToDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read image'));
    reader.readAsDataURL(file);
  });

export const ImageUploadField = forwardRef<HTMLDivElement, ImageUploadFieldProps>(
  ({ label, description, value, onChange, accept = 'image/*', error }, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | undefined>();
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
      // Resolve the asset URL for display (handles relative paths from CMS)
      if (value) {
        setPreview(resolveCmsAssetUrl(value) || value);
      } else {
        setPreview(undefined);
      }
    }, [value]);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const dataUrl = await fileToDataUrl(file);
        setPreview(dataUrl);
        onChange(dataUrl);
      } catch (error) {
        console.error(error);
      } finally {
        setIsUploading(false);
      }
    };

    const triggerFilePicker = () => inputRef.current?.click();

    const clearImage = () => {
      setPreview(undefined);
      onChange(undefined);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    };

    const hasError = Boolean(error);

    return (
      <div ref={ref} className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-[#2D1B1B]">{label}</p>
          {description ? <p className="text-xs text-[#9B8B7E]">{description}</p> : null}
        </div>
        <div
          className={`rounded-xl border bg-[#FFF8F3] p-5 ${hasError ? 'border-red-300 ring-2 ring-red-100' : 'border-[#E6D4C3]'}`}
        >
          {preview ? (
            <div className="mb-4 flex items-center justify-center rounded-lg bg-white p-4">
              <img src={preview} alt="Selected asset" className="max-h-24 w-auto" />
            </div>
          ) : (
            <div className="mb-4 flex h-24 items-center justify-center rounded-lg border border-dashed border-[#D4AF77]/60 text-sm text-[#9B8B7E]">
              No image selected
            </div>
          )}
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              onClick={triggerFilePicker}
              disabled={isUploading}
              className="bg-gradient-to-r from-[#D4AF77] to-[#C9A58D] text-white hover:opacity-90"
            >
              <Upload size={16} />
              {isUploading ? 'Uploading...' : 'Choose Image'}
            </Button>
            {preview ? (
              <Button type="button" variant="outline" onClick={clearImage} className="border-[#D4AF77] text-[#2D1B1B]">
                <X size={16} /> Remove
              </Button>
            ) : null}
          </div>
          <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleFileChange} />
          {hasError ? <p className="mt-2 text-sm text-red-500">{error}</p> : null}
        </div>
      </div>
    );
  },
);

ImageUploadField.displayName = 'ImageUploadField';
