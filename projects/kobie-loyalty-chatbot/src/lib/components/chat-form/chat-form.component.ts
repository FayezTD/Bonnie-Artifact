// src/app/components/chat-form/chat-form.component.ts

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChatFormData, FormSubmissionResult } from '../../interfaces/chat.interfaces';

// ============================================================================
// COMPONENT
// ============================================================================

@Component({
  selector: 'app-chat-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './chat-form.component.html',
  styleUrls: ['./chat-form.component.scss']
})
export class ChatFormComponent implements OnInit {
  // ============================================================================
  // INPUT/OUTPUT PROPERTIES
  // ============================================================================
  @Input() formData!: ChatFormData;
  @Output() formSubmit = new EventEmitter<FormSubmissionResult>();
  @Output() formCancel = new EventEmitter<string>();

  // ============================================================================
  // PROPERTIES
  // ============================================================================
  dynamicForm!: FormGroup;
  isSubmitting = false;

  // ============================================================================
  // CONSTRUCTOR
  // ============================================================================
  constructor(private fb: FormBuilder) { }

  // ============================================================================
  // LIFECYCLE HOOKS
  // ============================================================================
  ngOnInit(): void {
    this.buildForm();
  }

  // ============================================================================
  // PUBLIC METHODS
  // ============================================================================

  /**
   * Handle form submission
   */
  onSubmit(): void {
    if (this.dynamicForm.valid) {
      this.isSubmitting = true;

      const result: FormSubmissionResult = {
        formId: this.formData.formId,
        data: this.dynamicForm.value,
        isValid: true
      };

      setTimeout(() => {
        this.formSubmit.emit(result);
        this.isSubmitting = false;
      }, 500);
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.dynamicForm.controls).forEach(key => {
        this.dynamicForm.get(key)?.markAsTouched();
      });

      const result: FormSubmissionResult = {
        formId: this.formData.formId,
        data: this.dynamicForm.value,
        isValid: false
      };

      this.formSubmit.emit(result);
    }
  }

  /**
   * Handle form cancellation
   */
  onCancel(): void {
    this.formCancel.emit(this.formData.formId);
  }

  /**
   * Check if a field is invalid and has been touched
   */
  isFieldInvalid(fieldKey: string): boolean {
    const field = this.dynamicForm.get(fieldKey);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Get error message for a specific field
   */
  getFieldError(fieldKey: string): string {
    const field = this.dynamicForm.get(fieldKey);

    if (field && field.errors) {
      if (field.errors['required']) {
        return 'This field is required';
      }

      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }

      if (field.errors['min']) {
        return `Minimum value is ${field.errors['min'].min}`;
      }

      if (field.errors['max']) {
        return `Maximum value is ${field.errors['max'].max}`;
      }

      if (field.errors['minlength']) {
        return `Minimum length is ${field.errors['minlength'].requiredLength} characters`;
      }

      if (field.errors['maxlength']) {
        return `Maximum length is ${field.errors['maxlength'].requiredLength} characters`;
      }
    }

    return '';
  }

  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================

  /**
   * Build the dynamic form based on formData configuration
   */
  private buildForm(): void {
    const formControls: any = {};

    this.formData.fields.forEach(field => {
      const validators = [];

      // Add required validator if specified
      if (field.required) {
        validators.push(Validators.required);
      }

      // Add email validator for email fields
      if (field.type === 'email') {
        validators.push(Validators.email);
      }

      // Add custom validators if provided
      if (field.validation) {
        if (Array.isArray(field.validation)) {
          validators.push(...field.validation);
        } else {
          validators.push(field.validation);
        }
      }

      // Set default value based on field type
      let defaultValue: any = '';
      if (field.type === 'checkbox') {
        defaultValue = false;
      } else if (field.type === 'number') {
        defaultValue = null;
      }

      formControls[field.key] = [defaultValue, validators];
    });

    this.dynamicForm = this.fb.group(formControls);
  }
}