import { IsEnum, IsNotEmpty, IsNumber } from "class-validator";

export enum SupportedCurrency {
  USD = "USD",
  EUR = "EUR",
  ETB = "ETB",
  GBP = "GBP",
  JPY = "JPY",
  CNY = "CNY",
  CAD = "CAD",
  AUD = "AUD",
  CHF = "CHF",
  INR = "INR",
  AED = "AED",
}

export class RateConversionDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsEnum(SupportedCurrency, {
    message: `fromCurrency must be one of: ${Object.values(SupportedCurrency).join(", ")}`,
  })
  fromCurrency: SupportedCurrency;

  @IsEnum(SupportedCurrency, {
    message: `toCurrency must be one of: ${Object.values(SupportedCurrency).join(", ")}`,
  })
  toCurrency: SupportedCurrency;
}