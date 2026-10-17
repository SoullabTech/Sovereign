/**
 * Conventional Writer beta — the confirmed manuscript and ALL of its
 * mechanically sectioned bodies commit as one PostgreSQL transaction.
 *
 * This does not encrypt bytes, certify a file-vault arrival, or authorize an
 * author. The route must authenticate and validate the input before calling.
 * Source arrival claim remains a distinct, already-established custody act.
 */
import {transaction} from '@/lib/db/postgres';

export type ConfirmedSectionR63={
 readonly position:number;
 readonly heading:string|null;
 readonly body:string;
 readonly headingDepth:number|null;
 readonly headingSignal:string|null;
};

export async function persistConfirmedSectionsR63(input:{
 readonly verifiedMemberId:string;
 readonly title:string;
 readonly sections:readonly ConfirmedSectionR63[];
}):Promise<string>{
 if(!input.verifiedMemberId || !input.title || !input.sections.length){
  throw new Error('confirmed_import_scope_absent');
 }
 return transaction(async(tx)=>{
  const minted=await tx.query<{id:string}>(
   'INSERT INTO member_manuscripts (member_id, title) VALUES ($1, $2) RETURNING id',
   [input.verifiedMemberId,input.title],
  );
  const id=minted.rows[0]?.id;
  if(minted.rowCount!==1 || !id){
   throw new Error('confirmed_import_manuscript_unverified');
  }
  for(const section of input.sections){
   const inserted=await tx.query(
    `INSERT INTO manuscript_sections
       (manuscript_id, position, heading, body, heading_depth, heading_signal)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id,section.position,section.heading,section.body,
     section.headingDepth,section.headingSignal],
   );
   if(inserted.rowCount!==1){
    throw new Error('confirmed_import_section_unverified');
   }
  }
  // The actual transaction helper commits only if every awaited insert passed.
  return id;
 });
}
