import React from 'react';
// import {useState} from 'react';

export default function Bin() {
  return (
    <section className='bin_Page'>
      <div className='pageHeader flex-even-cent'>
        <Switch />
      </div>

      <div className='pageData'>
        <Content />
        <PageInformation />
      </div>
    </section>
  )
}


// ===== Page Header =====

const Switch = () => {
  return (
    <div className='Switch SW_Bin'>
      <div className='Slider SL_Bin'></div>
      <div swoppos='1' className='SwitchSelected'>Main</div>
      <div swoppos='2'>Blocks</div>
      <div swoppos='3'>Lists</div>
    </div>
  )
}


// ===== Page Data =====

const Content = () => {
  return (
    <div className='Content binContainer grid-items-center'><div></div></div>
  )
}

const PageInformation = () => {
  return (
    <div className='PageInformation'>
      <div className='binInfo flex-column-cent'>
        <p className='binSize'></p>
      
        <div className='binUsage'><div></div></div>
      
        <div className='binItemData'></div>
      
        <div className='binEmptyContainer'>
          <button className='rb-btn-full red-full binEmptyBtn'>Empty Bin</button>
        </div>
    
      </div>
    </div>
  )
}