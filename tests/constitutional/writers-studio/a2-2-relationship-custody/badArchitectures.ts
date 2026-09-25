import type { CustodyDesign } from './model';
import { referenceDesign } from './design';

function clone(): CustodyDesign { return structuredClone(referenceDesign()); }

function askThreadParent(): CustodyDesign {
  const d:any=clone();
  d.parentIdentitySource='ASK_THREAD_ID';
  d.pluralityRepresentable=false;
  d.storesLivingWorkId=false;
  d.bindingProof='MANUSCRIPT_ONLY';
  d.appendReverifiesCurrentDeclaration=false;
  d.parentStoresChildResponseProse=true;
  d.childReferenceShape='GENERIC_CHILD_ID';
  d.exactlyOneChildKind=false;
  d.editorialGranularity='WHOLE_THREAD';
  d.reviewGranularity='WHOLE_THREAD';
  d.parentOrder='CHILD_TURN_INDEX';
  d.concurrentAppend='AMBIGUOUS';
  d.relationshipMembershipImpliesCognitionCarry=true;
  d.readProjection='FLATTENED_TRANSCRIPT';
  d.reusesAskThreadsAsParent=true;
  return d;
}

function genericGraph(): CustodyDesign {
  const d:any=clone();
  d.parentIdentitySource='GENERIC_GRAPH_NODE';
  d.bindingProof='CLIENT_ASSERTED_IDS';
  d.childReferenceShape='OPTIONAL_EVERYTHING';
  d.exactlyOneChildKind=false;
  d.parentOrder='CREATED_AT';
  d.concurrentAppend='AMBIGUOUS';
  d.childReferenceMutable=true;
  d.browserSuppliedIdsTrustedForOwnership=true;
  d.readProjection='CONTENT_FREE_RELATIONSHIP_INDEX';
  return d;
}

function sessionParent(): CustodyDesign {
  const d:any=clone();
  d.parentIdentitySource='SESSION_ID';
  d.storesLivingWorkId=false;
  d.bindingProof='CLIENT_ASSERTED_IDS';
  d.parentStoresChildResponseProse=true;
  d.parentGrantsCognition=true;
  d.childReferenceShape='GENERIC_CHILD_ID';
  d.exactlyOneChildKind=false;
  d.focusGranularity='SESSION';
  d.editorialGranularity='SESSION';
  d.reviewGranularity='SESSION';
  d.parentOrder='CHILD_TURN_INDEX';
  d.concurrentAppend='LAST_WRITE_WINS';
  d.parentGrantsPersonalMemory=true;
  d.browserSuppliedIdsTrustedForOwnership=true;
  return d;
}

export const ASK_THREAD_AS_PARENT = askThreadParent();
export const GENERIC_EVENT_GRAPH = genericGraph();
export const SESSION_AS_PARENT = sessionParent();
