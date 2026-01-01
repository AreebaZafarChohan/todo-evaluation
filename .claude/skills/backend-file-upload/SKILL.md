# backend-file-upload

## Description
File upload handling patterns with validation, storage backends, and secure access patterns.

## Core Principles
1. **Validate First**: Check file type, size before processing.
2. **Store Securely**: Use signed URLs, never expose direct paths.
3. **Virus Scan**: Scan uploads in background.
4. **Cleanup**: Remove orphaned files periodically.
