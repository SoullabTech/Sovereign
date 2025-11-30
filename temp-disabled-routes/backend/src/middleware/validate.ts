import { Request, Response, NextFunction } from "express";
import { Schema } from "zod";
import { ValidationError } from "../utils/errors";

export const validate = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof Error) {
        next(new ValidationError(error.message));
      } else {
        next(new ValidationError("Invalid request data"));
      }
    }
  };
};
