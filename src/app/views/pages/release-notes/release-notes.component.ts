import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IconDirective } from '@coreui/icons-angular';
import { cilPencil, cilPlus, cilSave, cilTrash, cilActionUndo } from '@coreui/icons';
import { ReleaseNote, ReleaseNotesService } from '../../../services/release-notes.service';
import { SweetAlertService } from '../../../services/sweet-alert.service';
import { ToastrService } from 'ngx-toastr';
import { DatatableComponent } from '../common/components/datatable/datatable.component';
import { SwitchToggleComponent } from '../common/components/switch-toggle/switch-toggle.component';

@Component({
  selector: 'app-release-notes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IconDirective,
    DatatableComponent,
    SwitchToggleComponent,
    DatePipe
  ],
  templateUrl: './release-notes.component.html',
  styleUrls: ['./release-notes.component.scss']
})
export class ReleaseNotesComponent implements OnInit {
  icons = { cilPencil, cilPlus, cilSave, cilTrash, cilActionUndo };
  releaseForm: FormGroup;
  releaseNotes: ReleaseNote[] = [];
  currentReleaseVersion: string | null = null;
  isEditMode = false;

  columns: any[] = [];
  @ViewChild('forceUpdateTemplate', { static: true }) forceUpdateTemplate!: TemplateRef<any>;
  @ViewChild('arrayTemplate', { static: true }) arrayTemplate!: TemplateRef<any>;
  @ViewChild('dateTemplate', { static: true }) dateTemplate!: TemplateRef<any>;

  constructor(
    private fb: FormBuilder,
    private releaseNotesService: ReleaseNotesService,
    private sweetAlert: SweetAlertService,
    private toastr: ToastrService
  ) {
    this.releaseForm = this.fb.group({
      version: ['', [Validators.required, Validators.pattern(/^\d+\.\d+\.\d+$/)]],
      force_update: [false],
      features: this.fb.array([]),
      bug_fixes: this.fb.array([]),
      release_date: [new Date().toISOString().split('T')[0], Validators.required] // Default to today
    });
  }

  ngOnInit(): void {
    this.fetchReleaseNotes();
    this.columns = [
      { name: 'Version', prop: 'version', sortable: true },
      { name: 'Release Date', prop: 'release_date', sortable: true, template: this.dateTemplate, pipe: new DatePipe('en-US'), pipeArgs: ['shortDate'] },
      { name: 'Force Update', prop: 'force_update', sortable: true, template: this.forceUpdateTemplate },
      { name: 'Features', prop: 'features', template: this.arrayTemplate },
      { name: 'Bug Fixes', prop: 'bug_fixes', template: this.arrayTemplate },
    ];
  }

  fetchReleaseNotes(): void {
    this.releaseNotesService.getReleaseNotes().subscribe(data => {
      this.releaseNotes = data;
    }, error => {
      this.toastr.error('Failed to fetch release notes.');
    });
  }

  get features(): FormArray {
    return this.releaseForm.get('features') as FormArray;
  }

  get bug_fixes(): FormArray {
    return this.releaseForm.get('bug_fixes') as FormArray;
  }

  createItem(text: string = ''): FormControl {
    return this.fb.control(text, Validators.required);
  }

  addItem(type: 'features' | 'bug_fixes'): void {
    const formArray = this.releaseForm.get(type) as FormArray;
    formArray.push(this.createItem());
  }

  removeItem(type: 'features' | 'bug_fixes', index: number): void {
    const formArray = this.releaseForm.get(type) as FormArray;
    formArray.removeAt(index);
  }

  onSubmit(): void {
    if (this.releaseForm.invalid) {
      this.toastr.error('Please fill all required fields correctly.');
      this.markFormGroupTouched(this.releaseForm);
      return;
    }

    const formData = this.releaseForm.value;
    const releaseData: Partial<ReleaseNote> = {
      ...formData,
      release_date: new Date(formData.release_date) // Ensure it's a Date object
    };

    if (this.isEditMode && this.currentReleaseVersion) {
      this.releaseNotesService.updateReleaseNote(this.currentReleaseVersion, releaseData).subscribe(() => {
        this.toastr.success('Release note updated successfully!');
        this.fetchReleaseNotes();
        this.clearForm();
      }, () => {
        this.toastr.error('Failed to update release note.');
      });
    } else {
      this.releaseNotesService.createReleaseNote(releaseData).subscribe(() => {
        this.toastr.success('Release note created successfully!');
        this.fetchReleaseNotes();
        this.clearForm();
      }, (error) => {
        const message = error.error?.message || 'Failed to create release note.';
        this.toastr.error(message);
      });
    }
  }

  onEdit(releaseNote: ReleaseNote): void {
    this.isEditMode = true;
    this.currentReleaseVersion = releaseNote.version;
    this.releaseForm.reset(); // Clear previous values and arrays

    // Clear and repopulate FormArrays
    this.features.clear();
    this.bug_fixes.clear();

    releaseNote.features.forEach(feature => this.features.push(this.createItem(feature)));
    releaseNote.bug_fixes.forEach(fix => this.bug_fixes.push(this.createItem(fix)));

    this.releaseForm.patchValue({
      version: releaseNote.version,
      force_update: releaseNote.force_update,
      release_date: releaseNote.release_date ? new Date(releaseNote.release_date).toISOString().split('T')[0] : ''
    });
    this.releaseForm.get('version')?.disable(); // Disable version editing
  }

  onDelete(releaseNote: ReleaseNote): void {
    this.sweetAlert.deleteConfirmation().then(result => {
      if (result.isConfirmed) {
        this.releaseNotesService.deleteReleaseNote(releaseNote.version).subscribe(() => {
          this.toastr.success('Release note deleted successfully!');
          this.fetchReleaseNotes();
          if (this.currentReleaseVersion === releaseNote.version) {
            this.clearForm();
          }
        }, () => {
          this.toastr.error('Failed to delete release note.');
        });
      }else{
        this.toastr.warning('Deletion cancelled!');
      }
    });
  }

  clearForm(): void {
    this.isEditMode = false;
    this.currentReleaseVersion = null;
    this.releaseForm.reset({
      version: '',
      force_update: false,
      release_date: new Date().toISOString().split('T')[0]
    });
    this.features.clear();
    this.bug_fixes.clear();
    this.releaseForm.get('version')?.enable();
  }

  getSwitchControl(name: string): FormControl {
    return this.releaseForm.get(name) as FormControl;
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray) {
    (<any>Object).values(formGroup.controls).forEach((control:any) => {
      control.markAsTouched();
      if (control.controls) {
        this.markFormGroupTouched(control);
      }
    });
  }
} 