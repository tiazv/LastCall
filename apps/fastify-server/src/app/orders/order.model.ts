import { Schema, Document, Model, model } from 'mongoose';
import { Buyer } from '../buyers/buyers.model';
import { Product, ProductSchema } from '../products/product.model';
import { Seller } from '../sellers/sellers.model';

export const OrderSchema = new Schema({
  products: [
    {
      product: { type: ProductSchema, required: true },
      quantity: { type: Number, required: true, default: 1 },
    },
  ],
  buyer: { type: Schema.Types.ObjectId, ref: 'Buyer', required: true },
  seller: { type: Schema.Types.ObjectId, ref: 'Seller', required: true },
  totalPrice: { type: Number, required: true },
  dateOfPurchase: { type: Date, immutable: true, default: () => Date.now() },
  lastDateOfDelivery: { type: Date, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  uid: { type: String, required: true },
  coordinates: [{ type: Number }]
});

export interface Order extends Document {
  products: { product: Product; quantity: number }[];
  buyer: Buyer;
  seller: Seller;
  totalPrice: number;
  dateOfPurchase: Date;
  lastDateOfDelivery: Date;
  address: string;
  city: string;
  country: string;
  status: string;
  uid: string;
  coordinates: number[];
}

export const OrderModel: Model<Order> = model<Order>('Order', OrderSchema);
