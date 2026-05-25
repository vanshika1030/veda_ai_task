'use client';

import { useRef, useState, useCallback } from 'react';
import { CloudUpload, FileText, X } from 'lucide-react';

interface FileUploadProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
}

export default function FileUpload({ file, onFileSelect, onFileRemove }: FileUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      onFileSelect(droppedFile);
    }
  }, [onFileSelect]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="form-group">
      <div
        className={`file-upload-zone ${dragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.pdf"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <div className="file-upload-icon"><CloudUpload size={32} /></div>
        <div className="file-upload-text">Choose a file or drag &amp; drop it here</div>
        <div className="file-upload-subtext">JPEG, PNG, upto 10MB</div>
        <button
          type="button"
          className="file-upload-browse"
          onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
        >
          Browse Files
        </button>
      </div>

      {file && (
        <div className="file-upload-preview">
          <span style={{ display: 'flex', alignItems: 'center' }}><FileText size={20} /></span>
          <span className="file-upload-preview-name">{file.name}</span>
          <button
            type="button"
            className="file-upload-preview-remove"
            onClick={(e) => { e.stopPropagation(); onFileRemove(); }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="file-upload-caption">
        Upload images of your preferred document/image
      </div>
    </div>
  );
}
