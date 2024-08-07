import { Body, Controller, Get, HttpStatus, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { OrderProduct } from '@/core/domain/order/order-product.entity';
import { Order } from '@/core/domain/order/order.entity';
import { StatusEnum } from '@/core/domain/order/status.entity';
import { BadRequestException } from '@/core/exceptions/custom-exceptions/bad-request.exception';
import { InternalServerErrorException } from '@/core/exceptions/custom-exceptions/internal-server-error.exception';
import { NotFoundException } from '@/core/exceptions/custom-exceptions/not-found.exception';
import { CreateOrderUseCasesPort } from '@/core/interactor/port/order/create-order-use-cases.port';
import { FindAllOrdersUseCasesPort } from '@/core/interactor/port/order/find-all-orders-use-cases.port';
import { FindOrderByIdUseCasesPort } from '@/core/interactor/port/order/find-order-by-id-use-cases.port';
import { UpdateOrderUseCasesPort } from '@/core/interactor/port/order/update-order-use-cases.port';
import { API_RESPONSE } from '@/transport/constant/api-response.constant';
import { ORDER } from '@/transport/constant/order.constant';
import {
  CreateOrderDTO,
  toDomain as createToDomain,
} from '@/transport/dto/order/create-order.dto';
import { UpdateOrderDTO } from '@/transport/dto/order/update-order.dto';

const { CREATE, GET_ALL, GET_BY_ID, UPDATE } = ORDER.API_PROPERTY;
const {
  OK_DESC,
  CREATED_DESC,
  BAD_REQUEST_DESC,
  NOT_FOUND_DESC,
  INTERNAL_SERVER_EXCEPTION_DESC,
} = API_RESPONSE;

@Controller('orders')
@ApiTags('orders')
export class OrderController {
  constructor(
    private readonly createOrderUseCases: CreateOrderUseCasesPort,
    private readonly updateOrderUseCases: UpdateOrderUseCasesPort,
    private readonly findAllOrdersUseCases: FindAllOrdersUseCasesPort,
    private readonly findOrderByIdUseCases: FindOrderByIdUseCasesPort,
  ) {}

  @Post()
  @ApiOperation({ summary: CREATE.SUMMARY, description: CREATE.DESC })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: CREATED_DESC,
    type: () => Order,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: BAD_REQUEST_DESC,
    type: () => BadRequestException,
  })
  async create(@Body() createOrder: CreateOrderDTO) {
    return this.createOrderUseCases.execute(
      createToDomain(createOrder),
      createOrder.products,
    );
  }

  @Get()
  @ApiOperation({ summary: GET_ALL.SUMMARY, description: GET_ALL.DESC })
  @ApiResponse({
    status: HttpStatus.OK,
    description: OK_DESC,
    type: () => [OrderProduct],
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: NOT_FOUND_DESC,
    type: () => NotFoundException,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: INTERNAL_SERVER_EXCEPTION_DESC,
    type: () => InternalServerErrorException,
  })
  async findAll() {
    return this.findAllOrdersUseCases.execute();
  }

  @Get(':id')
  @ApiOperation({ summary: GET_BY_ID.SUMMARY, description: GET_BY_ID.DESC })
  @ApiResponse({ status: HttpStatus.OK, description: OK_DESC, type: () => OrderProduct })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: NOT_FOUND_DESC,
    type: () => NotFoundException,
  })
  async findById(@Param('id') id: string) {
    return this.findOrderByIdUseCases.execute(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: UPDATE.SUMMARY, description: UPDATE.DESC })
  @ApiResponse({ status: HttpStatus.OK, description: OK_DESC, type: () => Order })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: NOT_FOUND_DESC,
    type: () => NotFoundException,
  })
  async update(@Body() updateOrder: UpdateOrderDTO, @Param('id') id: string) {
    return this.updateOrderUseCases.execute({
      id,
      status: StatusEnum[updateOrder.status],
      paymentId: null,
      orderCode: null,
      clientId: null,
    });
  }
}
