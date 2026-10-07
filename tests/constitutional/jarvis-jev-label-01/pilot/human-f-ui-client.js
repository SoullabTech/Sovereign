(() => {
  const QUESTIONS = ['Q_DEPTH', 'Q_RISK', 'Q_SUFFICIENT', 'Q_LLM_NEEDED'];
  const SECTION_ORDER = ['identity','custody','routing_request','context','scope','authority','evaluation','routing'];
  let state = null;
  let index = 0;
  let saving = false;

  const byId = (id) => document.getElementById(id);
  const escapeHtml = (s) => String(s)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

  async function api(path, options) {
    const res = await fetch(path, Object.assign({ credentials: 'same-origin' }, options || {}));
    const data = await res.json();
    if (!res.ok || !data.ok) {
      const err = new Error(data.detail || data.error || 'Request failed');
      err.code = data.error || null;
      err.status = res.status;
      throw err;
    }
    return data;
  }

  function renderCustody(c) {
    const el = byId('custody');
    if (!c) return;
    const short = (h) => (h ? h.slice(0, 12) : 'none yet');
    el.className = 'custody';
    el.textContent = 'DISK VERIFIED · ' + c.completed_cases_from_disk + ' of ' + c.total_cases +
      ' read back from disk · working file ' + short(c.working_sha256) + '… · rolling copy ' +
      (c.rolling_sha256 && c.rolling_sha256 === c.working_sha256 ? 'matches' : (c.working_exists ? 'MISSING' : 'n/a yet')) +
      ' · ' + c.generation_count + ' generation(s) · ledger event ' + c.event_seq +
      (c.repaired && c.repaired.length ? ' · repaired: ' + c.repaired.join(', ') : '') +
      ' · checked ' + new Date().toLocaleTimeString();
  }
  function custodyFailed(e) {
    const el = byId('custody');
    el.className = 'custody bad';
    el.textContent = 'DISK NOT VERIFIED — stop labelling and tell your assistant. ' + (e.code ? e.code + ': ' : '') + e.message;
  }
  async function pollCustody() {
    try { renderCustody((await api('/api/custody')).custody); }
    catch (e) { custodyFailed(e); }
  }

  function titleFor(k) {
    return k.replaceAll('_',' ').replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function formatValue(v) {
    if (v === null || v === undefined || v === '') return '<span class="stateEmpty">Not set</span>';
    if (Array.isArray(v)) {
      if (v.length === 0) return '<span class="stateEmpty">None</span>';
      return escapeHtml(v.map((x) => typeof x === 'object' ? JSON.stringify(x, null, 2) : String(x)).join('\n'));
    }
    if (typeof v === 'object') return escapeHtml(JSON.stringify(v, null, 2));
    return escapeHtml(String(v));
  }
  function renderFullState(full) {
    byId('fullState').innerHTML = SECTION_ORDER.map((section) => {
      const value = full[section];
      const rows = value && typeof value === 'object' && !Array.isArray(value)
        ? Object.entries(value).map(([k,v]) =>
            '<div class="stateRow"><div class="stateKey">' + escapeHtml(titleFor(k)) +
            '</div><div class="stateValue">' + formatValue(v) + '</div></div>'
          ).join('')
        : '<div class="stateRow"><div class="stateKey">Value</div><div class="stateValue">' +
          formatValue(value) + '</div></div>';
      return '<section class="stateSection"><h3>' + escapeHtml(titleFor(section)) +
        '</h3><div class="stateBody">' + rows + '</div></section>';
    }).join('');
  }

  function buildAmbiguityControls() {
    document.querySelectorAll('.ambiguity').forEach((host) => {
      const q = host.dataset.for;
      host.innerHTML =
        '<label class="ambigToggle"><input type="checkbox" data-ambiguous="' + q + '" />' +
        '<span>This judgment is ambiguous; I chose the nearest answer.</span></label>' +
        '<div class="noteWrap"><textarea data-note="' + q + '" maxlength="1200" ' +
        'placeholder="Optional note — stays only on this Mac and is never committed."></textarea></div>';
    });
  }

  function buildDepthChoices() {
    const bands = (state && state.depth_anchors && state.depth_anchors.bands) || {};
    byId('depthChoices').innerHTML = Object.entries(bands).map(([n,text]) =>
      '<label class="depthChoice"><input type="radio" name="Q_DEPTH" value="' + n + '" />' +
      '<span class="band">' + n + '</span><span class="anchor">' + escapeHtml(text) + '</span></label>'
    ).join('');
  }
  function parseValue(q, raw) {
    if (q === 'Q_DEPTH') return Number(raw);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return null;
  }

  function currentAnswers() {
    const answers = {};
    const labels = {
      Q_DEPTH: 'Question 1 — thinking depth',
      Q_RISK: 'Question 2 — extra caution',
      Q_SUFFICIENT: 'Question 3 — enough information',
      Q_LLM_NEEDED: 'Question 4 — needs an LLM'
    };
    for (const q of QUESTIONS) {
      const picked = document.querySelector('input[name="' + q + '"]:checked');
      if (!picked) {
        const err = new Error('Please answer ' + labels[q] + ' before saving.');
        err.questionId = q;
        throw err;
      }
      const value = parseValue(q, picked.value);
      if (value === null || value === 'UNDETERMINABLE') throw new Error('Invalid F answer');
      const ambiguous = document.querySelector('[data-ambiguous="' + q + '"]').checked;
      const noteRaw = document.querySelector('[data-note="' + q + '"]').value.trim();
      answers[q] = { value, ambiguous, note: noteRaw || null };
    }
    return answers;
  }

  function hasAnyDraft() {
    return QUESTIONS.some((q) =>
      document.querySelector('input[name="' + q + '"]:checked') ||
      document.querySelector('[data-ambiguous="' + q + '"]').checked ||
      document.querySelector('[data-note="' + q + '"]').value.trim()
    );
  }
  function loadAnswers(c) {
    for (const q of QUESTIONS) {
      document.querySelectorAll('input[name="' + q + '"]').forEach((x) => { x.checked = false; });
      const a = c.answers[q];
      const amb = document.querySelector('[data-ambiguous="' + q + '"]');
      const note = document.querySelector('[data-note="' + q + '"]');
      amb.checked = Boolean(a && a.ambiguous);
      note.value = (a && a.note) || '';
      if (a) {
        const raw = String(a.value);
        const radio = Array.from(document.querySelectorAll('input[name="' + q + '"]')).find((x) => x.value === raw);
        if (radio) radio.checked = true;
      }
    }
  }

  function showError(e) {
    byId('formError').textContent = e.message;
    byId('formError').hidden = false;
    if (e.questionId) {
      const section = document.querySelector('[data-q="' + e.questionId + '"]');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
        section.style.outline = '3px solid #b76a5f';
        setTimeout(() => { section.style.outline = ''; }, 1800);
      }
    }
  }

  function render() {
    const c = state.cases[index];
    if (!c) return showFinished();
    byId('finished').hidden = true;
    byId('caseForm').hidden = false;
    byId('caseLabel').textContent = 'Case ' + (index + 1) + ' of ' + state.total_cases;
    byId('completeLabel').textContent = state.completed_cases + ' of ' + state.total_cases + ' saved to disk';
    byId('progressBar').style.width = ((state.completed_cases / state.total_cases) * 100) + '%';
    renderFullState(c.full_state);
    loadAnswers(c);
    byId('prevBtn').disabled = index === 0;
    byId('nextBtn').textContent = index === state.total_cases - 1 ? 'Save & Finish' : 'Save & Next';
    byId('saveState').textContent = c.complete ? 'Saved to disk' : 'Not yet saved';
    byId('formError').hidden = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function saveCurrent() {
    if (saving) return false;
    const c = state.cases[index];
    let answers;
    try { answers = currentAnswers(); }
    catch (e) { showError(e); return false; }

    saving = true;
    byId('saveState').textContent = 'Saving…';
    byId('nextBtn').disabled = true;
    byId('prevBtn').disabled = true;
    try {
      const data = await api('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pilot_id: c.pilot_id, answers })
      });
      state = data.state;
      renderCustody(data.custody);
      byId('saveState').textContent = 'Saved to disk';
      byId('formError').hidden = true;
      return true;
    } catch (e) {
      if (e.status === 409) custodyFailed(e);
      byId('formError').textContent = 'Could not save: ' + e.message;
      byId('formError').hidden = false;
      byId('saveState').textContent = 'Not saved';
      return false;
    } finally {
      saving = false;
      byId('nextBtn').disabled = false;
      byId('prevBtn').disabled = index === 0;
    }
  }

  function showFinished() {
    byId('caseForm').hidden = true;
    byId('finished').hidden = false;
    byId('caseLabel').textContent = state.total_cases + ' of ' + state.total_cases;
    byId('completeLabel').textContent = state.completed_cases + ' of ' + state.total_cases + ' saved to disk';
    byId('progressBar').style.width = '100%';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  byId('caseForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!(await saveCurrent())) return;
    if (index >= state.total_cases - 1) showFinished();
    else { index += 1; render(); }
  });

  byId('prevBtn').addEventListener('click', async () => {
    if (index === 0 || saving) return;
    if (hasAnyDraft()) {
      try {
        currentAnswers();
        if (!(await saveCurrent())) return;
      } catch (e) {
        showError(e);
        return;
      }
    }
    index -= 1;
    render();
  });

  byId('reviewLastBtn').addEventListener('click', () => {
    index = state.total_cases - 1;
    render();
  });

  window.addEventListener('beforeunload', (e) => {
    const c = state && state.cases && state.cases[index];
    if (c && !c.complete && hasAnyDraft()) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  async function init() {
    buildAmbiguityControls();
    try {
      const data = await api('/api/state');
      state = data.state;
      renderCustody(data.custody);
      setInterval(pollCustody, 30000);
      buildDepthChoices();
      const firstIncomplete = state.cases.findIndex((c) => !c.complete);
      index = firstIncomplete >= 0 ? firstIncomplete : state.total_cases - 1;
      if (state.completed_cases === state.total_cases) showFinished();
      else render();
    } catch (e) {
      document.body.innerHTML = '<main class="shell"><section class="card"><h1>Couldn’t open the F pass</h1><p>' +
        escapeHtml(e.message) + '</p></section></main>';
    }
  }

  init();
})();
