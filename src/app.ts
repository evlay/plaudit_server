import express from 'express'
import mongoose from 'mongoose'
import dotenv from 'dotenv'
import loggerMiddleware from './middleware/logger.middleware'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
// import errorMiddleware from './middleware/error.middleware'

dotenv.config()

class App {
  public app: express.Application

  constructor(controllers: any) {
    this.app = express()
    this.initializeMiddlewares()
    this.initializeControllers(controllers)
    this.connectToDB()
    this.initializeErrorHandler()
  }

  public listen() {
    this.app.listen(process.env.PORT, () => {
      console.log(`App listening on port ${process.env.PORT}`)
    })
  }

  private initializeMiddlewares() {
    this.app.use(loggerMiddleware)
    this.app.use(express.json())
    this.app.use(cors())
    this.app.use(rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: "too many request from this IP in the last 15 minutes"
    }))
  }

  private initializeErrorHandler(){
    // this.app.use(errorMiddleware)
  }

  private initializeControllers(controllers: any) {
    controllers.forEach((controller: any) => {
      this.app.use('/', controller.router)
    })
  }

  private connectToDB() {
    mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
      })
      .catch((err) => console.log(err))
  }
}

export default App
