import { Body, Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthenticatedRequest } from '../auth/auth.guard';
import { Roles, RolesGuard } from '../auth/roles';
import { JournalService } from './journal.service';
import type { ManualJournalInput } from './journal.types';

@Controller('journal')
@UseGuards(AuthGuard, RolesGuard)
export class JournalController {
  constructor(private readonly journalService: JournalService) {}

  @Get('accounts')
  accounts(@Req() request: AuthenticatedRequest) {
    return this.journalService.accounts(request.user);
  }

  @Get()
  list(@Req() request: AuthenticatedRequest, @Query('limit') limit?: string) {
    return this.journalService.list(request.user, Number(limit));
  }

  @Post()
  @Roles('owner', 'admin', 'accountant')
  post(@Req() request: AuthenticatedRequest, @Body() body: ManualJournalInput) {
    return this.journalService.post(request.user, body);
  }

  @Post(':journalEntryId/reverse')
  @Roles('owner', 'admin', 'accountant')
  reverse(@Req() request: AuthenticatedRequest, @Param('journalEntryId') journalEntryId: string, @Body() body: { reason: string }) {
    return this.journalService.reverse(request.user, journalEntryId, body.reason);
  }
}
