import { supabase } from './supabase';
import { logger } from './logger';

export type StorageBucket = 'course-videos' | 'course-images' | 'course-documents';

export interface UploadResult {
  url: string;
  path: string;
  size: number;
  type: string;
  originalFilename: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

const BUCKET_MAP: Record<string, StorageBucket> = {
  'video/mp4': 'course-videos',
  'video/webm': 'course-videos',
  'video/quicktime': 'course-videos',
  'video/x-msvideo': 'course-videos',
  'image/jpeg': 'course-images',
  'image/png': 'course-images',
  'image/gif': 'course-images',
  'image/webp': 'course-images',
  'image/svg+xml': 'course-images',
  'application/pdf': 'course-documents',
  'application/msword': 'course-documents',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'course-documents',
  'text/plain': 'course-documents',
};

function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop();
  const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9]/g, '-');
  return `${nameWithoutExt}-${timestamp}-${randomStr}.${extension}`;
}

function getBucketForFileType(mimeType: string): StorageBucket {
  const bucket = BUCKET_MAP[mimeType];
  if (!bucket) {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
  return bucket;
}

export async function uploadFile(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<UploadResult> {
  try {
    const bucket = getBucketForFileType(file.type);
    const fileName = generateUniqueFileName(file.name);
    const filePath = fileName;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw error;
    }

    if (onProgress) {
      onProgress({
        loaded: file.size,
        total: file.size,
        percentage: 100,
      });
    }

    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return {
      url: urlData.publicUrl,
      path: data.path,
      size: file.size,
      type: file.type,
      originalFilename: file.name,
    };
  } catch (error) {
    logger.error('File upload error', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteFile(url: string): Promise<void> {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');

    const bucketIndex = pathParts.findIndex(part =>
      part === 'course-videos' || part === 'course-images' || part === 'course-documents'
    );

    if (bucketIndex === -1) {
      throw new Error('Could not determine bucket from URL');
    }

    const bucket = pathParts[bucketIndex] as StorageBucket;
    const filePath = pathParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    logger.error('File delete error', error);
    throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getFileTypeFromMime(mimeType: string): 'video' | 'image' | 'document' {
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('image/')) return 'image';
  return 'document';
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
