export class RateResponse {
  id: string;
  baseCurrency?: string;
  usdRate: number;
  eurRate: number;
  etbRate: number;
  gbpRate: number;
  jpyRate: number;
  cnyRate: number;
  cadRate: number;
  audRate: number;
  chfRate: number;
  inrRate: number;
  aedRate: number;
  exchangeDate: Date;
}

export class ConversionRespose {
  fromCurrency: string;
  toCurrency: string;
  Amount: number;
}