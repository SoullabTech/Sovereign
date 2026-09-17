const { chromium, webkit } = require('playwright');
const { createServer } = require('http');
const fs = require('fs');
const path = require('path');
const { createHash } = require('crypto');
const assert = require('assert/strict');
const out = process.env.WS_INSIGHT_WITNESS_DIR || '/tmp/ws-insight-witness';
const results = [];
const hash = s => createHash('sha256').update(s).digest('hex');
const makeState = () => {
  const sections = ['The fire as encounter.', 'The fire as understanding.', 'The fire as practice.'].map((text, i) => ({
    draftSectionId: 's' + i, sourceSectionId: null, position: i,
    heading: i === 0 ? 'Chapter 1: Fire' : i === 1 ? 'Understanding the fire' : 'Practicing the fire',
    headingDepth: i === 0 ? 1 : 2, headingSignal: 'explicit', editable: true,
    body: text + '\n\n' + ('A reader brings their own experience to this image.\n\n').repeat(8),
  }));
  const context = { state: 'section_aware', manuscriptId: 'm1', title: 'Fire Stories', version: 1, sections, updatedAt: '2026-09-17T00:00:00Z' };
  const thread = { threadId: 't1', chainId: 'c1', locusText: sections[0].body, targetSectionId: 's0', sectionLabel: sections[0].heading,
    legacyLocus: false, turns: [{ turnIndex: 0, speaker: 'maia', body: 'One possibility is to make the invitation more concrete.', at: '2026-09-17T00:00:00Z' }],
    versions: [{ id: 'v1', author: 'maia', wording: 'The fire as a lived encounter.', supersedes: null, rationale: null }], headVersionId: 'v1' };
  const reading = { id: 'r1', manuscriptId: 'm1', outcome: 'reading',
    scope: { commissionedLens: 'development', bodyScope: ['s0','s1','s2'], withStructure: false },
    readState: { draftId: 'd1', revisionNumber: 1, revisionDigest: 'fixture', inputFingerprint: 'fixture', sectionTopology: ['s0','s1','s2'],
      sections: Object.fromEntries(sections.map(s => [s.draftSectionId, { revisionNumber: 1, range: { start: 0, end: Array.from(s.body).length }, digest: hash(s.body) }])) },
    coverage: { sections: { s0: 'body', s1: 'body', s2: 'body' } },
    provenance: { frozenAt: '2026-09-17T00:00:00Z', reader: { model: 'controlled', readerVersion: 'test' } },
    observations: [{ key: 'o1', lens: 'development', phenomenon: 'recurrence', observation: 'The fire story returns in three sections.',
      evidenceRefs: sections.map(s => ({ kind: 'passage', sectionId: s.draftSectionId, range: { start: 0, end: Array.from(s.body.split('\n')[0]).length } })),
      doesNotEstablish: ['across-unread-span'], structureDependency: { kind: 'independent' } }],
  };
  return { context, thread, reading, writes: [], conflict: false, purpose: 'Keep the lived fire and the depth of its meaning.' };
};
const server = createServer((req, res) => {
  const file = req.url.split('?')[0] === '/app.js' ? 'app.js' : req.url.split('?')[0] === '/app.css' ? 'app.css' : 'index.html';
  res.setHeader('content-type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html');
  res.end(fs.readFileSync(path.join(out, file)));
});
async function routeApi(page, state) {
  await page.route('**/api/**', async route => {
    const req = route.request(), u = new URL(req.url()), method = req.method();
    const data = method === 'GET' ? null : req.postDataJSON();
    const respond = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
    if (method !== 'GET') state.writes.push({ path: u.pathname, data });
    if (u.pathname === '/api/writers-studio/rebuild/context') return respond(state.context);
    if (u.pathname === '/api/sovereign/manuscripts') return respond({ manuscripts: [{ id: 'm1', title: 'Fire Stories' }] });
    if (u.pathname === '/api/sovereign/living-works') return respond({ works: [{
      id: 'w1', title: 'Fire Stories', purpose: state.purpose, form: 'Book', stage: 'writing',
      createdAt: '2026-09-17T00:00:00Z', updatedAt: '2026-09-17T00:00:00Z',
      expressions: [{ expressionType: 'manuscript', expressionId: 'm1' }], materials: [],
    }] });
    if (u.pathname === '/api/sovereign/living-works/w1' && method === 'PATCH') { state.purpose = data.purpose; return respond({ work: { id: 'w1', purpose: state.purpose } }); }
    if (u.pathname === '/api/sovereign/keeps') return respond({ keeps: [{ id: 'k1', verbatimText: 'Let the fire illuminate rather than consume.', manuscriptId: 'm1', manuscriptTitle: 'Fire Stories', sectionHeading: 'Opening', createdAt: '2026-09-17T00:00:00Z' }] });
    if (u.pathname === '/api/writers-studio/sources') return respond({ sources: [] });
    if (u.pathname.endsWith('/chapter-reviews')) return respond({ run: null });
    if (u.pathname.endsWith('/structure')) return respond({ manuscriptId: 'm1', units: [], roots: [] });
    if (u.pathname.endsWith('/standings')) return respond({ standings: [] });
    if (u.pathname.endsWith('/preparation')) return respond({ kind: 'ready' });
    if (u.pathname.endsWith('/readings')) return respond({ readings: [{ id: 'r1', outcome: 'reading', lens: 'development', frozenAt: '2026-09-17T00:00:00Z', observationCount: 1 }] });
    if (u.pathname.endsWith('/readings/r1')) return respond({ reading: state.reading,
      assessment: { reading: { state: 'current' }, observations: { o1: { state: 'current' } } },
      sections: state.context.sections.map(s => ({ id: s.draftSectionId, heading: s.heading })) });
    if (u.pathname === '/api/writers-studio/editorial/thread') return respond(state.thread);
    if (u.pathname === '/api/writers-studio/editorial/version') {
      if (state.conflict) return respond({ error: 'not_successor_of_head' }, 409);
      const version = { id: 'v' + (state.thread.versions.length + 1), author: 'member', wording: data.replacementText, supersedes: data.supersedes, rationale: null };
      state.thread.versions.push(version); state.thread.headVersionId = version.id;
      return respond({ versionId: version.id, supersedes: version.supersedes }, 201);
    }
    if (u.pathname === '/api/writers-studio/editorial/adoption') {
      const v = state.thread.versions.find(v => v.id === data.versionId);
      state.context.sections[0].body = v.wording; state.context.version++;
      return respond({ kind: 'applied', versionId: v.id });
    }
    return respond({ error: 'controlled endpoint unavailable' }, 404);
  });
}
async function run(browserType, name, base) {
  const browser = await browserType.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = []; page.on('pageerror', e => errors.push(e.message));
  const state = makeState();
  await routeApi(page, state);
  try {
    await page.goto(base + '/?m=m1&s=s0&editorialThread=t1');
    await page.locator('[data-write-work-on-canvas]').waitFor();
    await page.locator('[data-suggested-revision]').waitFor();
    const scroll = page.locator('[data-manuscript-scroll]');
    await scroll.evaluate(el => { el.scrollTop = 160; });
    const priorScroll = await scroll.evaluate(el => el.scrollTop);
    await page.locator('[data-write-work-on-canvas]').click();
    const desk = page.locator('dialog[open]');
    await desk.waitFor();
    assert.equal(state.writes.length, 0);
    await desk.getByRole('button', { name: 'Show additions and removals' }).click();
    assert.ok(await desk.locator('del').count());
    assert.ok(await desk.locator('ins').count());
    await desk.getByRole('button', { name: 'Adjust this wording' }).click();
    await desk.getByLabel('Your working revision').fill('The fire becomes a practice the reader can enter.');
    await desk.getByRole('button', { name: 'Return to manuscript' }).click();
    assert.equal(await scroll.evaluate(el => el.scrollTop), priorScroll);
    await page.locator('[data-write-work-on-canvas]').click();
    assert.equal(await desk.getByLabel('Your working revision').inputValue(), 'The fire becomes a practice the reader can enter.');
    assert.equal(state.writes.length, 0);
    await desk.getByRole('button', { name: 'Save your revision as a version' }).click();
    await desk.getByRole('button', { name: 'Apply your saved revision' }).waitFor();
    assert.deepEqual(state.writes[0].data, { threadId: 't1', supersedes: 'v1', replacementText: 'The fire becomes a practice the reader can enter.' });
    assert.equal(state.writes.length, 1);
    const otherBody = state.context.sections[1].body;
    await desk.getByRole('button', { name: 'Apply your saved revision' }).click();
    await desk.getByText('Applied to this exact place in the Work.').waitFor();
    assert.equal(state.context.sections[0].body, 'The fire becomes a practice the reader can enter.');
    assert.equal(state.context.sections[1].body, otherBody);
    assert.equal(state.writes[1].data.versionId, 'v2');
    console.log('Completed checkpoint', name, state.writes.length); results.push(name + ': compare, explicit member version, exact adoption, return scroll, no writes on expansion PASS');
    // Conflict never retargets or discards the writer's words.
    await desk.getByRole('button', { name: 'Adjust this wording' }).click();
    await desk.getByLabel('Your working revision').fill('Keep this draft through a conflict.');
    state.conflict = true;
    await desk.getByRole('button', { name: 'Save your revision as a version' }).click();
    await desk.getByText(/This conversation gained another version/).waitFor();
    assert.equal(await desk.getByLabel('Your working revision').inputValue(), 'Keep this draft through a conflict.');
    assert.equal(state.writes.at(-1).data.supersedes, 'v2');
    await desk.getByRole('button', { name: 'Discard working revision' }).click();
    // Persistent member-authored inspiration and selected source-bound gold line.
    await desk.getByText('Inspiration & intention · held with this Work', { exact: true }).click();
    await desk.getByRole('button', { name: 'Edit your statement' }).click();
    await desk.getByLabel('Your Work statement').fill('My fire is discovery; my water is meaning.');
    await desk.getByRole('button', { name: 'Save inspiration & intention' }).click();
    await desk.getByText('Saved as your Work’s statement of inspiration and intention.').waitFor();
    assert.equal(state.purpose, 'My fire is discovery; my water is meaning.');
    const writesBeforeBring = state.writes.length;
    await desk.getByRole('button', { name: 'Bring this into my question' }).click();
    assert.ok((await desk.getByLabel('Explore an approach with MAIA').inputValue()).includes(state.purpose));
    assert.equal(state.writes.length, writesBeforeBring);
    await desk.locator('[data-studio-gold-line] summary').click();
    await desk.getByLabel('Gold line to hold nearby').selectOption('k1');
    assert.equal(await desk.locator('blockquote').innerText(), 'Let the fire illuminate rather than consume.');
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(await desk.evaluate(el => el.scrollWidth <= el.clientWidth + 1), true);
    await page.screenshot({ path: path.join(out, name + '-mobile.png') });
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('dialog[open]').count(), 0);
    console.log('Completed checkpoint', name, state.writes.length); results.push(name + ': conflict preserves predecessor/draft; inspiration opt-in; gold source; mobile and Escape PASS');
    // A fresh page opens actual DevelopRoom and verifies all three passages.
    await page.close();
    const develop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    develop.on('pageerror', e => errors.push(e.message));
    const clean = makeState(); await routeApi(develop, clean);
    await develop.goto(base + '/?mode=develop&m=m1&s=s0&r=r1');
    await develop.locator('[data-observation-work-on-canvas="o1"]').click({timeout:10000}).catch(async e => { console.error('Develop errors', errors, (await develop.locator('body').innerText()).slice(0,2000)); await develop.screenshot({path:path.join(out,name+'-develop-error.png')}); throw e; });
    const layer = develop.locator('dialog[open]');
    await layer.locator('.wsi-passage').first().waitFor();
    assert.equal(await layer.locator('.wsi-passage').count(), 3);
    assert.equal(await layer.locator('mark').count(), 3);
    assert.equal(clean.writes.length, 0);
    await layer.getByRole('slider').fill('0');
    assert.equal(await layer.locator('mark').first().innerText(), 'The fire as encounter.');
    await layer.getByLabel('Evidence markers').uncheck();
    assert.equal(await layer.locator('mark').count(), 0);
    await develop.screenshot({ path: path.join(out, name + '-develop.png') });
    const href = await layer.getByRole('link', { name: 'Revise this passage in Write' }).first().getAttribute('href');
    assert.equal(new URL(href, base).searchParams.get('s'), 's0');
    assert.deepEqual(errors, []);
    console.log('Completed checkpoint', name, state.writes.length); results.push(name + ': actual DevelopRoom opens three exact passages; context/markers/identity handoff PASS');
    await layer.getByRole('link', { name: 'Revise this passage in Write' }).nth(1).click();
    const continued = develop.locator('dialog[open]');
    await continued.locator('.wsi-passage').nth(2).waitFor();
    await continued.locator('.wsi-passage').nth(2).getByRole('button', {name:'Revise this passage'}).click();
    await continued.locator('[data-revision-desk] h3').filter({hasText:'Practicing the fire'}).waitFor();
    assert.equal(clean.writes.length, 0);
    await continued.getByRole('button', {name:'Return to manuscript'}).click();
    assert.equal(new URL(develop.url()).searchParams.get('s'), 's1');
    assert.equal(clean.writes.length, 0);
    results.push(name + ': Develop-to-Write handoff, different related passage, and original-place restoration PASS');
    await develop.close();
  } finally { await browser.close(); }
}
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = 'http://127.0.0.1:' + server.address().port;
  try {
    await run(chromium, 'chromium', base);
    await run(webkit, 'webkit', base);
    fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify(results, null, 2));
    console.log(results.join('\n'));
  } finally { server.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
