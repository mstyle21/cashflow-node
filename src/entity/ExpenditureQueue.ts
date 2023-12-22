import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./User";
import { ExpenditureQueueImage } from "./ExpenditureQueueImage";

export const expenditureQueueStatus = ["pending", "running", "done", "failed"];

@Entity()
export class ExpenditureQueue {
  @PrimaryGeneratedColumn()
  id: number;
  @JoinColumn()
  @ManyToOne(() => User)
  user: User;
  @Column({ type: "enum", enum: expenditureQueueStatus, default: "pending" })
  status: string;
  @Column()
  date: string;
  @Column()
  price: string;
  @Column()
  company: string;
  @OneToMany(() => ExpenditureQueueImage, (expenditureQueueImage) => expenditureQueueImage.expenditureQueue, {
    cascade: true,
  })
  images: ExpenditureQueueImage[];
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
