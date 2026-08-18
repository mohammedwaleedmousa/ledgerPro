import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { RolesGuard } from './auth/roles';
import { CustomersController } from './customers/customers.controller';
import { CustomersService } from './customers/customers.service';
import { ErpController } from './erp/erp.controller';
import { ErpService } from './erp/erp.service';
import { ExpensesController } from './expenses/expenses.controller';
import { ExpensesService } from './expenses/expenses.service';
import { InventoryController } from './inventory/inventory.controller';
import { InventoryService } from './inventory/inventory.service';
import { InvoicesController } from './invoices/invoices.controller';
import { InvoicesService } from './invoices/invoices.service';
import { JournalController } from './journal/journal.controller';
import { JournalService } from './journal/journal.service';
import { PaymentsController } from './payments/payments.controller';
import { PaymentsService } from './payments/payments.service';
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { PurchasesController } from './purchases/purchases.controller';
import { PurchasesService } from './purchases/purchases.service';
import { QuotationsController } from './quotations/quotations.controller';
import { QuotationsService } from './quotations/quotations.service';
import { ReturnsController } from './returns/returns.controller';
import { ReturnsService } from './returns/returns.service';
import { SuppliersController } from './suppliers/suppliers.controller';
import { SuppliersService } from './suppliers/suppliers.service';
import { SystemController } from './system/system.controller';
import { SystemService } from './system/system.service';

@Module({
  imports: [],
  controllers: [AppController, ErpController, InvoicesController, ProductsController, CustomersController, InventoryController, PaymentsController, SuppliersController, PurchasesController, QuotationsController, ReturnsController, ExpensesController, JournalController, SystemController],
  providers: [AppService, AuthService, AuthGuard, RolesGuard, ErpService, InvoicesService, ProductsService, CustomersService, InventoryService, PaymentsService, SuppliersService, PurchasesService, QuotationsService, ReturnsService, ExpensesService, JournalService, SystemService],
})
export class AppModule {}
