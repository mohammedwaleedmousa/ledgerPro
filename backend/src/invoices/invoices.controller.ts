import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.guard';
import { AuthGuard } from '../auth/auth.guard';
import { idempotencyKey } from '../common/idempotency';
import { Roles, RolesGuard } from '../auth/roles';
import { InvoicesService } from './invoices.service';
import type { PostInvoiceInput } from './invoices.types';

@Controller('invoices')
@UseGuards(AuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post('post')
  @Roles('owner', 'admin', 'accountant', 'sales')
  postInvoice(@Req() request: AuthenticatedRequest, @Body() body: PostInvoiceInput) {
    return this.invoicesService.postInvoice(request.user, body, idempotencyKey(request));
  }
}
