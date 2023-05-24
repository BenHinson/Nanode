import React, { createContext, useState, useEffect } from "react"
import { ConvertSize } from "../../JS/tools";
import { Core } from '../../JS/core';

export const UserContext = createContext([]);

export function UserProvider(props) {
  const [settings, setSettings] = useState(null);
  const [userStorage, setUserStorage] = useState({
    raw: {used: 0, max: 0}, 
    converted: {used: 0, max: 0, percentage: 0}
  });

  useEffect(() => {
    (async() => {
      const initialSettings = await readSettings();
      setSettings(initialSettings);
      setUserStorage({
        converted: {
          used: ConvertSize(initialSettings.User.plan.used), 
          max: ConvertSize(initialSettings.User.plan.max), 
          percentage: initialSettings.User.plan.used / initialSettings.User.plan.max * 100
        },
        ...initialSettings.User.plan,
      }
      );
    })()
  }, []);


  return (
    <UserContext.Provider value={{
      userStorage,
      settings, setSettings,
    }}>
      {props.children}
    </UserContext.Provider>
  )
}


async function readSettings() {
  let User = {};
  let Local = {};
  
  const Read = (type, setting) => {
    let settings = JSON.parse(localStorage.getItem(`${type}-settings`));
    return setting ? settings[setting] || null : settings;
  }
  const Write = (location, setting, value) => {
    if (location == 'local') {
      Local[setting] = (value == 'toggle' ? (Local[setting] == 0 ? 1 : 0) : value);
    } else if (setting.match(/accessed|date/)) {
      User[setting] = value;
    }

    Update(location, false);
  }
  const Update = (location, set=true) => {
    if (location == 'local') { // Set local settings. Else Push to server settings. (server)
      User.accessed = new Date().toISOString(); // The server knows when we accessed, no need to set it here or send it to the server.
      localStorage.setItem('local-settings', JSON.stringify(Local));
      localStorage.setItem('user-settings', JSON.stringify(User));
    }
  }

  User = Read('user') || await Core.API_Fetch({url: '/account/settings'});
  Local = Read('local') || {
    'theme': (window.matchMedia("(prefers-color-scheme: dark)").matches ? 0 : 1) || 0, // Reads system theme
    'layout': 1,
    'recents': 0,
    'search_options': {'description': true, 'prevNames': true, 'withinAll': true, 'forFolders': true, 'forFiles': true}
  };

  if ((new Date().getTime() - new Date(User.accessed || 0).getTime()) > 5*60*1000) {
    User = await Core.API_Fetch({url: '/account/settings'}) || {'accessed': new Date().toISOString(), 'date': 0, 'plan': {'max': 10 * 1024 * 1024 * 1024, 'used': 0}};
  }

  Update('local');

  return {User, Local}
}