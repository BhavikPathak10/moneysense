import { Deserializable } from './deserializable.model';

export class IncomeAtGlanceModel implements Deserializable {
  public account?: string;
  public billNumber?: number;
  public clientName?: string;
  public date?: Date;
  public billAmount!: number;
  public igst?: number;
  public cgst?: number;
  public sgst?: number;
  public paymentRcvdDate?: Date;
  public amountRcvd!: number;
  public id!: number;
  
  public month?: string;
  public totalTax?: number;
  public totalAmount?: number;
  public afterTDS?: number;
  public pendingAmount?: number;


  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
