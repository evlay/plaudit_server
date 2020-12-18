import HttpException from '../exceptions/HttpException'
import { Request, Response, NextFunction } from 'express'

export default function errorMiddlware(err: HttpException, req: Request, res: Response, next: NextFunction){
  const status = err.status || 500
  const message = err.message || "Whoops, look like something went wrong"
  res.status(status).send({
    status,
    message
  })
}