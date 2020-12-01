import Controller from '../interfaces/controller.interface'
import express from 'express'
import postModel from '../models/post.model'
import Post from '../interfaces/post.interface'
import CreatePostDto from '../dto/createPost.dto'
import { IsString, validate } from 'class-validator'
import { NextFunction } from 'express'
import { plainToClass } from 'class-transformer'
import 'reflect-metadata'
import { RSA_NO_PADDING } from 'constants'

class PostController implements Controller {
  public path = '/posts'
  public router = express.Router()
  private post = postModel

  constructor() {
    this.initializeRoutes()
  }

  public initializeRoutes() {
    this.router.get(this.path, this.getAllPosts)
    this.router.get(`${this.path}/:username`, this.getAllPostsFromUser)
    this.router.post(this.path, this.createPost)
    this.router.get(`${this.path}/:id`, this.getPostById)
    this.router.patch(`${this.path}/:id`, this.updatePostById)
    this.router.patch(`${this.path}/upvote/:id`, this.upvotePostById)
    this.router.patch(`${this.path}/downvote/:id`, this.removeUpvoteById)
    this.router.delete(`${this.path}/:id`, this.deletePostById)
  }

  private getAllPosts = (req: express.Request, res: express.Response) => {
    this.post
      .find(function (results, err) {
        if (err) {
          res.send(err)
        } else {
          res.send(results)
        }
      })
      .sort({ createdOn: 'descending' })
  }

  private getAllPostsFromUser = (
    req: express.Request,
    res: express.Response
  ) => {
    if (!req.params.username) {
      res.send('username is required')
    } else {
      this.post
        .find({
          username: req.params.username,
        })
        .sort({ createdOn: 'descending' })
        .then((results) => {
          res.send(results)
        })
        .catch((error) => {
          res.send(error)
          console.log(error)
        })
    }
  }

  private createPost = (req: express.Request, res: express.Response) => {
    const newPost: CreatePostDto = {
      body: req.body.body,
      username: req.body.username,
      createdOn: new Date().toISOString(),
      upvotes: [],
    }

    validate(plainToClass(CreatePostDto, newPost)).then((errors) => {
      if (errors.length > 0) {
        res.json({
          errors,
        })
      } else {
        this.post
          .create(newPost)
          .then((results) => {
            res.send(results)
          })
          .catch((err) => {
            res.status(400).send('No post created: ' + err)
            console.log('error: ' + err)
          })
      }
    })
  }

  private getPostById = async (
    req: express.Request,
    res: express.Response,
    next: NextFunction
  ) => {
    const id = req.params.id
    this.post
      .findById(id)
      .then((post) => {
        res.send(post)
      })
      .catch((error) => {
        res.status(404).send('no post found with that id')
      })
  }

  private upvotePostById = async (
    req: express.Request,
    res: express.Response
  ) => {
    const id = req.params.id
    const upvoteUsername = req.body.username

    if (!id || !upvoteUsername) {
      res.send('username and post id are required')
    } else {
      this.post
        .findById(id)
        .then((post) => {
          if (post == null) {
            res.status(400).send('post was null')
            return
          }

          if (post.upvotes.includes(upvoteUsername)) {
            res.send('user already upvoted this post')
          } else {
            post.upvotes.push(upvoteUsername)
            post.save()
            res.send(`post ${post._id} upvoted by ${upvoteUsername}`)
          }
        })
        .catch((error) => {
          res.send(error)
        })
    }
  }
  private removeUpvoteById = (req: express.Request, res: express.Response) => {
    const id = req.params.id
    const removeUsername = req.body.username

    if (!id || !removeUsername) {
      res.send('username and post id are required')
    } else {
      this.post
        .findById(id)
        .then((post) => {
          if (post == null) {
            res.status(400).send('post was null')
            return
          }
          if (post.upvotes.includes(removeUsername)) {
            const index = post.upvotes.indexOf(removeUsername)
            if (index > -1) {
              post.upvotes.splice(index, 1)
            }
            post.save()
            res.send(
              `username ${removeUsername} removed upvote from post ${post._id}`
            )
          } else {
            res.send(`username ${removeUsername} not found on post ${post._id}`)
          }
        })
        .catch((err) => {
          res.send(err)
        })
    }
  }

  private updatePostById = (req: express.Request, res: express.Response) => {
    this.post
      .findOneAndUpdate({ __id: req.params.id }, req.body)
      .then((results) => {
        res.send(results)
      })
      .catch((err) => {
        res.status(400).send('No post with that id found')
        console.log('error: ' + err)
      })
  }

  private deletePostById = (req: express.Request, res: express.Response) => {
    this.post
      .findOneAndDelete({ _id: req.params.id })
      .then((results) => {
        res.send(results)
      })
      .catch((err) => {
        res.status(400).send('No post with that id found')
        console.log('error: ' + err)
      })
  }
}

export default PostController
