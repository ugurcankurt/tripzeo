import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

export function getExperienceUrl(experience: {
  location_country?: string | null
  location_city: string
  title: string
  id: string
}): string {
  const countrySlug = slugify(experience.location_country || 'turkey')
  const citySlug = slugify(experience.location_city)
  const titleSlug = slugify(experience.title)
  return `/${countrySlug}/${citySlug}/${titleSlug}-${experience.id}`
}

export async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Initial Resize Strategy
      // 1200px is usually enough for web viewing, but if user wants strictly < 500kb, we might need to go lower effectively.
      let MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;

      // Maintain aspect ratio
      if (width > height) {
        if (width > MAX_WIDTH) {
          height = Math.round((height *= MAX_WIDTH / width));
          width = MAX_WIDTH;
        }
      } else {
        if (height > MAX_HEIGHT) {
          width = Math.round((width *= MAX_HEIGHT / height));
          height = MAX_HEIGHT;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not supported'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);

      // Iterative Compression Strategy
      // Target: < 500KB
      const TARGET_SIZE_BYTES = 500 * 1024; // 500KB
      let quality = 0.8; // Start high-ish

      const compress = () => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }

            // Check size
            if (blob.size <= TARGET_SIZE_BYTES || quality <= 0.2) {
              // Verify final size just to be sure we don't return something massive if quality floor hit
              // If still > 500kb at 0.1, we could resize again, but 0.2 webp at 1200px is usually tiny.
              // If it is still huge, we brute force resize down.
              if (blob.size > TARGET_SIZE_BYTES && quality <= 0.2) {
                // Emergency Resize: Cut dimensions in half
                const factor = 0.7;
                canvas.width = canvas.width * factor;
                canvas.height = canvas.height * factor;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                quality = 0.5; // Reset quality for new size
                compress(); // Retry
                return;
              }

              console.log(`Compressed image: ${Math.round(blob.size / 1024)}KB at Q=${quality.toFixed(1)}`);
              resolve(blob);
            } else {
              // Reduce quality and try again
              quality -= 0.1;
              compress();
            }
          },
          'image/webp',
          quality
        );
      };

      compress();
    };
    img.onerror = (e: any) => reject(e);
  });
}

