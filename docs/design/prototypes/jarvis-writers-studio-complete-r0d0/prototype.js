const studio = document.querySelector('.studio');
const anchor = document.getElementById('inlineAnchor');
const selectable = document.getElementById('selectable');
const reviewDrawer = document.getElementById('reviewDrawer');
const related = document.getElementById('related');
const toast = document.getElementById('toast');

const templates = {
  conversation: document.getElementById('conversationTemplate'),
  alternatives: document.getElementById('alternativesTemplate'),
  context: document.getElementById('contextTemplate'),
  applied: document.getElementById('appliedTemplate'),
};

let state = 'manuscript';
let applied = false;
let originalText = selectable.textContent.trim();

function announce(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(announce.timer);
  announce.timer = setTimeout(() => { toast.hidden = true; }, 2400);
}

function clearInline() {
  anchor.replaceChildren();
  selectable.classList.remove('selected');
}
function mount(name) {
  clearInline();
  const tpl = templates[name];
  if (!tpl) return;
  selectable.classList.add('selected');
  anchor.append(tpl.content.cloneNode(true));
  state = name;
  studio.dataset.state = name;
  bindDynamic();
  anchor.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function setCandidatePreview(enabled = true) {
  if (!enabled) {
    selectable.innerHTML = originalText;
    return;
  }
  selectable.innerHTML =
    'To live developmentally is to notice that every return carries memory, consequence, and possibility. ' +
    'What once felt like repetition can become <del>recognition when we meet it with enough presence</del>' +
    '<ins>a place we recognize differently because we have changed while returning</ins>.';
}

function resetToManuscript() {
  clearInline();
  setCandidatePreview(false);
  state = 'manuscript';
  studio.dataset.state = state;
  reviewDrawer.hidden = true;
}

function showConversation() {
  reviewDrawer.hidden = true;
  mount('conversation');
}
function showAlternatives() {
  reviewDrawer.hidden = true;
  mount('alternatives');
}

function showContext() {
  setCandidatePreview(true);
  mount('context');
  selectable.classList.add('selected');
}

function applyCandidate() {
  applied = true;
  clearInline();
  selectable.innerHTML =
    'To live developmentally is to notice that every return carries memory, consequence, and possibility. ' +
    'What once felt like repetition can become <ins>a place we recognize differently because we have changed while returning</ins>.';
  selectable.classList.add('selected');
  anchor.append(templates.applied.content.cloneNode(true));
  state = 'applied';
  studio.dataset.state = state;
  bindDynamic();
  announce('Applied to this exact passage. Previous wording remains in history.');
}

function undoCandidate() {
  applied = false;
  resetToManuscript();
  selectable.classList.add('selected');
  announce('Undo restored the previous wording. The application remains in history.');
}
function showReview() {
  clearInline();
  setCandidatePreview(false);
  reviewDrawer.hidden = false;
  state = 'review';
  studio.dataset.state = state;
  document.querySelectorAll('.movements button').forEach(b => b.classList.remove('active'));
  document.querySelector('[data-action="review"]').classList.add('active');
}

function showRelated() {
  related.hidden = !related.hidden;
  if (!related.hidden) related.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function bindDynamic() {
  anchor.querySelectorAll('[data-action]').forEach(button => {
    button.addEventListener('click', handleAction);
  });
  anchor.querySelectorAll('[data-form="reply"]').forEach(form => {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const input = form.querySelector('input');
      if (input.value.trim()) {
        announce('Your reply stays in this passage conversation.');
        input.value = '';
      }
    });
  });
  anchor.querySelectorAll('.alt[data-alt]').forEach(button => {
    button.addEventListener('click', () => {
      anchor.querySelectorAll('.alt').forEach(x => x.classList.remove('active'));
      button.classList.add('active');
      announce(button.querySelector('strong').textContent + ' selected for comparison.');
    });
  });
}
function handleAction(event) {
  const action = event.currentTarget.dataset.action;
  switch (action) {
    case 'toggle-outline':
      studio.classList.toggle('outline-closed');
      break;
    case 'focus':
      studio.classList.toggle('focus');
      break;
    case 'ask':
      showConversation();
      break;
    case 'review':
      showReview();
      break;
    case 'close-review':
      reviewDrawer.hidden = true;
      resetToManuscript();
      break;
    case 'open-finding':
      reviewDrawer.hidden = true;
      selectable.scrollIntoView({ behavior: 'smooth', block: 'center' });
      selectable.classList.add('selected');
      setTimeout(showConversation, 350);
      break;
    case 'alternatives':
      showAlternatives();
      break;
    case 'context':
      showContext();
      break;
    case 'apply':
      applyCandidate();
      break;
    case 'undo':
      undoCandidate();
      break;
    case 'back-alt':
      setCandidatePreview(false);
      showAlternatives();
      break;
    case 'discuss':
      showConversation();
      announce('The proposal remains available while the conversation continues.');
      break;
    case 'keep':
      resetToManuscript();
      announce('Current wording kept. Nothing changed.');
      break;
    case 'why':
      announce('Reasoning opens as explanation, not as a second workspace.');
      break;
    case 'learn':
      announce('Teaching stays tied to this exact passage and does not rewrite it.');
      break;
    case 'related':
      showRelated();
      break;
    case 'history':
    case 'versions':
      announce('History is on demand. The manuscript stays in place.');
      break;
    case 'sources':
      announce('Sources remain supporting material, not manuscript.');
      break;
    case 'listen':
      announce('Prototype: MAIA voice control would start here.');
      break;
    case 'close-card':
      resetToManuscript();
      break;
  }
}

document.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('click', handleAction);
});

selectable.addEventListener('click', showConversation);
selectable.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    showConversation();
  }
});

document.querySelectorAll('[data-jump]').forEach(button => {
  button.addEventListener('click', () => {
    const jump = button.dataset.jump;
    document.querySelectorAll('.movements button').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-movement="work"]').classList.add('active');
    if (jump === 'manuscript') resetToManuscript();
    if (jump === 'conversation') showConversation();
    if (jump === 'alternatives') showAlternatives();
    if (jump === 'review') showReview();
  });
});

document.querySelectorAll('.outline-row').forEach(row => {
  row.addEventListener('click', () => {
    document.querySelectorAll('.outline-row').forEach(r => r.classList.remove('active'));
    row.classList.add('active');
    announce('Same manuscript, new authored place.');
  });
});

if (window.matchMedia('(max-width: 900px)').matches) {
  studio.classList.add('outline-closed');
}

const requestedState = new URLSearchParams(window.location.search).get('state');
if (requestedState === 'conversation') showConversation();
if (requestedState === 'alternatives') showAlternatives();
if (requestedState === 'context') showContext();
if (requestedState === 'applied') {
  showContext();
  applyCandidate();
}
if (requestedState === 'review') showReview();
if (requestedState === 'related') showRelated();
