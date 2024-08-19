import { IsNumber, IsPositive } from "class-validator";

export class OrderItemDto {
    @IsPositive()
    @IsNumber()
    productId: number;
    
    @IsNumber()
    @IsPositive()
    quantity: number;

    @IsNumber()
    @IsPositive()
    price: number;
}