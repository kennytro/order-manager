import { FormControl } from '@angular/forms';

export interface OrderItem {
  id: FormControl,
  imageUrl: FormControl,
  name: FormControl,
  description: FormControl,
  category: FormControl,
  unitPrice: FormControl,
  quantity: FormControl,
  subTotal: FormControl
}
