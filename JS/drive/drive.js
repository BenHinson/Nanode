const defConfig = {method: 'POST', headers: {'Content-Type': 'application/json'}}
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

// Generate App ==========

class App {
  static Section = 'main';

  static Spans = {};
  static Nodes = {};
  static NodeSelected = new Set();

  static InternetConnection = window?.navigator?.onLine || undefined;

  constructor() {
    this.SetListeners_();    
  }

  SetListeners_() {
    document.addEventListener("DOMContentLoaded", async(event) => {
      await new Settings();
      await App.pageSwitch('main');
    })
    document.querySelectorAll('.PageList div span').forEach((pageBtn) => {
      pageBtn.addEventListener('click', (e) => {
        App.pageSwitch(e.currentTarget.getAttribute('drvpage'));
      })
    })

    // * Key Event Listeners
    onkeydown = (e) => { keyMap[e.key] = true; }
    onkeyup = (e) => { keyMap[e.key] = false; }

    // * Internet Connection Listener
    window.ononline = () => {
      App.InternetConnection = true;
      N_.InfoPopup({'parent':N_.Find('.Page_Loading'), 'type': 'success', 'text':'Internet Connection Restored', 'displayDelay':100, 'displayTime':5000});
    }
    window.onoffline = () => {
      App.InternetConnection = false;
      N_.InfoPopup({'parent':N_.Find('.Page_Loading'), 'type': 'error', 'text':'You are not connected to the internet', 'displayDelay':100, 'displayTime':5000});
    }
  }

  static async pageSwitch(pageName) {
    let pageToSwitch = document.querySelector(`.Pages .${pageName}_Page`);
    document.querySelectorAll('.PageDisplay').forEach((page) => { page.classList.remove('PageDisplay') });
    if (pageToSwitch.innerHTML.length === 0) { // WHAT IS AN ALTERNATIVE FOR THIS. ATLEAST THIS LOADS SCRIPTS
      await $(pageToSwitch).load(`/views/drive/${pageName}.html`);
    }
    pageToSwitch.classList.add('PageDisplay');
    App.Section=pageName;
  
    document.querySelector('.SelectedPage').classList.remove('SelectedPage');
    document.querySelector(`span[drvpage='${pageName}']`).classList.add('SelectedPage');
  
    return true;
  }

  static async API_Fetch(fetch_data, response) { // await App.API_Fetch({url: `/example/test`})
    const {url, conv} = fetch_data;

    if (!App.InternetConnection) {
      N_.InfoPopup({'parent':N_.Find('.Page_Loading'), 'type': 'error', 'text':'Unable to send request: No Internet Connection', 'displayDelay':100, 'displayTime':3000});
    }
  
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
  
  static async API_Post(send_data) { // await App.API_Post({url: `drive.nanode.one/`})
    const {url, body, skipErr=false} = send_data;

    if (!App.InternetConnection) {
      N_.InfoPopup({'parent':N_.Find('.Page_Loading'), 'type': 'error', 'text':'Unable to send request: No Internet Connection', 'displayDelay':100, 'displayTime':3000});
    }

    try {
      let res = await fetch(`https://drive.nanode.one${url[0] != '/' ? '/' : ''}${url}`, {
        ...defConfig,
        body: new Blob( [ JSON.stringify(body) ], { type: 'text/plain' })
      })
      if (!res.ok && !skipErr) throw new Error(res.statusText);
      N_.ClientStatus(3, "True", 500);
      return res.json();
    } catch(err) { console.log(err); }
  }
}

new App();


// Generate Node ==========
class Node {
  constructor(data, id, parent) {
    this.data = data;
    this.data.id = this.data.id || id;
    this.data.parent = this.data.parent || parent;
    this.data.type = N_.TypeManager(data.mime || data.type.mime);
  }
}