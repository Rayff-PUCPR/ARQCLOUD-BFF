import { Controller, Get, Inject, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../shared/auth/auth.guard';
import { AggregatedDataUseCase } from './aggregated-data.use-case';

@ApiTags('aggregated-data')
@UseGuards(AuthGuard)
@Controller('aggregated-data')
export class AggregatedDataController {
  constructor(
    @Inject(AggregatedDataUseCase)
    private readonly aggregatedDataUseCase: AggregatedDataUseCase
  ) {}

  @Get()
  getAggregatedData() {
    return this.aggregatedDataUseCase.execute();
  }
}
