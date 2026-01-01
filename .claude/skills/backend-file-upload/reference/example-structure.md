# File Upload Module Structure Reference

```
src/
  infrastructure/
    upload/
      middleware/
        upload.middleware.ts      # Multer configuration
        s3-upload.ts              # S3 operations
      services/
        file.service.ts           # File business logic
        storage.service.ts        # Storage abstraction
      validators/
        file.validator.ts         # File validation
      utils/
        cleanup.ts                # Cleanup utilities
        helpers.ts                # Helper functions

  interfaces/
    http/
      controllers/
        upload.controller.ts      # Upload endpoints
      routes/
        upload.routes.ts          # Route definitions

  types/
    upload.types.ts               # TypeScript types
```

## Usage Examples

### 1. Local Upload Controller
```typescript
// controllers/upload.controller.ts
import { Router, Request, Response } from 'express';
import { createUploadMiddleware } from '../middleware/upload.middleware';
import { fileService } from '../services/file.service';

const router = Router();
const uploadMiddleware = createUploadMiddleware({
  maxFileSize: 5 * 1024 * 1024,
  allowedMimeTypes: ['image/jpeg', 'image/png'],
  destination: './uploads',
});

router.post('/upload', uploadMiddleware, async (req: Request, res: Response) => {
  const file = req.body.file;
  const saved = await fileService.save(file);
  res.json({ data: saved });
});

router.delete('/upload/:filename', async (req: Request, res: Response) => {
  await fileService.delete(req.params.filename);
  res.status(204).send();
});
```

### 2. S3 Upload Controller
```typescript
// controllers/s3-upload.controller.ts
import { Router, Request, Response } from 'express';
import { multer } from '../middleware/upload.middleware';
import { uploadToS3, getDownloadUrl } from '../middleware/s3-upload';

const s3Config = {
  region: process.env.AWS_REGION!,
  bucket: process.env.AWS_BUCKET!,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
};

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req: Request, res: Response) => {
  const result = await uploadToS3(s3Config, req.file!);
  res.json({ data: result });
});

router.get('/download/:key', async (req: Request, res: Response) => {
  const { downloadUrl } = await getDownloadUrl(s3Config, req.params.key);
  res.json({ url: downloadUrl });
});
```

### 3. Presigned URL for Direct Browser Upload
```typescript
router.post('/presigned-url', async (req: Request, res: Response) => {
  const { filename, contentType } = req.body;
  const { uploadUrl, key, expiresAt } = await getUploadUrl(s3Config, filename, contentType);
  res.json({ uploadUrl, key, expiresAt });
});
```

## File Size Limits

| Type     | Max Size | Use Case                |
|----------|----------|-------------------------|
| Image    | 10 MB    | Profile photos, assets  |
| Document | 50 MB    | PDFs, Word documents    |
| Video    | 500 MB   | User videos             |
| Archive  | 100 MB   | Zip, tar files          |

## Allowed MIME Types by Category

**Images:**
- image/jpeg
- image/png
- image/gif
- image/webp
- image/svg+xml

**Documents:**
- application/pdf
- application/msword
- application/vnd.openxmlformats-officedocument.wordprocessingml.document
- application/vnd.ms-excel
- application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

**Archives:**
- application/zip
- application/x-tar
- application/gzip

**Video:**
- video/mp4
- video/webm
- video/quicktime

## Security Considerations

1. **File Type Validation**: Check magic numbers, not just extensions
2. **Filename Sanitization**: Use UUIDs, never trust user input
3. **Virus Scanning**: Integrate with ClamAV or cloud scanning
4. **Rate Limiting**: Limit uploads per user/IP
5. **Storage Quotas**: Enforce per-user storage limits
6. **Access Control**: Verify user can upload to specific paths
7. **Audit Logging**: Log all upload/delete operations
