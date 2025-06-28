import { Directive, Input, OnDestroy, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appDisableCompleted]'
})
export class DisableCompletedDirective implements OnInit, OnDestroy {

  @Input('appDisableCompleted') formGroup!: FormGroup;
  private sub?: Subscription;

  ngOnInit() {
    if (!this.formGroup) {
      console.warn('appDisableCompleted directive requires a formGroup input');
      return;
    }

    // If the status is initially Done, only then we will disable the form controls.
    // if the status changes to Done while editing the task or creating the task, we will not disable
    // the form controls in Task Form.
    const initialStatus = this.formGroup.get('status')?.value;
    if (initialStatus === 'Done') {
      this.disableControlsExceptStatus();
    }

    // Subscribe to status changes
    this.sub = this.formGroup.get('status')?.valueChanges.subscribe(newStatus => {
      // If changing FROM Done to something else enable controls
      if (newStatus !== 'Done') {
        this.enableAllControls();
      }
    });
  }

  ngOnDestroy() {
    this.sub?.unsubscribe();
  }

  private disableControlsExceptStatus() {
    // disable all form controls in Task Form except Status
    Object.keys(this.formGroup.controls).forEach(name => {
      if (name !== 'status') {
        this.formGroup.get(name)?.disable({ emitEvent: false });
      }
    });
  }

  private enableAllControls() {
    // enable all form controls in Task form
    Object.keys(this.formGroup.controls).forEach(name => {
      this.formGroup.get(name)?.enable({ emitEvent: false });
    });
  }
}
