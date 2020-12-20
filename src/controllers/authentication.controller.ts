import Controller from '../interfaces/controller.interface'
import express from 'express'
import bcrypt from 'bcrypt'
import PlauditUser from '../interfaces/plauditUser.interface'
import PlauditUserModel from '../models/plauditUser.model'
import BlacklistedRefreshTokenModel from '../models/blacklistedRefreshTokens.model'
import { NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import verifyToken from '../middleware/verifyToken.middleware'
import { isToken } from 'typescript'
import { isEmpty } from 'class-validator'

require('dotenv').config({ path: `${__dirname}/../../.env` })

class AuthenticationController implements Controller {
  public path = '/auth'
  public router = express.Router()
  public saltRounds = 10
  public plauditUser = PlauditUserModel
  public blacklistedRefreshToken = BlacklistedRefreshTokenModel

  constructor() {
    this.initializeRoutes()
  }

  public initializeRoutes() {
    this.router.post(`${this.path}/register`, this.createPlauditUser)
    this.router.post(`${this.path}/login`, this.login)
    this.router.post(`${this.path}/token`, this.getAuthTokenWithRefresh)
    this.router.post(
      `${this.path}/blacklist-refreshtoken`,
      this.blacklistRefreshToken
    )
  }

  private login = async (
    req: express.Request,
    res: express.Response,
    next: NextFunction
  ) => {
    if (!req.body.username || !req.body.password) {
      res.send('username and password are required')
    } else {
      const loginUser: string = req.body.username
      const loginPw: string = req.body.password

      await this.plauditUser.findOne(
        {
          username: req.body.username,
        },
        async (err, results) => {
          if (err) {
            res.send(err)
          } else if (!results) {
            res.send('Incorrect email or password.')
          } else {
            // check
            await bcrypt.compare(loginPw, results.password, (err, results) => {
              if (err) {
                res.send(err)
              } else if (results === true) {
                const authToken = this.genAuthToken(loginUser)
                const refreshToken = this.genRefreshToken(loginUser)
                res.json({
                  plauditAuthToken: authToken,
                  plauditRefreshToken: refreshToken,
                })
                console.log(`cookie set for user ${loginUser}`)
              } else if (results === false) {
                res.send('login failed')
              }
            })
          }
        }
      )
    }
  }

  private genAuthToken = (username: string) => {
    const authToken = jwt.sign(
      { data: username },
      process.env.AUTH_TOKEN_SECRET as string,
      { expiresIn: '5m' }
    )
    return authToken
  }

  private genRefreshToken = (username: string) => {
    const refreshToken = jwt.sign(
      { data: username },
      process.env.REFRESH_TOKEN_SECRET as string,
      { expiresIn: '24h' }
    )
    return refreshToken
  } 

  private getDecodedRefreshToken = async (refreshToken: string): Promise<any> => {
    try {
      return jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      )
    } catch (error) {
      console.error(error)
      return ''
    }
  }

  private async isRefreshtokenBlacklisted(refreshToken: string) {
    let isBlacklisted = false
    await this.blacklistedRefreshToken
      .find({ refreshToken })
      .then((results) => {
        if (results.length > 0) {
          isBlacklisted = true
        }
      })
      .catch((err) => console.error(err))
    return isBlacklisted
  }

  private getAuthTokenWithRefresh = async (
    req: express.Request,
    res: express.Response
  ) => {
    if (!req.body.refreshToken || !req.body.username)
      res.send('refresh token and user is required')
    const refreshToken = req.body.refreshToken
    const username = req.body.username
    // check against blacklist of tokens
    const isBlacklisted = await this.isRefreshtokenBlacklisted(refreshToken)
    if (isBlacklisted) {
      res.status(403).send('token is blacklisted')
    } else {
      const decoded = await this.getDecodedRefreshToken(refreshToken)
      if(decoded.data == username){
        res.json({ authToken: await this.genAuthToken(username) })
      } else {
        res.status(403).send('username did not match username')
      }
    }  
  }

  private blacklistRefreshToken = async (
    req: express.Request,
    res: express.Response
  ) => {
    if (!req.body.username || !req.body.refreshToken) {
      res.send('username and refreshToken are required')
    } else {
      const refreshToken = req.body.refreshToken
      const username = req.body.username

      await this.blacklistedRefreshToken
        .create({ refreshToken, username })
        .then((results) => {
          res.json({ results })
        })
        .catch((error) => res.status(500).json({ error }))
    }
  }


  private createPlauditUser = async (
    req: express.Request,
    res: express.Response
  ) => {
    const hashedPassword: string = await bcrypt.hash(
      req.body.password,
      this.saltRounds
    )

    const newPlauditUser: PlauditUser = {
      username: req.body.username,
      password: hashedPassword,
      createdOn: new Date(),
    }

    // check if user with that username exist before creating
    await this.plauditUser.findOne(
      { username: newPlauditUser.username },
      (err: any, results: any) => {
        if (err) {
          throw err
        } else {
          if (!results) {
            this.plauditUser
              .create(newPlauditUser)
              .then(() => {
                res.status(200).send(`User ${newPlauditUser.password}`)
              })
              .catch((err: any) => {
                res.status(201).send(err)
              })
          } else {
            res.send('username already exist with that name')
          }
        }
      }
    )
  }
}

export default AuthenticationController
