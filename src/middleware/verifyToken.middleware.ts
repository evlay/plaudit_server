import {NextFunction, Request, Response} from "express";
import jwt from 'jsonwebtoken'

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const cookie = req.headers.cookie;
    if(typeof cookie === undefined) {
      next('unauthorized')
    }
    if(typeof cookie === "string") {
      if(!cookie.split('=')[1]) {
        next('unauthorized')
      }
      const token = cookie.split('=')[1]
      jwt.verify(token, process.env.AUTH_TOKEN_SECRET as string, (err: any , decoded: any) => {
        if(err) {
          console.log(err)
           next(new Error(err))
        }
        if(decoded) {
          req.user = decoded.data
          next()
        }
      })
    }
} 

export default verifyToken;

