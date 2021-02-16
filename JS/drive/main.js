// ================ Variables ================
let currentPage = "User";

let NanoName = "home";
let Directory_Tree = [];  // Array of Trees, Uses Last Tree, New Tree on More than 1 Step. ie: Home / dirBtn. Saves Forward/Backward
let Directory_Route = []; // The Current Route, is whats used for the dir btns. Doesnt Store Forward
let Tree_Number = 0; // Current Tree Index
let Tree_Steps = 0; // Current Index in Tree
let FolderCall = true; // If Route Was Called by Clicking on a Folder
let Section='main';
let Directory_Content = '';
let NanoSelected = [];
let UserSettings = {};

// ===========================================  Connect to socket.io
window.socket = io.connect('https://Nanode.one', { reconnection:false });

function Socket_Reconnect(status) {
  let Recon = document.getElementById('Recon_Btn');
  Recon.style.display = status === true ? "none" : "block";
  if (status === false) {
    Recon.innerText = Recon.innerText == "Reconnecting" ? "Failed" : "Reconnect";
    Recon.addEventListener("click", function() {if (socket) { Recon.innerText = "Reconnecting"; socket.connect(); } }) }
}

// =========================================== Initial Actions
document.addEventListener("DOMContentLoaded", async(event) => {
  await Settings_Call();
  await pageSwitch('User');
  
  // Check for Connection
  if (socket !== undefined) {
    socket.on('connect', function() { setTimeout(function() { clientStatus("CS0", "Ok"); Socket_Reconnect(true); }, 1000) })
    socket.on('disconnect', function() {clientStatus("CS0", "False"); Socket_Reconnect(false); })
    socket.on('connect_error', function() {clientStatus("CS0", "False"); Socket_Reconnect(false); })
    socket.on('connect_failed', function() {clientStatus("CS0", "Wait"); })  
  }
})

// =========================================== Settings Caller
Settings_Call = async() => {
  let curSet = JSON.parse(localStorage.getItem('user-settings'));
  if (curSet && (new Date().getTime() - new Date(curSet.LastAc).getTime()) < 20*60*1000) {
    SetStorage( JSON.parse(localStorage.getItem('user-plan')) );
    return readSettings( curSet );
  } else {
    let Settings_Request = await fetch('https://drive.nanode.one/settings');
    let Settings_Response = await Settings_Request.json();
    if (Settings_Response.Error) { noSettings(); return false; }
    else {
      Settings_Response.Settings.LastAc = new Date().toISOString();
      localStorage.setItem('user-plan', JSON.stringify(Settings_Response.Plan))
      localStorage.setItem('user-settings', JSON.stringify(Settings_Response.Settings))
      SetStorage( Settings_Response.Plan );
      return readSettings(Settings_Response.Settings);
    }
  }
}

// =========================================== Page Changer
pageSwitch = async(pageName) => {
  let pageToSwitch = document.querySelector('.Pages .'+pageName+'_Page');
  document.querySelectorAll('.PageDisplay').forEach((page) => { page.classList.remove('PageDisplay') });
  if (pageToSwitch.innerHTML.length == 0) {
    await $(pageToSwitch).load(`/views/drive/${pageName}.html`);
  }
  pageToSwitch.classList.add('PageDisplay');
}

document.querySelectorAll('.PageList div span').forEach((pageBtn) => {
  pageBtn.addEventListener('click', (e) => {
    pageSwitch(e.currentTarget.getAttribute('drvpage'));
    document.querySelector('.SelectedPage').classList.remove('SelectedPage')
    e.currentTarget.classList.add('SelectedPage');
  })
})

// =========================================== Button and Key Listeners
const shortcutKeys = {
  "Ctrl+A": "All",
  "Ctrl+N": "New",
  "Delete": "Delete",
  "Arrow_Up": "Move Up an Item",
  "Arrow_Down": "Move Down an Item",
  "Arrow_Left": "Back a directory",
  "Arrow_Right": "Forward a directory",
}

const keyMap = {};

onkeydown = function(e) { keyMap[e.key] = true; }
onkeyup = function(e) { keyMap[e.key] = false; }

// =========================================== Visual Functions

function clientStatus(Light, Status, Time) {
  lightColours = {"Off": "None", "True": "White", "False": "Red", "Ok": "#00ff00", "Wait": "Yellow", "User": "Cyan"};
  if (document.getElementById(Light) != undefined) {
    document.getElementById(Light).style.cssText = "background: "+lightColours[Status]+"; color:"+lightColours[Status]+";";
    if (Time) {
      setTimeout(function() {
        document.getElementById(Light).style.cssText = "background: none; color: none;";
      }, Time)
    }
  }
}

function ColorPicker(calledBy, callback) {
  clientStatus("CS7", "Wait", 400); clientStatus("CS8", "User");

  if ($(".colorContainer")[0]) {$(".colorContainer")[0].remove();}

  let colorContainer = document.createElement('div');
  colorContainer.setAttribute('class', "colorContainer");
  colorContainer.innerHTML = "<i id='closeColorPicker' class='fas fa-times' title='Close Picker'></i> <input type='text' id='colorPickEntry' class='colorPickEntry' placeholder='#000000'></input> <div class='colorOptionsContainer'></div><i id='acceptColorPicked' class='fas fa-check' title='Accept Colour'></i>";
  document.body.appendChild(colorContainer);

  if (typeof RCElement === 'object' && RCElement.hasAttribute('style')) {
    let HexColor = UserSettings.ViewT == 0 ? N_RGBtoHex($(RCElement).css('borderBottom')) : N_RGBtoHex($(RCElement).css('boxShadow'));

    $("#colorPickEntry")[0].value = HexColor
    $("#colorPickEntry")[0].style.color = HexColor;
  }

  const colorOptions = [
    "#ffffff", "#d2d2d2", "#ababab", "#464646", "#000000", 
    "#ff0000", "#cc7575", "#c83939", "#720000", "#460000",
    "#f000ff", "#f4bdf7", "#f99aff", "#9c2ba3", "#630169",
    "#66cfd4", "#6ec5e7", "#6697d4", "#4e4cb3", "#2825ca",
    "#00ff4f", "#bdf7cf", "#60b179", "#148a39", "#004816",
    "#f9fd00", "#fdff93", "#a8a95c", "#8e9000", "#474800",
    "#ff7500", "#ff9133", "#a34b00", "#69370b", "#401e00",
  ]

  for (i=0; i<colorOptions.length; i++) {
    let colorOption = document.createElement('div');
    colorOption.setAttribute('color', colorOptions[i]);
    colorOption.style.background = colorOptions[i];
    $(".colorOptionsContainer")[0].appendChild(colorOption);
  }

  $("#colorPickEntry").keypress(function(e) {
    if ($(".selectedCol")[0]) {$(".selectedCol")[0].classList.remove('selectedCol')}
    if ($("#colorPickEntry")[0].value.length > 9) { e.preventDefault() }
    $("#colorPickEntry")[0].style.color = $("#colorPickEntry")[0].value + String.fromCharCode(e.keyCode);
  })

  $(".colorOptionsContainer > div").on("click", function(e) {
    selectedColor = e.target.getAttribute('color');
    $("#colorPickEntry")[0].value = selectedColor
    $("#colorPickEntry")[0].style.color = selectedColor;
    if ($(".selectedCol")[0]) {$(".selectedCol")[0].classList.remove('selectedCol')}
    e.target.classList.add('selectedCol');
  })

  $("#closeColorPicker").on("click", function() {
    $(".colorContainer")[0].remove();
  })
  $("#acceptColorPicked").on("click", function() {
    if ( !$("#colorPickEntry")[0].style.color ) { let ColorPicked = null }
    let ColorPicked = $("#colorPickEntry")[0].style.color;
    $(".colorContainer")[0].remove();

    if (typeof RCElement !== 'undefined' && calledBy == "RC") {
      socket.emit('ItemEdit', {"action": "DATA", "section": Section, "ID": RCElement.getAttribute('nano-id'), "EditData": {"color": ColorPicked}, "Path": NanoID })
      return;
    }
    callback(ColorPicked);
  })

  dragElement($(".colorContainer")[0]);
}

function dragElement(element) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  element.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    if (e.target != element) { return; }
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function SetStorage(plan) {
  let StorageElem = document.querySelector('.Storage');
  StorageElem.querySelector('p').innerText = `${N_ConvertSize(plan.used)} / ${N_ConvertSize(plan.max).replace('.00', '')}`;
  StorageElem.querySelector('progress').value = parseFloat(((plan.used / plan.max) * 100).toFixed(2));
}