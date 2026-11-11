import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./Order";

@Entity("order_items")
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  order!: Order;

  @Column({ type: "int" })
  productId!: number;

  @Column({ type: "varchar", length: 150 })
  productName!: string;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  unitPrice!: number;

  @Column({ type: "int" })
  quantity!: number;
}
