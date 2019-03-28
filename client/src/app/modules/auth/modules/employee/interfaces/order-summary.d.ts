declare interface OrderSummary {
  id: string,
  clientId: string,
  clientName: string,
  status: string,
  createdAt: Date,
  totalAmount: number,
  note: string
}