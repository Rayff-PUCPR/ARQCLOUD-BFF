import { Module } from '@nestjs/common';
import { AggregatedDataController } from './aggregated-data/aggregated-data.controller';
import { AggregatedDataUseCase } from './aggregated-data/aggregated-data.use-case';
import { ResponseComposer } from './aggregated-data/response-composer';
import { BffRoutesController } from './proxy/bff-routes.controller';
import { OrdersClient } from './shared/clients/orders.client';
import { RoutesClient } from './shared/clients/routes.client';
import { CalculationFunctionClient } from './shared/clients/calculation-function.client';
import { CreateCalculatedRouteUseCase } from './proxy/create-calculated-route.use-case';

@Module({
  controllers: [AggregatedDataController, BffRoutesController],
  providers: [
    AggregatedDataUseCase,
    CreateCalculatedRouteUseCase,
    ResponseComposer,
    OrdersClient,
    RoutesClient,
    CalculationFunctionClient
  ]
})
export class AppModule {}
