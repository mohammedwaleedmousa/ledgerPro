import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../auth/auth.guard';
import { idempotencyKey } from '../common/idempotency';
import { Roles, RolesGuard } from '../auth/roles';
import { InventoryService } from './inventory.service';
import type { StockAdjustmentInput } from './inventory.types';

@Controller('inventory')
@UseGuards(AuthGuard, RolesGuard)
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get('movements')
  movements(@Req() request: AuthenticatedRequest, @Query('limit') limit?: string) {
    return this.inventoryService.movements(request.user, Number(limit));
  }

  @Post('adjust')
  @Roles('owner', 'admin', 'inventory')
  adjust(@Req() request: AuthenticatedRequest, @Body() input: StockAdjustmentInput) {
    return this.inventoryService.adjust(request.user, input, idempotencyKey(request));
  }
}
