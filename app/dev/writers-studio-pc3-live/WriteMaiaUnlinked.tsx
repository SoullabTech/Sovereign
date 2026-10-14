'use client';

/**
 * An unresolved Work is not permission to create or infer one. The panel is
 * still a real, resizable region and offers the existing explicit Home flow.
 * This component does not read a conversation, disclose text, or write data.
 */
export function WriteMaiaUnlinked({ onChooseWork }: { onChooseWork: () => void }) {
  return (
    <div className="fr-maia-inner p4r1-write-maia" data-write-maia-unlinked>
      <div className="fr-maia-head">
        <div className="fr-orb" aria-hidden="true" />
        <div className="fr-maia-name">
          <h2>MAIA</h2>
          <span>Alongside your writing</span>
        </div>
      </div>
      <div className="fr-mbody">
        <div className="fr-say" role="status">
          <h3>Choose the Work for this writing</h3>
          <p>
            A Work has not been resolved for this manuscript. In Studio Home,
            you can make this writing a Work or add it to a Work you already have.
          </p>
          <p>Your manuscript stays unchanged. Nothing is sent to MAIA by opening this panel.</p>
        </div>
        <button type="button" className="p4r1-talk" onClick={onChooseWork}>
          Choose a Work in Home
        </button>
      </div>
      <div className="fr-foot">You decide where this writing belongs.</div>
    </div>
  );
}
