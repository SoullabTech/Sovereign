"""Chromium in-memory regression for Build 02 portable proof; no network access."""
from pathlib import Path
from playwright.sync_api import sync_playwright
SOURCE=Path(__file__).resolve().parents[3]/'Soullab_Listening_Room_Portable_AAC.html'
checks=[]
def check(label,ok):
    print(('PASS' if ok else 'FAIL') + ': ' + label)
    checks.append((label,bool(ok)))
    assert ok,label
with sync_playwright() as pw:
    browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--autoplay-policy=no-user-gesture-required'])
    context=browser.new_context(viewport={'width':1366,'height':860},accept_downloads=True)
    page=context.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    page.set_content(SOURCE.read_text(),wait_until='domcontentloaded',timeout=45000)
    check('correct title',page.title()=='Soullab — Listening Room')
    check('3 original studies available',page.locator('#originalRows .track-row').count()==3)
    check('audio source embedded AAC',page.locator('#audio').get_attribute('src').startswith('data:audio/mp4;base64,'))
    check('collection import controls available',page.locator('#playlistFile').count()==1)
    check('playlist URL no hidden provider access',page.locator('#playlistLink').count()==1)
    page.locator('#playBtn').click();page.wait_for_timeout(1400)
    state=page.locator('#audio').evaluate('(a)=>({paused:a.paused,time:a.currentTime,ready:a.readyState,error:a.error?.code})')
    print('Audio',state)
    check('AAC sample actually playing',not state['paused'] and state['time']>0.2 and state['ready']>=2)
    page.locator('#nextBtn').click();page.wait_for_timeout(350)
    check('next sample selected',page.locator('#nowTitle').inner_text()=='Velvet Current')
    page.locator('#playBtn').click()
    check('pause works',page.locator('#audio').evaluate('(a)=>a.paused'))
    page.locator('#playlistName').fill('Existential Bliss')
    page.locator('#playlistLink').fill('https://open.spotify.com/playlist/abcdef?si=tracker')
    page.locator('#savePlaylistLink').click()
    check('Spotify link saved without query',page.locator('#memberShelf a[href="https://open.spotify.com/playlist/abcdef"]').count()==1)
    page.locator('#playlistName').fill('Spoofed')
    page.locator('#playlistLink').fill('https://open.spotify.com.evil.test/playlist/abcdef')
    page.locator('#savePlaylistLink').click()
    check('spoofed provider refused',page.locator('#memberShelf .member-card').count()==1)
    file_input=page.locator('#playlistFile')
    file_input.set_input_files({'name':'Personal.csv','mimeType':'text/csv','buffer':b'Title,Artist\n"A Love Supreme",Coltrane\n"<script>attack()</script>",Test\n'})
    page.locator('#importPlaylistFile').click();page.wait_for_timeout(200)
    check('user CSV imported as metadata',page.locator('#memberShelf .member-card').count()==2)
    check('injected HTML not rendered as element',page.locator('#memberShelf script').count()==0)
    with page.expect_download() as download:
        page.locator('#exportCollections').click()
    check('portable export works',download.value.suggested_filename.endswith('.json'))
    check('JS runtime free from page errors',not errors)
    mobile=browser.new_context(viewport={'width':390,'height':844},device_scale_factor=1,is_mobile=True,has_touch=True)
    mp=mobile.new_page();mp.set_content(SOURCE.read_text(),wait_until='domcontentloaded',timeout=45000)
    check('mobile header visible',mp.locator('h1').is_visible())
    check('mobile no horizontal overflow',not mp.evaluate('document.documentElement.scrollWidth > window.innerWidth+2'))
    print(f'RESULT: {sum(ok for _,ok in checks)}/{len(checks)} verified')
    mobile.close();context.close();browser.close()

