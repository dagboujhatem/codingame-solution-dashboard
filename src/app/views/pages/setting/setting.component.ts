import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SettingsService } from '../../../services/settings.service';
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

  constructor(private settingsService: SettingsService, private toastr: ToastrService) {}

  ngOnInit() {
    this.fetchSettings();
  }

  fetchSettings() {
    this.settingsService.getSettings().subscribe((data:any) => {
      this.settings = data;
    });
  }

  addSetting() {
    if (!this.newSetting.key || !this.newSetting.value) return;

    this.settingsService.addSetting(this.newSetting).then(() => {
      this.toastr.success('Setting added successfully!');
      this.newSetting = { key: '', value: '' };
    });
  }

  updateSetting(settingId: string) {
    const updatedData = { value: 'Updated Value' };

    this.settingsService.updateSetting(settingId, updatedData).then(() => {
      this.toastr.success('Setting updated successfully!');
    });
  }

  deleteSetting(settingId: string) {
    this.settingsService.deleteSetting(settingId).then(() => {
      this.toastr.warning('Setting deleted!');
    });
  }
}
