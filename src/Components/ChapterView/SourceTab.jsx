import React from 'react';
import TranslationTab from './TranslationTab';

export default function SourceTab({ chapters, langMap, fontSize }) {
  return (
    <TranslationTab 
      chapters={chapters} 
      langMap={langMap} 
      lang="CN" 
      fontSize={fontSize} 
    />
  );
}
