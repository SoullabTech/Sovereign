const status = document.getElementById('status');
const check = document.getElementById('check');
const open = document.getElementById('open');
async function refresh() {
  check.disabled = true; open.disabled = true;
  check.textContent = 'Checking…';
  status.textContent = 'Checking your local workspace and models…';
  try {
    const result = await window.cabin.readiness();
    const time = new Date(result.observedAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit',second:'2-digit'});
    status.textContent = result.canOpen
      ? 'Workspace ready. Check completed at ' + time + '. You can open it below.'
      : 'Check completed at ' + time + '. The workspace needs attention. Close other Cabin test windows and check again.';
    document.getElementById('models').textContent = result.models === 'AVAILABLE'
      ? 'Local models are available on this Mac.' : 'Local model availability could not be verified.';
    open.disabled = !result.canOpen;
  } catch { status.textContent = 'Check failed: the local workspace could not start. Close other Cabin test windows and try again.'; }
  finally { check.disabled = false; check.textContent = 'Check readiness'; }
}
check.addEventListener('click', refresh);
open.addEventListener('click', async () => {
  open.disabled = true;
  try {
    const result = await window.cabin.open();
    status.textContent = result.opened ? 'Your local workspace is open.' : result.readiness.message;
    open.disabled = !result.readiness.canOpen;
  } catch { status.textContent = 'The local workspace could not open. Check readiness again.'; }
});
refresh();
