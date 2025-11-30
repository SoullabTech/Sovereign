import { Request } from "express";

export interface UserPayload {
  id: string;
  email: string;
  role?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}
