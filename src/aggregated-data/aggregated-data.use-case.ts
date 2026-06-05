import { Inject, Injectable } from '@nestjs/common';
import { CalculationFunctionClient } from '../shared/clients/calculation-function.client';
import { OrdersClient } from '../shared/clients/orders.client';
import { RoutesClient } from '../shared/clients/routes.client';
import { ResponseComposer } from './response-composer';

@Injectable()
export class AggregatedDataUseCase {
  constructor(
    @Inject(OrdersClient)
    private readonly ordersClient: OrdersClient,
    @Inject(RoutesClient)
    private readonly routesClient: RoutesClient,
    @Inject(CalculationFunctionClient)
    private readonly calculationFunctionClient: CalculationFunctionClient,
    @Inject(ResponseComposer)
    private readonly responseComposer: ResponseComposer
  ) {}

  async execute() {
    const warnings: string[] = [];

    const [ordersResult, routesResult, driversResult] = await Promise.allSettled([
      this.ordersClient.listOrders(),
      this.routesClient.listRoutes(),
      this.ordersClient.listDrivers()
    ]);

    const orders = ordersResult.status === 'fulfilled' ? ordersResult.value : [];
    const routes = routesResult.status === 'fulfilled' ? routesResult.value : [];
    const drivers = driversResult.status === 'fulfilled' ? driversResult.value : [];

    if (ordersResult.status === 'rejected') warnings.push('Pedidos indisponiveis no momento.');
    if (routesResult.status === 'rejected') warnings.push('Rotas indisponiveis no momento.');
    if (driversResult.status === 'rejected') warnings.push('Motoristas indisponiveis no momento.');

    const firstRoute = routes[0];
    const calculationPayload = firstRoute
      ? {
          origin: {
            latitude: firstRoute.stops[0]?.latitude ?? -25.4515,
            longitude: firstRoute.stops[0]?.longitude ?? -49.2525
          },
          stops: firstRoute.stops
            .filter((stop) => typeof stop.latitude === 'number' && typeof stop.longitude === 'number')
            .map((stop) => ({
              latitude: stop.latitude,
              longitude: stop.longitude,
              priority: 'MEDIUM'
            }))
        }
      : undefined;

    const calculation = calculationPayload
      ? await this.calculationFunctionClient.calculate(calculationPayload).catch(() => {
          warnings.push('Calculo auxiliar indisponivel; dados principais foram mantidos.');
          return undefined;
        })
      : undefined;

    return this.responseComposer.compose({
      orders,
      routes,
      drivers,
      calculation,
      warnings
    });
  }
}
