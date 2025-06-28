import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

  transform(value: string | null | undefined, limit = 50): string {
    // If there is no Value then SHowing N/A
    if (!value) return 'N/A';
    // Returning first Limit characters using slice() if length of value is greater than limit
    return value.length > limit ? value.slice(0, limit).trimEnd() + '…' : value;
  }

}
