import { Body, Controller, Delete, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { AuthGuard } from '../auth/auth.guard';
import { Roles, RolesGuard } from '../auth/roles';
import { CustomersService } from './customers.service';
import type { CustomerWriteInput } from './customers.types';

@Controller('customers')
@UseGuards(AuthGuard, RolesGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  @Roles('owner', 'admin', 'accountant', 'sales')
  create(@Req() request: AuthenticatedRequest, @Body() body: CustomerWriteInput) {
    return this.customersService.create(request.user, body);
  }

  @Patch(':customerId')
  @Roles('owner', 'admin', 'accountant', 'sales')
  update(@Req() request: AuthenticatedRequest, @Param('customerId') customerId: string, @Body() body: CustomerWriteInput) {
    return this.customersService.update(request.user, customerId, body);
  }

  @Delete(':customerId')
  @Roles('owner', 'admin')
  deactivate(@Req() request: AuthenticatedRequest, @Param('customerId') customerId: string) {
    return this.customersService.deactivate(request.user, customerId);
  }
}
