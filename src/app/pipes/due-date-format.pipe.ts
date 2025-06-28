import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dueDateFormat'
})
export class DueDateFormatPipe implements PipeTransform {

  transform(value: string | Date | null | undefined): string {
    // check if there is no date
    if (!value) return 'No Due Date';

    const dueDate = new Date(value);
    const today = new Date();

    // Reset times to compare dates only
    dueDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // formatting date to MM/dd/YYYY format
    const formatted = dueDate.toLocaleDateString('en-US', {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    });

    // if it is in past then adding Overdue to the formatted Date
    return dueDate < today ? `Overdue (${formatted})` : formatted;
  }

}
