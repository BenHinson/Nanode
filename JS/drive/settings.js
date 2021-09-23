class Settings {
  static User = {}; // Settings.User
  static Local = {}; // Settings.Local

  constructor() {
    Settings.Session();
  }

  // API ==========
  static Session = async() => {  // Calls App.API_Fetch({url: '/account/settings'}) if needed and send settings updates.
    Settings.User = this.Read('user') || await App.API_Fetch({url: '/account/settings'});
    Settings.Local = this.Read('local') || {
      'theme': (window.matchMedia("(prefers-color-scheme: dark)").matches ? 0 : 1) || 0, // Reads system theme
      'layout': 0,
      'recents': 0,
      'search_options': {'description': true, 'prevNames': true, 'withinAll': true, 'forFolders': true, 'forFiles': true}
    };
  
    if ((new Date().getTime() - new Date(Settings.User.accessed || 0).getTime()) > 5*60*1000) {
      Settings.User = await App.API_Fetch({url: '/account/settings'}) || {'accessed': new Date().toISOString(), 'date': 0, 'plan': {'max': 10 * 1024 * 1024 * 1024, 'used': 0}};
    }
  
    this.Update('local');
  }

  // Handle
  static Read(type, setting) {
    let settings = JSON.parse(localStorage.getItem(`${type}-settings`));
    return setting ? settings[setting] || null : settings;
  }
  static Write(location, setting, value) {
    if (location == 'local') {
      Settings.Local[setting] = (value == 'toggle' ? (Settings.Local[setting] == 0 ? 1 : 0) : value);
    } else if (setting.match(/accessed|date/)) {
      Settings.User[setting] = value;
    }
  
    this.Update(location, false);
  }
  static Update(location, set=true) {
    if (location == 'local') { // Set local settings. Else Push to server settings. (server)
      Settings.User.accessed = new Date().toISOString(); // The server knows when we accessed, no need to set it here or send it to the server.
      localStorage.setItem('local-settings', JSON.stringify(Settings.Local));
      localStorage.setItem('user-settings', JSON.stringify(Settings.User));
    }
    
    if (set) this.SetSettings();
  }

  // Manage
  static SetSettings() {
    Settings.SetStorage(Settings.User.plan);
    Settings.ToggleTheme(Settings.Local.theme, 'set');
  }
  
  // Events
  static SetStorage (plan=Settings.User.plan) {
    Settings.Write('user', 'plan', plan);
    let StorageElem = document.querySelector('.Storage');
    StorageElem.querySelector('p').innerText = `${N_.ConvertSize(plan.used)} / ${N_.ConvertSize(plan.max).replace('.00', '')}`;
    StorageElem.querySelector('progress').value = parseFloat(((plan.used / plan.max) * 100).toFixed(2)) || 0;
  }
  static ToggleTheme = (theme, set) => {
    if (set) {
      document.body.setAttribute('data-theme', (theme ? 'light' : 'dark'));
    } else {
      document.body.getAttribute('data-theme') == 'light'
        ? document.body.setAttribute('data-theme', 'dark')
        : document.body.setAttribute('data-theme', 'light');
      Settings.Write('local', 'theme', 'toggle');
    }
    document.querySelector('#colorTheme i').classList = Settings.Local.theme ? 'fas fa-sun' : 'fas fa-moon';
  }
  static ToggleView = () => {
    Settings.Write('local', 'layout', 'toggle');
    document.querySelector('.Slider.SL_View').style.transform = `translateX(${Settings.Local.layout ? 28 : 0}px)`;
    // Main.NodeCall({"Folder":Main.NodeID, "Reload":false});
    Directory.Render();
  }
  static ToggleRecents = () => {
    Settings.Write('local', 'recents', 'toggle');
    Recent.Load();
  }
}