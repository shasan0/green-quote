import { useEffect, useRef } from 'react';

export function useFormErrorFocus(fieldErrors: Record<string, string | string[] | undefined>) {
  const hasFocusedError = useRef(false);

  useEffect(() => {
    const errorKeys = Object.keys(fieldErrors);

    if (errorKeys.length === 0) {
      hasFocusedError.current = false;
      return;
    }

    if (!hasFocusedError.current) {
      const element = document.querySelector<HTMLElement>('[aria-invalid="true"]');

      if (element) {
        element.focus();
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        hasFocusedError.current = true;
      }
    }
  }, [fieldErrors]);

  const resetFocusLock = () => {
    hasFocusedError.current = false;
  };

  return { resetFocusLock };
}
