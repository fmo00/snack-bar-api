import { ClientModule } from '@/config/modules/client.module';
import { PaymentModule } from '@/config/modules/payment.module';
import { ProductModule } from '@/config/modules/product.module';
import { Module } from '@nestjs/common';
import { OrderModule } from './config/modules/order.module';

@Module({
  imports: [ProductModule, PaymentModule, ClientModule, OrderModule],
})
export class AppModule {}
