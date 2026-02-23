import cloudinary from '../config/cloudinary';
import { Readable } from 'stream';

export class UploadService {
  async uploadLogo(file: Buffer, tenantId: string, fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          // public_id fixo por tenant: ao subir nova logo, substitui a anterior no Cloudinary
          public_id: `vivoly/${tenantId}/logo/logo`,
          overwrite: true,
          invalidate: true,
          resource_type: 'image',
          transformation: [
            { width: 600, height: 200, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        }
      );

      const readableStream = Readable.from(file);
      readableStream.pipe(uploadStream);
    });
  }

  async uploadLogoTemp(file: Buffer, fileName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const folder = `vivoly/logos/temp`;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: `logo-temp-${Date.now()}`,
          resource_type: 'image',
          transformation: [
            { width: 600, height: 200, crop: 'limit' },
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result!.secure_url);
        }
      );

      const readableStream = Readable.from(file);
      readableStream.pipe(uploadStream);
    });
  }

  async uploadImage(
    file: Buffer,
    tenantId: string,
    imovelId: string,
    fileName: string
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const folder = `vivoly/${tenantId}/imoveis/${imovelId}`;

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          public_id: `${Date.now()}-${fileName}`,
          resource_type: 'image',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result!.secure_url);
          }
        }
      );

      const readableStream = Readable.from(file);
      readableStream.pipe(uploadStream);
    });
  }

  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      throw error;
    }
  }

  extractPublicIdFromUrl(url: string): string {
    // Extract public_id from Cloudinary URL
    // Example: https://res.cloudinary.com/cloud/image/upload/v123/vivoly/tenant/imoveis/imovel/photo.jpg
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');
    if (uploadIndex === -1) return '';

    // Get everything after 'upload/v123/'
    const pathParts = parts.slice(uploadIndex + 2);
    const publicId = pathParts.join('/').split('.')[0];
    return publicId;
  }
}

export const uploadService = new UploadService();
