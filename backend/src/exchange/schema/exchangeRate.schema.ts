import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
@Schema()
export class ExchangeRate extends Document {
  @Prop()
  baseCurrency: string;

  @Prop()
  usdRate: number;//usd

  @Prop()
  eurRate: number;//eur

  @Prop()
  etbRate: number;//ethiopian birr

  @Prop()
  gbpRate: number; // British Pound

  @Prop()
  jpyRate: number; // Japanese Yen

  @Prop()
  cnyRate: number; // Chinese Yuan

  @Prop()
  cadRate: number; // Canadian Dollar

  @Prop()
  audRate: number; // Australian Dollar

  @Prop()
  chfRate: number; // Swiss Franc

  @Prop()
  inrRate: number; // Indian Rupee

  @Prop()
  aedRate: number; // UAE Dirham

  @Prop()
  exchangeDate: Date;
}
export const exchangeRateSchema = SchemaFactory.createForClass(ExchangeRate);