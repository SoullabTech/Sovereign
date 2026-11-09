"""Bounded browser decoder witness for a user-selected audio Blob URL.
Not an integrated Next route or physical headphone/bit-perfect qualification.
"""
import asyncio, pathlib, json, shutil, subprocess, tempfile
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).parent

def prepare_sample(temp: pathlib.Path) -> pathlib.Path:
    exe = shutil.which('ffmpeg')
    if not exe: raise RuntimeError('ffmpeg required to synthesize the test-only FLAC fixture')
    sample = temp / 'fictional-sine-3sec.flac'
    subprocess.run([exe, '-nostdin', '-hide_banner', '-loglevel', 'error', '-y',
        '-f', 'lavfi', '-i', 'sine=frequency=220:sample_rate=48000:duration=3',
        '-af', 'pan=stereo|c0=c0|c1=c0', '-sample_fmt', 's32', '-c:a', 'flac',
        str(sample)], check=True, timeout=20)
    return sample
async def main():
    with tempfile.TemporaryDirectory(prefix='soullab-listen04-test-') as folder:
      sample = prepare_sample(pathlib.Path(folder))
      async with async_playwright() as p:
        browser=await p.chromium.launch(executable_path='/usr/bin/chromium', args=['--no-sandbox', '--disable-dev-shm-usage'])
        page=await browser.new_page()
        outbound=[]
        page.on('request',lambda r: outbound.append(r.url) if not (r.url.startswith('data:') or r.url.startswith('blob:')) else None)
        await page.set_content('''<!doctype html><title>Local audio codec witness</title>
            <input id="pick" type="file" accept=".flac,audio/*">
            <button id="play">Play</button><button id="pause">Pause</button>
            <audio id="audio" controls preload="metadata"></audio>
            <script>
              const audio=document.getElementById('audio');let localUrl=null;
              document.getElementById('pick').onchange = e => {
                const f=e.target.files[0];if(!f)return;
                if(localUrl) URL.revokeObjectURL(localUrl);
                localUrl=URL.createObjectURL(f);audio.src=localUrl;
              };
              document.getElementById('play').onclick = () => audio.play();
              document.getElementById('pause').onclick = () => audio.pause();
            </script>''')
        await page.locator('#pick').set_input_files(str(sample))
        await page.wait_for_function("document.querySelector('audio').readyState >= 1",timeout=10000)
        metadata=await page.locator('audio').evaluate('(a)=>({duration:a.duration,src:a.currentSrc,ready:a.readyState})')
        assert metadata['src'].startswith('blob:'),metadata
        assert abs(metadata['duration']-3)<0.05,metadata
        await page.locator('#play').click()
        await page.wait_for_function('document.querySelector("audio").currentTime > 0.3',timeout=7000)
        playing=await page.locator('audio').evaluate('(a)=>({time:a.currentTime,paused:a.paused})')
        assert playing['time']>0.3 and playing['paused'] is False,playing
        await page.locator('#pause').click()
        paused=await page.locator('audio').evaluate('(a)=>a.paused')
        assert paused
        assert not outbound, f'Unexpected network requests: {outbound}'
        print(json.dumps({'browser':'Chromium','codec':'FLAC','sample':'3-second locally synthesized test sine wave','duration':metadata['duration'],'playbackProgressSeconds':round(playing['time'],2),'paused':paused,'networkRequests':len(outbound),'result':'PASS'},indent=2))
        await browser.close()
if __name__=='__main__':asyncio.run(main())
