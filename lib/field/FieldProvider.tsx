'use client';

import { createContext, useContext } from 'react';
import type { PractitionerField } from './types';

const FieldContext = createContext<PractitionerField | null>(null);

export function FieldProvider({
  field,
  children,
}: {
  field: PractitionerField;
  children: React.ReactNode;
}) {
  return <FieldContext.Provider value={field}>{children}</FieldContext.Provider>;
}

export function useField(): PractitionerField {
  const ctx = useContext(FieldContext);
  if (!ctx) throw new Error('useField must be used within FieldProvider');
  return ctx;
}
