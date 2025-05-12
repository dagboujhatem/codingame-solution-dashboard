import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'search',
  standalone: true
})
export class SearchPipe implements PipeTransform {
  transform<T>(items: T[], searchText: string, searchFields: (keyof T)[]): T[] {
    if (!items || !searchText || !searchFields.length) {
      return items;
    }

    searchText = searchText.toLowerCase();

    return items.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (value === null || value === undefined) {
          return false;
        }
        return String(value).toLowerCase().includes(searchText);
      });
    });
  }
}
// Usage:
// <input type="text" class="form-control" placeholder="Search..." [(ngModel)]="searchText" /><input [(ngModel)]="searchText" placeholder="Search...">
// <table>
// <tr *ngFor="let item of items | search:searchText:searchFields">
//   <!-- Your table content -->
// </tr>
// </table>
