// @vitest-environment jsdom

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Button from '@/src/ui/components/button';

describe('Button', () => {
  it('renders its label and forwards the button type', () => {
    render(<Button label="Save quote" type="submit" />);
    expect(screen.getByRole('button', { name: 'Save quote' })).toHaveAttribute('type', 'submit');
  });

  it('is disabled when disabled is true', () => {
    render(<Button label="Save" disabled />);
    expect(screen.getByRole('button', { name: 'Save' })).toBeDisabled();
  });

  it('is disabled while loading', () => {
    render(<Button label="Please wait" isLoading />);
    expect(screen.getByRole('button', { name: 'Please wait' })).toBeDisabled();
  });

  it('combines the base class with a caller-provided class', () => {
    render(<Button label="Continue" className="custom-action" />);
    expect(screen.getByRole('button', { name: 'Continue' })).toHaveClass('btn', 'custom-action');
  });
});
