import Controller from "../interfaces/controller.interface"
import express from "express"
import bcrypt from "bcrypt"
import PlauditUser from "../interfaces/plauditUser.interface"
import PlauditUserModel from "../models/plauditUser.model"
import BlacklistedRefreshTokenModel from "../models/blacklistedRefreshTokens.model"
import { NextFunction } from "express"
import jwt from "jsonwebtoken"
import verifyToken from "../middleware/verifyToken.middleware"

require("dotenv").config({ path: `${__dirname}/../../.env` })

class AuthenticationController implements Controller {
  public path = "/auth"
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
  }

  private login = async (
    req: express.Request,
    res: express.Response,
    next: NextFunction
  ) => {
    if (!req.body.username || !req.body.password) {
      res.send("username and password are required")
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
            res.send("Incorrect email or password.")
          } else {
            // check
            await bcrypt.compare(loginPw, results.password, (err, results) => {
              if (err) {
                res.send(err)
              } else if (results === true) {
                const authToken = jwt.sign(
                  { data: loginUser },
                  process.env.AUTH_TOKEN_SECRET as string,
                  { expiresIn: "5m" }
                )
                const refreshToken = jwt.sign(
                  { data: loginUser },
                  process.env.REFRESH_TOKEN_SECRET as string,
                  { expiresIn: "24h" }
                )
                res.json({
                  plauditAuthToken: authToken,
                  plauditRefreshToken: refreshToken,
                })
                console.log(`cookie set for user ${loginUser}`)
              } else if (results === false) {
                res.send("login failed")
              }
            })
          }
        }
      )
    }
  }

  private getAuthTokenWithRefresh(req: express.Request, res: express.Response) {
    // check against blacklist of tokens
    // check for auth token and validate
    // check for refresh token and validate
  }

  private getAllPlauditUsers = (
    req: express.Request,
    res: express.Response
  ) => {
    if (req.user) {
      this.plauditUser.find().then((plauditUsers) => {
        res.status(200).json({ plauditUsers })
      })
    } else {
      res.status(403).json({ msg: "403 forbidden" })
    }
  }

  private findOnePlauditUserById = (
    req: express.Request,
    res: express.Response
  ) => {
    this.plauditUser.findOne(
      {
        username: req.body.username,
      },
      function (err: any, results: any) {
        if (err) {
          res.send(err)
        } else {
          res.send(results)
        }
      }
    )
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
            res.send("username already exist with that name")
          }
        }
      }
    )
    /////////////////////////////////////////////////////////
  }

  private createOneTestPlauditUser = async (
    req: express.Request,
    res: express.Response
  ) => {
    const testPw = "supersecret"
    const password: string = await bcrypt.hash(testPw, this.saltRounds)

    const newPlauditUser: PlauditUser = {
      username: `test-user-${new Date().getTime()}`,
      password,
      createdOn: new Date(),
    }

    this.plauditUser
      .create(newPlauditUser)
      .then(() => {
        res.status(200).json(newPlauditUser)
      })
      .catch((err) => {
        res.status(201).send(err)
      })
  }
}

export default AuthenticationController
