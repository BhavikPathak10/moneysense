import { Deserializable } from './deserializable.model';

export class Transaction implements Deserializable {
  public transactionDate!: Date;
  public transactionMonth!: string;
  public transactionFY!: string;
  public particular!: string;
  public reference!: string;
  public mode?: string;
  public transactionType?: string;
  public withdrawal!: number;
  public deposit!: number;
  public transactionAmount?: number;
  public accountName?: string;
  public remark?: string;
  public groupHead?: string;
  public subHead?: string;
  public accountHead?: string;
  public costCenter?: string;
  public costCategory?: string;
  public id?: any;
  public _balance?: number;

  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
