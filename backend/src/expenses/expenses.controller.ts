import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../auth/auth.guard';
import { idempotencyKey } from '../common/idempotency';
import { Roles, RolesGuard } from '../auth/roles';
import { ExpensesService } from './expenses.service';

@Controller('expenses')
@UseGuards(AuthGuard, RolesGuard)
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest, @Query('limit') limit?: string) {
    return this.expensesService.list(request.user, Number(limit));
  }

  @Post()
  @Roles('owner', 'admin', 'accountant')
  post(@Req() request: AuthenticatedRequest, @Body() body: { category: string; description: string; amount: number; date: string; status: 'paid' | 'pending'; supplierId?: string; paymentMethod?: 'cash' | 'bank' | 'card' }) {
    return this.expensesService.post(request.user, body, idempotencyKey(request));
  }
}
