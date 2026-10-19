/**
 * C0 fictional-account server-render smoke test for the mounted beta upgrade
 * sheet. No requests, credentials, or real member state are involved.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from '@jest/globals';
import PasswordChangeSheet from '../PasswordChangeSheet';

describe('C0 password setup sheet — truthful beta UX', () => {
  it('renders unavailable state and never asks for a password', () => {
    const markup = renderToStaticMarkup(React.createElement(PasswordChangeSheet, {
      isOpen: true,
      onClose: () => {},
      memberId: '11111111-1111-4111-8111-111111111111',
      memberName: 'Fictional Member',
    }));
    expect(markup).toContain('Password setup is temporarily unavailable');
    expect(markup).toContain('No password has been changed');
    expect(markup).toContain('Contact Soullab support');
    expect(markup).toContain('/account/settings');
    expect(markup).not.toContain('Set Password');
    expect(markup).not.toContain('<input');
  });

  it('does not render the modal when closed', () => {
    const markup = renderToStaticMarkup(React.createElement(PasswordChangeSheet, {
      isOpen: false,
      onClose: () => {},
      memberId: '11111111-1111-4111-8111-111111111111',
    }));
    expect(markup).not.toContain('Password setup is temporarily unavailable');
  });
});
