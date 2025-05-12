import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SettingsService } from '../../../services/settings.service';
import { SweetAlertService } from '../../../services/sweet-alert.service';
import { CommonModule } from '@angular/common';
import { IconDirective } from '@coreui/icons-angular';
import { cilSave, cilActionUndo, cilTrash, cilPen } from '@coreui/icons';
import { Setting } from '../../../models/setting.interface';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { DatatableComponent } from '../common/components/datatable.component';

@Component({
  selector: 'app-setting',
  imports: [CommonModule, FormsModule, IconDirective, NgxDatatableModule, DatatableComponent],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class SettingComponent implements OnInit {
  icons = { cilSave, cilActionUndo, cilTrash, cilPen };
  settings: any[] = [];
  newSetting: Setting = { key: '', value: '' };
  settingUId: any;
  columns: any[] = [
    {
      name: 'Key',
      prop: 'key',
      sortable: true
    },
    {
      name: 'Value',    
      prop: 'value',
      sortable: true
    }
  ];

  constructor(private settingsService: SettingsService,
    private sweetAlert: SweetAlertService,
    private toastr: ToastrService) {}

  ngOnInit() {
    this.fetchSettings();
  }

  fetchSettings() {
    this.settingsService.getSettings().subscribe((data:any) => {
      this.settings = data;
    });
  }

  saveSetting() {
    if (!this.newSetting.key || !this.newSetting.value) return;
    if (this.settingUId) {
      this.settingsService.updateSetting(this.settingUId, this.newSetting)
      .then(() => {
        this.toastr.success('Setting updated successfully!');
        this.clearForm();
        this.fetchSettings();
      });
    } else {
      this.settingsService.addSetting(this.newSetting).then(() => {
        this.toastr.success('Setting added successfully!');
        this.clearForm();
        this.fetchSettings();
      });
    }
  }

  showUpdateForm(setting: Setting) {
    this.settingUId = setting.uid;
    this.newSetting = { key: setting['key'], value: setting['value']};
  }

  deleteSetting(setting: Setting) {
    this.sweetAlert.deleteConfirmation().then((result:any) => {
      if (result.isConfirmed) {
        this.settingsService.deleteSetting(setting.uid!).then(() => {
          this.toastr.success('Setting deleted successfully!');
        });
      }else{
        this.toastr.warning('Deletion cancelled!');
      }
    });
  }

  clearForm(): void {
    this.newSetting = { key: '', value: '' };
    this.settingUId = null;
  }
}
