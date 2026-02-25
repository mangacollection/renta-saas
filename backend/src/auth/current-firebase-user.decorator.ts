import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentFirebaseUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return req.user; // lo setea FirebaseAuthGuard
  },
);
