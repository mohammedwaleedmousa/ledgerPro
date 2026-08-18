import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../auth/auth.guard';
import { idempotencyKey } from '../common/idempotency';
import { Roles, RolesGuard } from '../auth/roles';
import { PaymentsService } from './payments.service';
import type { PaymentWriteInput } from './payments.types';

@Controller('payments')
@UseGuards(AuthGuard, RolesGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest, @Query('limit') limit?: string) {
    return this.paymentsService.list(request.user, Number(limit));
  }

  @Get('suppliers')
  suppliers(@Req() request: AuthenticatedRequest) {
    return this.paymentsService.suppliers(request.user);
  }

  @Post()
  @Roles('owner', 'admin', 'accountant', 'sales')
  post(@Req() request: AuthenticatedRequest, @Body() input: PaymentWriteInput) {
    return this.paymentsService.post(request.user, input, idempotencyKey(request));
  }
}
