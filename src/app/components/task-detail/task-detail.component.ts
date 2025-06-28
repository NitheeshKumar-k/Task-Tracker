import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Category, Priority, Status } from 'src/app/models/enums';
import { Task } from 'src/app/models/task';
import { TaskService } from 'src/app/services/task.service';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit {
  separatorKeysCodes: number[] = [ENTER, COMMA];
  taskForm!: FormGroup;
  taskId!: number;
  isNew = false;
  submitted = false;
  statuses = Object.values(Status);
  allowedCategories = Object.values(Category);
  allowedPriorities = Object.values(Priority);
  predefinedTags: string[] = [];
  tagsLoadError = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    // Using ActivatedRoute to find the id of Task we want to view or edit
    // If TaskService doesn't have the TaskId then we are creating a new Task
    // Otherwise we are editing the existing task.
    this.route.params.subscribe(params => {
      this.taskId = +params['id'];
      const existingTask = this.taskService.getTaskById(this.taskId);
      // This is used to control the template shown to user creating new task or 
      // Working with existing Task.
      this.isNew = !existingTask;
      // Creating a Task Form Group using Form Builder with appropriate Form Controls and validators.
      this.taskForm = this.fb.group({
        title: [existingTask?.title || '', [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50)
        ]],
        description: [existingTask?.description || '', [
          Validators.maxLength(200)
        ]],
        status: [existingTask?.status || Status.ToDo, Validators.required],
        dueDate: [existingTask?.dueDate || null, this.futureDateValidator()],
        creationDate: [existingTask?.creationDate || new Date().toISOString()],
        category: [existingTask?.category || Category.Work, [Validators.required, this.allowedCategoryValidator()]],
        priority: [existingTask?.priority || Priority.Low],
        tags: this.fb.array(
          (existingTask?.tags || []).map(tag => this.fb.control(tag, [
            Validators.minLength(2),
            Validators.maxLength(20)
          ])),
          [this.tagsValidator(5, 2, 20)]
        ),
        archived: [existingTask?.archived || false]
      });
    });

    // Getting the Predefined Tags using Task Service from Json Place Holder API
    this.taskService.getPredefinedTags().subscribe({
      next: tags => this.predefinedTags = tags,
      error: () => this.tagsLoadError = true
    });
  }

  // Getter Method to gets Tags form Array.
  get tags(): FormArray {
    return this.taskForm.get('tags') as FormArray;
  }

  // This method will add new custom tag given as input by user
  addTagFromInput(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value.trim();

    this.addTag(value);

    if (input) {
      input.value = '';
    }
  }

  // This method will add the tag either predefined tag or custom tag to the form array
  addTag(tag: string): void {
    if (tag) {
      this.tags.push(this.fb.control(tag, [
        Validators.minLength(2),
        Validators.maxLength(20)
      ]));
      this.tags.markAsTouched();
      this.tags.updateValueAndValidity();
    }
  }

  // This helper method will remove the tag at particular index when clicked on cancel icon in UI.
  removeTag(index: number): void {
    this.tags.removeAt(index);
    this.tags.markAsTouched();
    this.tags.updateValueAndValidity();
  }

  // Saving the new Task or editted task and navifating to the home route
  // which will redirect to tasks route
  save(): void {
    this.submitted = true;
    if (this.taskForm.valid) {
      const newTask: Task = { id: this.taskId, ...this.taskForm.value };
      this.taskService.saveTask(newTask);
      this.router.navigate(['/']);
    }
  }

  // Custom Validator function to perform date validation
  futureDateValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const value = control.value;
      // if there is no value then it is valid
      if (!value) return null;
      const selected = new Date(value);
      // If the time of the date is NaN then the date is not valid
      if (isNaN(selected.getTime())) {
        return { invalidDate: true };
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // CHecking if the date is in future or not.
      return selected < today ? { pastDate: true } : null;
    };
  }

  // This custom validator is used for Category form Input, 
  // checks if the input is present in the Available categories
  allowedCategoryValidator(): ValidatorFn {
    return (control: AbstractControl) =>
      this.allowedCategories.includes(control.value) ? null : { invalidCategory: true };
  }

  // Tags validator will check if the count of tags is less than max tags
  // And check if any tag has length less than 2 characters or more than 20 characters
  tagsValidator(maxTags: number, minLength: number, maxLength: number): ValidatorFn {
    return (control: AbstractControl) => {
      let err: any = {};
      let tagsControl = control as FormArray;
      if (tagsControl.length > maxTags) {
        err['maxTags'] = true;
      }
      const hasShortTag = tagsControl.controls.some(c => c.value?.trim().length < minLength);
      if (hasShortTag) {
        err['shortTag'] = true;
      }
      const hasLongTag = tagsControl.controls.some(c => c.value?.trim().length > maxLength);
      if (hasLongTag) {
        err['longTag'] = true;
      }
      return Object.keys(err).length ? err : null;
    }
  }

  // Checks whether the form group is valid or not for submit button.
  isInvalid(field: string): boolean {
    const control = this.taskForm.get(field);
    return !!control && control?.invalid && (control?.touched || this.submitted);
  }
}