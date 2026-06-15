"""PDF utility functions for NCERT Library."""

import hashlib
from pathlib import Path
from typing import Optional


def calculate_sha256(file_path: str | Path) -> str:
    """Calculate SHA-256 hash of a file."""
    sha256 = hashlib.sha256()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256.update(chunk)
    return sha256.hexdigest()


def get_pdf_page_count(file_path: str | Path) -> Optional[int]:
    """Get page count of a PDF file."""
    try:
        import PyPDF2
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            return len(reader.pages)
    except ImportError:
        return None
    except Exception:
        return None


def get_file_size_mb(file_path: str | Path) -> float:
    """Get file size in MB."""
    return Path(file_path).stat().st_size / (1024 * 1024)


def batch_merge_pdfs(pdf_dir: str | Path, output_dir: str | Path) -> list[dict]:
    """Merge PDFs in a directory using Python (alternative to pdf-lib)."""
    import PyPDF2

    pdf_dir = Path(pdf_dir)
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    results = []

    for book_dir in sorted(pdf_dir.iterdir()):
        if not book_dir.is_dir():
            continue

        pdf_files = sorted(book_dir.glob("*.pdf"))
        if not pdf_files:
            continue

        merger = PyPDF2.PdfMerger()
        for pdf_file in pdf_files:
            try:
                merger.append(str(pdf_file))
            except Exception as e:
                print(f"  Failed to merge {pdf_file.name}: {e}")

        output_path = output_dir / f"{book_dir.name}.pdf"
        merger.write(str(output_path))
        merger.close()

        results.append({
            "book_code": book_dir.name,
            "pages": get_pdf_page_count(output_path),
            "size_mb": round(get_file_size_mb(output_path), 2),
            "sha256": calculate_sha256(output_path),
        })
        print(f"  Merged {book_dir.name}: {results[-1]['pages']} pages")

    return results
