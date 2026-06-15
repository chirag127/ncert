import { access, mkdir } from 'node:fs/promises';

export const fileUtils = {
  async ensureDir(path: string): Promise<void> {
    await mkdir(path, { recursive: true });
  },

  async exists(path: string): Promise<boolean> {
    try {
      await access(path);
      return true;
    } catch {
      return false;
    }
  },

  sanitizeFilename(name: string): string {
    return name
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_|_$/g, '')
      .toLowerCase()
      .slice(0, 200);
  },
};
