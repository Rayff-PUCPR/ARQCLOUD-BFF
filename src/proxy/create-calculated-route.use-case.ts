import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CalculationFunctionClient } from '../shared/clients/calculation-function.client';
import { OrdersClient } from '../shared/clients/orders.client';
import { RoutesClient } from '../shared/clients/routes.client';

@Injectable()
export class CreateCalculatedRouteUseCase {
  constructor(
    @Inject(OrdersClient)
    private readonly ordersClient: OrdersClient,
    @Inject(RoutesClient)
    private readonly routesClient: RoutesClient,
    @Inject(CalculationFunctionClient)
    private readonly calculationFunctionClient: CalculationFunctionClient
  ) {}

  async execute() {
    const pendingOrders = await this.ordersClient.listPendingOrders();

    if (pendingOrders.length === 0) {
      throw new BadRequestException('There are no pending orders to calculate a route');
    }

    const stopsWithCoordinates = pendingOrders.filter(
      (order) =>
        typeof order.deliveryAddress.latitude === 'number' &&
        typeof order.deliveryAddress.longitude === 'number'
    );

    if (stopsWithCoordinates.length === 0) {
      throw new BadRequestException('Pending orders do not have coordinates');
    }

    const calculation = await this.calculationFunctionClient.calculate({
      origin: {
        latitude: stopsWithCoordinates[0].deliveryAddress.latitude,
        longitude: stopsWithCoordinates[0].deliveryAddress.longitude
      },
      stops: stopsWithCoordinates.map((order) => ({
        orderId: order.id,
        latitude: order.deliveryAddress.latitude,
        longitude: order.deliveryAddress.longitude,
        priority: order.priority
      }))
    });

    const route = await this.routesClient.createRoute({
      region: stopsWithCoordinates[0].deliveryAddress.district,
      origin: 'Origem operacional RotaCerta',
      destination: stopsWithCoordinates.at(-1)?.deliveryAddress.district ?? 'Destino operacional',
      estimatedDistanceKm: calculation.estimatedDistanceKm,
      estimatedDurationMinutes: calculation.estimatedDurationMinutes,
      score: calculation.score,
      stops: stopsWithCoordinates.map((order, index) => ({
        orderId: order.id,
        customerName: order.customer.name,
        address: `${order.deliveryAddress.street}, ${order.deliveryAddress.number} - ${order.deliveryAddress.district}`,
        sequence:
          calculation.orderedStops.find((stop) => stop.orderId === order.id)?.sequence ?? index + 1,
        status: 'PENDING',
        latitude: order.deliveryAddress.latitude,
        longitude: order.deliveryAddress.longitude
      }))
    });

    await Promise.allSettled(
      route.stops.map((stop) => this.ordersClient.assignOrderRoute(stop.orderId, route.id))
    );

    return route;
  }
}
