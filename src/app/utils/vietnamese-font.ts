/**
 * Utility để load font Unicode hỗ trợ tiếng Việt cho jsPDF
 * Sử dụng font Roboto từ CDN
 */

const FONT_URLS = {
  regular: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
  bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
  italic: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
  bolditalic: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
};

/**
 * Load font Unicode vào jsPDF document
 * @param doc jsPDF instance
 */
export async function loadVietnameseFont(doc: any): Promise<void> {
  try {
    // Load Roboto Regular
    const regularBuffer = await loadFontAsBase64(FONT_URLS.regular);
    doc.addFileToVFS('Roboto-Regular.ttf', regularBuffer);
    doc.addFont('Roboto-Regular.ttf', 'Roboto', 'normal');

    // Load Roboto Bold
    const boldBuffer = await loadFontAsBase64(FONT_URLS.bold);
    doc.addFileToVFS('Roboto-Bold.ttf', boldBuffer);
    doc.addFont('Roboto-Bold.ttf', 'Roboto', 'bold');

    // Set font mặc định
    doc.setFont('Roboto');
  } catch (error) {
    console.error('Failed to load Vietnamese font:', error);
    // Fallback to default font if loading fails
    doc.setFont('helvetica');
  }
}

/**
 * Load font từ URL và convert sang base64
 */
async function loadFontAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Cấu hình font cho jsPDF document
 */
export function setupFont(doc: any): void {
  doc.setFont('Roboto');
  doc.setFontSize(11);
}
