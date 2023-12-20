import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Expenditure } from "./Expenditure";

@Entity()
export class ExpenditureImage {
  @PrimaryGeneratedColumn()
  id: number;
  @JoinColumn()
  @ManyToOne(() => Expenditure)
  expenditure: Expenditure;
  @Column({ length: 150 })
  path: string;
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
