/**
 * Image compressor compliant with PRD Section 17 & 38:
 * - Max resolution: 1280 - 1600 px
 * - Output format: image/jpeg or image/webp
 * - Quality: 0.75 (approx 75%)
 * - Target size: ~200 - 500 KB
 */

export interface CompressionResult {
  dataUrl: string;
  originalSize: number;
  compressedSize: number;
  dimensions: { width: number; height: number };
  fileName: string;
}

export const compressImageFile = async (
  file: File,
  maxDimension = 1440,
  quality = 0.75
): Promise<CompressionResult> => {
  return new Promise((resolve, reject) => {
    // Basic validation
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File yang diunggah harus berupa format gambar (JPG, PNG, atau WebP)'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect-ratio scale
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Gagal memproses kanvas gambar'));
        }

        // Draw image onto canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to compressed JPEG data URL
        const mimeType = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, quality);

        // Calculate approximate size in bytes from base64 string
        const base64Length = dataUrl.length - (dataUrl.indexOf(',') + 1);
        const compressedSize = Math.round((base64Length * 3) / 4);

        resolve({
          dataUrl,
          originalSize: file.size,
          compressedSize,
          dimensions: { width, height },
          fileName: file.name.replace(/\.[^/.]+$/, '') + '.jpg',
        });
      };
      img.onerror = () => reject(new Error('Gagal memuat gambar'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file gambar'));
    reader.readAsDataURL(file);
  });
};

export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};
