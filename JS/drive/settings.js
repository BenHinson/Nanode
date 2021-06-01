let UserSettings = {};

// ======================

async function sessionSettings(settings={}) {  // Call API_Fetch({url: '/account/settings'}) if needed and send settings updates.
  settings['user'] = readSettings('user') || await API_Fetch({url: '/account/settings'});
  settings['local'] = readSettings('local') || {'theme': 0, 'layout': 0};

  if ((new Date().getTime() - new Date(settings.user.accessed || 0).getTime()) > 5*60*1000) {
    settings['user'] = await API_Fetch({url: '/account/settings'}) || {'accessed': new Date().toISOString(), 'date': 0, 'plan': {'max': 10 * 1024 * 1024 * 1024}, 'used': 0};
  }

  updateSettings(settings, 'local');
}

function readSettings(type, setting) {  // Return local-settings, user-settings or a specific setting.
  let settings = JSON.parse(localStorage.getItem(`${type}-settings`));
  return setting ? settings[setting] || null : settings;
}

function writeSettings(location, setting, value) {
  if (location == 'local') {
    UserSettings.local[setting] = (value == 'toggle' ? (UserSettings.local[setting] == 0 ? 1 : 0) : value);
  } else if (setting.match(/accessed|date/)) {
    UserSettings.user[setting] = value;
  }

  updateSettings(UserSettings, location, false);
}

function updateSettings(settings, location, set=true) { // Edit local settings and push to server
  if (location == 'local') { // Set local settings. Else Push to server settings. (server)
    settings.user.accessed = new Date().toISOString();
    localStorage.setItem('local-settings', JSON.stringify(settings.local));
    localStorage.setItem('user-settings', JSON.stringify(settings.user));
  }
  
  if (set) setSettings(settings);
}


function setSettings(settings) {
  UserSettings = settings;

  SetStorage(UserSettings.user.plan);
  ToggleTheme(UserSettings.local.theme, 'set');
}

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

function SetStorage(plan=UserSettings.user.plan) {
  writeSettings('user', 'plan', plan);
  let StorageElem = document.querySelector('.Storage');
  StorageElem.querySelector('p').innerText = `${N_ConvertSize(plan.used)} / ${N_ConvertSize(plan.max).replace('.00', '')}`;
  StorageElem.querySelector('progress').value = parseFloat(((plan.used / plan.max) * 100).toFixed(2));
}

function ToggleTheme(theme, set) {
  if (set) {
    document.body.classList[theme ? 'remove' : 'add']('dark-theme');
  } else {
    document.body.classList.toggle('dark-theme');
    writeSettings('local', 'theme', 'toggle');
  }
  document.querySelector('#colorTheme i').classList = UserSettings.local.theme ? 'fas fa-sun' : 'fas fa-moon';
}

function ToggleView() {
  writeSettings('local', 'layout', 'toggle');
  document.querySelector('.Slider.SL_View').style.transform = `translateX(${UserSettings.local.layout ? 28 : 0}px)`;
  HomeCall({"Folder":NodeID, "Reload":false});
}