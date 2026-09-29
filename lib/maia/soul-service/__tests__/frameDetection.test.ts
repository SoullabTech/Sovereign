import { describe, expect, it } from 'vitest'
import {
  FRAME_GRAMMAR,
  buildFrameDetectionSystemPrompt,
  frameForDimension,
  validateFrameDetectionOutput,
} from '../frameDetection'

describe('Soul-Service frame detection contract', () => {
  it('limits model authority to choosing two aperture dimensions', () => {
    const prompt = buildFrameDetectionSystemPrompt()
    expect(prompt).toContain('do NOT interpret the person')
    expect(prompt).toContain('Do not generate frame labels')
    expect(prompt).toContain('server owns all member-facing language')
    expect(prompt).toContain('There is no correct or higher perspective')
  })

  it('accepts two different governed dimensions', () => {
    const out = validateFrameDetectionOutput(JSON.stringify({
      primaryDimension: 'question_structure',
      alternativeDimension: 'evidence',
    }))
    expect(out.primaryDimension).toBe('question_structure')
    expect(out.alternativeDimension).toBe('evidence')
    expect(out.scope).toBe('current_question')
  })

  it('rejects unknown dimensions', () => {
    expect(() => validateFrameDetectionOutput(JSON.stringify({
      primaryDimension: 'psychological_pattern',
      alternativeDimension: 'evidence',
    }))).toThrow('FRAME_DIMENSION_INVALID')
  })

  it('requires a genuine dimension shift', () => {
    expect(() => validateFrameDetectionOutput(JSON.stringify({
      primaryDimension: 'evidence',
      alternativeDimension: 'evidence',
    }))).toThrow('FRAME_DIMENSION_NOT_SHIFTED')
  })

  it('renders member-facing language from server grammar, not model text', () => {
    const frame = frameForDimension('evidence')
    expect(frame).toEqual({
      dimension: 'evidence',
      label: 'Evidence',
      question: 'What does the evidence actually support?',
      description: FRAME_GRAMMAR.evidence.description,
      standing: 'MAIA_POSSIBLE_FRAME',
    })
  })

  it('every governed frame preserves ordinary language and a question', () => {
    for (const frame of Object.values(FRAME_GRAMMAR)) {
      expect(frame.label.length).toBeGreaterThan(0)
      expect(frame.question.endsWith('?')).toBe(true)
      expect(frame.description.length).toBeGreaterThan(10)
    }
  })
})
