declare interface Message {
  id: number,
  messageType: string,
  subject: string,
  body: string,
  fromUser: string,
  toUserId: number,
  createdAt: Date,
  expiresAt: Date,
  isRead: boolean
}
