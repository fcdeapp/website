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
        'linear-gradient(135deg, #F2542D 0%, #D8315B 100%)',
      color: '#fff',
    }}>
      {children}
    </Comp>
  );
}
