import { Category, Priority, Status } from "./enums";

export interface Task {
  id: number;
  title: string;
  description?: string;
  status: Status;
  creationDate: string;
  dueDate?: string;
  category: Category;
  tags?: string[];
  archived: boolean;
  priority: Priority;
}
