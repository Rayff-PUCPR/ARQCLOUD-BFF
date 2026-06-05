import { Injectable } from '@nestjs/common';
import { HttpClient } from '../http/http-client';
import { CalculationResult } from '../contracts';

@Injectable()
export class CalculationFunctionClient extends HttpClient {
  private readonly url = process.env.CALCULATION_FUNCTION_URL ?? 'http://localhost:7071/api/calculate-route';

  calculate(body: unknown) {
    return this.request<CalculationResult>(this.url, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }
}
