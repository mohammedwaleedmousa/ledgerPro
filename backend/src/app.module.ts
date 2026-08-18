import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { RolesGuard } from './auth/roles';
import { ErpController } from './erp/erp.controller';
import { ErpService } from './erp/erp.service';
import { InvoicesController } from './invoices/invoices.controller';
import { InvoicesService } from './invoices/invoices.service';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';

@Module({
  imports: [],
  controllers: [AppController, ErpController, InvoicesController, ProductsController],
  providers: [AppService, AuthService, AuthGuard, RolesGuard, ErpService, InvoicesService, ProductsService],
})
export class AppModule {}
