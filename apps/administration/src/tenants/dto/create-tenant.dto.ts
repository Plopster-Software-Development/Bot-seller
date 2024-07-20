import { IsString } from 'class-validator';

export class CreateTenantDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  country: string;

  @IsString()
  city: string;

  @IsString()
  province: string;

  @IsString()
  address: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  email: string;
}
