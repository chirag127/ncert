import type { BookMetadata } from '@ncert-library/types';

export interface ClientConfig {
  baseUrl: string;
  metadataPath?: string;
  searchIndexPath?: string;
}

export interface BooksResponse {
  books: BookMetadata[];
  total: number;
  page: number;
  pageSize: number;
}

export interface BookResponse {
  book: BookMetadata;
}

export interface SearchResponse {
  results: Array<{
    bookCode: string;
    title: string;
    className: string;
    subject: string;
    language: string;
    score: number;
  }>;
  total: number;
  query: string;
}

export interface FiltersResponse {
  classes: Array<{ value: string; label: string; count: number }>;
  subjects: Array<{ value: string; label: string; count: number }>;
  languages: Array<{ value: string; label: string; count: number }>;
  editions: number[];
  tags: string[];
}
