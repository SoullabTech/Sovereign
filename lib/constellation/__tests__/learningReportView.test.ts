/** @jest-environment node */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import LearningReportView from '../../../app/founder/constellation/LearningReportView';
import { buildLearningReport, type FeedbackRead } from '../learningReport';

jest.mock('../../../app/founder/constellation/learning-report.module.css', () => ({
  __esModule: true, default: { report: 'report' },
}));
const render = (read: FeedbackRead) => renderToStaticMarkup(createElement(LearningReportView, {
  report: buildLearningReport(read, new Date('2026-10-03T20:00:00Z')),
}));

describe('C7A report presentation — synthetic data only', () => {
  it('renders small-group suppression without leaking the hidden count', () => {
    const html = render({ kind: 'read', groups: [{ signal: 'felt_like_my_voice', submissions: 100, contributors: 1 }] });
    expect(html).toContain('Below display floor');
    expect(html).not.toContain('100');
    expect(html).toContain('data-measure-state="withheld"');
  });
  it('renders unavailable measurements distinctly from zero', () => {
    const html = render({ kind: 'unavailable' });
    expect((html.match(/data-measure-state="unavailable"/g) ?? []).length).toBe(8);
    expect(html).not.toContain('data-measure-state="observed"');
    expect(html).toContain('Nothing here is being reported as zero');
  });
  it('keeps observation units, coverage gaps, and limitations visible', () => {
    const html = render({ kind: 'read', groups: [] });
    expect(html).toContain('Feedback submissions');
    expect(html).toContain('not people or proven improvement');
    expect((html.match(/Not measured/g) ?? []).length).toBe(6);
    expect(html).toContain('<caption>');
    expect(html).not.toContain('<main');
    expect(html).toContain('Source, boundaries, and what this does not establish');
  });
});
