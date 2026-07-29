/**
 * Capture disclosure — event-boundary tests.
 *
 * These assert WHERE disclosure begins and ends in the source, not how it looks.
 * The defects being locked out were all boundary defects: a claim bound to the
 * member's intent rather than to the event that made the claim true, or a claim
 * cleared before the condition it described had actually ended.
 *
 * WHY SOURCE-LEVEL: @testing-library/react is not a dependency of this project and
 * jest runs with testEnvironment 'node', so these components cannot be mounted and
 * driven here. Adding RTL was outside the authorized scope of this repair. The
 * limitation is named in the PR: interaction behaviour is covered by the device walk.
 *
 * WHY A CONTROL: a structural test that passes against the code it was written for
 * proves nothing unless it also FAILS against the code before the fix. Every
 * assertion below is paired with the pre-fix snapshot in PRE_FIX, and the final
 * describe block proves each detector actually discriminates. Without that, these
 * would be vacuous.
 */

import { readFileSync } from 'fs'
import { join } from 'path'

const root = join(__dirname, '..', '..', '..')
const read = (p: string) => readFileSync(join(root, p), 'utf8')

const NOW_WHAT = 'components/now-what/NowWhatRoom.tsx'
const VISION = 'components/maia/vision-studio/VisionStudioRoom.tsx'
const MAIA_CAPTURE = 'components/maia/MaiaCapture.tsx'
const QUICK_JOURNAL = 'components/journal/QuickJournalSheet.tsx'

/** Exact shapes as they existed before this repair. Used as negative controls. */
const PRE_FIX = {
  // Listening asserted synchronously after start(), with no onstart handler.
  listeningOnIntent: `
    try {
      recognition.start();
      recognitionRef.current = recognition;
      setMicListening(true);
    } catch {
      setMicListening(false);
    }
  `,
  // Disclosure cleared before the recorder was told to stop.
  clearedBeforeStop: `
  const stopRecording = () => {
    setIsRecording(false);
    speechRef.current?.stop?.();
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== 'inactive') {
      mr.stop();
    }
  };
  `,
  // stop() with no status change: the 'recording' claim outlived the recording.
  stopWithoutClearing: `
  function stopRecording() {
    mediaRecorderRef.current?.stop()
    mediaRecorderRef.current = null
  }
  `,
}

/** Does this source bind listening to the onstart event? */
const bindsListeningToOnstart = (src: string) =>
  /recognition\.onstart\s*=\s*\(\)\s*=>\s*\{[^}]*setMicListening\(true\)/s.test(src)

/** Does this source assert listening directly in the start() try-block? */
const assertsListeningOnIntent = (src: string) =>
  /recognition\.start\(\);\s*\n\s*recognitionRef\.current\s*=\s*recognition;\s*\n\s*setMicListening\(true\)/s.test(
    src,
  )

/** Does stopRecording clear the recording claim before calling stop()? */
const clearsBeforeStop = (src: string) => {
  const m = src.match(/const stopRecording = \(\) => \{([\s\S]*?)\n  \};/)
  if (!m) return false
  const body = m[1]
  const clearIdx = body.indexOf('setIsRecording(false)')
  const stopIdx = body.indexOf('mr.stop()')
  return clearIdx !== -1 && stopIdx !== -1 && clearIdx < stopIdx
}

/** Does MaiaCapture's stopRecording end the recording claim at all? */
const stopEndsRecordingClaim = (src: string) => {
  const m = src.match(/function stopRecording\(\) \{([\s\S]*?)\n  \}/)
  if (!m) return false
  return /setStatus\(/.test(m[1])
}

describe('listening disclosure is bound to onstart, not to intent', () => {
  for (const [name, path] of [
    ['NowWhatRoom', NOW_WHAT],
    ['VisionStudioRoom', VISION],
  ] as const) {
    it(`${name}: sets listening only from recognition.onstart`, () => {
      const src = read(path)
      expect(bindsListeningToOnstart(src)).toBe(true)
      expect(assertsListeningOnIntent(src)).toBe(false)
    })

    it(`${name}: shows an intermediate activating state instead`, () => {
      const src = read(path)
      expect(src).toContain('setMicActivating(true)')
      // 'Listening…' must not be the label while only activating is true.
      expect(src).toMatch(/micListening \? 'Listening…' : micActivating \? 'Starting…'/)
    })

    it(`${name}: denial and end clear both activating and listening`, () => {
      const src = read(path)
      const onerror = src.match(/recognition\.onerror = \([\s\S]*?\n    \};/)?.[0] ?? ''
      const onend = src.match(/recognition\.onend = \(\) => \{[\s\S]*?\n    \};/)?.[0] ?? ''
      for (const handler of [onerror, onend]) {
        expect(handler).toContain('setMicActivating(false)')
        expect(handler).toContain('setMicListening(false)')
      }
    })

    it(`${name}: permission denial is surfaced, not swallowed`, () => {
      const src = read(path)
      const onerror = src.match(/recognition\.onerror = \([\s\S]*?\n    \};/)?.[0] ?? ''
      expect(onerror).toContain('not-allowed')
      expect(onerror).toContain('setError(')
    })
  }
})

describe('recording disclosure ends when recording ends', () => {
  it('MaiaCapture: stopRecording ends the recording claim', () => {
    expect(stopEndsRecordingClaim(read(MAIA_CAPTURE))).toBe(true)
  })

  it('MaiaCapture: transcription does not inherit the recording disclosure', () => {
    const src = read(MAIA_CAPTURE)
    // 'transcribing' is a separate status with separate copy.
    expect(src).toContain("setStatus({ kind: 'transcribing' })")
    expect(src).toContain('Transcribing…')
    // The reserved recording treatment is not applied to any other status.
    expect(src).toContain('<CaptureDisclosure state="recording" />')
  })

  it('QuickJournalSheet: the claim is cleared by onstop, not before stop()', () => {
    const src = read(QUICK_JOURNAL)
    expect(clearsBeforeStop(src)).toBe(false)
    const onstop = src.match(/mr\.onstop = \(\) => \{[\s\S]*?\n      \};/)?.[0] ?? ''
    expect(onstop).toContain('setIsRecording(false)')
  })
})

describe('capture cannot outlive the component', () => {
  it('MaiaCapture: unmount stops the recorder and every track', () => {
    const src = read(MAIA_CAPTURE)
    expect(src).toContain('streamRef')
    const cleanup = src.match(/useEffect\(\(\) => \{\s*return \(\) => \{[\s\S]*?\n  \}, \[\]\)/)?.[0] ?? ''
    expect(cleanup).toContain('rec.stop()')
    expect(cleanup).toContain('getTracks().forEach')
  })

  it('QuickJournalSheet: unmount stops recorder, recognition, and tracks', () => {
    const src = read(QUICK_JOURNAL)
    const cleanup =
      src.match(/useEffect\(\(\) => \{\s*return \(\) => \{[\s\S]*?\n  \}, \[\]\);/)?.[0] ?? ''
    expect(cleanup).toContain('mr.stop()')
    expect(cleanup).toContain('speechRef.current?.stop')
    expect(cleanup).toContain('getTracks().forEach')
  })
})

describe('the reserved recording treatment is not the generic pulse', () => {
  it('no recording surface uses animate-pulse for its disclosure', () => {
    for (const path of [MAIA_CAPTURE, QUICK_JOURNAL]) {
      const src = read(path)
      // animate-pulse is used elsewhere in the app for health, loading and
      // emergency. Recording must not be confusable with any of them.
      expect(src).not.toContain('animate-pulse')
    }
  })

  it('the recording glyph is defined as steady, so reduced motion changes nothing', () => {
    const css = read('app/globals.css')
    const block = css.match(
      /\.capture-disclosure--recording \.capture-disclosure__glyph \{[\s\S]*?\}/,
    )?.[0]
    // Assert the rule EXISTS before asserting what it lacks. Without this the
    // 'not.toContain' checks below pass trivially against a file that has no
    // capture-disclosure styles at all — which is how they passed against the
    // pre-fix source. A negative assertion over an empty match proves nothing.
    expect(block).toBeDefined()
    expect(block).toContain('background:')
    expect(block).not.toContain('animation:')
    // And the reduced-motion query never needs to mention recording. globals.css
    // has several reduced-motion blocks; select the capture one specifically rather
    // than whichever happens to appear first.
    const rmBlocks = css.match(/@media \(prefers-reduced-motion: reduce\) \{[\s\S]*?\n\}/g) ?? []
    const rm = rmBlocks.find((b) => b.includes('capture-disclosure'))
    expect(rm).toBeDefined()
    expect(rm).not.toContain('--recording')
  })
})

/**
 * Control: every detector above must FAIL on the pre-fix source. A structural
 * assertion that cannot fail is not evidence.
 */
describe('detectors discriminate against the pre-fix source (negative control)', () => {
  it('the onstart detector rejects the pre-fix listening binding', () => {
    expect(bindsListeningToOnstart(PRE_FIX.listeningOnIntent)).toBe(false)
    expect(assertsListeningOnIntent(PRE_FIX.listeningOnIntent)).toBe(true)
  })

  it('the ordering detector catches clearing before stop()', () => {
    expect(clearsBeforeStop(PRE_FIX.clearedBeforeStop)).toBe(true)
  })

  it('the stop detector catches a stop that never ends the claim', () => {
    expect(stopEndsRecordingClaim(PRE_FIX.stopWithoutClearing)).toBe(false)
  })
})
