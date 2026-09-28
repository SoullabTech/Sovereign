import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { DecisionAccessNotice } from '../DecisionAccessNotice';

jest.mock('../house-preferences.module.css', () => ({ __esModule: true,
  default: { decisionNotice: 'decisionNotice', accessMark: 'accessMark',
    accessTitle: 'accessTitle', accessAction: 'accessAction' } }));

describe('Decisions remains discoverable without granting Studio access', () => {
  const closed = () => renderToStaticMarkup(createElement(DecisionAccessNotice, { available: false }));
  it('does not override an eligible member’s chosen shortcuts', () => {
    expect(renderToStaticMarkup(createElement(DecisionAccessNotice, { available: true }))).toBe('');
  });
  it('names Decisions and the connection state', () => {
    expect(closed()).toContain('Decisions — Studio connection needed');
  });
  it('offers a native keyboard-operable disclosure', () => {
    expect(closed()).toContain('<details'); expect(closed()).toContain('<summary');
  });
  it('names Personal as well as Practice Studio', () => {
    expect(closed()).toContain('Personal or Practice Studio');
  });
  it('uses the existing Studio doorway, not a new authority or setup mutation', () => {
    expect(closed()).toContain('href="/studio"');
    expect(closed()).not.toContain('href="/studio/decisions"');
  });
  it('warns against creating a duplicate Studio', () => {
    expect(closed()).toContain('before creating another');
  });
});
