import Controller from '../interfaces/controller.interface'
import express from 'express'
import bcrypt from 'bcrypt'
import PlauditUser from '../interfaces/plauditUser.interface'
import PlauditUserModel from '../models/plauditUser.model'
import { NextFunction } from 'express'
import { ReplSet } from 'typeorm'
require('dotenv').config()

class AuthenticationController implements Controller {
  public path = '/auth'
  public router = express.Router()
  public saltRounds = 10
  public plauditUser = PlauditUserModel

  constructor() {
    this.initializeRoutes()
  }

  public initializeRoutes() {
    this.router.get(`${this.path}/users`, this.getAllPlauditUsers)
    this.router.get(`${this.path}/users/one`, this.findOnePlauditUserById)
    this.router.post(`${this.path}/register`, this.createPlauditUser)
    this.router.post(`${this.path}/login`, this.login)
  }

  private getAllPlauditUsers = (
    req: express.Request,
    res: express.Response
  ) => {
    this.plauditUser.find().then((plauditUsers) => {
      res.status(200).send(plauditUsers)
    })
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
                res.status(200).json(newPlauditUser)
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
    /////////////////////////////////////////////////////////
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
        (err, results) => {
          if (err) {
            res.send(err)
          } else if (!results) {
            res.send('Incorrect email or password.')
          } else {
            // check
            bcrypt.compare(loginPw, results.password, (err, results) => {
              if (err) {
                res.send(err)
              } else if (results === true) {
                res.json(
                  results
                )
              } else if (results === false) {
                res.send('login failed')
              }
            })
          }
        }
      )
    }
  }

  private createOneTestPlauditUser = async (
    req: express.Request,
    res: express.Response
  ) => {
    const testPw = 'supersecret'
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
