/**
 * Founder-only Wisdom Keepers gathering formats, fictional/static preview.
 * These are not actual meetings, video adapters, vendor settings, invitations,
 * calendar events or a source of authorization. All real service gates remain
 * separately closed in Stage G's delivery contract.
 */
export type WisdomGatheringPreviewMode = 'online' | 'hybrid';

export type WisdomGatheringPreview = Readonly<{
  id: WisdomGatheringPreviewMode;
  heading: string;
  status: string;
  description: string;
  promises: readonly Readonly<{heading:string;explanation:string}>[];
  boundary: string;
}>;

export const WISDOM_GATHERING_DELIVERY_PREVIEW: Readonly<Record<WisdomGatheringPreviewMode,WisdomGatheringPreview>> = {
  online:{
    id:'online',
    heading:'Begin together online',
    status:'First pilot · Proposed',
    description:'A small, private Wisdom Circle: the host welcomes each participant, makes room for silence, and leads an inquiry without recording or automatic AI interpretation.',
    promises:[
      {heading:'A human host', explanation:'A named facilitator holds welcome, participant choice and speaking boundaries, not a claim to interpret anyone’s life.'},
      {heading:'Private entry', explanation:'A meeting provider and access controls must be selected and tested; no join link or registration currently exists.'},
      {heading:'Optional presence', explanation:'Speak, listen, choose camera off, ask a question or pass—participation does not require personal disclosure.'},
      {heading:'Keep what is yours', explanation:'No planned recording, AI transcript, AIN ingestion, participation ranking or pressure to return.'},
    ],
    boundary:'Concept only. No video provider selected, no session created, and no invitation sent. A third-party provider’s actual privacy rules still need verification.',
  },
  hybrid:{
    id:'hybrid',
    heading:'Gather locally and remotely',
    status:'Later phase · Not active',
    description:'An in-person gathering with an equally invited remote circle—not a one-way livestream or a meeting that quietly records unwilling local participants.',
    promises:[
      {heading:'Two human stewards', explanation:'A local host holds the physical space; a remote advocate makes sure online voices and needs are not overlooked.'},
      {heading:'Equal contribution', explanation:'Remote members can be heard clearly, ask questions, decline a prompt or remain quietly present on equal terms.'},
      {heading:'Visible consent', explanation:'Every participant knows who can hear or see them; cameras, microphones and recordings follow agreed boundaries.'},
      {heading:'A tested bridge', explanation:'Room audio, echo control, camera framing, caption/accessibility plan, and fail-safe online fallback are verified before invitations.'},
    ],
    boundary:'Concept only. No venue, meeting, keeper host, streaming system, equipment setup or remote-attendance consent is active. Hybrid has a separate release gate.',
  },
};
