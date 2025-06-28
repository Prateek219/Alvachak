import React, { createContext, useContext, useState } from 'react';
import { FinetuningOcr } from './initialState';

const FinetuningContext = createContext();

export const FinetuningProvider = ({ children }) => {
  const [outputOcr, setOutputOcr] = useState(FinetuningOcr);

  return (
    <FinetuningContext.Provider value={{ outputOcr, setOutputOcr }}>
      {children}
    </FinetuningContext.Provider>
  );
};

export const useFinetuning = () => useContext(FinetuningContext);
