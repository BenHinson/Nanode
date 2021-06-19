// ================ Variables ================
let currentPage = 'main';
let Section = 'main';

let NodeName = 'home';
let Spans = {};
let Nodes = {};
let NodeSelected = []; // Items that are currently selected

// @ == Initial Load
document.addEventListener("DOMContentLoaded", async(event) => {
  await sessionSettings();
  await pageSwitch(currentPage);
})


// @ == API Caller
API_Fetch = async(fetchdata, response) => { // await API_Fetch({url: `/example/test`})
  const {url, conv} = fetchdata;
  N_ClientStatus(4, 'Wait');
  let req = await fetch(`https://drive.nanode.one${url[0] != '/' ? '/' : ''}${url}`);

  if (conv == 'blob') { req = await req.blob() }
  else if (conv == 'text') { req = await req.text() }
  else { req = await req.json() }

  N_ClientStatus(4, 'Off');
  return req.Error ? false : req;
}

API_Post = async(senddata) => { // await API_Post({url: `drive.nanode.one/`})
  const {url, body} = senddata;
  let req = await fetch(`https://drive.nanode.one${url[0] != '/' ? '/' : ''}${url}`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: new Blob( [ JSON.stringify(body) ], { type: 'text/plain' })
  })
  N_ClientStatus(3, "True", 500);
  return await req.json();
}

// @ = Nodes Creator
class Node {
  constructor(data, id, parent) {
    this.data = data;
    this.data.id = this.data.id || id;
    this.data.parent = this.data.parent || parent;
    this.data.type = N_TypeManager(data.mime || data.type.mime);
  }
}

// @ == Change Pages
pageSwitch = async(pageName) => {
  let pageToSwitch = document.querySelector(`.Pages .${pageName}_Page`);
  document.querySelectorAll('.PageDisplay').forEach((page) => { page.classList.remove('PageDisplay') });
  if (pageToSwitch.innerHTML.length === 0) { // WHAT IS AN ALTERNATIVE FOR THIS. ATLEAST THIS LOADS SCRIPTS
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

// @ == Global Element Functions

class CreateColorPicker {
  constructor(caller, callback) {
    this.callback = callback;
    this.element = caller == 'RC' && typeof RCElement !== 'undefined' ? RCElement : null;
    this.originColor = this.element?.hasAttribute('style')
      ? N_RGBtoHex(getComputedStyle(this.element)[ UserSettings.local.layout == 0 ? 'borderBottom' : 'boxShadow' ])
      : '';
    this.colorOptions = [
      "#ffffff", "#d2d2d2", "#ababab", "#464646", "#000000", 
      "#ff0000", "#cc7575", "#c83939", "#720000", "#460000",
      "#f000ff", "#f4bdf7", "#f99aff", "#9c2ba3", "#630169",
      "#66cfd4", "#6ec5e7", "#6697d4", "#4e4cb3", "#2825ca",
      "#00ff4f", "#bdf7cf", "#60b179", "#148a39", "#004816",
      "#f9fd00", "#fdff93", "#a8a95c", "#8e9000", "#474800",
      "#ff7500", "#ff9133", "#a34b00", "#69370b", "#401e00",
    ]

    this._Initialise();
  }

  _Initialise() {
    N_ClientStatus(8, "User");
    document.querySelector(".colorContainer")?.remove();
    this.RenderPicker_();
  }

  RenderPicker_() {
    this.container = document.createElement('div');
    this.container.classList.add('colorContainer');
    this.container.innerHTML = `
      <span class='flex-around-cent'>
        <i id='closeColorPicker' class='fas fa-times' title='Close Picker'></i>
        <input type='text' class='colorPickEntry' placeholder='#000000'></input>
        <i id='acceptColorPicked' class='fas fa-check' title='Accept Colour'></i>
      </span>
      <div class='colorOptionsContainer'>${this.colorOptions.reduce((a, b) => a + `<div style='background: ${b};'></div>`, ``)}</div>
    `;
    document.body.appendChild(this.container);

    this.colorEntry = this.container.querySelector('input');
    this.UpdateColor_();
    this.SetListeners_();
    dragElement(this.container);
  }

  SetListeners_() {
    document.getElementById('closeColorPicker').onclick = () => {this.container?.remove()}
    document.getElementById('acceptColorPicked').onclick = async() => {
      if (this.callback) {this.callback(this.colorEntry.value)}
      else {await NodeAPI('edit', {'action': 'DATA', 'section': Section, 'id': this.element.getAttribute('node-id'), 'data': {'color': this.colorEntry.value}, 'path': NodeID})}
      this.container?.remove();
    }
    this.colorEntry.addEventListener('keypress', (e) => { // For some reason this can make the thing lag badly.
      this.container.querySelector('.selected')?.classList.remove('selected');
      if (e.target.value.length > 6 && e.key !== 'Backspace') {e.preventDefault()}
      e.target.style.color = e.target.value;
    })
    this.container.querySelectorAll('.colorOptionsContainer div').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.UpdateColor_(N_RGBtoHex(e.target.style.background))
        this.container.querySelector('.selected')?.classList.remove('selected');
        e.target.classList.add('selected');
      })
    })
  }

  UpdateColor_(newColor) {
    this.colorEntry.value = newColor || this.originColor;
    this.colorEntry.style.color = newColor || this.originColor;
  }
}

function dragElement(element) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  element.onmousedown = (e) => {
    if (e.target !== element) { return; }
    e.preventDefault();
    [pos3, pos4] = [e.clientX, e.clientY];

    document.onmouseup = () => {
      document.onmouseup = null;
      document.onmousemove = null;
    };

    document.onmousemove = (e) => {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      [pos3, pos4] = [e.clientX, e.clientY];
      element.style.top = `${element.offsetTop - pos2}px`;
      element.style.left = `${element.offsetLeft - pos1}px`;
    };
  }
}