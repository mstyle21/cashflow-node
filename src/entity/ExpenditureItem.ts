import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Expenditure } from "./Expenditure";
import { Category } from "./Category";
import { Product } from "./Product";

@Entity()
export class ExpenditureItem {
  @PrimaryGeneratedColumn()
  id: number;
  @JoinColumn()
  @ManyToOne(() => Expenditure, (expenditure) => expenditure.items)
  expenditure: Expenditure;
  @JoinColumn()
  @ManyToOne(() => Product)
  product: Product;
  @Column()
  quantity: number;
  @Column()
  pricePerUnit: number;
  @Column()
  totalPrice: number;
  @JoinColumn()
  @ManyToOne(() => Category)
  category: Category;
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP", select: false })
  created: Date;
  @Column({
    type: "timestamp",
    default: null,
    onUpdate: "CURRENT_TIMESTAMP",
    select: false,
  })
  updated: Date | null;
}
