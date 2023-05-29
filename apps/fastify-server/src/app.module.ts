import {
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductsModule } from './app/products/products.module';
import { BuyersModule } from './app/buyers/buyers.module';
import { SellersModule } from './app/sellers/sellers.module';
import { OrdersModule } from './app/orders/orders.module';
import { AuthenticationModule } from './app/authentication/authentication.module';
import { CartModule } from './app/cart/cart.module';

const databaseHost = require('../constants').databaseHost;

@Module({
  imports: [
    BuyersModule,
    ProductsModule,
    SellersModule,
    OrdersModule,
    CartModule,
    AuthenticationModule,
    MongooseModule.forRoot(databaseHost),
    ConfigModule.forRoot({
      cache: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // se ne uporablja zdaj
    /*consumer
      .apply(FirebaseAuthMiddleware)
      .forRoutes('/orders'); // Apply the middleware to these routes
    consumer
      .apply(FirebaseAuthMiddleware)
      .exclude(
        { path: 'seller', method: RequestMethod.ALL }, // Exclude all routes that start with 'seller'
      )
      .forRoutes({ path: 'sellers', method: RequestMethod.POST }); // Apply the middleware only to the POST method of /buyers route*/
  }
}
