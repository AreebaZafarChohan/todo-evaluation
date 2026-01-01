import { Request, Response, NextFunction } from 'express';
import multer, { FileFilterCallback, MulterError } from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { stat, unlink } from 'fs/promises';
import { existsSync } from 'fs';

// Configuration types
export interface UploadConfig {
  maxFileSize: number; // in bytes
  allowedMimeTypes: string[];
  destination: string;
  generateFilename?: (originalName: string) => string;
  validateFile?: (file: Express.Multer.File) => Promise<boolean>;
}

// Default configuration
export const defaultConfig: UploadConfig = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  destination: './uploads',
  generateFilename: (originalName: string) => {
    const ext = path.extname(originalName);
    return `${uuidv4()}${ext}`;
  },
};

// File filter middleware
export function createFileFilter(config: UploadConfig) {
  return (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (!config.allowedMimeTypes.includes(file.mimetype)) {
      cb(new MulterError('LIMIT_FILE_TYPE', config.allowedMimeTypes));
      return;
    }
    cb(null, true);
  };
}

// Multer storage configuration
export function createStorage(config: UploadConfig) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, config.destination);
    },
    filename: (req, file, cb) => {
      const filename = config.generateFilename!(file.originalname);
      cb(null, filename);
    },
  });
}

// Create upload middleware
export function createUploadMiddleware(config: Partial<UploadConfig> = {}) {
  const finalConfig = { ...defaultConfig, ...config };

  const upload = multer({
    storage: createStorage(finalConfig),
    limits: {
      fileSize: finalConfig.maxFileSize,
    },
    fileFilter: createFileFilter(finalConfig),
  });

  // Middleware to attach file info to request
  return [
    upload.single('file'),
    async (req: Request, res: Response, next: NextFunction) => {
      if (!req.file) {
        res.status(400).json({
          error: {
            code: 'NO_FILE',
            message: 'No file uploaded',
          },
        });
        return;
      }

      try {
        // Validate file if custom validator provided
        if (finalConfig.validateFile) {
          const isValid = await finalConfig.validateFile(req.file);
          if (!isValid) {
            await cleanupFile(req.file.path);
            res.status(400).json({
              error: {
                code: 'INVALID_FILE',
                message: 'File validation failed',
              },
            });
            return;
          }
        }

        // Attach full file info to request
        req.body.file = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          url: `/uploads/${req.file.filename}`,
        };

        next();
      } catch (error) {
        next(error);
      }
    },
  ];
}

// Multi-file upload middleware
export function createMultiUploadMiddleware(
  fieldName: string,
  maxCount: number,
  config: Partial<UploadConfig> = {}
) {
  const finalConfig = { ...defaultConfig, ...config };

  const upload = multer({
    storage: createStorage(finalConfig),
    limits: {
      fileSize: finalConfig.maxFileSize,
      files: maxCount,
    },
    fileFilter: createFileFilter(finalConfig),
  });

  return [
    upload.array(fieldName, maxCount),
    async (req: Request, res: Response, next: NextFunction) => {
      const files = (req as any).files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({
          error: {
            code: 'NO_FILES',
            message: `No files uploaded for field '${fieldName}'`,
          },
        });
        return;
      }

      try {
        req.body.files = files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          url: `/uploads/${file.filename}`,
        }));

        next();
      } catch (error) {
        next(error);
      }
    },
  ];
}

// Helper: Clean up file on error
export async function cleanupFile(filePath: string): Promise<void> {
  try {
    if (existsSync(filePath)) {
      await unlink(filePath);
    }
  } catch (error) {
    console.error('Failed to cleanup file:', error);
  }
}

// Helper: Get file info
export async function getFileInfo(filePath: string) {
  const stats = await stat(filePath);
  return {
    size: stats.size,
    created: stats.birthtime,
    modified: stats.mtime,
  };
}

// Extended Request interface
declare global {
  namespace Express {
    interface Request {
      body: {
        file?: {
          filename: string;
          originalName: string;
          mimetype: string;
          size: number;
          path: string;
          url: string;
        };
        files?: Array<{
          filename: string;
          originalName: string;
          mimetype: string;
          size: number;
          path: string;
          url: string;
        }>;
      };
    }
  }
}
