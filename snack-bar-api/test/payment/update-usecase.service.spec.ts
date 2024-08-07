import { Payment } from '@/core/domain/payment/payment.entity';
import { StatusEnum } from '@/core/domain/payment/status.entity';
import { FindOrderByPaymentUseCasesPort } from '@/core/interactor/port/order/find-order-by-payment-use-cases.port';
import { UpdateOrderUseCasesPort } from '@/core/interactor/port/order/update-order-use-cases.port';
import { UpdatePaymentUseCase } from '@/core/interactor/usecases/payment/update-payment.use-cases';
import { IPaymentRepository } from '@/core/repository/payment/payment.repository';
import { MercadoPagoServicePort } from '@/datasource/mercado-pago/port/mercado-pago-service.port';

describe('UpdatePaymentUseCase', () => {
  let service: UpdatePaymentUseCase;
  let paymentRepository: IPaymentRepository;
  let mercadoPagoAdapterService: MercadoPagoServicePort;
  let updateOrderUseCase: UpdateOrderUseCasesPort;
  let findOrderByPaymentUseCases: FindOrderByPaymentUseCasesPort;

  beforeEach(async () => {
    paymentRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      updateById: jest.fn(),
    };

    mercadoPagoAdapterService = {
      createPayment: jest.fn(),
      getPaymentById: jest.fn(),
    };

    updateOrderUseCase = {
      execute: jest.fn(),
    };

    findOrderByPaymentUseCases = {
      execute: jest.fn(),
    };

    service = new UpdatePaymentUseCase(
      paymentRepository,
      mercadoPagoAdapterService,
      findOrderByPaymentUseCases,
      updateOrderUseCase,
    );
  });

  it('should fetch payment data from mercado pago API and update database register', async () => {
    const payment: Payment = {
      id: '122',
      value: 100,
      method: 'PIX',
      externalId: '123',
      status: StatusEnum.APPROVED,
      createdAt: new Date(),
    };

    const adapterSpy = jest
      .spyOn(mercadoPagoAdapterService, 'getPaymentById')
      .mockResolvedValue(payment);
    const repositorySpy = jest.spyOn(paymentRepository, 'updateById');

    const result = await service.execute('122');

    expect(result).toMatchObject({
      message: 'Payment register was updated successfully',
    });
    expect(repositorySpy).toHaveBeenCalled();
    expect(adapterSpy).toHaveBeenCalledWith('122');
  });

  it('should handle errors when mercado pago API is not responsive', async () => {
    jest
      .spyOn(mercadoPagoAdapterService, 'getPaymentById')
      .mockRejectedValueOnce(new Error('Third party API is out of service'));

    try {
      return await service.execute('122');
    } catch (error) {
      expect(error).toEqual(new Error('Third party API is out of service'));
    }
  });
});
