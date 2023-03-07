import { Deserializable } from './deserializable.model';

export class PendingPaymentModel implements Deserializable {
  public billDate!: Date;
  public head?: string;
  public dueDate!: Date;
  public invoiceAmount!: number;
  public amountPaid?: number;
  public pendingPayment?: number;
  public remark?: string;
  public id!: number;

  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
