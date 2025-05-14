import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, TemplateRef, PipeTransform } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ColumnMode, NgxDatatableModule, SortType } from '@swimlane/ngx-datatable';
import { SearchPipe } from '../../pipes/search.pipe';
import { FormsModule } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';
import { cilPen, cilTrash, cilYen } from '@coreui/icons';
import { datatableMessages } from './messages';

export interface Column {
  name: string;
  prop: string;
  sortable?: boolean;
  template?: any;
  pipe?: PipeTransform;
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
  @Input() columnMode: ColumnMode = ColumnMode.force;
  @Input() headerHeight: number = 50;
  @Input() footerHeight: number = 50;
  @Input() rowHeight: number = 50 ;
  @Input() sortType: SortType = SortType.single;
  @Input() limit: number = 5;
  @Input() messages: any = datatableMessages;
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

  updateMessages() {
    this.messages.emptyMessage = this.filterQuery?.trim()
    ? this.messages.emptyMessageSearch
    : this.messages.emptyMessage;
  }
}