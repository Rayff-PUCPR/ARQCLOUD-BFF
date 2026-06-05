import { describe, expect, it } from 'vitest';
import { ResponseComposer } from './response-composer';

describe('ResponseComposer', () => {
  it('builds operation summary and exposes map stops', () => {
    const composer = new ResponseComposer();
    const result = composer.compose({
      orders: [
        {
          id: 'order-1',
          customer: { name: 'Cliente', phone: '1', trackingToken: 't' },
          deliveryAddress: { street: 'Rua', number: '1', district: 'Centro', city: 'Curitiba', state: 'PR', zipCode: '1' },
          priority: 'MEDIUM',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      routes: [
        {
          id: 'route-1',
          region: 'Centro',
          origin: 'Base',
          destination: 'Centro',
          status: 'AVAILABLE',
          estimatedDistanceKm: 1,
          estimatedDurationMinutes: 10,
          score: 90,
          locationHistory: [],
          occurrences: [],
          stops: [
            {
              orderId: 'order-1',
              customerName: 'Cliente',
              address: 'Rua',
              sequence: 1,
              status: 'PENDING',
              latitude: -25,
              longitude: -49
            }
          ]
        }
      ],
      drivers: [],
      warnings: []
    });

    expect(result.summary.totalOrders).toBe(1);
    expect(result.routes[0].mapStops).toHaveLength(1);
  });
});
