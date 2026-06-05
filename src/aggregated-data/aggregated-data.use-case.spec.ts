import { describe, expect, it, vi } from 'vitest';
import { CalculationFunctionClient } from '../shared/clients/calculation-function.client';
import { OrdersClient } from '../shared/clients/orders.client';
import { RoutesClient } from '../shared/clients/routes.client';
import { DriverDto, OrderDto, RouteDto } from '../shared/contracts';
import { AggregatedDataUseCase } from './aggregated-data.use-case';
import { ResponseComposer } from './response-composer';

describe('AggregatedDataUseCase', () => {
  it('aggregates orders, routes, drivers and auxiliary calculation', async () => {
    const calculationClient = {
      calculate: vi.fn().mockResolvedValue({
        estimatedDistanceKm: 2,
        estimatedDurationMinutes: 10,
        score: 97,
        orderedStops: [],
        calculationSource: 'test'
      })
    } as unknown as CalculationFunctionClient;

    const useCase = new AggregatedDataUseCase(
      {
        listOrders: vi.fn().mockResolvedValue([makeOrder()]),
        listDrivers: vi.fn().mockResolvedValue([makeDriver()])
      } as unknown as OrdersClient,
      {
        listRoutes: vi.fn().mockResolvedValue([makeRoute()])
      } as unknown as RoutesClient,
      calculationClient,
      new ResponseComposer()
    );

    const result = await useCase.execute();

    expect(result.summary.totalOrders).toBe(1);
    expect(result.summary.availableDrivers).toBe(1);
    expect(result.routes[0].mapStops).toHaveLength(1);
    expect(result.latestCalculation?.score).toBe(97);
    expect(calculationClient.calculate).toHaveBeenCalledWith({
      origin: { latitude: -25.4515, longitude: -49.2525 },
      stops: [{ latitude: -25.4515, longitude: -49.2525, priority: 'MEDIUM' }]
    });
  });

  it('keeps the aggregate available when one dependency fails', async () => {
    const useCase = new AggregatedDataUseCase(
      {
        listOrders: vi.fn().mockRejectedValue(new Error('orders unavailable')),
        listDrivers: vi.fn().mockResolvedValue([makeDriver()])
      } as unknown as OrdersClient,
      {
        listRoutes: vi.fn().mockResolvedValue([])
      } as unknown as RoutesClient,
      {
        calculate: vi.fn()
      } as unknown as CalculationFunctionClient,
      new ResponseComposer()
    );

    const result = await useCase.execute();

    expect(result.orders).toHaveLength(0);
    expect(result.drivers).toHaveLength(1);
    expect(result.warnings).toContain('Pedidos indisponiveis no momento.');
  });
});

function makeOrder(): OrderDto {
  return {
    id: 'order-1',
    customer: {
      name: 'Cliente Teste',
      phone: '41999999999',
      trackingToken: 'token'
    },
    deliveryAddress: {
      street: 'Rua Teste',
      number: '123',
      district: 'Centro',
      city: 'Curitiba',
      state: 'PR',
      zipCode: '80000-000',
      latitude: -25.4515,
      longitude: -49.2525
    },
    priority: 'HIGH',
    status: 'PENDING',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z'
  };
}

function makeDriver(): DriverDto {
  return {
    id: 'driver-1',
    name: 'Ana Martins',
    vehicle: 'Moto',
    status: 'AVAILABLE',
    region: 'Centro'
  };
}

function makeRoute(): RouteDto {
  return {
    id: 'route-1',
    region: 'Centro',
    origin: 'Base',
    destination: 'Centro',
    status: 'AVAILABLE',
    estimatedDistanceKm: 8.4,
    estimatedDurationMinutes: 31,
    score: 91,
    locationHistory: [],
    occurrences: [],
    stops: [
      {
        orderId: 'order-1',
        customerName: 'Cliente Teste',
        address: 'Rua Teste, 123 - Centro',
        sequence: 1,
        status: 'PENDING',
        latitude: -25.4515,
        longitude: -49.2525
      }
    ]
  };
}
