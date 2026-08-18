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

@Module({
  imports: [],
  controllers: [AppController, ErpController, InvoicesController],
  providers: [AppService, AuthService, AuthGuard, RolesGuard, ErpService, InvoicesService],
})
export class AppModule {}
