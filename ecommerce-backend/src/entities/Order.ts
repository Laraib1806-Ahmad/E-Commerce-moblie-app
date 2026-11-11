import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { OrderItem } from "./OrderItem";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ type: "varchar", length: 255 })
  userEmail!: string;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: { to: (v: number) => v, from: (v: string) => parseFloat(v) },
  })
  total!: number;

  @Column({ type: "varchar", length: 20, default: "pending" })
  status!: "pending" | "paid";

  @Column({ type: "varchar", nullable: true })
  paymentIntentId!: string | null;

  @Column({ type: "varchar", length: 150 })
  fullName!: string;

  @Column({ type: "varchar", length: 30 })
  phone!: string;

  @Column({ type: "text" })
  address!: string;

  @Column({ type: "varchar", length: 100 })
  city!: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items!: OrderItem[];

  @CreateDateColumn()
  createdAt!: Date;
}
