import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { ExpenditureQueue } from "./ExpenditureQueue";

@Entity()
export class ExpenditureQueueImage {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  filename: string;
  @JoinColumn()
  @ManyToOne(() => ExpenditureQueue)
  expenditureQueue: ExpenditureQueue;
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
