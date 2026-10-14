import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  permissions: string[];
}

export interface AuthRequest extends Request {
  user: AuthenticatedUser;
}