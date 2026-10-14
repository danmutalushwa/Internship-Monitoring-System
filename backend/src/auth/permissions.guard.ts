import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.get<string[]>('permissions', context.getHandler());
    if (!requiredPermissions) return true;   

    const request = context.switchToHttp().getRequest();  
    const user = request.user;
    if (user.role === 'ADMIN' || user.role === 'DEAN') {
      return true; 
    }
    return requiredPermissions.every((perm) => user.permissions?.includes(perm));
  }
}