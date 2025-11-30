import { Multer } from "multer";

declare global {
  namespace Express {
    interface Request {
      file?: Multer.File;
      files?: Multer.File[] | { [fieldname: string]: Multer.File[] };
    }
    
    interface Response {
      success?: (data: any) => void;
      error?: (error: any) => void;
    }
  }
}

export {};
