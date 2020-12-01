import mongoose from 'mongoose'
import PlauditUser from '../interfaces/plauditUser.interface'

const plauditUserSchema = new mongoose.Schema({
  username: String,
  password: String,
  createdOn: String
})

const PlauditUserModel = mongoose.model<PlauditUser & mongoose.Document>('PlauditUser', plauditUserSchema)

export default PlauditUserModel