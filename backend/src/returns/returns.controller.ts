import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../auth/auth.guard';
import { idempotencyKey } from '../common/idempotency';
import { Roles, RolesGuard } from '../auth/roles';
import { ReturnsService } from './returns.service';

@Controller('returns')
@UseGuards(AuthGuard, RolesGuard)
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest, @Query('limit') limit?: string) {
    return this.returnsService.list(request.user, Number(limit));
  }

  @Post()
  @Roles('owner', 'admin', 'accountant', 'sales')
  post(@Req() request: AuthenticatedRequest, @Body() body: { invoiceId: string; reason: string }) {
    return this.returnsService.post(request.user, body.invoiceId, body.reason, idempotencyKey(request));
  }
}
