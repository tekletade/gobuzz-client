import { useRef, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = 'Image',
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('adminToken');
      const res = await axios.post(`${API_URL}/api/upload/image`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      onChange(res.data.data.url);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
        {label}
      </label>

      {value ? (
        <div className="relative inline-block">
          <img
            src={value.startsWith('http') ? value : `${API_URL}${value}`}
            alt="Upload"
            className="max-h-40 rounded border border-gray-300"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full text-xs hover:bg-red-600"
          >
            ×
          </button>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded p-6 text-center cursor-pointer hover:border-[#86691c] transition"
        >
          {uploading ? (
            <p className="text-sm text-gray-500">Uploading...</p>
          ) : (
            <>
              <p className="text-sm text-gray-600 mb-1">
                Click to upload image
              </p>
              <p className="text-xs text-gray-400">
                JPEG, PNG, GIF, WebP · Max 5MB
              </p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {error && (
        <p className="text-red-600 text-xs mt-2">{error}</p>
      )}
    </div>
  );
}