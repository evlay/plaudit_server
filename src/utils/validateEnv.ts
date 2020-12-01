import { str, port, cleanEnv } from 'envalid'

function validateEnv() {
  cleanEnv(process.env, {
    MONGO_URI: str(),
    PORT: port(),
    JWT_SALT: str(),
  });
}

export default validateEnv