'use client';

import React, {forwardRef} from 'react';

export interface Props {
  children: React.ReactNode;
}

export const List = forwardRef<HTMLUListElement, Props>(
  ({children}: Props, ref) => {
    return (
      <ul
        style={{width: '200px'}}
        ref={ref}
      >
        {children}
      </ul>
    );
  }
);
