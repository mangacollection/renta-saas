import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { firebaseAdmin } from './firebase';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    console.log('Auth header:', authHeader);

    if (!authHeader)
      throw new UnauthorizedException('Missing Authorization header');

    const token = authHeader.replace('Bearer ', '').trim();

    try {
      const decoded = await firebaseAdmin.auth().verifyIdToken(token);
      request.user = decoded;
      return true;
    } catch (e) {
      console.error('Firebase verify error:', e);
      throw new UnauthorizedException('Invalid Firebase token');
    }
  }
}
