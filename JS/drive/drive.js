// ================ Variables ================
let currentPage = 'main';
let Section = 'main';

let NodeName = 'home';
let Spans = {};
let Nodes = {};
let NodeSelected = new Set(); // Items that are currently selected

const defConfig = {method: 'POST', headers: {'Content-Type': 'application/json'}}


// @ == Initial Load
document.addEventListener("DOMContentLoaded", async(event) => {
  await SettingsController();
  await pageSwitch(currentPage);
})


// @ == API Caller
API_Fetch = async(fetch_data, response) => { // await API_Fetch({url: `/example/test`})
  const {url, conv} = fetch_data;

  try {
    N_.ClientStatus(4, 'Wait');
    let req = await fetch(`https://drive.nanode.one${url[0] != '/' ? '/' : ''}${url}`);
    if (!req.ok) throw new Error(req.statusText);
    if (conv == 'blob') { req = await req.blob() }
    else if (conv == 'text') { req = await req.text() }
    else { req = await req.json() }
    
    N_.ClientStatus(4, 'Off');
    return req.Error ? false : req;
  } catch(err) { console.log(err) }
}

API_Post = async(send_data) => { // await API_Post({url: `drive.nanode.one/`})
  const {url, body} = send_data;
  try {
    let res = await fetch(`https://drive.nanode.one${url[0] != '/' ? '/' : ''}${url}`, {
      ...defConfig,
      body: new Blob( [ JSON.stringify(body) ], { type: 'text/plain' })
    })
    if (!res.ok) throw new Error(res.statusText);
    N_.ClientStatus(3, "True", 500);
    return res.json();
  } catch(err) { console.log(err) }
}

// @ = Nodes Creator
class Node {
  constructor(data, id, parent) {
    this.data = data;
    this.data.id = this.data.id || id;
    this.data.parent = this.data.parent || parent;
    this.data.type = N_.TypeManager(data.mime || data.type.mime);
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

  document.querySelector('.SelectedPage').classList.remove('SelectedPage');
  document.querySelector(`span[drvpage='${pageName}']`).classList.add('SelectedPage');

  return true;
}

document.querySelectorAll('.PageList div span').forEach((pageBtn) => {
  pageBtn.addEventListener('click', (e) => {pageSwitch(e.currentTarget.getAttribute('drvpage'));})
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