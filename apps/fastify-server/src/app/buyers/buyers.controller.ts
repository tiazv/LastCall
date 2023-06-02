import {
  Body,
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { BuyersService } from './buyers.service';
import { Buyer } from './buyers.model';
import { CreateUpdateBuyerDto } from './create-update-buyer.dto';
import { Order } from '../orders/order.model';
import { CartResponse, SuccessResponse } from 'src/data.response';
import { FirebaseTokenGuard } from '../guards/firebase-token-guard';

@Controller('buyers')
export class BuyersController {
  constructor(private readonly buyersService: BuyersService) { }

  @Post()
  async addBuyer(@Body() createBuyerDto: CreateUpdateBuyerDto): Promise<Buyer> {
    return await this.buyersService.addBuyer(createBuyerDto);
  }

  @Get()
  async getAllBuyers(): Promise<Buyer[]> {
    return await this.buyersService.getAllBuyers();
  }

  @Get(':id')
  async getSingleBuyer(@Param('id') id: string): Promise<Buyer> {
    return await this.buyersService.getSingleBuyer(id);
  }

  @Get('/get/:email')
  async getSingleBuyerByEmail(@Param('email') email: string): Promise<Buyer> {
    return await this.buyersService.getSingleBuyerByEmail(email);
  }

  @Patch(':id')
  async updateBuyer(
    @Param('id') buyerId: string,
    @Body() updatedBuyerData: Partial<Buyer>,
  ): Promise<Buyer> {
    return await this.buyersService.updateBuyer(buyerId, updatedBuyerData);
  }

  @Patch('/patch/:email')
  async updateBuyerByEmail(
    @Param('email') email: string,
    @Body() updatedBuyerData: Partial<Buyer>,
  ): Promise<Buyer> {
    return await this.buyersService.updateBuyerByEmail(email, updatedBuyerData);
  }

  @Delete(':id')
  async removeBuyer(@Param('id') id: string): Promise<SuccessResponse> {
    await this.buyersService.removeBuyer(id);
    return { success: true };
  }

  @Delete('/delete/:email')
  async removeBuyerByEmail(
    @Param('email') email: string,
  ): Promise<SuccessResponse> {
    await this.buyersService.removeBuyerByEmail(email);
    return { success: true };
  }

  @Post('orders')
  @UseGuards(FirebaseTokenGuard)
  async getAllOrdersByBuyer(@Body('email') email: string): Promise<Order[]> {
    return await this.buyersService.getOrdersByBuyer(email);
  }
}
