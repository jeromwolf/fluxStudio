'use client';

import { exportRegistry } from '../plugin-registry';
import { PngExportPlugin } from './png-export';
import { GifExportPlugin } from './gif-export';
import { Mp4ExportPlugin } from './mp4-export';
import { WebMExportPlugin } from './webm-export';

// Register all export plugins
export function registerExportPlugins() {
  // Image formats
  exportRegistry.register(new PngExportPlugin(), 10);
  
  // Animation formats
  exportRegistry.register(new GifExportPlugin(), 20);
  
  // Video formats
  exportRegistry.register(new Mp4ExportPlugin(), 30);
  exportRegistry.register(new WebMExportPlugin(), 25);
}

// Export individual plugins for direct use
export { PngExportPlugin } from './png-export';
export { GifExportPlugin } from './gif-export';
export { Mp4ExportPlugin } from './mp4-export';
export { WebMExportPlugin } from './webm-export';