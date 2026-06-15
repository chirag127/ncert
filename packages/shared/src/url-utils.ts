export const urlUtils = {
  isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  normalizeUrl(base: string, path: string): string {
    if (path.startsWith('http')) return path;
    const baseUrl = base.replace(/\/+$/, '');
    const cleanPath = path.replace(/^\/+/, '');
    return `${baseUrl}/${cleanPath}`;
  },
};
