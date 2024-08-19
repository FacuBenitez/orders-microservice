import { Status } from "@prisma/client";



export const OrderStatusList = [
    Status.PENDING,
    Status.APPROVED,
    Status.REJECTED,
]