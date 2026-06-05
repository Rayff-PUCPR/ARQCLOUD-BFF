import { Injectable } from '@nestjs/common';
import { CalculationResult, DriverDto, OrderDto, RouteDto } from '../shared/contracts';

@Injectable()
export class ResponseComposer {
  compose(input: {
    orders: OrderDto[];
    routes: RouteDto[];
    drivers: DriverDto[];
    calculation?: CalculationResult;
    warnings: string[];
  }) {
    const activeRoutes = input.routes.filter((route) => route.status === 'IN_PROGRESS');
    const pendingOrders = input.orders.filter((order) => order.status === 'PENDING');

    return {
      generatedAt: new Date().toISOString(),
      summary: {
        totalOrders: input.orders.length,
        pendingOrders: pendingOrders.length,
        activeRoutes: activeRoutes.length,
        availableDrivers: input.drivers.filter((driver) => driver.status === 'AVAILABLE').length,
        averageRouteScore: average(input.routes.map((route) => route.score))
      },
      orders: input.orders.map((order) => ({
        id: order.id,
        customerName: order.customer.name,
        status: order.status,
        priority: order.priority,
        district: order.deliveryAddress.district,
        routeId: order.routeId
      })),
      routes: input.routes.map((route) => ({
        id: route.id,
        region: route.region,
        origin: route.origin,
        destination: route.destination,
        status: route.status,
        driverId: route.driverId,
        stops: route.stops.length,
        completedStops: route.stops.filter((stop) => stop.status === 'COMPLETED').length,
        estimatedDistanceKm: route.estimatedDistanceKm,
        estimatedDurationMinutes: route.estimatedDurationMinutes,
        score: route.score,
        mapStops: route.stops
          .filter((stop) => typeof stop.latitude === 'number' && typeof stop.longitude === 'number')
          .sort((a, b) => a.sequence - b.sequence)
          .map((stop) => ({
            orderId: stop.orderId,
            customerName: stop.customerName,
            address: stop.address,
            sequence: stop.sequence,
            status: stop.status,
            latitude: stop.latitude,
            longitude: stop.longitude
          }))
      })),
      drivers: input.drivers,
      latestCalculation: input.calculation,
      warnings: input.warnings
    };
  }
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}
