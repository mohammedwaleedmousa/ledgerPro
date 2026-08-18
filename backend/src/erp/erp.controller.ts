import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../auth/auth.guard';
import { ErpService } from './erp.service';

@Controller('erp')
@UseGuards(AuthGuard)
export class ErpController {
  constructor(private readonly erpService: ErpService) {}

  @Get('bootstrap')
  bootstrap(@Req() request: AuthenticatedRequest) {
    return this.erpService.bootstrap(request.user);
  }

  @Get('products')
  products(@Req() request: AuthenticatedRequest, @Query() query: Record<string, unknown>) {
    return this.erpService.products(request.user, query);
  }

  @Get('customers')
  customers(@Req() request: AuthenticatedRequest, @Query() query: Record<string, unknown>) {
    return this.erpService.customers(request.user, query);
  }

  @Get('invoices')
  invoices(@Req() request: AuthenticatedRequest, @Query() query: Record<string, unknown>) {
    return this.erpService.invoices(request.user, query);
  }

  @Get('invoices/:invoiceId')
  invoiceDetails(@Req() request: AuthenticatedRequest, @Param('invoiceId') invoiceId: string) {
    return this.erpService.invoiceDetails(request.user, invoiceId);
  }
}
