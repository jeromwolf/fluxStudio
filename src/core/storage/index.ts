// Storage abstraction layer for file uploads
// Can be swapped between Vercel Blob, R2, S3, etc.

export interface StorageProvider {
  upload(file: File, path: string): Promise<string>
  delete(url: string): Promise<void>
  getUrl(path: string): string
}

class VercelBlobStorage implements StorageProvider {
  async upload(file: File, path: string): Promise<string> {
    // TODO: Implement Vercel Blob upload
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    
    const { url } = await response.json()
    return url
  }
  
  async delete(url: string): Promise<void> {
    // TODO: Implement Vercel Blob delete
    await fetch('/api/upload', {
      method: 'DELETE',
      body: JSON.stringify({ url }),
    })
  }
  
  getUrl(path: string): string {
    return `${process.env.NEXT_PUBLIC_BLOB_URL}/${path}`
  }
}

// Export singleton instance
export const storage = new VercelBlobStorage()