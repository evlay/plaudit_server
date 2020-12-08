import {NextFunction, Request, Response} from "express";
import jwt from 'jsonwebtoken'

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('verify token function running')
    const authHeader = req.header('authorization')
    if(typeof authHeader === undefined) {
      next('unauthorized')
    }
    if(typeof authHeader === "string") {
      const token = authHeader.split(' ')[1]
      jwt.verify(token, process.env.AUTH_TOKEN_SECRET as string, (err: any , decoded: any) => {
        if(err) {
           next(new Error(err))
        }
        if(decoded) {
          req.user = decoded.data
          next()
        } else {
          next(new Error('something went wrong!'))
        }
      })
    }
} 

export default verifyToken;

