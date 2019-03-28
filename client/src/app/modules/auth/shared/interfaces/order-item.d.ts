//import { FormControl } from '@angular/forms';

declare interface OrderItem {
  id: number,
  imageUrl?: string,
  name: string,
  description: string,
  category: string,
  unitPrice: number,
  unit: string,
//  quantity: FormControl,
  quantity: any,
  subTotal: number
}
