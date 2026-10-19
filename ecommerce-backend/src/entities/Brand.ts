import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Product } from "./Product";

@Entity("brands")
export class Brand {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: "varchar", length: 100, unique: true })
  name!: string;

  @Column({ type: "varchar", length: 100 })
  country!: string;

  @OneToMany(() => Product, (product) => product.brand)
  products!: Product[];
}
