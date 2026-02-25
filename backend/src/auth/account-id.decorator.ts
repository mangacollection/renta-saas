import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AccountId = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest();
  return req.accountId;
});
