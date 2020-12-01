import App from './app';
// import PlauditUserController from './controllers/plauditUser.controller'
import mongoose from 'mongoose'
import validateEnv from './utils/validateEnv'
import PostController from './controllers/post.controller';
import AuthenticationController from './controllers/authentication.controller'

validateEnv()

const app = new App(
  [
    // new PlauditUserController(),
    new PostController(),
    new AuthenticationController(),
  ]
);

app.listen();