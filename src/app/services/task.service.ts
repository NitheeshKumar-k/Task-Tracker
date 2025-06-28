import { Injectable } from '@angular/core';
import { Category, Priority, Status } from '../models/enums';
import { Task } from '../models/task';
import { Router } from '@angular/router';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  // Key for storing Tasks in Local Storage of browser for convinence during page reloads.
  TASK_STORAGE_KEY = 'my-tasks';

  // JSON Placeholder API
  private readonly TAGS_API = 'https://jsonplaceholder.typicode.com/users';
  private cachedTags?: Observable<string[]>;

  // Few Default tasks with different cases
  tasks: Task[] = [
    {id:1,title:"Task 1",description:"This is a Dummy Task of status TO DO and Category Work for test purpose.",status:Status.ToDo,creationDate:"2025-06-30T04:00:00.000Z",dueDate:"2025-06-30T04:00:00.000Z",category:Category.Work,tags:["Leanne Graham","Ervin Howell","Clementine Bauch"],priority:Priority.Low,archived:false},
    {id:2,title:"Task 2",description:"This is a Dummy Task of status In Progress and Category Personal for test purpose.",status:Status.InProgress,creationDate:"2025-06-27T04:00:00.000Z",dueDate:"2025-06-27T04:00:00.000Z",category:Category.Personal,tags:["Leanne Graham","Clementina DuBuque","Kurtis Weissnat"],priority:Priority.High,archived:false},
    {id:3,title:"Task 3",description:"This is a Dummy Task of status Done and Category Urgent for test purpose.",status:Status.Done,creationDate:"2025-06-30T04:00:00.000Z",dueDate:"2025-06-30T04:00:00.000Z",category:Category.Urgent,tags:["Leanne Graham","Kurtis Weissnat","Glenna Reichert"],priority:Priority.Medium,archived:false},
    {id:4,title:"Task 4",description:"This is a Dummy Task of status Done and Category Other with custom tags for test purpose.",status:Status.Done,creationDate:"2025-06-29T04:00:00.000Z",dueDate:"2025-06-29T04:00:00.000Z",category:Category.Other,tags:["Test","Class","Angular","Leanne Graham"],priority:Priority.Low,archived:false}
  ];
  // few State information that controls the tasks based on user interactions
  sorted = false;
  sortOption: string = 'priority';

  constructor(private router: Router,
              private http: HttpClient
  ) { 
    // Checking is tasks are available in local storage
    // if yes, use the data from Local Storage other wise use default data
    let data = localStorage.getItem(this.TASK_STORAGE_KEY);
    if (data) {
      let parsedData = JSON.parse(data) as Task[];
      this.tasks = parsedData ? parsedData : this.tasks;
    }
    // Setting sorted to false when Task Service is initialized (page reload)
    this.sorted = false;
  }

  getPredefinedTags(): Observable<string[]> {
    // Used HttpClient to get the Predifined tags and saving the observable with ShareReplay operator for reuse
    if (!this.cachedTags) {
      this.cachedTags = this.http.get<any[]>(this.TAGS_API).pipe(
        map(users => users.slice(0, 10).map(user => user.name)),
        shareReplay(1)
      );
    }
    return this.cachedTags;
  }

  getTasks(sort = true) {
    // Check the current route to get appropriate tasks
    // if current route is archive then return task with archived property set to true
    // else return other tasks.
    const currentPath = this.router.url;
    // Applying sorting by default if user already requested sorting
    let tasks = (sort && this.sorted) ? this.sort(this.sortOption) : this.tasks;
    if (currentPath === '/archive') {
      return tasks.filter(task => task.archived);
    }
    return tasks.filter(task => !task.archived);
  }

  getTaskById(id: number): Task | undefined {
    // Getting task by id
    return this.tasks.find(task => task.id === id);
  }

  getNextTaskId(): number {
    // Getting next available task id 
    return Math.max(...this.tasks.map(t => t.id)) + 1;
  }

  saveTask(task: Task): void {
    // checking if the task is available
    // if it is available update the task with new object
    // else push it to the end
    const index = this.tasks.findIndex(t => t.id === task.id);
    if (index > -1) {
      this.tasks[index] = task;
    } else {
      this.tasks.push(task);
    }
    // removing sorting when new task or existing task is editted
    this.sorted = false;
    // SToring the updates in Local Storage
    this.saveTasksInLocalStorage(this.tasks);
  }

  deleteTask(id: number): Task[] {
    // If the task is available then removing it from the tasks using splice operator
    const index = this.tasks.findIndex(t => t.id === id);
    if (index > -1) {
      this.tasks.splice(index, 1);
      this.saveTasksInLocalStorage(this.tasks);
    }
    return this.getTasks();
  }

  toggleArchiveTask(id: number): Task[] {
    // Changing the archive status of task based on task id
    const index = this.tasks.findIndex(t => t.id === id);
    if (index > -1) {
      this.tasks[index].archived = !this.tasks[index].archived;
      this.saveTasksInLocalStorage(this.tasks);
    }
    return this.getTasks();
  }

  saveTasksInLocalStorage(tasks: Task[]): void {
    // helper method for storing the data in Local Storage
    localStorage.setItem(this.TASK_STORAGE_KEY, JSON.stringify(tasks));
  }

  sort(option: string): Task[] {
    // sort method to sort the tasks objects
    // Assigined the numerical value to the priority values
    const priorityMap = { 'High': 3, 'Medium': 2, 'Low': 1 };

    const tasks = this.getTasks(false).slice().sort((a, b) => {
      // if sort option is priority then checking priority map
      if (option === 'priority') {
        return priorityMap[b.priority] - priorityMap[a.priority];
      } else {
        // else sorting based on creation Date
        return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
      }
    });

    // State information about sorting for future use when we visting different routes
    this.sorted = true;
    this.sortOption = option;
    return tasks;
  }
}
