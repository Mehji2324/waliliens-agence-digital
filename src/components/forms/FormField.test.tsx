import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { FormField } from './FormField';
import { TextInput } from './TextInput';

describe('FormField accessibility', () => {
  it('connects the label and error description to its input', () => {
    render(
      <FormField label="Work email" required error="Enter a valid email address">
        <TextInput type="email" required />
      </FormField>,
    );

    const input = screen.getByLabelText('Work email *');
    const error = screen.getByRole('alert');
    expect(input).toHaveAttribute('id');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', error.id);
  });

  it('marks native browser validation failures as invalid', () => {
    render(
      <FormField label="Name" required>
        <TextInput required />
      </FormField>,
    );

    const input = screen.getByLabelText('Name *');
    fireEvent.invalid(input);
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });
});
