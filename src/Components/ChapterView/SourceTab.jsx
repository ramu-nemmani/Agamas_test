import React from 'react';
import TranslationTab from './TranslationTab';

export default function SourceTab({ chapters, langMap, fontSize, targetChapterId }) {
  return (
    <TranslationTab 
      chapters={chapters} 
      langMap={langMap} 
      lang="CN" 
      fontSize={fontSize} 
      targetChapterId={targetChapterId}
    />
  );
}
