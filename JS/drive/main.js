// ================ Variables ================
let currentPage = 'main';
let Section = 'main';

let NodeName = 'home';
let Directory_Content = '';
let NodeSelected = []; // Items that are currently selected

// =========================================== Initial Actions

document.addEventListener("DOMContentLoaded", async(event) => {
  await sessionSettings();
  await pageSwitch(currentPage);
})

// =========================================== Directory Caller

Directory_Call = async(FetchData, Response) => {
  const {Folder, Section, subSection} = FetchData;
  N_ClientStatus(4, "Wait");
  let Request = await fetch(`https://drive.nanode.one/folder/${Folder.toLowerCase()}?s=${Section.toLowerCase()}&sub=${subSection.toLowerCase()}`);
  N_ClientStatus(4, "Off"); N_ClientStatus(7, "Wait", 800);
  return await Request.json();
}

// =========================================== Settings Caller

Settings_Call = async() => {
  N_ClientStatus(4, "Wait");
  let Settings_Request = await fetch('https://drive.nanode.one/account/settings');
  let Settings_Response = await Settings_Request.json();
  N_ClientStatus(4, "Off");
  return Settings_Response.Error ? false : Settings_Response;
}

// =========================================== Page Changer

pageSwitch = async(pageName) => {
  let pageToSwitch = document.querySelector('.Pages .'+pageName+'_Page');
  document.querySelectorAll('.PageDisplay').forEach((page) => { page.classList.remove('PageDisplay') });
  if (pageToSwitch.innerHTML.length === 0) {
    await $(pageToSwitch).load(`/views/drive/${pageName}.html`);
  }
  pageToSwitch.classList.add('PageDisplay');
  Section=pageName;
}

document.querySelectorAll('.PageList div span').forEach((pageBtn) => {
  pageBtn.addEventListener('click', (e) => {
    pageSwitch(e.currentTarget.getAttribute('drvpage'));
    document.querySelector('.SelectedPage').classList.remove('SelectedPage')
    e.currentTarget.classList.add('SelectedPage');
  })
})

// =========================================== Search Call and Response

Search_Call = async(FetchData, Response) => {
  const {Search, Section, subSection} = FetchData;
  let Request = await fetch(`https://drive.nanode.one/search/${Search}?s=${Section.toLowerCase()}&sub=${subSection.toLowerCase()}`)
  return await Request.json();
}

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

function ColorPicker(calledBy, callback) {
  N_ClientStatus(7, "Wait", 400); N_ClientStatus(8, "User");

  if ($(".colorContainer")[0]) {$(".colorContainer")[0].remove();}

  let colorContainer = document.createElement('div');
  colorContainer.setAttribute('class', "colorContainer");
  colorContainer.innerHTML = "<i id='closeColorPicker' class='fas fa-times' title='Close Picker'></i> <input type='text' id='colorPickEntry' class='colorPickEntry' placeholder='#000000'></input> <div class='colorOptionsContainer'></div><i id='acceptColorPicked' class='fas fa-check' title='Accept Colour'></i>";
  document.body.appendChild(colorContainer);

  if (typeof RCElement === 'object' && RCElement.hasAttribute('style')) {
    let HexColor = UserSettings.local.layout == 0 ? N_RGBtoHex($(RCElement).css('borderBottom')) : N_RGBtoHex($(RCElement).css('boxShadow'));

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
      // socket.emit('ItemEdit', {"action": "DATA", "section": Section, "ID": RCElement.getAttribute('node-id'), "EditData": {"color": ColorPicked}, "Path": NodeID })
      EditPOST({"action": "DATA", "section": Section, "id": RCElement.getAttribute('node-id'), "data": { "color": ColorPicked }, "path": NodeID})
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