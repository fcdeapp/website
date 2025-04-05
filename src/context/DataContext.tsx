// DataContext.tsx
import React, { createContext, useContext, useState } from 'react';

type DataContextType = {
  text: string;
  setText: (value: string) => void;
};

// children을 포함한 Props 타입
interface DataProviderProps {
  children: React.ReactNode;
}

const DataContext = createContext<DataContextType>({
  text: '',
  setText: () => {},
});

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [text, setText] = useState('');

  return (
    <DataContext.Provider value={{ text, setText }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
