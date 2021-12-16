import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AwsS3Config {
  constructor(private configService: ConfigService) {}

  public acessKeyId: string = this.configService.get<string>('AWS_ACCESS_KEY_ID');
  public secretAccessKey: string = this.configService.get<string>('AWS_SECRET_ACCESS_KEY');
  public bucketName: string = this.configService.get<string>('AWS_BUCKET_NAME');
}
