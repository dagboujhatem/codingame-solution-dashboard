import {Injectable} from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class SweetAlertService {

  constructor() { }

  deleteConfirmation()
  {
    return Swal.fire({
      title: `Are you sure?`,
      text: `Do you really want to delete this record?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4dbd74',
      cancelButtonColor: '#f86c6b',
      confirmButtonText: `<i class="fa fa-check" aria-hidden="true"></i> Yes, delete it`,
      cancelButtonText: `<i class="fa fa-times" aria-hidden="true"></i> No, cancel`
    });
  }
}
