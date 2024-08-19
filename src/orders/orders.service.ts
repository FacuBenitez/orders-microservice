import { Injectable, Logger, OnModuleInit,  HttpStatus, Inject } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { ChangeOrderStatusDto, CreateOrderDto } from './dto';
import { OrderPaginationDto } from './dto';
import { NATS_SERVICE} from 'src/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OrdersService extends PrismaClient implements OnModuleInit {
  
  private readonly logger = new Logger('OrdersService');

  constructor(
    @Inject(NATS_SERVICE) private readonly client: ClientProxy,
  ) {
    super();
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to database');
  }

  async create( createOrderDto: CreateOrderDto) {
    
    try {
      const productIds = createOrderDto.items.map(item => item.productId);

      const products:any[] = await firstValueFrom(
        this.client.send({ cmd: 'validate_products' }, productIds),
      ) 


      //calculo de los valores de los productos

      const totalAmount = createOrderDto.items.reduce((acc, item) => {
        const product = products.find(p => p.id === item.productId);
        return acc + (product.price * item.quantity);
      }, 0);


      const totalItems = createOrderDto.items.reduce((acc, item) => {
        return acc + item.quantity;
      }, 0);

      const order = await this.order.create({
        data: {
          totalAmount: totalAmount,
          totalItems: totalItems,
          OrderItem: {
            createMany: {
              data: createOrderDto.items.map((orderItem) => ({
                price: products.find(
                  (product) => product.id === orderItem.productId,
                ).price,
                productId: orderItem.productId,
                quantity: orderItem.quantity,
              })),
            },
          },
        },
        include: {
          OrderItem: {
            select: {
              price: true,
              quantity: true,
              productId: true,
            },
          },
        },
      });


      return {
        ...order,
        OrderItem: order.OrderItem.map((orderItem) => ({
          ...orderItem,
          name: products.find((product) => product.id === orderItem.productId)
            .name,
        })),
      };


    } catch (error) {
      this.logger.error('Error al obtener los IDs de productos', error);
      throw new RpcException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Error al procesar la orden'
      });
    }







  }

  async findAll(orderPaginationDto: OrderPaginationDto) {

    const totalPages = await this.order.count({
      where: {
        status: orderPaginationDto.status
      }
    });


    const currentPage = orderPaginationDto.page;
    const perPage = orderPaginationDto.limit;


    return {
      data: await this.order.findMany({
        skip: ( currentPage - 1 ) * perPage,
        take: perPage,
        where: {
          status: orderPaginationDto.status
        }
      }),
      meta: {
        total: totalPages,
        page: currentPage,
        lastPage: Math.ceil( totalPages / perPage )
      }
    }
  }

  async findOne(id: string) {
    const order = await this.order.findFirst({
      where: {
        id
      }
    })

    if ( !order ) {
      throw new RpcException({ 
        status: HttpStatus.NOT_FOUND, 
        message: `Order with id ${ id } not found`
      });
    }

    return order;
  }
  async changeStatus(changeOrderStatusDto: ChangeOrderStatusDto) {

    const { id, status } = changeOrderStatusDto;

    const order = await this.findOne(id);
    if ( order.status === status ) {
      return order;
    }

    return this.order.update({
      where: { id },
      data: { status: status }
    });
  }
}
