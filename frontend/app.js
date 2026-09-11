import { Signature, paths, exportSVG } from './signature.js';

const drawing = document.querySelector('#drawing');
const paper = document.querySelector('#paper');
const status = document.querySelector('#status');
const undo = document.querySelector('#undo');
const clear = document.querySelector('#clear');
const save = document.querySelector('#save');
const signature = new Signature();
const keys = new Set();
let pointer = null;
let saving = false;

function render(message) {
  drawing.innerHTML = `<g fill="none" stroke="#172b25" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">${paths(signature.strokes)}</g>`;
  document.querySelector('#placeholder').hidden = signature.strokes.length > 0;
  undo.disabled = clear.disabled = save.disabled = saving || signature.strokes.length === 0;
  paper.classList.toggle('recording', signature.active !== null);
  status.textContent = message ?? (signature.active ? 'Pen down · release to lift' : signature.strokes.length ? `${signature.strokes.length} stroke${signature.strokes.length === 1 ? '' : 's'} · hold any key to continue` : '');
}

function stop() { keys.clear(); signature.end(); render(); }
function position(event) {
  const rect = drawing.getBoundingClientRect();
  return {x: (event.clientX - rect.left) * 1000 / rect.width, y: (event.clientY - rect.top) * 400 / rect.height};
}
drawing.addEventListener('pointerenter', event => { pointer = position(event); });
drawing.addEventListener('pointermove', event => {
  pointer = position(event);
  if (saving || !keys.size) return;
  if (!signature.active) signature.begin(pointer);
  for (const sample of event.getCoalescedEvents?.() ?? [event]) signature.move(position(sample));
  signature.move(pointer);
  render();
});
drawing.addEventListener('pointerleave', () => { pointer = null; signature.end(); render(); });
drawing.addEventListener('pointercancel', () => { pointer = null; stop(); });
drawing.addEventListener('pointerdown', event => { event.preventDefault(); drawing.focus({preventScroll: true}); });
drawing.addEventListener('contextmenu', event => event.preventDefault());
window.addEventListener('keydown', event => {
  // Outside the paper, buttons retain normal keyboard activation and navigation.
  if (!pointer || saving) return;
  event.preventDefault();
  if (event.repeat || keys.has(event.code)) return;
  keys.add(event.code);
  if (!signature.active) signature.begin(pointer);
  render();
}, true);
window.addEventListener('keyup', event => {
  if (!keys.has(event.code)) return;
  event.preventDefault();
  keys.delete(event.code);
  if (!keys.size) signature.end();
  render();
}, true);
window.addEventListener('blur', () => { pointer = null; stop(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) { pointer = null; stop(); } });
window.addEventListener('resize', () => { pointer = null; stop(); });
undo.addEventListener('click', () => { stop(); signature.undo(); render(); });
clear.addEventListener('click', () => { stop(); signature.clear(); render(); });
save.addEventListener('click', async () => {
  stop();
  const svg = exportSVG(signature.strokes);
  saving = true;
  render('Choose where to save your signature…');
  let message;
  try {
    const { Call } = await import('/wails/runtime.js');
    const saved = await Call.ByName('main.SignatureService.SaveSVG', svg);
    message = saved ? 'Signature saved' : 'Save cancelled · your signature is still here';
  } catch (error) {
    message = `Could not save: ${error.message ?? error}`;
  } finally {
    saving = false;
    render(message);
  }
});
render();
