changeTheme = function() {
  let darkThemeEnabled = document.body.classList.toggle('dark-theme');
  localStorage.setItem('dark-theme-enabled', darkThemeEnabled);
  document.querySelector('#colorTheme i').classList = darkThemeEnabled ? 'fas fa-moon' : 'fas fa-sun';
}
if (JSON.parse(localStorage.getItem('dark-theme-enabled'))) {
  document.body.classList.add('dark-theme');
  document.querySelector('#colorTheme i').classList = 'fas fa-moon';
} else if (!localStorage.getItem('dark-theme-enabled') == false) { // Set Starting Theme to Dark-Mode
  localStorage.setItem('dark-theme-enabled', false);
  changeTheme();
}

// ======================

settingsOpen = true;
NotLogged = false;

settingsMap = {
  "LastAc": "SW_LastAc",
  "BGImg": "SW_BGImg",
  "Bin": "SW_Bin",
  "Date": {0: "SW_Date_ddmmyy", 1: "SW_Date_mmddyy"},
  "Dir": "SW_Dir",
  "HighL": "SW_HighL",
  "LockF": {0: "SW_LockF_Pad", 1: "SW_LockF_Bor", 2: "SW_LockF_Non"},
  "Theme": {0: "SW_Theme_Dark", 1: "SW_Theme_Light"},
  "TimeZ": "SW_TimeZ",
  "ViewT": {0: "SW_ViewT_Block", 1: "SW_ViewT_List"},
}

if (typeof socket == 'undefined') {window.socket = io.connect('https://nanode.one'); }

if (socket !== undefined) {
  socket.on('Settings', function(UserSettings) { readSettings(UserSettings); })
  socket.on('NoLoggedSettings', function() { noSettings(); })
}

// Open and Close Settings Panel
$(".NHBLC").on("click", function() { 
  settingsOpen = !settingsOpen;
  if (settingsOpen) {
    $(".settingsContainer")[0].style.left = "-300px";
    if ($(".NHBLC")[0]) {  $(".NHBLC")[0].style.position = "absolute";  }
    }
  else {
    socket.emit('CallSettings', "Read");
    $(".settingsContainer")[0].style.left = "0px";
    if ($(".NHBLC")[0]) {  $(".NHBLC")[0].style.position = "fixed";  }
  }
})

function readSettings(calledSettings) {
  UserSettings = calledSettings;

  // let keys = Object.keys(UserSettings);
  // for (key in keys) {
  //   let objID = settingsMap[keys[key]]
  //   if ( typeof UserSettings[keys[key]] == "number" ) {
  //     $("#"+ objID[ UserSettings[keys[key]] ])[0].classList.add("SW_Selected");
  //   } else if ( $("#"+objID)[0] ) {
  //     if (objID == "SW_LastAc") { UserSettings[keys[key]] = N_DateAndTimeFormater(UserSettings[keys[key]]) }
  //     $("#"+objID)[0].value = UserSettings[keys[key]];
  //   }
  // }
  handleSettings();
}

function noSettings() {
  // Retreive NO Data and Set up Cover
  if (NotLogged == true) {return;}
  NotLogged = true;
  $(".settingsContainer > h2:nth-child(1)").after("<h6>Click <a href='//account.nanode.one/login'>here</a> to login to edit settings</h6>");
  let cover = document.createElement('div');  cover.setAttribute("class", "settingsCover")
  $(".settingsWrapper")[0].appendChild(cover);
  $(".settingsWrapper")[0].style = "filter: blur(1px) brightness(0.6);"
}

// Change Settings on Server End
$("input[type=button]:not(#SW_LockLinks)").on("click", function(e) {
  if ( !$(e.target).hasClass('SW_Selected') ) {
    fellowNodes = $(e.target.parentNode.childNodes);
    for (i=0; i<fellowNodes.length; i++) {
      if ($(fellowNodes[i]).hasClass('SW_Selected')) { $(fellowNodes[i])[0].classList.remove('SW_Selected') }
    }
    let targetType = $(e.target)[0].id.split('_')[1];
    let targetID = $(e.target)[0].id;
    data = [ targetType, parseInt(Object.keys(settingsMap[targetType]).find(key => settingsMap[targetType][key] === targetID)) ]
    socket.emit('CallSettings', "Write", data)
    $(e.target)[0].classList.add('SW_Selected');

    UserSettings[targetType] = parseInt(Object.keys(settingsMap[targetType]).find(key => settingsMap[targetType][key] === targetID));
    handleSettings();
  }
})

$(" input[type=text], input[type=number], input[type=url], input[type=color] ").change(async(e) => {
  let key = $(e.target)[0].id.split('_')[1];
  let newVal = $(e.target)[0].value;
  let update = {};
  update[key] = newVal;

  if (key == "BGImg" && newVal.length) {
    const item_Resp = await fetch(`//drive.nanode.one/user/files/${newVal}/type`);
    const itemType = await item_Resp.json();
    if (itemType.isFi && itemType.isImg) { console.log("accepted") }
    else {console.log("not a valid file for a background."); return;}
  }
  socket.emit('CallSettings', "Write", update);

  UserSettings[key] = newVal;
  handleSettings();
})


function changeSetting(setting, newVal) {
  if (setting.match(/Date|Theme|ViewT/g)) {
    newVal = [setting, UserSettings[setting] == 0 ? 1 : 0]
    UserSettings[setting] = newVal[1];

    localStorage.setItem('user-settings', JSON.stringify(UserSettings))
    socket.emit('CallSettings', "Write", newVal);
  }
  handleSettings();
}

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

function handleSettings() {
  for (key in UserSettings) {
    if (key == "Dir") { startDirectory = UserSettings[key]; }
    else if (key == "Date") { dateFormat = UserSettings[key];}
    else if (key == "TimeZ") { timezone = UserSettings[key]; }
    else if (key == "Theme") {
      UserSettings[key] == 0 ? document.body.classList.add('dark-theme') : document.body.classList.remove('dark-theme');
    }
    else if (key == "ViewT" && typeof NanoName != 'undefined') {
      document.querySelector('.Slider.SL_View').style.transform = `translateX(${UserSettings.ViewT == 0 ? 28 : 0}px)`;
      if (UserSettings.ViewT == 0 && typeof NanoID != 'undefined') {
        viewContentAsBlock(NanoName);
        clientStatus("CS6", "Off");
      } else if (UserSettings.ViewT == 1 && typeof NanoID != 'undefined') {
        viewContentAsList(NanoName);
        clientStatus("CS6", "True");
      }
    }
    else if (key == "HighL") { document.documentElement.style.setProperty('--highlight-color', UserSettings[key]) }
    else if (key == "BGImg") {
      if (UserSettings[key] && $(".PageContainer")[0]) {
        let BG_url = UserSettings[key].split('/').length > 2 ? "url("+UserSettings[key]+")" : "url(//drive.nanode.one/storage/"+(UserSettings[key]).replace(" ", "")+")"
        $(".PageContainer")[0].style.backgroundImage = BG_url;
      } else if ($(".PageContainer")[0]) { $(".PageContainer")[0].style.backgroundImage = ""; }
    }
  }
  return true;
}

/////////////////////////////////////////////
/////////////////////////////////////////////

shortcutKeys = {
  "Ctrl+A": "All",
  "Ctrl+N": "New",
  "Delete": "Delete",
  "Arrow_Up": "Move Up an Item",
  "Arrow_Down": "Move Down an Item",
  "Arrow_Left": "Back a directory",
  "Arrow_Right": "Forward a directory",
}