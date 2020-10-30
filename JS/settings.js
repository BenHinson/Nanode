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

  let keys = Object.keys(UserSettings);
  for (key in keys) {
    let objID = settingsMap[keys[key]]
    if ( typeof UserSettings[keys[key]] == "number" ) {
      $("#"+ objID[ UserSettings[keys[key]] ] +"")[0].classList.add("SW_Selected");
    } else if ( $("#"+objID+"")[0] ) {
      $("#"+objID+"")[0].value = UserSettings[keys[key]];
    }
  }
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
    else if (key == "ViewT" && typeof directoryPath != 'undefined') {
      if (UserSettings.ViewT == 0 && typeof NanoID != 'undefined') {
        viewContentAsBlock(directoryPath);
        clientStatus("CS6", "Off");
      } else if (UserSettings.ViewT == 1 && typeof NanoID != 'undefined') {
        viewContentAsList(directoryPath);
        clientStatus("CS6", "True");
      }
    }
    else if (key == "HighL") { document.documentElement.style.setProperty('--highlight-color', UserSettings[key]) }
    else if (key == "BGImg") {
      if (UserSettings[key] && $("#databaseBackgroundMain")[0]) {
        let BG_url = UserSettings[key].split('/').length > 2 ? "url("+UserSettings[key]+")" : "url(//drive.nanode.one/storage/"+(UserSettings[key]).replace(" ", "")+")"
        $("#databaseBackgroundMain")[0].style.backgroundImage = BG_url;
      } else { $("#databaseBackgroundMain")[0].style.backgroundImage = ""; }
    }
  }
  displayDetails() == true ? $(".toggleDetailsBtn").css({"text-align": "left", "color":UserSettings["HighL"]}) : $(".toggleDetailsBtn").css({"text-align": "right", "color":"#5b5b5f"});
}


const displayDetails = () => { 
  return (JSON.parse(localStorage.getItem('displayDetails'))) ? true : false 
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


function dateNow() {
  return date = new Date().toISOString().split('T')[0];
}
function dateFormater(date) {
  if (date == null || !date.length) { return "-"; }
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2)  day = '0' + day;

  return dateFormat == 0 ? [day, month, year].join('/') : [month, day, year].join('/');
}
function timeFormater(time) {
  let Minutes = Math.floor(time / 60) < 10 ?  "0" + Math.floor(time / 60) : Math.floor(time / 60);
  let Seconds = Math.floor(time - (Minutes * 60)) < 10 ? "0" + Math.floor(time - (Minutes * 60)) : Math.floor(time - (Minutes * 60));
  return Minutes+":"+Seconds;
}
function timeFormaterReverse(time) {
  return (parseInt(time.split(':')[0] * 60) + parseInt(time.split(':')[1]))
}
function RGBtoHEX(rgb){
  let RGBColor = rgb.replace(/^.*rgba?\(([^)]+)\).*$/,'$1').split(',');
  return  RGBColor.length >= 2 ? ("#" + ("0" + parseInt(RGBColor[0],10).toString(16)).slice(-2) + ("0" + parseInt(RGBColor[1],10).toString(16)).slice(-2) + ("0" + parseInt(RGBColor[2],10).toString(16)).slice(-2)) : (RGBColor);
}
function convertSize(InputSize) {
  if (!InputSize) { return '-' }
  let fileSizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  for (let i=0; i<fileSizes.length; i++) {
    if (InputSize <= 1024) { return InputSize+" "+fileSizes[i] }
    else { InputSize = parseFloat(InputSize / 1024).toFixed(2) }
  }
  return InputSize;
}
function ItemImage(type, OID, Block) {
  if (!type.isFi)           return "/assets/FileIcons/Folder.svg";
  else if (type.isImg)      return Block ? "/storage/"+OID+"?h=90&w=120" : "/storage/"+OID+"?h=32&w=32";

  let file_type = ItemChecker(type)
  if (file_type == "unknown")     return "/assets/FileIcons/File.svg";
  else                            return "/assets/FileIcons/"+file_type+"File.svg";
}
const ItemChecker = (item_Type) => {
  if (!item_Type.isFi) { return "folder" }
  if (item_Type.isImg) { return "image" }
  if (item_Type.mimeT) {
    if (item_Type.mimeT.includes("video")) { return "video" }
    if (item_Type.mimeT.includes("audio")) { return "audio" }
    if (item_Type.mimeT.includes("text")) { return "text" }
    return "file";
  }
  if (item_Type.End == "txt") { return "text" }
  return "unknown";
}
const capFirstLetter = (string) => {
  return typeof string !== 'string' ? '' : string.charAt(0).toUpperCase() + string.slice(1)
}


var keyMap = {};
onkeydown = onkeyup = function(e) {
  keyMap[e.keyCode] = e.type == 'keydown';
}