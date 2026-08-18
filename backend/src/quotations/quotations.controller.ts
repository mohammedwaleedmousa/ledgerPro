import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../auth/auth.guard';
import { idempotencyKey } from '../common/idempotency';
import { Roles, RolesGuard } from '../auth/roles';
import { QuotationsService } from './quotations.service';

@Controller('quotations')
@UseGuards(AuthGuard, RolesGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Get()
  list(@Req() request: AuthenticatedRequest,@Query('limit') limit?:string){return this.quotationsService.list(request.user,Number(limit));}

  @Post()
  @Roles('owner','admin','accountant','sales')
  create(@Req() request:AuthenticatedRequest,@Body() body:{customerId:string;issueDate:string;expiryDate:string;status:'draft'|'sent';taxRate:number;notes?:string;items:Array<{productId:string;quantity:number;unitPrice:number}>}){
    return this.quotationsService.create(request.user,body,idempotencyKey(request));
  }

  @Patch(':quotationId/status')
  @Roles('owner','admin','accountant','sales')
  updateStatus(@Req() request:AuthenticatedRequest,@Param('quotationId') id:string,@Body() body:{status:string}){return this.quotationsService.updateStatus(request.user,id,body.status);}

  @Post(':quotationId/convert')
  @Roles('owner','admin','accountant','sales')
  convert(@Req() request:AuthenticatedRequest,@Param('quotationId') id:string,@Body() body:{paymentMethod:string}){return this.quotationsService.convert(request.user,id,body.paymentMethod,idempotencyKey(request));}
}
