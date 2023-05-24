import React, {useState, useContext} from 'react';
import { Link } from "react-router-dom";

import { PageContext } from "../../../state/context/PageContext.react";

import UserStorage from './userStorage.react';

// ===============================================

const TopPages = [
  {name: 'home', title: 'Home', icon: 'fas fa-user'},
  {name: 'share', title: 'Share', icon: 'fas fa-users'},
  {name: 'blocks', title: 'Blocks', icon: 'fas fa-th'},
  {name: 'lists', title: 'Lists', icon: 'fas fa-stream'}
]
const SecondaryPages = [
  {name: 'bin', title: 'Bin', icon: 'fas fa-trash-alt'},
  {name: 'settings', title: 'Settings', icon: 'fas fa-cog'}
]

// ===============================================

export default function SideBar() {

  return (
    <div className='sideBar'>
      <div>
        <a href="https://nanode.one" className="nanode"><div></div>Nanode</a>

        <PageLinks pageList={TopPages} />
      </div>

      <div className='PagesTwo'>
        <PageLinks pageList={SecondaryPages} />
        <UserStorage />
      </div>
    </div>
  );
}

const PageLinks = ({pageList}) => {
  const { activePage, setActivePage } = useContext(PageContext);

  return (
    <>
      {pageList.map((page, i) => (
        <Link to={`/${page.name === 'home' ? '' : page.name}`} onClick={() => setActivePage(page.name)} style={{textDecoration: 'none'}} key={i}>
          <span title={page.title} className={page.name === activePage ? 'SelectedPage' : undefined}>
              <i className={page.icon}></i>
              <p>{page.title}</p>
          </span>
        </Link>
      ))}
    </>
  )
}