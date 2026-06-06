import { Injectable } from '@nestjs/common';
import { HttpClient } from '../http/http-client';
import { CreateDriverDto, DriverDto, DriverStatus, OrderDto, OrderStatus } from '../contracts';

@Injectable()
export class OrdersClient extends HttpClient {
  private readonly baseUrl = process.env.ORDERS_SERVICE_URL ?? 'http://localhost:3001';

  listOrders() {
    return this.request<OrderDto[]>(`${this.baseUrl}/api/v1/orders`);
  }

  listPendingOrders() {
    return this.request<OrderDto[]>(`${this.baseUrl}/api/v1/orders/pending`);
  }

  createOrder(body: unknown) {
    return this.request<OrderDto>(`${this.baseUrl}/api/v1/orders`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  updateOrderStatus(orderId: string, status: OrderStatus) {
    return this.request<OrderDto>(`${this.baseUrl}/api/v1/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  assignOrderRoute(orderId: string, routeId: string, driverId?: string) {
    return this.request<OrderDto>(`${this.baseUrl}/api/v1/orders/${orderId}/route`, {
      method: 'PATCH',
      body: JSON.stringify({ routeId, driverId })
    });
  }

  listDrivers() {
    return this.request<DriverDto[]>(`${this.baseUrl}/api/v1/drivers`);
  }

  createDriver(body: CreateDriverDto) {
    return this.request<DriverDto>(`${this.baseUrl}/api/v1/drivers`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  updateDriverStatus(driverId: string, status: DriverStatus) {
    return this.request<DriverDto>(`${this.baseUrl}/api/v1/drivers/${driverId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  }

  resetOrders() {
    return this.request<{ reset: boolean }>(`${this.baseUrl}/api/v1/orders/reset`, {
      method: 'POST'
    });
  }

  resetDrivers() {
    return this.request<{ reset: boolean }>(`${this.baseUrl}/api/v1/drivers/reset`, {
      method: 'POST'
    });
  }
}
