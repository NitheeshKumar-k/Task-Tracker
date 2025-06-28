import { Directive, ElementRef, Input, OnChanges, Renderer2, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appOverdueHighlight]'
})
export class OverdueHighlightDirective implements OnChanges {

  @Input() dueDate?: string | Date | null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnChanges(changes: SimpleChanges): void {
    // This will not occur but handling it incase if we want to use it in future
    if ('dueDate' in changes) {
      this.updateHighlight();
    }
  }

  private updateHighlight() {
    // If there is no due date then we shouldn't apply highlight
    if (!this.dueDate) {
      this.clearHighlight();
      return;
    }

    const due = new Date(this.dueDate);
    const today = new Date();
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // checking if the due date is in the past
    if (due < today) {
      // adding red border for the task element
      this.renderer.setStyle(this.el.nativeElement, 'border', '2px solid red');
    } else {
      this.clearHighlight();
    }
  }

  private clearHighlight() {
    // removing border from the task element
    this.renderer.removeStyle(this.el.nativeElement, 'border');
  }

}
