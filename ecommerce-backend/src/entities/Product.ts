import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Brand } from "./Brand";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 150 })
  productName!: string;

  @Column({ type: "varchar", length: 50 })
  category!: string;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  price!: number;

  @Column({ type: "float" })
  rating!: number;

  @Column({ type: "varchar", nullable: true })
  imageUrl!: string | null;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "boolean", default: false })
  favorite!: boolean;

  @ManyToOne(() => Brand, (brand) => brand.products, { nullable: false })
  brand!: Brand;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
