import React from 'react';
import { createRoot } from 'react-dom/client';
import RebuildStudioClient from '../../../app/writers-studio/rebuild/RebuildStudioClient';
import DevelopRoom from '../../../app/writers-studio/develop/DevelopRoom';
import '../../../app/writers-studio/rebuild/rebuild.css';
import { ATMOSPHERES, atmosphereVariables } from '../../../app/writers-studio/atmosphere/atmospheres';
Object.entries(atmosphereVariables(ATMOSPHERES.forest)).forEach(([key,value]) => document.body.style.setProperty(key,value));
const params = new URLSearchParams(location.search);
createRoot(document.getElementById('root')!).render(params.get('mode') === 'develop'
  ? <DevelopRoom manuscriptId="m1" requestedReadingId="r1" requestedSectionId="s0" />
  : <RebuildStudioClient />);
