declare interface StatementSummary {
  id: string,
  clientId: string,
  clientName: string,
  totalAmount: number,
  paidAmount: number,
  createdAt: Date,
  updatedAt: Date,
  note: string
}