import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgxDatatableModule, SortType } from '@swimlane/ngx-datatable';
import { SearchPipe } from '../../pipes/search.pipe';
import { FormsModule } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';
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
  templateUrl: './datatable.component.html', 
  styleUrls: ['./datatable.component.scss']
})
export class DatatableComponent implements OnChanges {
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

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data']) {
      this.searchFields = this.columns.map(col => col.prop);
    }
  }
}