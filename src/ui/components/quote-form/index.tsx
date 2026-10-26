import { type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/src/ui/components/button';
import Input from '@/src/ui/components/input';
import { createQuoteSchema } from '@/src/lib/schemas';
import { useApi } from '../useApi';
import { URLS, ROUTES } from '@/src/lib/constants';
import { useFormErrorFocus } from '../useFormErrorFocus';

export default function QuoteForm() {
    const router = useRouter();

    const { errors, formError, isSubmitting, execute } = useApi({
        url: URLS.CREATE_QUOTE,
        schema: createQuoteSchema,
        onSuccess: (body) => {
            const { data } = body as { data: { id: string } };
            router.push(`${ROUTES.VIEW_QUOTE}/${data.id}`);
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
            downPayment: formData.get('downPayment')
        }

        execute(payload);
    }

    return (
        <form onSubmit={onSubmit}>
            {formError && (
                <p>{formError}</p>
            )}
            <Input
                type='text'
                label='Full name'
                id='fullName'
                name='fullName'
                error={errors.fullName}
                required
            />
            <Input
                type='email'
                label='E-mail'
                id='email'
                name='email'
                error={errors.email}
                required
            />
            <Input
                type='text'
                label='Address'
                id='address'
                name='address'
                error={errors.address}
                required
            />
            <Input
                type='number'
                label='Monthly Consumption Kwh'
                id='monthlyConsumptionKw'
                name='monthlyConsumptionKw'
                error={errors.monthlyConsumptionKw}
                required
            />
            <Input
                type='number'
                label='System Size Kwh'
                id='systemSizeKw'
                name='systemSizeKw'
                error={errors.systemSizeKw}
                required
            />
            <Input
                type='number'
                label='Down Payment'
                id='downPayment'
                name='downPayment'
                error={errors.downPayment}
                required
            />
            <Button
                disabled={isSubmitting}
                label={isSubmitting ? 'Calculating…' : 'Get pre-qualification'}
                type='submit'
            />
        </form>
    )
}