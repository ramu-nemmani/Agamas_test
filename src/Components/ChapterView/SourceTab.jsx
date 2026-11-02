import React from 'react';
import TranslationTab from './TranslationTab';

export default function SourceTab({ chapters, currentChapterId, langMap, fontSize, targetChapterId }) {
  return (
    <TranslationTab 
      chapters={chapters} 
      currentChapterId={currentChapterId}
      langMap={langMap} 
      lang="CN" 
      fontSize={fontSize} 
      targetChapterId={targetChapterId}
    />
  );
}
