import { Injectable } from '@nestjs/common';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { TenantsRepository } from './tenants.repository';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(private readonly tenantsRepository: TenantsRepository) {}

  create(createTenantDto: CreateTenantDto) {
    return this.tenantsRepository.create(createTenantDto);
  }

  findAll() {
    return `This action returns all tenants`;
  }

  findOne(id: number) {
    return `This action returns a #${id} tenant`;
  }

  update(updateTenantDto: UpdateTenantDto) {
    const { id, ...tenantDto } = updateTenantDto;
    return this.tenantsRepository.findOneAndUpdate({ _id: id }, tenantDto);
  }

  remove(id: number) {
    return `This action removes a #${id} tenant`;
  }
}
