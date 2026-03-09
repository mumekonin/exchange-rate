import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ExchangeRate } from "../schema/exchangeRate.schema";
import { Model } from "mongoose";
import { HttpService } from "@nestjs/axios";
import { Cron, CronExpression } from "@nestjs/schedule";
import { RateResponse, ConversionRespose } from "../response/exchangeRate.reponse";
import { RateConversionDto } from "../dto/exchangeRate.dto";

@Injectable()
export class ExchangeRatesService {
  constructor(
    @InjectModel(ExchangeRate.name)
    private readonly rateModel: Model<ExchangeRate>,
    private readonly httpService: HttpService
  ) {}

  private getUTCDayRange(): { startOfDayUTC: Date; endOfDayUTC: Date } {
    const today = new Date();
    const startOfDayUTC = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      0, 0, 0, 0
    ));
    const endOfDayUTC = new Date(Date.UTC(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
      23, 59, 59, 999
    ));
    return { startOfDayUTC, endOfDayUTC };
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async sendRequestAndUpdateRates() {
    try {
      const { startOfDayUTC, endOfDayUTC } = this.getUTCDayRange();

      const existingRate = await this.rateModel.findOne({
        exchangeDate: { $gte: startOfDayUTC, $lte: endOfDayUTC }
      });

      if (existingRate) {
        console.log("Today's exchange rate already exists");
        return;
      }

      const response = await this.httpService.axiosRef.get(process.env.EXCHANGE_RATE_API_URL!
      );

      if (response.data.result === "success") {
        const rates = response.data.conversion_rates;

        const Usd = rates.USD;
        const Eur = rates.EUR;
        const etb = rates.ETB;
        const gbp = rates.GBP;
        const jpy = rates.JPY;
        const cny = rates.CNY;
        const cad = rates.CAD;
        const aud = rates.AUD;
        const chf = rates.CHF;
        const inr = rates.INR;
        const aed = rates.AED;

        const newRate = await this.rateModel.create({
          baseCurrency: response.data.base_code,
          usdRate: Usd,
          eurRate: Eur,
          etbRate: etb,
          gbpRate: gbp,
          jpyRate: jpy,
          cnyRate: cny,
          cadRate: cad,
          audRate: aud,
          chfRate: chf,
          inrRate: inr,
          aedRate: aed,
          exchangeDate: startOfDayUTC,
        });

        await newRate.save();
        console.log("Exchange rate saved successfully");
        return newRate;
      }
    } catch (error) {
      console.log(error);
      throw new Error("Failed to fetch exchange rate.");
    }
  }

  async getTodayExchangeRate(): Promise<RateResponse> {
    const { startOfDayUTC, endOfDayUTC } = this.getUTCDayRange();

    const todayRate = await this.rateModel.findOne({
      exchangeDate: { $gte: startOfDayUTC, $lte: endOfDayUTC }
    });

    if (!todayRate) {
      throw new BadRequestException("Today's exchange rate not found.");
    }

    const response: RateResponse = {
      id: todayRate._id.toString(),
      usdRate: todayRate.usdRate,
      eurRate: todayRate.eurRate,
      etbRate: todayRate.etbRate,
      gbpRate: todayRate.gbpRate,
      jpyRate: todayRate.jpyRate,
      cnyRate: todayRate.cnyRate,
      cadRate: todayRate.cadRate,
      audRate: todayRate.audRate,
      chfRate: todayRate.chfRate,
      inrRate: todayRate.inrRate,
      aedRate: todayRate.aedRate,
      exchangeDate: todayRate.exchangeDate,
    };

    return response;
  }

  async currencyConversion(rateConversionDto: RateConversionDto): Promise<ConversionRespose> {
    const todayRate = await this.getTodayExchangeRate();

    let convertedAmount: number;

    if (rateConversionDto.fromCurrency === rateConversionDto.toCurrency) {
      convertedAmount = rateConversionDto.amount;
    }

    // ETB to USD
    else if (rateConversionDto.fromCurrency === 'ETB' && rateConversionDto.toCurrency === 'USD') {
      convertedAmount = rateConversionDto.amount * todayRate.usdRate;
    }

    // ETB to EUR
    else if (rateConversionDto.fromCurrency === 'ETB' && rateConversionDto.toCurrency === 'EUR') {
      convertedAmount = rateConversionDto.amount * todayRate.eurRate;
    }

    // ETB to GBP
    else if (rateConversionDto.fromCurrency === 'ETB' && rateConversionDto.toCurrency === 'GBP') {
      convertedAmount = rateConversionDto.amount * todayRate.gbpRate;
    }

    // ETB to JPY
    else if (rateConversionDto.fromCurrency === 'ETB' && rateConversionDto.toCurrency === 'JPY') {
      convertedAmount = rateConversionDto.amount * todayRate.jpyRate;
    }

    // ETB to CNY
    else if (rateConversionDto.fromCurrency === 'ETB' && rateConversionDto.toCurrency === 'CNY') {
      convertedAmount = rateConversionDto.amount * todayRate.cnyRate;
    }

    // ETB to CAD
    else if (rateConversionDto.fromCurrency === 'ETB' && rateConversionDto.toCurrency === 'CAD') {
      convertedAmount = rateConversionDto.amount * todayRate.cadRate;
    }

    // ETB to AUD
    else if (rateConversionDto.fromCurrency === 'ETB' && rateConversionDto.toCurrency === 'AUD') {
      convertedAmount = rateConversionDto.amount * todayRate.audRate;
    }

    // ETB to CHF
    else if (rateConversionDto.fromCurrency === 'ETB' && rateConversionDto.toCurrency === 'CHF') {
      convertedAmount = rateConversionDto.amount * todayRate.chfRate;
    }

    // ETB to INR
    else if (rateConversionDto.fromCurrency === 'ETB' && rateConversionDto.toCurrency === 'INR') {
      convertedAmount = rateConversionDto.amount * todayRate.inrRate;
    }

    // ETB to AED
    else if (rateConversionDto.fromCurrency === 'ETB' && rateConversionDto.toCurrency === 'AED') {
      convertedAmount = rateConversionDto.amount * todayRate.aedRate;
    }

    // USD to ETB
    else if (rateConversionDto.fromCurrency === 'USD' && rateConversionDto.toCurrency === 'ETB') {
      convertedAmount = rateConversionDto.amount / todayRate.usdRate;
    }

    // USD to EUR
    else if (rateConversionDto.fromCurrency === 'USD' && rateConversionDto.toCurrency === 'EUR') {
      convertedAmount = (rateConversionDto.amount / todayRate.usdRate) * todayRate.eurRate;
    }

    // USD to GBP
    else if (rateConversionDto.fromCurrency === 'USD' && rateConversionDto.toCurrency === 'GBP') {
      convertedAmount = (rateConversionDto.amount / todayRate.usdRate) * todayRate.gbpRate;
    }

    // USD to JPY
    else if (rateConversionDto.fromCurrency === 'USD' && rateConversionDto.toCurrency === 'JPY') {
      convertedAmount = (rateConversionDto.amount / todayRate.usdRate) * todayRate.jpyRate;
    }

    // USD to CNY
    else if (rateConversionDto.fromCurrency === 'USD' && rateConversionDto.toCurrency === 'CNY') {
      convertedAmount = (rateConversionDto.amount / todayRate.usdRate) * todayRate.cnyRate;
    }

    // USD to CAD
    else if (rateConversionDto.fromCurrency === 'USD' && rateConversionDto.toCurrency === 'CAD') {
      convertedAmount = (rateConversionDto.amount / todayRate.usdRate) * todayRate.cadRate;
    }

    // USD to AUD
    else if (rateConversionDto.fromCurrency === 'USD' && rateConversionDto.toCurrency === 'AUD') {
      convertedAmount = (rateConversionDto.amount / todayRate.usdRate) * todayRate.audRate;
    }

    // USD to CHF
    else if (rateConversionDto.fromCurrency === 'USD' && rateConversionDto.toCurrency === 'CHF') {
      convertedAmount = (rateConversionDto.amount / todayRate.usdRate) * todayRate.chfRate;
    }

    // USD to INR
    else if (rateConversionDto.fromCurrency === 'USD' && rateConversionDto.toCurrency === 'INR') {
      convertedAmount = (rateConversionDto.amount / todayRate.usdRate) * todayRate.inrRate;
    }

    // USD to AED
    else if (rateConversionDto.fromCurrency === 'USD' && rateConversionDto.toCurrency === 'AED') {
      convertedAmount = (rateConversionDto.amount / todayRate.usdRate) * todayRate.aedRate;
    }

    // EUR to ETB
    else if (rateConversionDto.fromCurrency === 'EUR' && rateConversionDto.toCurrency === 'ETB') {
      convertedAmount = rateConversionDto.amount / todayRate.eurRate;
    }

    // EUR to USD
    else if (rateConversionDto.fromCurrency === 'EUR' && rateConversionDto.toCurrency === 'USD') {
      convertedAmount = (rateConversionDto.amount / todayRate.eurRate) * todayRate.usdRate;
    }

    // EUR to GBP
    else if (rateConversionDto.fromCurrency === 'EUR' && rateConversionDto.toCurrency === 'GBP') {
      convertedAmount = (rateConversionDto.amount / todayRate.eurRate) * todayRate.gbpRate;
    }

    // EUR to JPY
    else if (rateConversionDto.fromCurrency === 'EUR' && rateConversionDto.toCurrency === 'JPY') {
      convertedAmount = (rateConversionDto.amount / todayRate.eurRate) * todayRate.jpyRate;
    }

    // EUR to CNY
    else if (rateConversionDto.fromCurrency === 'EUR' && rateConversionDto.toCurrency === 'CNY') {
      convertedAmount = (rateConversionDto.amount / todayRate.eurRate) * todayRate.cnyRate;
    }

    // EUR to CAD
    else if (rateConversionDto.fromCurrency === 'EUR' && rateConversionDto.toCurrency === 'CAD') {
      convertedAmount = (rateConversionDto.amount / todayRate.eurRate) * todayRate.cadRate;
    }

    // EUR to AUD
    else if (rateConversionDto.fromCurrency === 'EUR' && rateConversionDto.toCurrency === 'AUD') {
      convertedAmount = (rateConversionDto.amount / todayRate.eurRate) * todayRate.audRate;
    }

    // EUR to CHF
    else if (rateConversionDto.fromCurrency === 'EUR' && rateConversionDto.toCurrency === 'CHF') {
      convertedAmount = (rateConversionDto.amount / todayRate.eurRate) * todayRate.chfRate;
    }

    // EUR to INR
    else if (rateConversionDto.fromCurrency === 'EUR' && rateConversionDto.toCurrency === 'INR') {
      convertedAmount = (rateConversionDto.amount / todayRate.eurRate) * todayRate.inrRate;
    }

    // EUR to AED
    else if (rateConversionDto.fromCurrency === 'EUR' && rateConversionDto.toCurrency === 'AED') {
      convertedAmount = (rateConversionDto.amount / todayRate.eurRate) * todayRate.aedRate;
    }

    // GBP to ETB
    else if (rateConversionDto.fromCurrency === 'GBP' && rateConversionDto.toCurrency === 'ETB') {
      convertedAmount = rateConversionDto.amount / todayRate.gbpRate;
    }

    // GBP to USD
    else if (rateConversionDto.fromCurrency === 'GBP' && rateConversionDto.toCurrency === 'USD') {
      convertedAmount = (rateConversionDto.amount / todayRate.gbpRate) * todayRate.usdRate;
    }

    // GBP to EUR
    else if (rateConversionDto.fromCurrency === 'GBP' && rateConversionDto.toCurrency === 'EUR') {
      convertedAmount = (rateConversionDto.amount / todayRate.gbpRate) * todayRate.eurRate;
    }

    // GBP to JPY
    else if (rateConversionDto.fromCurrency === 'GBP' && rateConversionDto.toCurrency === 'JPY') {
      convertedAmount = (rateConversionDto.amount / todayRate.gbpRate) * todayRate.jpyRate;
    }

    // GBP to CNY
    else if (rateConversionDto.fromCurrency === 'GBP' && rateConversionDto.toCurrency === 'CNY') {
      convertedAmount = (rateConversionDto.amount / todayRate.gbpRate) * todayRate.cnyRate;
    }

    // GBP to CAD
    else if (rateConversionDto.fromCurrency === 'GBP' && rateConversionDto.toCurrency === 'CAD') {
      convertedAmount = (rateConversionDto.amount / todayRate.gbpRate) * todayRate.cadRate;
    }

    // GBP to AUD
    else if (rateConversionDto.fromCurrency === 'GBP' && rateConversionDto.toCurrency === 'AUD') {
      convertedAmount = (rateConversionDto.amount / todayRate.gbpRate) * todayRate.audRate;
    }

    // GBP to CHF
    else if (rateConversionDto.fromCurrency === 'GBP' && rateConversionDto.toCurrency === 'CHF') {
      convertedAmount = (rateConversionDto.amount / todayRate.gbpRate) * todayRate.chfRate;
    }

    // GBP to INR
    else if (rateConversionDto.fromCurrency === 'GBP' && rateConversionDto.toCurrency === 'INR') {
      convertedAmount = (rateConversionDto.amount / todayRate.gbpRate) * todayRate.inrRate;
    }

    // GBP to AED
    else if (rateConversionDto.fromCurrency === 'GBP' && rateConversionDto.toCurrency === 'AED') {
      convertedAmount = (rateConversionDto.amount / todayRate.gbpRate) * todayRate.aedRate;
    }

    // JPY to ETB
    else if (rateConversionDto.fromCurrency === 'JPY' && rateConversionDto.toCurrency === 'ETB') {
      convertedAmount = rateConversionDto.amount / todayRate.jpyRate;
    }

    // JPY to USD
    else if (rateConversionDto.fromCurrency === 'JPY' && rateConversionDto.toCurrency === 'USD') {
      convertedAmount = (rateConversionDto.amount / todayRate.jpyRate) * todayRate.usdRate;
    }

    // JPY to EUR
    else if (rateConversionDto.fromCurrency === 'JPY' && rateConversionDto.toCurrency === 'EUR') {
      convertedAmount = (rateConversionDto.amount / todayRate.jpyRate) * todayRate.eurRate;
    }

    // JPY to GBP
    else if (rateConversionDto.fromCurrency === 'JPY' && rateConversionDto.toCurrency === 'GBP') {
      convertedAmount = (rateConversionDto.amount / todayRate.jpyRate) * todayRate.gbpRate;
    }

    // JPY to CNY
    else if (rateConversionDto.fromCurrency === 'JPY' && rateConversionDto.toCurrency === 'CNY') {
      convertedAmount = (rateConversionDto.amount / todayRate.jpyRate) * todayRate.cnyRate;
    }

    // JPY to CAD
    else if (rateConversionDto.fromCurrency === 'JPY' && rateConversionDto.toCurrency === 'CAD') {
      convertedAmount = (rateConversionDto.amount / todayRate.jpyRate) * todayRate.cadRate;
    }

    // JPY to AUD
    else if (rateConversionDto.fromCurrency === 'JPY' && rateConversionDto.toCurrency === 'AUD') {
      convertedAmount = (rateConversionDto.amount / todayRate.jpyRate) * todayRate.audRate;
    }

    // JPY to CHF
    else if (rateConversionDto.fromCurrency === 'JPY' && rateConversionDto.toCurrency === 'CHF') {
      convertedAmount = (rateConversionDto.amount / todayRate.jpyRate) * todayRate.chfRate;
    }

    // JPY to INR
    else if (rateConversionDto.fromCurrency === 'JPY' && rateConversionDto.toCurrency === 'INR') {
      convertedAmount = (rateConversionDto.amount / todayRate.jpyRate) * todayRate.inrRate;
    }

    // JPY to AED
    else if (rateConversionDto.fromCurrency === 'JPY' && rateConversionDto.toCurrency === 'AED') {
      convertedAmount = (rateConversionDto.amount / todayRate.jpyRate) * todayRate.aedRate;
    }

    // CNY to ETB
    else if (rateConversionDto.fromCurrency === 'CNY' && rateConversionDto.toCurrency === 'ETB') {
      convertedAmount = rateConversionDto.amount / todayRate.cnyRate;
    }

    // CNY to USD
    else if (rateConversionDto.fromCurrency === 'CNY' && rateConversionDto.toCurrency === 'USD') {
      convertedAmount = (rateConversionDto.amount / todayRate.cnyRate) * todayRate.usdRate;
    }

    // CNY to EUR
    else if (rateConversionDto.fromCurrency === 'CNY' && rateConversionDto.toCurrency === 'EUR') {
      convertedAmount = (rateConversionDto.amount / todayRate.cnyRate) * todayRate.eurRate;
    }

    // CNY to GBP
    else if (rateConversionDto.fromCurrency === 'CNY' && rateConversionDto.toCurrency === 'GBP') {
      convertedAmount = (rateConversionDto.amount / todayRate.cnyRate) * todayRate.gbpRate;
    }

    // CNY to JPY
    else if (rateConversionDto.fromCurrency === 'CNY' && rateConversionDto.toCurrency === 'JPY') {
      convertedAmount = (rateConversionDto.amount / todayRate.cnyRate) * todayRate.jpyRate;
    }

    // CNY to CAD
    else if (rateConversionDto.fromCurrency === 'CNY' && rateConversionDto.toCurrency === 'CAD') {
      convertedAmount = (rateConversionDto.amount / todayRate.cnyRate) * todayRate.cadRate;
    }

    // CNY to AUD
    else if (rateConversionDto.fromCurrency === 'CNY' && rateConversionDto.toCurrency === 'AUD') {
      convertedAmount = (rateConversionDto.amount / todayRate.cnyRate) * todayRate.audRate;
    }

    // CNY to CHF
    else if (rateConversionDto.fromCurrency === 'CNY' && rateConversionDto.toCurrency === 'CHF') {
      convertedAmount = (rateConversionDto.amount / todayRate.cnyRate) * todayRate.chfRate;
    }

    // CNY to INR
    else if (rateConversionDto.fromCurrency === 'CNY' && rateConversionDto.toCurrency === 'INR') {
      convertedAmount = (rateConversionDto.amount / todayRate.cnyRate) * todayRate.inrRate;
    }

    // CNY to AED
    else if (rateConversionDto.fromCurrency === 'CNY' && rateConversionDto.toCurrency === 'AED') {
      convertedAmount = (rateConversionDto.amount / todayRate.cnyRate) * todayRate.aedRate;
    }

    // CAD to ETB
    else if (rateConversionDto.fromCurrency === 'CAD' && rateConversionDto.toCurrency === 'ETB') {
      convertedAmount = rateConversionDto.amount / todayRate.cadRate;
    }

    // CAD to USD
    else if (rateConversionDto.fromCurrency === 'CAD' && rateConversionDto.toCurrency === 'USD') {
      convertedAmount = (rateConversionDto.amount / todayRate.cadRate) * todayRate.usdRate;
    }

    // CAD to EUR
    else if (rateConversionDto.fromCurrency === 'CAD' && rateConversionDto.toCurrency === 'EUR') {
      convertedAmount = (rateConversionDto.amount / todayRate.cadRate) * todayRate.eurRate;
    }

    // CAD to GBP
    else if (rateConversionDto.fromCurrency === 'CAD' && rateConversionDto.toCurrency === 'GBP') {
      convertedAmount = (rateConversionDto.amount / todayRate.cadRate) * todayRate.gbpRate;
    }

    // CAD to JPY
    else if (rateConversionDto.fromCurrency === 'CAD' && rateConversionDto.toCurrency === 'JPY') {
      convertedAmount = (rateConversionDto.amount / todayRate.cadRate) * todayRate.jpyRate;
    }

    // CAD to CNY
    else if (rateConversionDto.fromCurrency === 'CAD' && rateConversionDto.toCurrency === 'CNY') {
      convertedAmount = (rateConversionDto.amount / todayRate.cadRate) * todayRate.cnyRate;
    }

    // CAD to AUD
    else if (rateConversionDto.fromCurrency === 'CAD' && rateConversionDto.toCurrency === 'AUD') {
      convertedAmount = (rateConversionDto.amount / todayRate.cadRate) * todayRate.audRate;
    }

    // CAD to CHF
    else if (rateConversionDto.fromCurrency === 'CAD' && rateConversionDto.toCurrency === 'CHF') {
      convertedAmount = (rateConversionDto.amount / todayRate.cadRate) * todayRate.chfRate;
    }

    // CAD to INR
    else if (rateConversionDto.fromCurrency === 'CAD' && rateConversionDto.toCurrency === 'INR') {
      convertedAmount = (rateConversionDto.amount / todayRate.cadRate) * todayRate.inrRate;
    }

    // CAD to AED
    else if (rateConversionDto.fromCurrency === 'CAD' && rateConversionDto.toCurrency === 'AED') {
      convertedAmount = (rateConversionDto.amount / todayRate.cadRate) * todayRate.aedRate;
    }

    // AUD to ETB
    else if (rateConversionDto.fromCurrency === 'AUD' && rateConversionDto.toCurrency === 'ETB') {
      convertedAmount = rateConversionDto.amount / todayRate.audRate;
    }

    // AUD to USD
    else if (rateConversionDto.fromCurrency === 'AUD' && rateConversionDto.toCurrency === 'USD') {
      convertedAmount = (rateConversionDto.amount / todayRate.audRate) * todayRate.usdRate;
    }

    // AUD to EUR
    else if (rateConversionDto.fromCurrency === 'AUD' && rateConversionDto.toCurrency === 'EUR') {
      convertedAmount = (rateConversionDto.amount / todayRate.audRate) * todayRate.eurRate;
    }

    // AUD to GBP
    else if (rateConversionDto.fromCurrency === 'AUD' && rateConversionDto.toCurrency === 'GBP') {
      convertedAmount = (rateConversionDto.amount / todayRate.audRate) * todayRate.gbpRate;
    }

    // AUD to JPY
    else if (rateConversionDto.fromCurrency === 'AUD' && rateConversionDto.toCurrency === 'JPY') {
      convertedAmount = (rateConversionDto.amount / todayRate.audRate) * todayRate.jpyRate;
    }

    // AUD to CNY
    else if (rateConversionDto.fromCurrency === 'AUD' && rateConversionDto.toCurrency === 'CNY') {
      convertedAmount = (rateConversionDto.amount / todayRate.audRate) * todayRate.cnyRate;
    }

    // AUD to CAD
    else if (rateConversionDto.fromCurrency === 'AUD' && rateConversionDto.toCurrency === 'CAD') {
      convertedAmount = (rateConversionDto.amount / todayRate.audRate) * todayRate.cadRate;
    }

    // AUD to CHF
    else if (rateConversionDto.fromCurrency === 'AUD' && rateConversionDto.toCurrency === 'CHF') {
      convertedAmount = (rateConversionDto.amount / todayRate.audRate) * todayRate.chfRate;
    }

    // AUD to INR
    else if (rateConversionDto.fromCurrency === 'AUD' && rateConversionDto.toCurrency === 'INR') {
      convertedAmount = (rateConversionDto.amount / todayRate.audRate) * todayRate.inrRate;
    }

    // AUD to AED
    else if (rateConversionDto.fromCurrency === 'AUD' && rateConversionDto.toCurrency === 'AED') {
      convertedAmount = (rateConversionDto.amount / todayRate.audRate) * todayRate.aedRate;
    }

    // CHF to ETB
    else if (rateConversionDto.fromCurrency === 'CHF' && rateConversionDto.toCurrency === 'ETB') {
      convertedAmount = rateConversionDto.amount / todayRate.chfRate;
    }

    // CHF to USD
    else if (rateConversionDto.fromCurrency === 'CHF' && rateConversionDto.toCurrency === 'USD') {
      convertedAmount = (rateConversionDto.amount / todayRate.chfRate) * todayRate.usdRate;
    }

    // CHF to EUR
    else if (rateConversionDto.fromCurrency === 'CHF' && rateConversionDto.toCurrency === 'EUR') {
      convertedAmount = (rateConversionDto.amount / todayRate.chfRate) * todayRate.eurRate;
    }

    // CHF to GBP
    else if (rateConversionDto.fromCurrency === 'CHF' && rateConversionDto.toCurrency === 'GBP') {
      convertedAmount = (rateConversionDto.amount / todayRate.chfRate) * todayRate.gbpRate;
    }

    // CHF to JPY
    else if (rateConversionDto.fromCurrency === 'CHF' && rateConversionDto.toCurrency === 'JPY') {
      convertedAmount = (rateConversionDto.amount / todayRate.chfRate) * todayRate.jpyRate;
    }

    // CHF to CNY
    else if (rateConversionDto.fromCurrency === 'CHF' && rateConversionDto.toCurrency === 'CNY') {
      convertedAmount = (rateConversionDto.amount / todayRate.chfRate) * todayRate.cnyRate;
    }

    // CHF to CAD
    else if (rateConversionDto.fromCurrency === 'CHF' && rateConversionDto.toCurrency === 'CAD') {
      convertedAmount = (rateConversionDto.amount / todayRate.chfRate) * todayRate.cadRate;
    }

    // CHF to AUD
    else if (rateConversionDto.fromCurrency === 'CHF' && rateConversionDto.toCurrency === 'AUD') {
      convertedAmount = (rateConversionDto.amount / todayRate.chfRate) * todayRate.audRate;
    }

    // CHF to INR
    else if (rateConversionDto.fromCurrency === 'CHF' && rateConversionDto.toCurrency === 'INR') {
      convertedAmount = (rateConversionDto.amount / todayRate.chfRate) * todayRate.inrRate;
    }

    // CHF to AED
    else if (rateConversionDto.fromCurrency === 'CHF' && rateConversionDto.toCurrency === 'AED') {
      convertedAmount = (rateConversionDto.amount / todayRate.chfRate) * todayRate.aedRate;
    }

    // INR to ETB
    else if (rateConversionDto.fromCurrency === 'INR' && rateConversionDto.toCurrency === 'ETB') {
      convertedAmount = rateConversionDto.amount / todayRate.inrRate;
    }

    // INR to USD
    else if (rateConversionDto.fromCurrency === 'INR' && rateConversionDto.toCurrency === 'USD') {
      convertedAmount = (rateConversionDto.amount / todayRate.inrRate) * todayRate.usdRate;
    }

    // INR to EUR
    else if (rateConversionDto.fromCurrency === 'INR' && rateConversionDto.toCurrency === 'EUR') {
      convertedAmount = (rateConversionDto.amount / todayRate.inrRate) * todayRate.eurRate;
    }

    // INR to GBP
    else if (rateConversionDto.fromCurrency === 'INR' && rateConversionDto.toCurrency === 'GBP') {
      convertedAmount = (rateConversionDto.amount / todayRate.inrRate) * todayRate.gbpRate;
    }

    // INR to JPY
    else if (rateConversionDto.fromCurrency === 'INR' && rateConversionDto.toCurrency === 'JPY') {
      convertedAmount = (rateConversionDto.amount / todayRate.inrRate) * todayRate.jpyRate;
    }

    // INR to CNY
    else if (rateConversionDto.fromCurrency === 'INR' && rateConversionDto.toCurrency === 'CNY') {
      convertedAmount = (rateConversionDto.amount / todayRate.inrRate) * todayRate.cnyRate;
    }

    // INR to CAD
    else if (rateConversionDto.fromCurrency === 'INR' && rateConversionDto.toCurrency === 'CAD') {
      convertedAmount = (rateConversionDto.amount / todayRate.inrRate) * todayRate.cadRate;
    }

    // INR to AUD
    else if (rateConversionDto.fromCurrency === 'INR' && rateConversionDto.toCurrency === 'AUD') {
      convertedAmount = (rateConversionDto.amount / todayRate.inrRate) * todayRate.audRate;
    }

    // INR to CHF
    else if (rateConversionDto.fromCurrency === 'INR' && rateConversionDto.toCurrency === 'CHF') {
      convertedAmount = (rateConversionDto.amount / todayRate.inrRate) * todayRate.chfRate;
    }

    // INR to AED
    else if (rateConversionDto.fromCurrency === 'INR' && rateConversionDto.toCurrency === 'AED') {
      convertedAmount = (rateConversionDto.amount / todayRate.inrRate) * todayRate.aedRate;
    }

    // AED to ETB
    else if (rateConversionDto.fromCurrency === 'AED' && rateConversionDto.toCurrency === 'ETB') {
      convertedAmount = rateConversionDto.amount / todayRate.aedRate;
    }

    // AED to USD
    else if (rateConversionDto.fromCurrency === 'AED' && rateConversionDto.toCurrency === 'USD') {
      convertedAmount = (rateConversionDto.amount / todayRate.aedRate) * todayRate.usdRate;
    }

    // AED to EUR
    else if (rateConversionDto.fromCurrency === 'AED' && rateConversionDto.toCurrency === 'EUR') {
      convertedAmount = (rateConversionDto.amount / todayRate.aedRate) * todayRate.eurRate;
    }

    // AED to GBP
    else if (rateConversionDto.fromCurrency === 'AED' && rateConversionDto.toCurrency === 'GBP') {
      convertedAmount = (rateConversionDto.amount / todayRate.aedRate) * todayRate.gbpRate;
    }

    // AED to JPY
    else if (rateConversionDto.fromCurrency === 'AED' && rateConversionDto.toCurrency === 'JPY') {
      convertedAmount = (rateConversionDto.amount / todayRate.aedRate) * todayRate.jpyRate;
    }

    // AED to CNY
    else if (rateConversionDto.fromCurrency === 'AED' && rateConversionDto.toCurrency === 'CNY') {
      convertedAmount = (rateConversionDto.amount / todayRate.aedRate) * todayRate.cnyRate;
    }

    // AED to CAD
    else if (rateConversionDto.fromCurrency === 'AED' && rateConversionDto.toCurrency === 'CAD') {
      convertedAmount = (rateConversionDto.amount / todayRate.aedRate) * todayRate.cadRate;
    }

    // AED to AUD
    else if (rateConversionDto.fromCurrency === 'AED' && rateConversionDto.toCurrency === 'AUD') {
      convertedAmount = (rateConversionDto.amount / todayRate.aedRate) * todayRate.audRate;
    }

    // AED to CHF
    else if (rateConversionDto.fromCurrency === 'AED' && rateConversionDto.toCurrency === 'CHF') {
      convertedAmount = (rateConversionDto.amount / todayRate.aedRate) * todayRate.chfRate;
    }

    // AED to INR
    else if (rateConversionDto.fromCurrency === 'AED' && rateConversionDto.toCurrency === 'INR') {
      convertedAmount = (rateConversionDto.amount / todayRate.aedRate) * todayRate.inrRate;
    }

    else {
      throw new BadRequestException("Conversion path not supported yet.");
    }
    const response: ConversionRespose = {
      fromCurrency: rateConversionDto.fromCurrency,
      toCurrency: rateConversionDto.toCurrency,
      Amount: convertedAmount,
    };

    return response;
  }
}