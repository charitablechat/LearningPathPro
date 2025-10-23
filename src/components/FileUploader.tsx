import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, X, File, Image, Video, FileText, Loader2 } from 'lucide-react';
import { Button } from './Button';

export type FileType = 'video' | 'image' | 'document';

interface FileUploaderProps {
  fileType: FileType;
  onFileSelect: (file: File) => void;
  currentFileUrl?: string | null;
  currentFileName?: string | null;
  onRemove?: () => void;
  maxSize?: number;
  accept?: string;
  disabled?: boolean;
  uploading?: boolean;
  uploadProgress?: number;
}

const FILE_TYPE_CONFIG = {
  video: {
    icon: Video,
    accept: 'video/mp4,video/webm,video/quicktime,video/x-msvideo',
    maxSize: 500 * 1024 * 1024,
    label: 'Video',
    formats: 'MP4, WebM, MOV',
  },
  image: {
    icon: Image,
    accept: 'image/jpeg,image/png,image/gif,image/webp,image/svg+xml',
    maxSize: 10 * 1024 * 1024,
    label: 'Image',
    formats: 'JPG, PNG, GIF, WebP',
  },
  document: {
    icon: FileText,
    accept: 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain',
    maxSize: 50 * 1024 * 1024,
    label: 'Document',
    formats: 'PDF, DOC, DOCX, TXT',
  },
};

export function FileUploader({
  fileType,
  onFileSelect,
  currentFileUrl,
  currentFileName,
  onRemove,
  maxSize,
  accept,
  disabled = false,
  uploading = false,
  uploadProgress = 0,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const config = FILE_TYPE_CONFIG[fileType];
  const Icon = config.icon;
  const acceptTypes = accept || config.accept;
  const maxFileSize = maxSize || config.maxSize;

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size exceeds maximum of ${formatFileSize(maxFileSize)}`;
    }

    const acceptedTypes = acceptTypes.split(',').map(t => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      return `Invalid file type. Accepted: ${config.formats}`;
    }

    return null;
  };

  const handleFile = (file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);

    if (fileType === 'image' || fileType === 'video') {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }

    onFileSelect(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || uploading) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onRemove) {
      onRemove();
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const hasFile = currentFileUrl || selectedFile;

  return (
    <div className="space-y-3">
      {hasFile ? (
        <div className="border-2 border-gray-300 dark:border-gray-700 rounded-lg p-4 bg-gray-100 dark:bg-gray-800/50">
          <div className="flex items-start gap-4">
            {previewUrl && fileType === 'image' && (
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-900">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {previewUrl && fileType === 'video' && (
              <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-900">
                <video
                  src={previewUrl}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            {!previewUrl && (
              <div className="w-12 h-12 rounded-lg bg-gray-300 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <Icon className="w-6 h-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {selectedFile?.name || currentFileName || 'Uploaded file'}
              </p>
              {selectedFile && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {formatFileSize(selectedFile.size)}
                </p>
              )}
              {uploading && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            {!uploading && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={handleRemoveFile}
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer
            ${isDragging
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800/30 hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800/50'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onClick={!disabled ? handleBrowseClick : undefined}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptTypes}
            onChange={handleFileInputChange}
            disabled={disabled}
            className="hidden"
          />
          <div className="flex flex-col items-center">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors
              ${isDragging ? 'bg-blue-500/20' : 'bg-gray-300 dark:bg-gray-700'}
            `}>
              {uploading ? (
                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              ) : (
                <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`} />
              )}
            </div>
            <p className="text-gray-900 dark:text-white font-medium mb-1">
              {isDragging ? `Drop your ${config.label.toLowerCase()} here` : 'Drag and drop your file here'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              or click to browse
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Supported: {config.formats} (Max {formatFileSize(maxFileSize)})
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}
    </div>
  );
}
