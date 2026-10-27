import { logger } from '@/src/lib/logger';
import { parseAPIError } from '@/src/utils/form-utils';
import { useState } from 'react';
import { ZodType, treeifyError } from 'zod';

interface UseApiProps {
  schema: ZodType;
  url: string;
  onSuccess: (data: unknown) => void;
}

type PayloadProps = Record<string, unknown>;
type FieldErrors = Record<string, string | undefined>;

export const useApi = ({ schema, url, onSuccess }: UseApiProps) => {
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function execute(payload: PayloadProps) {
    setFormError(null);

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      setErrors(parseAPIError(treeifyError(parsed.error)));
      return;
    }
    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        const fieldErrors = parseAPIError(body?.details);
        if (Object.keys(fieldErrors).length) {
          setErrors(fieldErrors);
        }
        setFormError(body.error ?? 'Something went wrong. Please try again.');
        return;
      }

      onSuccess(body);
    } catch (error) {
      logger.error('Error in useAPI', { error });
      setFormError('Could not reach the server. Check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return { errors, formError, isSubmitting, execute };
};
