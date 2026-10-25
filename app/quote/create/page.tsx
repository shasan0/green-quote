'use client';

import { useState, type SubmitEvent } from 'react';
import Button from '@/src/ui/components/button';
import Input from '@/src/ui/components/input';

export default function CreateQuote() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    async function onSubmit(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        try {
            const formData = new FormData(event.currentTarget);
            console.log(Object.fromEntries(formData.entries()));
            const payload = {
                fullName: formData.get('fullName'),
                email: formData.get('email'),
                address: formData.get('address'),
                monthlyConsumptionKw: formData.get('monthlyConsumptionKw'),
                systemSizeKw: formData.get('systemSizeKw'),
                downPayment: formData.get('downPayment')
            }
            const response = await fetch('/api/quotes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) throw new Error('Submission failed');

        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }

    }

    return (
        <main>
            <form onSubmit={onSubmit}>
                <Input
                    type='text'
                    label='Full name'
                    id='fullName'
                    name='fullName'
                    required
                />
                <Input
                    type='email'
                    label='E-mail'
                    id='email'
                    name='email'
                    required
                />
                <Input
                    type='text'
                    label='Address'
                    id='address'
                    name='address'
                    required
                />
                <Input
                    type='number'
                    label='Monthly Consumption Kwh'
                    id='monthlyConsumptionKw'
                    name='monthlyConsumptionKw'
                    required
                />
                <Input
                    type='number'
                    label='System Size Kwh'
                    id='systemSizeKw'
                    name='systemSizeKw'
                    required
                />
                <Input
                    type='number'
                    label='Down Payment'
                    id='downPayment'
                    name='downPayment'
                    required
                />
                <Button
                    label='Submit'
                    type='submit'
                />
            </form>
        </main>
    )
}
