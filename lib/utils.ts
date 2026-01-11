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
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      // Clean up the object URL after loading
      URL.revokeObjectURL(objectUrl);

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not supported'));
        return;
      }

      let width = img.width;
      let height = img.height;

      // Start with a reasonable max dimension to avoid processing massive images
      // 1920px is a good balance for full-screen web quality
      const MAX_START_DIMENSION = 1920;
      if (width > MAX_START_DIMENSION || height > MAX_START_DIMENSION) {
        const ratio = Math.min(MAX_START_DIMENSION / width, MAX_START_DIMENSION / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const TARGET_SIZE_BYTES = 500 * 1024; // 500KB strict limit
      let quality = 0.9;
      let iteration = 0;
      const MAX_ITERATIONS = 10;

      const compress = () => {
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'));
              return;
            }

            console.log(`Compression iteration ${iteration + 1}: ${Math.round(blob.size / 1024)}KB | ${width}x${height} | Q=${quality.toFixed(2)}`);

            // Success condition
            if (blob.size <= TARGET_SIZE_BYTES) {
              resolve(blob);
              return;
            }

            iteration++;

            // Safety break
            if (iteration >= MAX_ITERATIONS) {
              console.warn("Max compression iterations reached. Returning best effort.");
              resolve(blob);
              return;
            }

            // Strategy:
            // 1. If quality is decent (> 0.5), reduce quality.
            // 2. If quality is already low, reduce dimensions and reset quality to keep image looking okay (just smaller).
            if (quality > 0.5) {
              quality -= 0.15;
            } else {
              // Aggressive resize
              const SCALE_FACTOR = 0.75;
              width = Math.round(width * SCALE_FACTOR);
              height = Math.round(height * SCALE_FACTOR);
              // Reset quality to avoid "deep fried" look, trust that size reduction will help
              quality = 0.8;
            }

            compress();
          },
          'image/webp',
          quality
        );
      };

      compress();
    };

    img.onerror = (e: any) => {
      URL.revokeObjectURL(objectUrl);
      reject(e);
    };
  });
}

