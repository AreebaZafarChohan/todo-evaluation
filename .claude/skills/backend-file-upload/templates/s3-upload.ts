import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// S3 Configuration
export interface S3Config {
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  endpoint?: string; // For MinIO or other S3-compatible services
  signedUrlExpiry: number; // seconds
}

// Default configuration
export const defaultS3Config: Partial<S3Config> = {
  signedUrlExpiry: 3600, // 1 hour
};

// S3 Client singleton
let s3Client: S3Client | null = null;

export function getS3Client(config: S3Config): S3Client {
  if (s3Client) return s3Client;

  s3Client = new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    endpoint: config.endpoint,
  });

  return s3Client;
}

// Generate unique S3 key
export function generateS3Key(originalName: string, prefix = 'uploads'): string {
  const ext = path.extname(originalName);
  const timestamp = Date.now();
  const uuid = uuidv4().slice(0, 8);
  return `${prefix}/${timestamp}-${uuid}${ext}`;
}

// Upload file to S3
export async function uploadToS3(
  config: S3Config,
  file: {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
  },
  key?: string
): Promise<{
  key: string;
  bucket: string;
  location: string;
  url: string;
}> {
  const client = getS3Client(config);
  const finalKey = key || generateS3Key(file.originalname);

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: finalKey,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'private',
  });

  await client.send(command);

  const location = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${finalKey}`;
  const url = `https://${config.bucket}.s3.${config.region}.amazonaws.com/${finalKey}`;

  return {
    key: finalKey,
    bucket: config.bucket,
    location,
    url,
  };
}

// Generate pre-signed URL for upload
export async function getUploadUrl(
  config: S3Config,
  filename: string,
  contentType: string
): Promise<{
  uploadUrl: string;
  key: string;
  expiresAt: Date;
}> {
  const client = getS3Client(config);
  const key = generateS3Key(filename);

  const command = new PutObjectCommand({
    Bucket: config.bucket,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, {
    expiresIn: config.signedUrlExpiry,
  });

  return {
    uploadUrl,
    key,
    expiresAt: new Date(Date.now() + config.signedUrlExpiry * 1000),
  };
}

// Generate pre-signed URL for download
export async function getDownloadUrl(
  config: S3Config,
  key: string
): Promise<{
  downloadUrl: string;
  expiresAt: Date;
}> {
  const client = getS3Client(config);

  const command = new GetObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });

  const downloadUrl = await getSignedUrl(client, command, {
    expiresIn: config.signedUrlExpiry,
  });

  return {
    downloadUrl,
    expiresAt: new Date(Date.now() + config.signedUrlExpiry * 1000),
  };
}

// Delete file from S3
export async function deleteFromS3(
  config: S3Config,
  key: string
): Promise<boolean> {
  const client = getS3Client(config);

  const command = new DeleteObjectCommand({
    Bucket: config.bucket,
    Key: key,
  });

  await client.send(command);
  return true;
}

// Copy file within S3
export async function copyFileInS3(
  config: S3Config,
  sourceKey: string,
  destinationKey: string
): Promise<{ key: string; url: string }> {
  const client = getS3Client(config);

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: destinationKey,
      CopySource: `${config.bucket}/${sourceKey}`,
    })
  );

  return {
    key: destinationKey,
    url: `https://${config.bucket}.s3.${config.region}.amazonaws.com/${destinationKey}`,
  };
}

// Move file in S3 (copy + delete)
export async function moveFileInS3(
  config: S3Config,
  sourceKey: string,
  destinationKey: string
): Promise<{ key: string; url: string }> {
  await copyFileInS3(config, sourceKey, destinationKey);
  await deleteFromS3(config, sourceKey);

  return {
    key: destinationKey,
    url: `https://${config.bucket}.s3.${config.region}.amazonaws.com/${destinationKey}`,
  };
}

// Express middleware for S3 upload
export function createS3UploadMiddleware(config: S3Config) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          error: { code: 'NO_FILE', message: 'No file uploaded' },
        });
        return;
      }

      const result = await uploadToS3(config, {
        buffer: req.file.buffer,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
      });

      req.body.s3File = result;
      next();
    } catch (error) {
      next(error);
    }
  };
}

// Generate client-side upload URL
export async function generateClientUploadUrl(
  config: S3Config,
  req: Request
): Promise<{ uploadUrl: string; key: string; fields: Record<string, string> }> {
  const { filename, contentType } = req.body;

  const { uploadUrl, key, expiresAt } = await getUploadUrl(
    config,
    filename,
    contentType
  );

  // For POST policy-based uploads
  return {
    uploadUrl: `https://${config.bucket}.s3.${config.region}.amazonaws.com`,
    key,
    fields: {
      key,
      'Content-Type': contentType,
      'x-amz-algorithm': 'AWS4-HMAC-SHA256',
      'x-amz-credential': `${config.accessKeyId}/${new Date().toISOString().slice(0, 10)}/${config.region}/s3/aws4_request`,
      'x-amz-date': new Date().toISOString().replace(/[:-]|\.\d{3}/g, ''),
      policy: '', // Generate JSON policy if needed
      'x-amz-signature': '', // Generate signature if needed
    },
  };
}

// Extended Request interface
declare global {
  namespace Express {
    interface Request {
      body: {
        s3File?: {
          key: string;
          bucket: string;
          location: string;
          url: string;
        };
      };
    }
  }
}
