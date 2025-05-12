import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
    selector: 'switch-toggle',
    standalone: true,
    imports: [NgIf, ReactiveFormsModule],
    templateUrl: './switch-toggle.component.html',
    styleUrls: ['./switch-toggle.component.scss']
})
export class SwitchToggleComponent {
    @Input() switchControl!: FormControl;
    @Input() switchControlName!: string;
    @Input() switchLabel?: string;
}
