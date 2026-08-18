import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../auth/auth.guard';
import { idempotencyKey } from '../common/idempotency';
import { Roles, RolesGuard } from '../auth/roles';
import { PurchasesService } from './purchases.service';
import type { PurchaseOrderWriteInput } from './purchases.types';

@Controller('purchases')
@UseGuards(AuthGuard, RolesGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest, @Query('limit') limit?: string) {
    return this.purchasesService.list(request.user, Number(limit));
  }

  @Post()
  @Roles('owner', 'admin', 'accountant', 'inventory')
  create(@Req() request: AuthenticatedRequest, @Body() body: PurchaseOrderWriteInput) {
    return this.purchasesService.create(request.user, body, idempotencyKey(request));
  }

  @Patch(':purchaseOrderId/ordered')
  @Roles('owner', 'admin', 'accountant', 'inventory')
  markOrdered(@Req() request: AuthenticatedRequest, @Param('purchaseOrderId') purchaseOrderId: string) {
    return this.purchasesService.markOrdered(request.user, purchaseOrderId);
  }

  @Post(':purchaseOrderId/receive')
  @Roles('owner', 'admin', 'accountant', 'inventory')
  receive(@Req() request: AuthenticatedRequest, @Param('purchaseOrderId') purchaseOrderId: string) {
    return this.purchasesService.receive(request.user, purchaseOrderId, idempotencyKey(request));
  }
}
