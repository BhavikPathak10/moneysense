import { Deserializable } from './deserializable.model';

export class BankDetails implements Deserializable {
  public accountName!: string;
  public accountNumber?: number;
  public accountType!: string;
  public bankName!: string;
  public branch!: string;
  public currentBalance!: number;
  public estimatedBalance?: number;
  public balanceUpdatedAt!: number;
  public totalWithdrawn!: number;
  public totalDeposit!: number;
  public id!: number;

  deserialize(input: any): this {
    return Object.assign(this, input);
  }
}
