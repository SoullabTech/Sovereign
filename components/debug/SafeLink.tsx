'use client';

import Link from 'next/link';
import React from 'react';

type Props = React.ComponentProps<typeof Link>;

export default function SafeLink({ href, children, ...rest }: Props) {
  if (!href) {
    console.warn('[SafeLink] Prevented Link with undefined href', { rest });
    return <span>{children}</span>;
  }
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
}
