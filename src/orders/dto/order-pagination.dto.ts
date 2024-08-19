import { IsEnum, IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common';
import { Status } from '@prisma/client';
import { OrderStatusList } from '../enum/enum.order';


export class OrderPaginationDto extends PaginationDto {


  @IsOptional()
  @IsEnum( OrderStatusList, {
    message: `Valid status are ${ OrderStatusList }`
  })
  status: Status;


}