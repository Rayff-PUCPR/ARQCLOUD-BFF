import { Injectable } from '@nestjs/common';
import { HttpClient } from '../http/http-client';
import { RouteDto } from '../contracts';

@Injectable()
export class RoutesClient extends HttpClient {
  private readonly baseUrl = process.env.ROUTES_SERVICE_URL ?? 'http://localhost:3002';

  listRoutes() {
    return this.request<RouteDto[]>(`${this.baseUrl}/api/v1/routes`);
  }

  listAvailableRoutes() {
    return this.request<RouteDto[]>(`${this.baseUrl}/api/v1/routes/available`);
  }

  createRoute(body: unknown) {
    return this.request<RouteDto>(`${this.baseUrl}/api/v1/routes`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  acceptRoute(routeId: string, driverId: string) {
    return this.request<RouteDto>(`${this.baseUrl}/api/v1/routes/${routeId}/accept`, {
      method: 'POST',
      body: JSON.stringify({ driverId })
    });
  }

  updateLocation(routeId: string, latitude: number, longitude: number) {
    return this.request<RouteDto>(`${this.baseUrl}/api/v1/routes/${routeId}/location`, {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude })
    });
  }

  registerOccurrence(routeId: string, body: unknown) {
    return this.request<RouteDto>(`${this.baseUrl}/api/v1/routes/${routeId}/occurrences`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  completeStop(routeId: string, orderId: string) {
    return this.request<RouteDto>(`${this.baseUrl}/api/v1/routes/${routeId}/stops/${orderId}/complete`, {
      method: 'POST'
    });
  }

  finishRoute(routeId: string) {
    return this.request<RouteDto>(`${this.baseUrl}/api/v1/routes/${routeId}/finish`, {
      method: 'POST'
    });
  }

  resetRoutes() {
    return this.request<{ reset: boolean }>(`${this.baseUrl}/api/v1/routes/reset`, {
      method: 'POST'
    });
  }
}
