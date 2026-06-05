import { Body, Controller, Get, Inject, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../shared/auth/auth.guard';
import { OrdersClient } from '../shared/clients/orders.client';
import { RoutesClient } from '../shared/clients/routes.client';
import { CreateDriverDto, OrderStatus } from '../shared/contracts';
import { CreateCalculatedRouteUseCase } from './create-calculated-route.use-case';

@ApiTags('bff-proxy')
@UseGuards(AuthGuard)
@Controller('api/v1')
export class BffRoutesController {
  constructor(
    @Inject(OrdersClient)
    private readonly ordersClient: OrdersClient,
    @Inject(RoutesClient)
    private readonly routesClient: RoutesClient,
    @Inject(CreateCalculatedRouteUseCase)
    private readonly createCalculatedRouteUseCase: CreateCalculatedRouteUseCase
  ) {}

  @Post('orders')
  createOrder(@Body() body: unknown) {
    return this.ordersClient.createOrder(body);
  }

  @Get('orders')
  listOrders() {
    return this.ordersClient.listOrders();
  }

  @Post('drivers')
  createDriver(@Body() body: CreateDriverDto) {
    return this.ordersClient.createDriver(body);
  }

  @Post('system/reset')
  async resetSystem() {
    await Promise.all([
      this.ordersClient.resetOrders(),
      this.ordersClient.resetDrivers(),
      this.routesClient.resetRoutes()
    ]);

    return { reset: true };
  }

  @Patch('orders/:id/status')
  updateOrderStatus(@Param('id') id: string, @Body('status') status: OrderStatus) {
    return this.ordersClient.updateOrderStatus(id, status);
  }

  @Get('routes/available')
  listAvailableRoutes() {
    return this.routesClient.listAvailableRoutes();
  }

  @Post('routes/calculate')
  createCalculatedRoute() {
    return this.createCalculatedRouteUseCase.execute();
  }

  @Post('routes/:id/accept')
  async acceptRoute(@Param('id') id: string, @Body('driverId') driverId: string) {
    const route = await this.routesClient.acceptRoute(id, driverId);
    await Promise.allSettled(
      route.stops.map((stop) => this.ordersClient.updateOrderStatus(stop.orderId, 'IN_ROUTE'))
    );
    return route;
  }

  @Post('routes/:id/location')
  updateLocation(
    @Param('id') id: string,
    @Body('latitude') latitude: number,
    @Body('longitude') longitude: number
  ) {
    return this.routesClient.updateLocation(id, Number(latitude), Number(longitude));
  }

  @Post('routes/:id/occurrences')
  registerOccurrence(@Param('id') id: string, @Body() body: unknown) {
    return this.routesClient.registerOccurrence(id, body);
  }

  @Post('routes/:id/stops/:orderId/complete')
  async completeStop(@Param('id') id: string, @Param('orderId') orderId: string) {
    const route = await this.routesClient.completeStop(id, orderId);
    await this.ordersClient.updateOrderStatus(orderId, 'DELIVERED').catch(() => undefined);
    return route;
  }
}
