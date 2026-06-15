import { describe, expect, it } from 'vitest';
import { LibraryClient } from '../client.js';

describe('LibraryClient', () => {
  it('should create instance with config', () => {
    const client = new LibraryClient({
      baseUrl: 'https://example.com',
    });
    expect(client).toBeInstanceOf(LibraryClient);
  });

  it('should use custom paths', () => {
    const client = new LibraryClient({
      baseUrl: 'https://example.com',
      metadataPath: '/custom/metadata.json',
    });
    expect(client).toBeInstanceOf(LibraryClient);
  });

  it('should throw on fetch to non-existent server', async () => {
    const client = new LibraryClient({
      baseUrl: 'https://nonexistent.example.com',
    });
    await expect(client.search('test')).rejects.toThrow();
  });
});
