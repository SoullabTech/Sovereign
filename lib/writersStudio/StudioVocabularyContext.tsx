'use client';
/**
 * The words the Studio speaks with for the Work on screen (founder rulings 2026-11-20). Provided by the room from the Work's own
 * program or form; the default is neutral, so a surface outside any provider never says "book" or "chapter" by assumption.
 */
import { createContext, useContext } from 'react';
import { formVocabulary, type FormVocabulary } from './formVocabulary';

const StudioVocabularyContext = createContext<FormVocabulary>(formVocabulary(null));
export const StudioVocabularyProvider = StudioVocabularyContext.Provider;
export function useStudioVocabulary(): FormVocabulary { return useContext(StudioVocabularyContext); }
