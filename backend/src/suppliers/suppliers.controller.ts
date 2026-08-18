import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../auth/auth.guard';
import { Roles, RolesGuard } from '../auth/roles';
import { SuppliersService } from './suppliers.service';
import type { SupplierWriteInput } from './suppliers.types';

@Controller('suppliers')
@UseGuards(AuthGuard, RolesGuard)
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest, @Query('limit') limit?: string) {
    return this.suppliersService.list(request.user, Number(limit));
  }

  @Post()
  @Roles('owner', 'admin', 'accountant')
  create(@Req() request: AuthenticatedRequest, @Body() body: SupplierWriteInput) {
    return this.suppliersService.create(request.user, body);
  }

  @Patch(':supplierId')
  @Roles('owner', 'admin', 'accountant')
  update(@Req() request: AuthenticatedRequest, @Param('supplierId') supplierId: string, @Body() body: SupplierWriteInput) {
    return this.suppliersService.update(request.user, supplierId, body);
  }

  @Delete(':supplierId')
  @Roles('owner', 'admin')
  deactivate(@Req() request: AuthenticatedRequest, @Param('supplierId') supplierId: string) {
    return this.suppliersService.deactivate(request.user, supplierId);
  }
}
