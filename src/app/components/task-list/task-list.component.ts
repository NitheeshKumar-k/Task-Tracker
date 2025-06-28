import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Status } from 'src/app/models/enums';
import { Task } from 'src/app/models/task';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent implements OnInit {
  Status = Status;
  tasks: Task[] = [];

  // Injecting TaskService and Router
  constructor(private taskService: TaskService,
    private router: Router) { }

  ngOnInit(): void {
    // Getting Tasks from Task Service
    this.tasks = this.taskService.getTasks();
  }

  addTask(): void {
    // Using Task service to get a new task id for new Task
    // Navigating to /task/:id route with new task id to create a new task
    const newId = this.taskService.getNextTaskId();
    this.router.navigate(['/task', newId]);
  }

  editTask(taskId: number): void {
    // navigating to the task route to edit the existing task
    this.router.navigate(['/task', taskId]);
  }

  deleteTask(taskId: number): void {
    // Using Task service to delete the task using task id
    this.tasks = this.taskService.deleteTask(taskId);
  }

  archiveTask(taskId: number): void {
    // using Task Service to toggle the achived field in Task object
    this.tasks = this.taskService.toggleArchiveTask(taskId);
  }

  sort(option: string): void {
    // Sorting the Tasks based on priority or Creation Date ('date' in short)
    this.tasks = this.taskService.sort(option);
  }
}
