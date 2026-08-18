import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { RolesGuard } from './auth/roles';
import { InvoicesController } from './invoices/invoices.controller';
import { InvoicesService } from './invoices/invoices.service';

@Module({
  imports: [],
  controllers: [AppController, InvoicesController],
  providers: [AppService, AuthService, AuthGuard, RolesGuard, InvoicesService],
})
export class AppModule {}
