// components/LinearGradient.tsx
import React from 'react';

export function LinearGradient({
  children,
  className,
  as: Comp = 'div',
}: React.PropsWithChildren<{ className?: string; as?: any }>) {
  return (
    <Comp className={className} style={{
      background:
        'linear-gradient(135deg, #A87989 0%, #A44765 100%)',
      color: '#fff',
    }}>
      {children}
    </Comp>
  );
}
