import React, {useState, createContext} from 'react';

import Controls from './home/header/controls.react';
import DirectoryPath from './home/header/directoryPath.react';
import Search from './home/header/search.react';

import Panel from './home/panel/panel.react';
import Content from './home/data/content.react';

export default function Home() {

  return (
    <section className='main_Page'>
      <div className='pageHeader'>
        <Controls />
        <DirectoryPath />
        <Search />
      </div>
    
      <div className='pageData' rc='File_Container'>
        <Content />
        <Panel />
      </div>
    </section>
  )
}