export type ManualJournalInput = {
  date: string;
  description: string;
  lines: Array<{ accountId: string; debit: number; credit: number }>;
};
