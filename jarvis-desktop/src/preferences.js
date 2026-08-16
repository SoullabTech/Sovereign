// JARVIS Preferences — repository binding surface.
//
// Shows three separate facts and refuses to merge them, in the same spirit as
// provenance.js: WHICH repository is active, WHETHER it currently validates,
// and HOW it was reached. A founder needs the third to know whether the app is
// operating somewhere they chose or somewhere it guessed — a green "valid"
// badge on a checkout nobody named would be exactly the reassurance this
// project's provenance rules exist to prevent.

const el = (tag, cls, text) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
};

function row(key, valueNode) {
  const r = el('div', 'row');
  r.appendChild(el('span', 'k', key));
  const v = el('span', 'v');
  if (typeof valueNode === 'string') v.textContent = valueNode;
  else v.appendChild(valueNode);
  r.appendChild(v);
  return r;
}

// How the root was reached, in the founder's terms, plus whether that counts
// as a deliberate binding.
const RESOLUTION_COPY = {
  'explicit-config': ['CHOSEN', 'ok', 'You selected this repository; it is stored and reused on every launch.'],
  'explicit-env': ['ENV', 'ok', 'Bound by JARVIS_REPO_ROOT in the launching environment. Explicit, but it lasts only as long as that environment — choose it here to make it durable.'],
  'implicit-default': ['GUESSED', 'warn', 'Reached by a hard-coded fallback candidate. Nobody chose this checkout, so JARVIS reports it as degraded. Choose a repository to make the binding deliberate.'],
  'dev-walk': ['DEV WALK', 'warn', 'Development mode resolved this by walking up from the running source. The installed app does not use this path.'],
  'unresolved': ['NONE', 'bad', 'No substrate resolved. JARVIS cannot read Builder OS state or route work until a repository is chosen.'],
};

function render(state) {
  const main = document.getElementById('main');
  main.textContent = '';

  const card = el('div', 'card');

  card.appendChild(row('Active repository', state.active_repo_root || '— none —'));

  const validBadge = el('span', `badge ${state.valid ? 'ok' : 'bad'}`, state.valid ? 'VALID' : 'INVALID');
  card.appendChild(row('Status', validBadge));

  const [label, cls, explain] = RESOLUTION_COPY[state.resolution] || ['UNKNOWN', 'warn', state.resolution];
  card.appendChild(row('How it was set', el('span', `badge ${cls}`, label)));

  card.appendChild(row('Mode', state.mode));

  const note = el('p', 'note', explain);
  card.appendChild(note);

  if (state.problem) card.appendChild(el('p', 'problem', state.problem));

  const actions = el('div', 'actions');
  const choose = el('button', 'primary', 'Choose Repository…');
  choose.addEventListener('click', async () => {
    choose.disabled = true;
    try { const r = await window.jarvis.chooseRepo(); if (r && r.state) render(r.state); }
    finally { choose.disabled = false; }
  });
  actions.appendChild(choose);

  if (state.config_present) {
    const clear = el('button', null, 'Forget Saved Repository');
    clear.addEventListener('click', async () => {
      clear.disabled = true;
      try { render(await window.jarvis.clearRepo()); }
      finally { clear.disabled = false; }
    });
    actions.appendChild(clear);
  }
  card.appendChild(actions);
  main.appendChild(card);

  // Second card: where the setting physically lives, and what makes a folder
  // acceptable. Both are things a founder would otherwise have to read source
  // code to discover.
  const meta = el('div', 'card');
  meta.appendChild(row('Saved at', state.config_path));
  meta.appendChild(row('Saved value', state.config_present ? state.config_repo_root : '— nothing saved —'));
  if (state.config_present && state.config_set_at) {
    meta.appendChild(row('Saved on', `${state.config_set_at}${state.config_set_by ? ` · via ${state.config_set_by}` : ''}`));
  }
  const req = el('div');
  req.appendChild(el('span', 'k', 'A repository qualifies only if it contains all of:'));
  const ul = el('ul', 'markers');
  (state.markers || []).forEach((m) => ul.appendChild(el('li', null, m)));
  req.appendChild(ul);
  meta.appendChild(req);
  main.appendChild(meta);
}

(async () => {
  render(await window.jarvis.getRepoConfig());
  window.jarvis.onRepoChanged(render);
})();
