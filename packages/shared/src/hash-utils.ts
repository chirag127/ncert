import { createHash } from 'node:crypto';

export const hashUtils = {
  sha256(data: Buffer | string): string {
    return createHash('sha256').update(data).digest('hex');
  },

  async sha256File(filePath: string): Promise<string> {
    const { readFile } = await import('node:fs/promises');
    const data = await readFile(filePath);
    return this.sha256(data);
  },
};
