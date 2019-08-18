declare interface Message {
  id: number,
  messageType: string,
  subject: string,
  body: string,
  fromUser: string,
  toUser: string,
  createdAt: Date,
  updatedAt: Date,
  read?: boolean
}
