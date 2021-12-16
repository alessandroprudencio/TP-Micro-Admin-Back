import { Injectable, Logger } from '@nestjs/common';
import { S3 } from 'aws-sdk';
import { randomUUID } from 'crypto';
import { AwsS3Config } from './aws-s3.config';

@Injectable()
export class AwsS3Service {
  private logger = new Logger();

  constructor(private s3Config: AwsS3Config) {}

  async uploadFile(file: Express.Multer.File): Promise<S3.ManagedUpload.SendData> {
    try {
      const { originalname, buffer, size } = file;

      const maxSize = 5 * 1024 * 1024; // for 5MB

      if (size > maxSize) {
        Logger.error(`Error uploading file with ${size * 1024} MB, the file must contain a maximum of 5 MB.`);

        throw Error(`Error uploading file with ${size * 1024} MB, the file must contain a maximum of 5 MB.`);
      }

      const ext = originalname.split('.')[1];

      const newName = randomUUID();

      const name = `${newName}.${ext}`;

      const params = {
        Bucket: this.s3Config.bucketName,
        Key: name,
        Body: Buffer.from(buffer),
      };

      const s3 = new S3({
        accessKeyId: this.s3Config.acessKeyId,
        secretAccessKey: this.s3Config.secretAccessKey,
      });

      const result: S3.ManagedUpload.SendData = await s3.upload(params).promise();

      this.logger.log(`upload file => ${JSON.stringify(result)}`);

      return result;
    } catch (error) {
      this.logger.error(error.message);

      throw error.message;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const params = {
        Bucket: this.s3Config.bucketName,
        Key: key,
      };

      const s3 = new S3({
        accessKeyId: this.s3Config.acessKeyId,
        secretAccessKey: this.s3Config.secretAccessKey,
      });
      console.log(key);

      const result = await s3.deleteObject(params).promise();

      console.log(result);

      this.logger.log(`delete file => ${JSON.stringify(result)}`);
    } catch (error) {
      throw error.stack;
    }
  }
}
