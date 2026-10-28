/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export async function exportSvgToPng(svgElement: SVGSVGElement, filename: string = 'schema-gospodarie-apa.png'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const xml = new XMLSerializer().serializeToString(svgElement);
      const svg64 = btoa(unescape(encodeURIComponent(xml)));
      const b64Start = 'data:image/svg+xml;base64,';
      const image64 = b64Start + svg64;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Export with 2x resolution for crisp high-definition printing / documentation
        const scale = 2;
        canvas.width = 1200 * scale;
        canvas.height = 760 * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, 1200, 760);

        // Convert canvas to blob & trigger download
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to generate PNG blob'));
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          resolve();
        }, 'image/png');
      };

      img.onerror = (e) => reject(e);
      img.src = image64;
    } catch (err) {
      reject(err);
    }
  });
}
