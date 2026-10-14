const status = document.getElementById('status');
const check = document.getElementById('check');
const open = document.getElementById('open');
async function refresh() {
  check.disabled = true; open.disabled = true;
  try {
    const result = await window.cabin.readiness();
    status.textContent = result.canOpen
      ? 'Your local workspace is running. You can open it here.'
      : 'The local workspace is not running yet. Check that another Cabin instance is not already running.';
    document.getElementById('models').textContent = result.models === 'AVAILABLE'
      ? 'Local models are available on this Mac.' : 'Local model availability could not be verified.';
    open.disabled = !result.canOpen;
  } catch { status.textContent = 'The local runtime could not start. Close other Cabin test windows and try again.'; }
  finally { check.disabled = false; }
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
