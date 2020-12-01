import {NextFunction, Request, Response} from "express";

let loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.path}`)

  next()
}

export default loggerMiddleware;

