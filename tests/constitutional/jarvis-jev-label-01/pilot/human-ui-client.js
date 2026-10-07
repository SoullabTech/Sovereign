(() => {
  const QUESTIONS = ['Q_DEPTH', 'Q_RISK', 'Q_SUFFICIENT', 'Q_LLM_NEEDED'];
  let state = null;
  let index = 0;
  let saving = false;

  const byId = (id) => document.getElementById(id);
  const yesNo = (v) => v === true ? 'Yes' : v === false ? 'No' : 'Not available';
  const taskLabel = (s) => {
    const map = {
      CODE_GROUNDED: 'Code-grounded',
      ARCHITECTURE_REASONING: 'Architecture reasoning',
      ADVERSARIAL_FALSIFICATION: 'Adversarial falsification',
      LONG_HORIZON_DECOMPOSITION: 'Long-horizon decomposition',
      EVIDENCE_SYNTHESIS: 'Evidence synthesis',
      FRONTIER_UNKNOWN: 'Frontier / unknown'
    };
    return map[s] || (s ? s.replaceAll('_', ' ').toLowerCase() : 'Not available');
  };
  const escapeHtml = (s) => String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');

  async function api(path, options) {
    const res = await fetch(path, Object.assign({ credentials: 'same-origin' }, options || {}));
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.detail || data.error || 'Request failed');
    return data;
  }

  function buildAmbiguityControls() {
    document.querySelectorAll('.ambiguity').forEach((host) => {
      const q = host.dataset.for;
      host.innerHTML =
        '<label class="ambigToggle"><input type="checkbox" data-ambiguous="' + q + '" />' +
        '<span>This judgment feels ambiguous or the wording doesn’t quite fit.</span></label>' +
        '<div class="noteWrap"><textarea data-note="' + q + '" maxlength="1200" ' +
        'placeholder="Optional note — stays only on this Mac and is never committed."></textarea></div>';
    });
  }

  function buildDepthChoices() {
    const bands = (state && state.depth_anchors && state.depth_anchors.bands) || {};
    byId('depthChoices').innerHTML = Object.entries(bands).map(([n, text]) =>
      '<label class="depthChoice"><input type="radio" name="Q_DEPTH" value="' + n + '" />' +
      '<span class="band">' + n + '</span><span class="anchor">' + escapeHtml(text) + '</span></label>'
    ).join('');
  }

  function parseValue(q, raw) {
    if (raw === 'UNDETERMINABLE') return raw;
    if (q === 'Q_DEPTH') return Number(raw);
    if (raw === 'true') return true;
    if (raw === 'false') return false;
    return null;
  }

  function currentAnswers(requireComplete) {
    const answers = {};
    for (const q of QUESTIONS) {
      const picked = document.querySelector('input[name="' + q + '"]:checked');
      if (!picked) {
        if (requireComplete) {
          const labels = {
            Q_DEPTH: 'Question 1 — thinking depth',
            Q_RISK: 'Question 2 — extra caution',
            Q_SUFFICIENT: 'Question 3 — enough information',
            Q_LLM_NEEDED: 'Question 4 — needs an LLM'
          };
          const err = new Error('Please answer ' + labels[q] + ' before saving.');
          err.questionId = q;
          throw err;
        }
        continue;
      }
      const value = parseValue(q, picked.value);
      if (value === null) throw new Error('Invalid answer');
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

  function showFinished() {
    byId('caseForm').hidden = true;
    byId('finished').hidden = false;
    byId('caseLabel').textContent = state.total_cases + ' of ' + state.total_cases;
    byId('completeLabel').textContent = state.completed_cases + ' of ' + state.total_cases + ' complete';
    byId('progressBar').style.width = '100%';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function render() {
    const c = state.cases[index];
    if (!c) return showFinished();
    byId('finished').hidden = true;
    byId('caseForm').hidden = false;
    byId('caseLabel').textContent = 'Case ' + (index + 1) + ' of ' + state.total_cases;
    byId('completeLabel').textContent = state.completed_cases + ' of ' + state.total_cases + ' complete';
    byId('progressBar').style.width = ((state.completed_cases / state.total_cases) * 100) + '%';

    byId('taskShape').textContent = taskLabel(c.packet.task_shape);
    byId('sensitive').textContent = yesNo(c.packet.contains_sensitive);
    byId('externalInfo').textContent = yesNo(c.packet.requires_external_info);
    const fc = c.packet.change_scope.file_count;
    byId('fileCount').textContent = fc === null ? 'Not available' : fc + ' declared path' + (fc === 1 ? '' : 's');
    byId('migration').textContent = yesNo(c.packet.change_scope.migration);
    byId('auth').textContent = yesNo(c.packet.change_scope.auth);
    byId('production').textContent = yesNo(c.packet.change_scope.production);

    loadAnswers(c);
    byId('prevBtn').disabled = index === 0;
    byId('nextBtn').textContent = index === state.total_cases - 1 ? 'Save & Finish' : 'Save & Next';
    byId('saveState').textContent = c.complete ? 'Saved' : 'Not yet saved';
    byId('formError').hidden = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function saveCurrent() {
    if (saving) return false;
    const c = state.cases[index];
    let answers;
    try {
      answers = currentAnswers(true);
    } catch (e) {
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
      return false;
    }
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
      byId('saveState').textContent = 'Saved';
      byId('formError').hidden = true;
      return true;
    } catch (e) {
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
        currentAnswers(true);
        if (!(await saveCurrent())) return;
      } catch {
        byId('formError').textContent = 'Finish all four questions on this case before going back.';
        byId('formError').hidden = false;
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
      buildDepthChoices();
      const firstIncomplete = state.cases.findIndex((c) => !c.complete);
      index = firstIncomplete >= 0 ? firstIncomplete : state.total_cases - 1;
      if (state.completed_cases === state.total_cases) showFinished();
      else render();
    } catch (e) {
      document.body.innerHTML = '<main class="shell"><section class="card"><h1>Couldn’t open the pilot</h1><p>' +
        escapeHtml(e.message) + '</p></section></main>';
    }
  }

  init();
})();
