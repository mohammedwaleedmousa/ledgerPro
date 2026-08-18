import { BadRequestException } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/auth.guard';

export function idempotencyKey(request: AuthenticatedRequest) {
  const value = request.headers['idempotency-key'];
  const key = Array.isArray(value) ? value[0] : value;
  if (!key || key.trim().length < 8 || key.trim().length > 200) {
    throw new BadRequestException('A valid Idempotency-Key header is required for this mutation.');
  }
  return key.trim();
}
