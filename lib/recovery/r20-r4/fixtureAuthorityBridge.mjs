/**
 * R20-R4 isolated signer -> existing R3I restore-publication fence.
 *
 * Caller must supply an independently authenticated outbox census and
 * authorized proof signer. A fixture callback does NOT certify that these
 * are independent in production. No actual archive, vault or database I/O.
 */
import { callFixtureSigner } from './fixtureSignerClient.mjs';
const SHA=/^[0-9a-f]{64}$/;
const refuse=reason=>{throw Error('R20-R4 authority bridge refused: '+reason);};

export function createFictionalAuthorityReader({
  root, captureRegistry, locations, keys,
  getCommittedOutbox, mintAuthorizedProofClaim,
}) {
  if(!root || !captureRegistry || !locations || !keys ||
    typeof getCommittedOutbox!=='function' ||
    typeof mintAuthorizedProofClaim!=='function') {
    refuse('missing separately governed fixture authority readers');
  }
  return async function readCurrentAuthorityInputs(){
    // Never silently trust local DB or backup-embedded deletion ledgers.
    // Caller must provide a genuinely current committed-outbox census.
    const knownOutbox=await getCommittedOutbox();
    if(!Array.isArray(knownOutbox) || knownOutbox.length===0)
      refuse('complete current committed outbox unavailable');
    const claim=await mintAuthorizedProofClaim(knownOutbox.length);
    if(!claim || typeof claim!=='object')
      refuse('explicit signed proof authorization missing');
    let proof;
    try{
      proof=await callFixtureSigner({
        root,
        request:{
          action:'READ_FICTIONAL_PROOF',
          fixtureOnly:true,
          claim,
        },
      });
    }catch{
      refuse('fixture signing authority unavailable');
    }
    if(proof.status!=='FICTIONAL_SIGNED_RECOVERY_PROOF' ||
      proof.productionPromotionAllowed!==false ||
      proof.physicallyIndependentSignerCertified!==false ||
      !Number.isSafeInteger(proof.signedSequence) ||
      proof.signedSequence<knownOutbox.length ||
      !SHA.test(proof.signedHeadDigest||'') ||
      !proof.sealedLedger || !proof.sealedHead || !proof.sealedPin) {
      refuse('signed proof lacks pinned current authority');
    }
    return {
      captureRegistry,locations,keys,
      completeCommittedOutbox:knownOutbox,
      transport:{
        getLedger:async()=>proof.sealedLedger,
        getHead:async()=>proof.sealedHead,
        getPin:async()=>proof.sealedPin,
      },
    };
  };
}
