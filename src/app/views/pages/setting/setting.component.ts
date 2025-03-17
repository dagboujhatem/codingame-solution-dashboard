import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SettingsService } from '../../../services/settings.service';
import { SweetAlertService } from '../../../services/sweet-alert.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-setting',
  imports: [CommonModule, FormsModule],
  templateUrl: './setting.component.html',
  styleUrl: './setting.component.scss'
})
export class SettingComponent implements OnInit {
  settings: any[] = [];
  newSetting = { key: '', value: '' };
  isUpdate: boolean = false;
  settingId: any;

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
    if (this.isUpdate) {
      this.settingsService.updateSetting(this.settingId, this.newSetting)
      .then(() => {
        this.toastr.success('Setting updated successfully!');
        this.newSetting = { key: '', value: '' };
        this.isUpdate = false;
      });
    } else {
      this.settingsService.addSetting(this.newSetting).then(() => {
        this.toastr.success('Setting added successfully!');
        this.newSetting = { key: '', value: '' };
      });
    }
  }

  showUpdateForm(settingId: string) {
    this.isUpdate = true;
    this.settingId = settingId;
    this.settingsService.getSettingById(settingId).subscribe((data:any)=> {
      this.newSetting = { key: data['key'], value: data['value']};
    })
  }

  deleteSetting(settingId: string) {
    this.sweetAlert.deleteConfirmation().then((result:any) => {
      if (result.isConfirmed) {
        this.settingsService.deleteSetting(settingId).then(() => {
          this.toastr.success('Setting deleted successfully!');
        });
      }else{
        this.toastr.warning('Deletion cancelled!');
      }
    });
  }
}
