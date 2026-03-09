import { Module } from "@nestjs/common";
import { ExchangeRatesService } from "./service/exchangeRate.service";
import { MongooseModule } from "@nestjs/mongoose";
import { ExchangeRate, exchangeRateSchema } from "./schema/exchangeRate.schema";
import { HttpModule } from "@nestjs/axios";
import { ExchangeRateController } from "./controller/exchangeRate.controller";

@Module({
   imports: [
        MongooseModule.forFeature([
            {name: ExchangeRate.name, schema: exchangeRateSchema}
        ]),
        HttpModule
    ],
  controllers: [ExchangeRateController],
  providers: [ExchangeRatesService],
})
export class ExchangeRateModule {}