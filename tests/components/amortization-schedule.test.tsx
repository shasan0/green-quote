// @vitest-environment jsdom

import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { AmortizationSchedule } from '@/src/ui/components/amortization-schedule';
import type { Offer } from '@/src/lib/pricing';

const offers: Offer[] = [
  { termYears: 5, apr: 6.9, principalUsed: 5000, monthlyPayment: 98.75 },
  { termYears: 10, apr: 6.9, principalUsed: 5000, monthlyPayment: 57.8 },
];

describe('AmortizationSchedule', () => {
  it('renders no content when no offers are supplied', () => {
    const { container } = render(<AmortizationSchedule offers={[]} currency="USD" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the first offer by default with an accessible schedule table', () => {
    render(<AmortizationSchedule offers={offers} currency="USD" />);
    expect(screen.getByText('Amortization schedule')).toBeInTheDocument();
    expect(screen.getByLabelText('Loan term')).toHaveValue('5');
    expect(screen.getByRole('region', { name: 'Amortization schedule table' })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Month' })).toBeInTheDocument();
    expect(screen.getByText(/Total interest over 5 years/)).toBeInTheDocument();
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
  });

  it('updates the selected offer and schedule when the term changes', async () => {
    const user = userEvent.setup();
    render(<AmortizationSchedule offers={offers} currency="USD" />);

    const loanTermSelectors = screen.getAllByLabelText('Loan term');
    await user.selectOptions(loanTermSelectors[0], '10');

    expect(loanTermSelectors[0]).toHaveValue('10');
    expect(screen.getByText(/Total interest over 10 years/)).toBeInTheDocument();
  });
});
