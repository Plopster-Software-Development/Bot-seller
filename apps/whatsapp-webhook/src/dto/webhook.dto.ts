import { IsString } from 'class-validator';

export class WebhookDto {
  @IsString()
  readonly message: string;

  @IsString()
  readonly sender: string;
}
