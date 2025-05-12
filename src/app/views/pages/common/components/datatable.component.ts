import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxDatatableModule, SortType } from '@swimlane/ngx-datatable';
import { SearchPipe } from '../pipes/search.pipe';
import { FormsModule } from '@angular/forms';
import { IconDirective, IconSetService } from '@coreui/icons-angular';
import { cilPen, cilTrash, cilYen } from '@coreui/icons';

export interface Column {
  name: string;
  prop: string;
  sortable?: boolean;
  template?: any;
}

@Component({
  selector: 'datatable',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgxDatatableModule, SearchPipe, IconDirective,],
  template: `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <input type="text" class="form-control" placeholder="Search..." [(ngModel)]="filterQuery" />  
    </div>
    <div class="row">
      <ngx-datatable 
      class="table table-striped table-hover table-responsive-lg"
      [rows]="data | search: filterQuery:searchFields"
      [columnMode]="columnMode"
      [headerHeight]="headerHeight"
      [footerHeight]="footerHeight"
      [rowHeight]="rowHeight"
      [sortType]="sortType"
      [limit]="limit"
      [messages]="messages"
      [sorts]="sorts">
      
      <ngx-datatable-column 
        *ngFor="let column of columns" 
        [name]="column.name" 
        [prop]="column.prop" 
        [sortable]="column.sortable">
        <ng-template *ngIf="column.template" let-row="row" ngx-datatable-cell-template>
          <ng-container *ngTemplateOutlet="column.template; context: { $implicit: row }">
          </ng-container>
        </ng-template>
      </ngx-datatable-column>

      <ngx-datatable-column *ngIf="showActions" name="Actions">
        <ng-template let-row="row" ngx-datatable-cell-template>
          <div class="d-flex gap-3">
            <button 
              *ngIf="showViewButton"
              class="btn btn-dark text-white btn-sm" 
              type="button"
              (click)="onView.emit(row)"
              [title]="viewTooltip">
                 <svg [cIcon]="icons.cilYen"></svg>
                 <span class="ms-2">View</span>
            </button>
            <button 
              *ngIf="showEditButton"
              class="btn btn-primary text-white btn-sm" 
              type="button"
              (click)="onEdit.emit(row)"
              [title]="editTooltip">
               <svg [cIcon]="icons.cilPen"></svg>
               <span class="ms-2">Update</span>
            </button>
            <button 
              *ngIf="showDeleteButton"
              class="btn btn-danger btn-sm text-white d-inline-flex" 
              type="button" 
              (click)="onDelete.emit(row)"
              [title]="deleteTooltip">
                 <svg [cIcon]="icons.cilTrash"></svg>
                 <span class="ms-2">Delete</span>
            </button>
          </div>
        </ng-template>
      </ngx-datatable-column>
    </ngx-datatable>
    </div>
  `,
  styles: [`
    :host {
      display: block;
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
    }
    th{
        cursor: pointer;
    }

    .Sorter{
      width: 100%;
      display: block;
    }

  `]
})
export class DatatableComponent {
  @Input() data: any[] = [];
  @Input() columns: Column[] = [];
  @Input() columnMode: 'standard' | 'force' | 'flex' = 'force';
  @Input() headerHeight: number = 50;
  @Input() footerHeight: number = 50;
  @Input() rowHeight: number = 50 ;
  @Input() sortType: SortType = SortType.multi;
  @Input() limit: number = 10;
  @Input() messages: any = {};
  @Input() sorts: any[] = [];

  // Action buttons configuration
  @Input() showActions: boolean = true;
  @Input() showViewButton: boolean = true;
  @Input() showEditButton: boolean = true;
  @Input() showDeleteButton: boolean = true;
  
  @Input() viewTooltip: string = 'View details';
  @Input() editTooltip: string = 'Edit item';
  @Input() deleteTooltip: string = 'Delete item';

  @Output() onEdit = new EventEmitter<any>();
  @Output() onView = new EventEmitter<any>();
  @Output() onDelete = new EventEmitter<any>();

  // Filter 
  filterQuery: string = '';
  searchFields: string[] = [];

  icons = { cilPen, cilTrash, cilYen };

  constructor(public iconSetService: IconSetService) {
    iconSetService.icons = { cilPen, cilTrash, cilYen };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.searchFields = this.columns.map(col => col.prop);
    }
  }
}