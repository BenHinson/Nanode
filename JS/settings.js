window.socket = io.connect('https://nanode.one');

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


socket.on('Settings', function(UserSettings) {
  readSettings(UserSettings);
})

socket.on("NoLoggedSettings", function() {
  noSettings();
})


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

  let keys = Object.keys(UserSettings);
  for (key in keys) {
    let objID = settingsMap[keys[key]]
    if ( typeof UserSettings[keys[key]] == "number" ) {
      $("#"+  objID[ UserSettings[keys[key]] ]   +"")[0].classList.add("SW_Selected");
    } else {
      $("#"+objID+"")[0].value = UserSettings[keys[key]];
    }
  }
  handleSettings();
}

function noSettings() {
  // Retreive NO Data and Set up Cover
  if (NotLogged == true) {return;}
  NotLogged = true;
  $(".settingsContainer > h2:nth-child(1)").after("<h4>Login to View and Edit Settings</h4>");
  let cover = document.createElement('div');  cover.setAttribute("class", "settingsCover")
  $(".settingsWrapper")[0].appendChild(cover);
  $(".settingsWrapper")[0].style = "filter: blur(0.8px) brightness(0.8); height: calc(100% - 160px); "
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

$(" input[type=text], input[type=number], input[type=url], input[type=color] ").change(function(e) {
  data = [ $(e.target)[0].id.split('_')[1] , $(e.target)[0].value ];
  socket.emit('CallSettings', "Write", data);

  UserSettings[$(e.target)[0].id.split('_')[1]] = [ $(e.target)[0].value ]
  handleSettings();
})


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
    else if (key == "ViewT") { 
      currentViewType = UserSettings[key];
      if (currentViewType == 0) {
        directoryPath == "Homepage" ? viewHomepageContentAsBlock() : viewContentAsBlock();
        clientStatus("CS6", "Off");
      } else if (currentViewType == 1) {
        directoryPath == "Homepage" ? viewHomepageContentAsList() : viewContentAsList();
        clientStatus("CS6", "True");
      }
    }
    else if (key == "HighL") { document.documentElement.style.setProperty('--highlight-color', UserSettings[key]) }
    else if (key == "BGImg") {
      if (UserSettings[key]) {
        let BG_url = UserSettings[key].split('/').length > 2 ? "url("+UserSettings[key]+")" : "url(//drive.nanode.one/storage/"+(UserSettings[key]).replace(" ", "")+")"
        $("#databaseBackgroundMain")[0].style.backgroundImage = BG_url;
      }
    }
  }
  displayDetails() == true ? $(".toggleDetailsBtn").css({"text-align": "left", "color":UserSettings["HighL"]}) : $(".toggleDetailsBtn").css({"text-align": "right", "color":"#5b5b5f"});
}


displayDetails = function() { 
  return (JSON.parse(localStorage.getItem('displayDetails'))) ? true : false 
}

function dateFormater(date) {
  if (date == null || !date.length) { return "-"; }
  if (dateFormat == 0) {
    let newDate = date.split('/')
    let hold = newDate[1];
    newDate[1] = newDate[0];
    newDate[0] = hold;
    return newDate.join('/');
  }
  return date;
}
function timeFormater(time) {
  let Minutes = Math.floor(time / 60) < 10 ?  "0" + Math.floor(time / 60) : Math.floor(time / 60);
  let Seconds = Math.floor(time - (Minutes * 60)) < 10 ? "0" + Math.floor(time - (Minutes * 60)) : Math.floor(time - (Minutes * 60));
  return Minutes+":"+Seconds;
}
function timeFormaterReverse(time) {
  return (parseInt(time.split(':')[0] * 60) + parseInt(time.split(':')[1]))
}

function convertSize(InputSize) {
  let size = (InputSize / 1024 / 1024 / 1024).toFixed(2)+ " GB";
  if (size.charAt(0) == "0") {
    size = (InputSize / 1024 / 1024).toFixed(2)+" MB";
    if (size.charAt(0) == "0") {
      size = (InputSize / 1024).toFixed(2)+' KB'
    }
    if (size.charAt(0) == "0") {
      size = (InputSize).toFixed(2)+' Bytes'
    }
  }
  return size;
}