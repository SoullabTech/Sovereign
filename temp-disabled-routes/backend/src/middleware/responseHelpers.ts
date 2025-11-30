import { Request, Response, NextFunction } from 'express';

export const responseHelpers = (req: Request, res: Response, next: NextFunction) => {
  res.success = function(data: any) {
    return this.json({
      success: true,
      data
    });
  };

  res.error = function(error: any, statusCode: number = 400) {
    return this.status(statusCode).json({
      success: false,
      error: error.message || error
    });
  };

  next();
};
