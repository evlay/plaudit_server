import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import HttpException from '../exceptions/HttpException'

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header('Authorization') || 'bad authoirzation header'
  const refreshToken = req.body.refreshToken
  if(!authHeader) {
    next(new HttpException('Authorization header is required', 401))
  }
    const token = authHeader.split(' ')[1]
    jwt.verify(
      token,
      process.env.AUTH_TOKEN_SECRET as string,
      (err: any, decoded: any) => {
        if (err) {
          next(new HttpException(err, 401))
        }
          
        if (decoded) {
          req.user = decoded.data
          console.log(`${decoded.data} authed`)
          next()
        }
      }
    )
  }

export default verifyToken
