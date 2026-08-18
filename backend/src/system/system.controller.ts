import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../auth/auth.guard';
import { Roles, RolesGuard } from '../auth/roles';
import { SystemService } from './system.service';

@Controller('system')
@UseGuards(AuthGuard, RolesGuard)
export class SystemController {
  constructor(private readonly systemService:SystemService){}

  @Get('categories') categories(@Req() request:AuthenticatedRequest){return this.systemService.categories(request.user);}
  @Post('categories') @Roles('owner','admin','inventory') createCategory(@Req() request:AuthenticatedRequest,@Body() body:{name:string;description?:string}){return this.systemService.createCategory(request.user,body.name,body.description??'');}
  @Delete('categories/:categoryId') @Roles('owner','admin','inventory') deactivateCategory(@Req() request:AuthenticatedRequest,@Param('categoryId') id:string){return this.systemService.deactivateCategory(request.user,id);}

  @Get('warehouses') warehouses(@Req() request:AuthenticatedRequest){return this.systemService.warehouses(request.user);}
  @Post('warehouses') @Roles('owner','admin','inventory') createWarehouse(@Req() request:AuthenticatedRequest,@Body() body:{name:string;location?:string}){return this.systemService.createWarehouse(request.user,body.name,body.location??'');}
  @Post('warehouses/transfer') @Roles('owner','admin','inventory') transfer(@Req() request:AuthenticatedRequest,@Body() body:{productId:string;fromWarehouseId:string;toWarehouseId:string;quantity:number;reference?:string}){return this.systemService.transferStock(request.user,body);}

  @Get('settings') settings(@Req() request:AuthenticatedRequest){return this.systemService.settings(request.user);}
  @Put('settings') @Roles('owner','admin') updateSettings(@Req() request:AuthenticatedRequest,@Body() body:{currency:'USD'|'YER'|'SAR';taxRate:number;invoicePrefix:string;quotationPrefix:string;purchasePrefix:string;fiscalYearStart:string}){return this.systemService.updateSettings(request.user,body);}

  @Get('activity') @Roles('owner','admin') activity(@Req() request:AuthenticatedRequest,@Query('limit') limit?:string){return this.systemService.activity(request.user,Number(limit));}

  @Post('accounts') @Roles('owner','admin','accountant') createAccount(@Req() request:AuthenticatedRequest,@Body() body:{code:string;name:string;type:string}){return this.systemService.createAccount(request.user,body);}
}
