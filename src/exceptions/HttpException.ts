export default class HttpException extends Error {
  message: string
  status: number
  constructor(message: string, status: number){
    super(message)
    this.message = message
    this.status = status
  }
}