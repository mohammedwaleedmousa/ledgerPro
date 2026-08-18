import { Body, Controller, Delete, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { AuthGuard } from '../auth/auth.guard';
import { Roles, RolesGuard } from '../auth/roles';
import { ProductsService } from './products.service';
import type { ProductWriteInput } from './products.types';

@Controller('products')
@UseGuards(AuthGuard, RolesGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @Roles('owner', 'admin', 'inventory')
  create(@Req() request: AuthenticatedRequest, @Body() body: ProductWriteInput) {
    return this.productsService.create(request.user, body);
  }

  @Patch(':productId')
  @Roles('owner', 'admin', 'inventory')
  update(@Req() request: AuthenticatedRequest, @Param('productId') productId: string, @Body() body: ProductWriteInput) {
    return this.productsService.update(request.user, productId, body);
  }

  @Delete(':productId')
  @Roles('owner', 'admin')
  deactivate(@Req() request: AuthenticatedRequest, @Param('productId') productId: string) {
    return this.productsService.deactivate(request.user, productId);
  }
}
