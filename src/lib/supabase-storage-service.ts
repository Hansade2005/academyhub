// Supabase Storage Service for T3A Platform
// Uses the 'files' bucket for all file uploads

import { supabase } from './supabase-client'

// Storage bucket name (configured in Supabase)
const STORAGE_BUCKET = 'files'

export interface UploadedFile {
  id?: string
  user_id: string
  filename: string
  file_url: string
  file_path: string
  file_type: string
  file_size: number
  metadata?: Record<string, any>
  uploaded_at: string
}

export interface UploadResult {
  success: boolean
  message: string
  data: UploadedFile | null
  error?: Error
}

export interface FileListResult {
  success: boolean
  message: string
  data: UploadedFile[]
}

/**
 * Generate a unique file path for storage
 */
const generateFilePath = (userId: string, filename: string): string => {
  const timestamp = Date.now()
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `${userId}/${timestamp}_${sanitizedFilename}`
}

/**
 * Get the file extension from a filename
 */
const getFileExtension = (filename: string): string => {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

/**
 * Validate file type for allowed uploads
 */
const isAllowedFileType = (filename: string, allowedTypes?: string[]): boolean => {
  const defaultAllowedTypes = [
    'pdf', 'doc', 'docx', 'txt', 'rtf',  // Documents
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',  // Images
    'mp4', 'webm', 'mov',  // Videos
    'mp3', 'wav', 'ogg',   // Audio
    'json', 'csv', 'xlsx', 'xls'  // Data files
  ]

  const extension = getFileExtension(filename)
  const typesToCheck = allowedTypes || defaultAllowedTypes
  return typesToCheck.includes(extension)
}

/**
 * Upload a file to Supabase Storage 'files' bucket
 */
export const uploadFile = async (
  file: File,
  userId: string,
  options?: {
    isPublic?: boolean
    metadata?: Record<string, any>
    folder?: string
    allowedTypes?: string[]
  }
): Promise<UploadResult> => {
  try {
    // Validate file type
    if (!isAllowedFileType(file.name, options?.allowedTypes)) {
      return {
        success: false,
        message: `File type not allowed: ${getFileExtension(file.name)}`,
        data: null
      }
    }

    // Generate file path (with optional folder prefix)
    let filePath = generateFilePath(userId, file.name)
    if (options?.folder) {
      filePath = `${options.folder}/${filePath}`
    }

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type,
        cacheControl: '3600'  // 1 hour cache
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return {
        success: false,
        message: uploadError.message || 'Failed to upload file to storage',
        data: null,
        error: uploadError as Error
      }
    }

    // Get public URL (or signed URL for private files)
    let fileUrl: string

    if (options?.isPublic !== false) {
      const { data: urlData } = supabase
        .storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath)
      fileUrl = urlData.publicUrl
    } else {
      // Generate a signed URL for private files (valid for 1 hour)
      const { data: signedData, error: signedError } = await supabase
        .storage
        .from(STORAGE_BUCKET)
        .createSignedUrl(filePath, 3600)

      if (signedError || !signedData) {
        fileUrl = '' // Will be regenerated when needed
      } else {
        fileUrl = signedData.signedUrl
      }
    }

    // Save file record to database
    const fileRecord = {
      user_id: userId,
      filename: file.name,
      file_url: fileUrl,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
      metadata: options?.metadata || {}
    }

    const { data: dbRecord, error: dbError } = await supabase
      .from('files')
      .insert(fileRecord)
      .select()
      .single()

    if (dbError) {
      console.error('Database insert error:', dbError)
      // File uploaded but DB record failed - still return success with file info
      return {
        success: true,
        message: 'File uploaded but database record failed',
        data: {
          ...fileRecord,
          uploaded_at: new Date().toISOString()
        }
      }
    }

    return {
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: dbRecord.id,
        user_id: dbRecord.user_id,
        filename: dbRecord.filename,
        file_url: fileUrl,
        file_path: filePath,
        file_type: dbRecord.file_type,
        file_size: dbRecord.file_size,
        metadata: dbRecord.metadata,
        uploaded_at: dbRecord.uploaded_at
      }
    }
  } catch (error) {
    console.error('Upload error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to upload file',
      data: null,
      error: error as Error
    }
  }
}

/**
 * Upload a resume/CV specifically (with validation)
 */
export const uploadResume = async (
  file: File,
  userId: string,
  metadata?: Record<string, any>
): Promise<UploadResult> => {
  return uploadFile(file, userId, {
    isPublic: false,  // Resumes should be private
    folder: 'resumes',
    metadata: { ...metadata, document_type: 'resume' },
    allowedTypes: ['pdf', 'doc', 'docx']
  })
}

/**
 * Upload an avatar/profile image
 */
export const uploadAvatar = async (
  file: File,
  userId: string
): Promise<UploadResult> => {
  return uploadFile(file, userId, {
    isPublic: true,  // Avatars are public
    folder: 'avatars',
    metadata: { document_type: 'avatar' },
    allowedTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  })
}

/**
 * Upload a portfolio asset
 */
export const uploadPortfolioAsset = async (
  file: File,
  userId: string,
  portfolioId: string
): Promise<UploadResult> => {
  return uploadFile(file, userId, {
    isPublic: true,
    folder: 'portfolios',
    metadata: { portfolio_id: portfolioId, document_type: 'portfolio_asset' }
  })
}

/**
 * Upload a project file (for LiveWorks)
 */
export const uploadProjectFile = async (
  file: File,
  userId: string,
  projectId: string
): Promise<UploadResult> => {
  return uploadFile(file, userId, {
    isPublic: false,
    folder: 'projects',
    metadata: { project_id: projectId, document_type: 'project_file' }
  })
}

/**
 * Get all files for a user
 */
export const getUserFiles = async (userId: string): Promise<FileListResult> => {
  try {
    const { data, error } = await supabase
      .from('files')
      .select('*')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false })

    if (error) {
      return {
        success: false,
        message: error.message,
        data: []
      }
    }

    return {
      success: true,
      message: 'Files retrieved successfully',
      data: data || []
    }
  } catch (error) {
    console.error('Error getting user files:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get files',
      data: []
    }
  }
}

/**
 * Delete a file from storage and database
 */
export const deleteFile = async (fileId: string, userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Get file record first
    const { data: fileRecord, error: fetchError } = await supabase
      .from('files')
      .select('*')
      .eq('id', fileId)
      .eq('user_id', userId)  // Ensure user owns the file
      .single()

    if (fetchError || !fileRecord) {
      return {
        success: false,
        message: 'File not found or access denied'
      }
    }

    // Delete from storage
    const { error: storageError } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .remove([fileRecord.file_path])

    if (storageError) {
      console.error('Storage delete error:', storageError)
      // Continue to delete database record anyway
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('files')
      .delete()
      .eq('id', fileId)

    if (dbError) {
      return {
        success: false,
        message: 'Failed to delete file record'
      }
    }

    return {
      success: true,
      message: 'File deleted successfully'
    }
  } catch (error) {
    console.error('Delete file error:', error)
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to delete file'
    }
  }
}

/**
 * Get a signed URL for a private file (valid for specified duration)
 */
export const getSignedUrl = async (
  filePath: string,
  expiresIn: number = 3600  // Default 1 hour
): Promise<{ success: boolean; url: string | null; message: string }> => {
  try {
    const { data, error } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(filePath, expiresIn)

    if (error || !data) {
      return {
        success: false,
        url: null,
        message: error?.message || 'Failed to generate signed URL'
      }
    }

    return {
      success: true,
      url: data.signedUrl,
      message: 'Signed URL generated successfully'
    }
  } catch (error) {
    console.error('Get signed URL error:', error)
    return {
      success: false,
      url: null,
      message: error instanceof Error ? error.message : 'Failed to generate signed URL'
    }
  }
}

/**
 * Download a file (returns blob data)
 */
export const downloadFile = async (
  filePath: string
): Promise<{ success: boolean; data: Blob | null; message: string }> => {
  try {
    const { data, error } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .download(filePath)

    if (error || !data) {
      return {
        success: false,
        data: null,
        message: error?.message || 'Failed to download file'
      }
    }

    return {
      success: true,
      data,
      message: 'File downloaded successfully'
    }
  } catch (error) {
    console.error('Download file error:', error)
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : 'Failed to download file'
    }
  }
}

// Export the storage service as a singleton-like object
export const supabaseStorageService = {
  uploadFile,
  uploadResume,
  uploadAvatar,
  uploadPortfolioAsset,
  uploadProjectFile,
  getUserFiles,
  deleteFile,
  getSignedUrl,
  downloadFile,
  STORAGE_BUCKET
}

export default supabaseStorageService
