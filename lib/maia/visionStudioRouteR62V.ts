/**
 * Held-only structural repair: Next.js useSearchParams() can be null during
 * router hydration. Do not render a guessed author's Vision/Practice room or
 * navigate away while the requested phase/context has not resolved.
 *
 * Once resolved, preserve every query parameter and the existing tab choices,
 * including the exact opaque fieldContext; do not infer access or identity.
 */
export type VisionStudioTabR62V='vision'|'practice'|'living-field';
export type VisionStudioQueryR62V=
 | Readonly<{kind:'unresolved'}>
 | Readonly<{kind:'ready';tab:string;phase:string;fieldContext:string|undefined}>;

export function readVisionStudioQueryR62V(
 params:Pick<URLSearchParams,'get'|'toString'>|null,
):VisionStudioQueryR62V{
 if(params===null)return {kind:'unresolved'};
 return {
  kind:'ready',
  tab:params.get('tab')??'vision',
  phase:params.get('phase')??'fire_1',
  fieldContext:params.get('fieldContext')??undefined,
 };
}

export function nextVisionStudioTabR62V(
 params:Pick<URLSearchParams,'get'|'toString'>|null,
 tab:VisionStudioTabR62V,
):string|null{
 if(params===null)return null;
 if(tab==='living-field')return '/maia/living-field';
 const exact=new URLSearchParams(params.toString());
 exact.set('tab',tab);
 return '/maia/vision-studio?'+exact.toString();
}
