import { IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class MetadataDto {
  @IsString()
  display_phone_number: string;

  @IsString()
  phone_number_id: string;
}

class ValueDto {
  @IsString()
  messaging_product: string;

  @ValidateNested()
  @Type(() => MetadataDto)
  metadata: MetadataDto;
}

class ChangesDto {
  @ValidateNested()
  @Type(() => ValueDto)
  value: ValueDto;

  @IsString()
  field: string;
}

class EntryDto {
  @IsString()
  id: string;

  @ValidateNested({ each: true })
  @Type(() => ChangesDto)
  changes: ChangesDto[];
}

export class WebhookDto {
  @IsString()
  object: string;

  @ValidateNested({ each: true })
  @Type(() => EntryDto)
  entry: EntryDto[];
}
