import { Component, OnInit } from '@angular/core';
import { Status } from 'src/app/models/enums';
import { Task } from 'src/app/models/task';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-archive',
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss']
})
export class ArchiveComponent implements OnInit {

  Status = Status;
  tasks: Task[] = [];

  constructor(public taskService: TaskService) { }

  ngOnInit(): void {
    this.tasks = this.taskService.getTasks();
  }

  restoreTask(taskId: number): void {
    // here we are toggling the archive field in Task Object to show the task in /tasks route
    this.tasks = this.taskService.toggleArchiveTask(taskId);
  }

}
