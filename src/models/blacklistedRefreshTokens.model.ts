import BlacklistedRefreshToken from '../interfaces/blacklistedRefreshToken.interface'
import mongoose from 'mongoose'

const BlacklistedRefreshTokenSchema = new mongoose.Schema({
    refreshToken: String,
    username: String,
  })
  
  const BlacklistedRefreshTokenModel = mongoose.model<BlacklistedRefreshToken & mongoose.Document>('BlacklistedRefreshToken', BlacklistedRefreshTokenSchema)
  
  export default BlacklistedRefreshTokenModel