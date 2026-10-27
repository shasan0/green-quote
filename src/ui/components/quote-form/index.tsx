'use client';

import { type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/src/ui/components/button';
import Field from '@/src/ui/components/field';
import { createQuoteSchema } from '@/src/lib/schemas';
import { useApi } from '../useApi';
import { URLS, ROUTES } from '@/src/lib/constants';
import { useFormErrorFocus } from '../useFormErrorFocus';

export default function QuoteForm({
  defaultName,
  defaultEmail,
}: {
  defaultName: string;
  defaultEmail: string;
}) {
  const router = useRouter();

  const { errors, formError, isSubmitting, execute } = useApi({
    url: URLS.CREATE_QUOTE,
    schema: createQuoteSchema,
    onSuccess: (body) => {
      const { quote } = body as { quote: { id: string } };
      router.push(`${ROUTES.VIEW_QUOTE}/${quote.id}`);
    },
  });

  const { resetFocusLock } = useFormErrorFocus(errors);

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFocusLock();

    const formData = new FormData(event.currentTarget);
    const payload = {
      fullName: formData.get('fullName'),
      email: formData.get('email'),
      address: formData.get('address'),
      monthlyConsumptionKw: formData.get('monthlyConsumptionKw'),
      systemSizeKw: formData.get('systemSizeKw'),
      downPayment: formData.get('downPayment'),
    };

    execute(payload);
  }

  return (
    <form className="form panel" onSubmit={onSubmit} noValidate aria-busy={isSubmitting}>
      {formError && (
        <p className="alert" role="alert">
          {formError}
        </p>
      )}
      <div className="form-grid">
        <Field
          type="text"
          label="Full name"
          id="fullName"
          name="fullName"
          defaultValue={defaultName}
          error={errors.fullName}
          required
        />
        <Field
          type="email"
          label="E-mail"
          id="email"
          name="email"
          defaultValue={defaultEmail}
          error={errors.email}
          required
        />
      </div>
      <Field
        type="text"
        label="Address"
        id="address"
        name="address"
        error={errors.address}
        required
      />
      <div className="form-grid">
        <Field
          type="number"
          label="Monthly Consumption Kw"
          id="monthlyConsumptionKw"
          name="monthlyConsumptionKw"
          error={errors.monthlyConsumptionKw}
          required
        />
        <Field
          type="number"
          label="System Size Kwh"
          id="systemSizeKw"
          name="systemSizeKw"
          error={errors.systemSizeKw}
          required
        />
        <Field
          type="number"
          label="Down Payment"
          id="downPayment"
          name="downPayment"
          error={errors.downPayment}
          required
        />
      </div>
      <div>
        <Button
          disabled={isSubmitting}
          label={isSubmitting ? 'Calculating…' : 'Get pre-qualification'}
          type="submit"
        />
      </div>
    </form>
  );
}
