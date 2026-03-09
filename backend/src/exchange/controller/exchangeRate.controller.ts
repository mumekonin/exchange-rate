import { Body, Controller, Get, Post } from "@nestjs/common";
import { ExchangeRatesService } from "../service/exchangeRate.service";
import { RateConversionDto } from "../dto/exchangeRate.dto";

@Controller('exchange-rate')
export class ExchangeRateController {
 constructor(
  private readonly exchangeRateService:ExchangeRatesService
 ){}

 @Get('today-rate')
 async getTodayRate(){
   const result= await this.exchangeRateService.getTodayExchangeRate();
   return result;
 }
 @Get('sync')
async syncNow() {
  return await this.exchangeRateService.sendRequestAndUpdateRates();
}
 @Post('convert-rate')
  async convertRate(@Body() rateConversionDto:RateConversionDto){
        const result = await this.exchangeRateService.currencyConversion(rateConversionDto);
        return result;
    } 
}