import {
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import IpSelectInputOption from '../../interfaces/ip-select-input-option';

@Component({
  selector: 'app-ip-select-input',
  templateUrl: './ip-select-input.component.html',
  styleUrls: ['./ip-select-input.component.scss'],
})
export class IpSelectInputComponent {
  @Input() control = new FormControl();
  @Input() label = '';
  @Input() onStyle = '';
  @Output() selectEmitter = new EventEmitter<any>();
  @Input() labelCode = '';
  @Input() options: IpSelectInputOption[] = [];
  @Input() selectFirstOption = false;
  @Input() isMultiple = false;
  @Input() disabled = false;
  @Input() reset = false;

  selectedAllOptions = false;
  errorMessages: Record<string, string> = {
    required: 'IP.VALIDATORS.REQUIRED',
  };

  ngOnInit(): void {
    if (this.selectFirstOption && this.options.length > 0) {
      const firstOptionValue = this.options[0].value;
      this.onSelectMaterial({
        value: this.isMultiple ? [firstOptionValue] : firstOptionValue,
      });
    }
    if (this.disabled) {
      this.control.disable();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['reset'] && changes['reset'].currentValue) {
      this.control.reset();
      this.selectedAllOptions = false;
      if (this.disabled) {
        this.control.disable();
      }
      if (this.selectFirstOption && this.options.length > 0) {
        const firstOptionValue = this.options[0].value;
        this.onSelectMaterial({
          value: this.isMultiple ? [firstOptionValue] : firstOptionValue,
        });
      }
    }
  }

  getErrorMessage(): string {
    if (this.control.touched && this.control.invalid && this.control.errors) {
      const errorKey = Object.keys(this.control.errors || {})[0];
      return this.errorMessages[errorKey] || '';
    }
    return '';
  }

  onSelect(ev: any) {
    this.selectEmitter.emit(ev.target.value);
  }

  onSelectMaterial(ev: { value: any }) {
    let selectedOptions = ev.value;
    if (this.isMultiple && Array.isArray(selectedOptions)) {
      selectedOptions = this.getSelectedOptionsForMultiple(selectedOptions);
      this.control.setValue(selectedOptions);
    }
    this.emitSelectedOptions(selectedOptions);
  }

  private getSelectedOptionsForMultiple(
    selectedOptionValues: string[]
  ): string[] {
    let selectedValues = selectedOptionValues;
    if (selectedOptionValues.includes('all') && !this.selectedAllOptions) {
      this.selectedAllOptions = true;
      selectedValues = this.options.map((option) => option.value);
    }
    if (!selectedOptionValues.includes('all') && this.selectedAllOptions) {
      this.selectedAllOptions = false;
      selectedValues = [];
    }
    return selectedValues;
  }

  private emitSelectedOptions(selectedOptions: string | string[]) {
    if (this.isMultiple && Array.isArray(selectedOptions)) {
      this.selectEmitter.emit(
        selectedOptions.filter((option) => option !== 'all')
      );
      return;
    }
    this.selectEmitter.emit(selectedOptions);
  }
}
