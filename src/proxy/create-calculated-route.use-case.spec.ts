import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { CalculationFunctionClient } from '../shared/clients/calculation-function.client';
import { OrdersClient } from '../shared/clients/orders.client';
import { RoutesClient } from '../shared/clients/routes.client';
import { OrderDto, RouteDto } from '../shared/contracts';
import { CreateCalculatedRouteUseCase } from './create-calculated-route.use-case';

describe('CreateCalculatedRouteUseCase', () => {
  it('calculates a route from pending orders and assigns each order to the created route', async () => {
    const pendingOrders = [makeOrder('order-1', -25.4515, -49.2525), makeOrder('order-2', -25.4386, -49.2707)];
    const route = makeRoute();
    const ordersClient = {
      listPendingOrders: vi.fn().mockResolvedValue(pendingOrders),
      assignOrderRoute: vi.fn().mockResolvedValue(undefined)
    } as unknown as OrdersClient;
    const routesClient = {
      createRoute: vi.fn().mockResolvedValue(route)
    } as unknown as RoutesClient;
    const calculationClient = {
      calculate: vi.fn().mockResolvedValue({
        estimatedDistanceKm: 8.4,
        estimatedDurationMinutes: 31,
        score: 91,
        orderedStops: [
          { orderId: 'order-2', latitude: -25.4386, longitude: -49.2707, priority: 'MEDIUM', sequence: 1 },
          { orderId: 'order-1', latitude: -25.4515, longitude: -49.2525, priority: 'HIGH', sequence: 2 }
        ],
        calculationSource: 'test'
      })
    } as unknown as CalculationFunctionClient;

    const result = await new CreateCalculatedRouteUseCase(
      ordersClient,
      routesClient,
      calculationClient
    ).execute();

    expect(result.id).toBe('route-1');
    expect(calculationClient.calculate).toHaveBeenCalledWith({
      origin: { latitude: -25.4515, longitude: -49.2525 },
      stops: [
        { orderId: 'order-1', latitude: -25.4515, longitude: -49.2525, priority: 'HIGH' },
        { orderId: 'order-2', latitude: -25.4386, longitude: -49.2707, priority: 'MEDIUM' }
      ]
    });
    expect(routesClient.createRoute).toHaveBeenCalledWith(
      expect.objectContaining({
        estimatedDistanceKm: 8.4,
        estimatedDurationMinutes: 31,
        score: 91,
        stops: expect.arrayContaining([
          expect.objectContaining({ orderId: 'order-2', sequence: 1 }),
          expect.objectContaining({ orderId: 'order-1', sequence: 2 })
        ])
      })
    );
    expect(ordersClient.assignOrderRoute).toHaveBeenCalledTimes(2);
  });

  it('rejects route calculation when there are no pending orders', async () => {
    const useCase = new CreateCalculatedRouteUseCase(
      {
        listPendingOrders: vi.fn().mockResolvedValue([])
      } as unknown as OrdersClient,
      {} as RoutesClient,
      {} as CalculationFunctionClient
    );

    await expect(useCase.execute()).rejects.toBeInstanceOf(BadRequestException);
  });
});

function makeOrder(id: string, latitude: number, longitude: number): OrderDto {
  return {
    id,
    customer: {
      name: `Cliente ${id}`,
      phone: '41999999999',
      trackingToken: `token-${id}`
    },
    deliveryAddress: {
      street: 'Rua Teste',
      number: '123',
      district: 'Centro',
      city: 'Curitiba',
      state: 'PR',
      zipCode: '80000-000',
      latitude,
      longitude
    },
    priority: id === 'order-1' ? 'HIGH' : 'MEDIUM',
    status: 'PENDING',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  };
}

function makeRoute(): RouteDto {
  return {
    id: 'route-1',
    region: 'Centro',
    origin: 'Origem operacional RotaCerta',
    destination: 'Centro',
    status: 'AVAILABLE',
    estimatedDistanceKm: 8.4,
    estimatedDurationMinutes: 31,
    score: 91,
    locationHistory: [],
    occurrences: [],
    stops: [
      {
        orderId: 'order-2',
        customerName: 'Cliente order-2',
        address: 'Rua Teste, 123 - Centro',
        sequence: 1,
        status: 'PENDING',
        latitude: -25.4386,
        longitude: -49.2707
      },
      {
        orderId: 'order-1',
        customerName: 'Cliente order-1',
        address: 'Rua Teste, 123 - Centro',
        sequence: 2,
        status: 'PENDING',
        latitude: -25.4515,
        longitude: -49.2525
      }
    ]
  };
}
