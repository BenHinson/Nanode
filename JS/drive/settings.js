let UserSettings = {};

// ======================

const SettingsController = async() => {

  // Manage
  SetSettings = (settings) => {
    UserSettings = settings;
    SetStorage(UserSettings.user.plan);
    ToggleTheme(UserSettings.local.theme, 'set');
  }


  // Handle
  Read = (type, setting) => {
    let settings = JSON.parse(localStorage.getItem(`${type}-settings`));
    return setting ? settings[setting] || null : settings;
  }
  Write = (location, setting, value) => {
    if (location == 'local') {
      UserSettings.local[setting] = (value == 'toggle' ? (UserSettings.local[setting] == 0 ? 1 : 0) : value);
    } else if (setting.match(/accessed|date/)) {
      UserSettings.user[setting] = value;
    }
  
    this.Update(UserSettings, location, false);
  }
  Update = (settings, location, set=true) => {
    if (location == 'local') { // Set local settings. Else Push to server settings. (server)
      settings.user.accessed = new Date().toISOString(); // The server knows when we accessed, no need to set it here or send it to the server.
      localStorage.setItem('local-settings', JSON.stringify(settings.local));
      localStorage.setItem('user-settings', JSON.stringify(settings.user));
    }
    
    if (set) this.SetSettings(settings);
  }


  // API
  Session = async(settings={}) => {  // Calls API_Fetch({url: '/account/settings'}) if needed and send settings updates.
    settings['user'] = this.Read('user') || await API_Fetch({url: '/account/settings'});
    settings['local'] = this.Read('local') || {'theme': (window.matchMedia("(prefers-color-scheme: dark)").matches ? 0 : 1) || 0, 'layout': 0, 'recents': 0}; // Reads system theme
  
    if ((new Date().getTime() - new Date(settings.user.accessed || 0).getTime()) > 5*60*1000) {
      settings['user'] = await API_Fetch({url: '/account/settings'}) || {'accessed': new Date().toISOString(), 'date': 0, 'plan': {'max': 10 * 1024 * 1024 * 1024, 'used': 0}};
    }
  
    this.Update(settings, 'local');
  }

  
  // Events
  const SetStorage = (plan=UserSettings.user.plan) => {
    this.Write('user', 'plan', plan);
    let StorageElem = document.querySelector('.Storage');
    StorageElem.querySelector('p').innerText = `${N_.ConvertSize(plan.used)} / ${N_.ConvertSize(plan.max).replace('.00', '')}`;
    StorageElem.querySelector('progress').value = parseFloat(((plan.used / plan.max) * 100).toFixed(2)) || 0;
  }
  const ToggleTheme = (theme, set) => {
    if (set) {
      document.body.setAttribute('data-theme', (theme ? 'light' : 'dark'));
            // document.body.classList[theme ? 'remove' : 'add']('dark-theme');
    } else {
      document.body.getAttribute('data-theme') == 'light'
        ? document.body.setAttribute('data-theme', 'dark')
        : document.body.setAttribute('data-theme', 'light');
  
            // document.body.classList.toggle('dark-theme');
      this.Write('local', 'theme', 'toggle');
    }
    document.querySelector('#colorTheme i').classList = UserSettings.local.theme ? 'fas fa-sun' : 'fas fa-moon';
  }
  const ToggleView = () => {
    this.Write('local', 'layout', 'toggle');
    document.querySelector('.Slider.SL_View').style.transform = `translateX(${UserSettings.local.layout ? 28 : 0}px)`;
    NodeCall({"Folder":NodeID, "Reload":false});
  }
  const ToggleRecents = () => {
    this.Write('local', 'recents', 'toggle');
    renderContent.renderRecents();
  }

  // ====================================

  await this.Session();

  SettingsController.SetStorage = SetStorage;
  SettingsController.ToggleTheme = ToggleTheme;
  SettingsController.ToggleView = ToggleView;
  SettingsController.ToggleRecents = ToggleRecents;
}