const BlockOut = document.querySelector('.BlockOut');

class SecurityInputContainer {
  constructor(res) {
    this.response = res;
    this.securityIcons = {"Password": "far fa-keyboard", "Pin": "fas fa-th", "Time": "far fa-clock"}
    this.securityElements = {
      "Password": " 'placeholder='Password' inputType='pass' type='password'' ",
      "Pin": " 'placeholder='Pin Code • 1-9' inputType='pin' type='password'' "
    }
    this._Initialise();
  }

  _Initialise() {
    N_.ClientStatus(5, "User");
    this.container = N_.MakeReplaceElem(ItemInformation.PageInfo, '.ItemLocked', '<div class="ItemLocked"></div>');
    this.RenderContents_();
    this.SetListeners_();
  }
  RenderContents_() {
    this.container.innerHTML = `
      <span class='locked_title flex-between-cent'>
        <h3>Locked</h3>
        <i class="far fa-times-circle"></i>
      </span>
      <h5 class='italic-small'>Enter the items credentials to view</h5>
      ${this.RenderOptions_()}
      <button class='securityEntry rb-btn-full'>Submit</button>
    `;
  }
  RenderOptions_(elements = ``) {
    this.response.Auth.forEach(measure => 
      elements += `
        <span class='security_option flex-between-cent'>
          <i class='${this.securityIcons[measure]}'></i>
          <input class='SecurityInputs ${this.securityElements[measure]}'></input>
        </span>`
    );
    return elements;
  }
  SetListeners_() {
    this.container.querySelector('.locked_title > i').addEventListener("click", () => { this.container.remove(); })

    this.container.querySelector('.securityEntry').addEventListener("click", async() => {
      let res = await App.API_Post({url: `/auth`, body: {
        "entries": this.GetEntries_(),
        "nodeId": this.response.Item,
        "section": App.Section,
      }});

      if (res.Error) {
        this.container.style.boxShadow = 'inset 0 0 0 1px var(--red)';
      } else {
        Main.NodeCall({"reload":true, "skip": true}, res);
        this.container.remove();
      }
    })

  }
  GetEntries_(val={}) {
    this.container.querySelectorAll('input').forEach(elem => {val[elem.getAttribute('inputType')] = elem.value})
    return val;
  }
}


class CreateColorPicker {
  constructor(caller, callback) {
    this.callback = callback;
    this.element = (caller == 'RC' && typeof RCC.RCElement !== 'undefined') ? RCC.RCElement : caller;
    // this.originColor = this.element?.hasAttribute('style')
    // ? N_.RGBtoHex(getComputedStyle(this.element)[ Settings.Local.layout == 0 ? 'borderBottom' : 'boxShadow' ])
    // : '';
    this.originColor = this.element?.getAttribute('color');
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
    N_.ClientStatus(8, "User");
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
    N_.DragElement(this.container);
  }

  SetListeners_() {
    document.getElementById('closeColorPicker').onclick = () => {this.container?.remove()}
    document.getElementById('acceptColorPicked').onclick = () => {
      if (this.callback) {this.callback(this.colorEntry.value)}
      else {Main.NodeAPI('edit', {'action': 'DATA', 'section': Section, 'id': [this.element.getAttribute('node-id')], 'data': {'color': this.colorEntry.value}, 'path': Main.NodeID})}
      this.container?.remove();
    }
    this.colorEntry.addEventListener('keypress', (e) => { // For some reason this can make the thing lag badly.
      this.container.querySelector('.selected')?.classList.remove('selected');
      if (e.target.value.length > 6 && e.key !== 'Backspace') {e.preventDefault()}
      e.target.style.color = e.target.value;
    })
    this.container.querySelectorAll('.colorOptionsContainer div').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        this.UpdateColor_(N_.RGBtoHex(e.target.style.background))
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


class Popup {
  constructor(PopupType, Target, Action, DATA) {
    [this.PopupType, this.Target, this.Action, this.DATA] = [PopupType, Target, Action, DATA];
    this.ButtonColor = {'warning': 'PUA_Red'}
    this._Initialise();
  }

  _Initialise() {
    this.LoadBase_();
    this.RenderContent_();
    this.SetListeners_();
  }
  LoadBase_() {
    if (!document.querySelector('.Popup_Container')) { BlockOut.innerHTML = `<div class='Popup_Container'></div>`}
    this.Base = document.querySelector('.Popup_Container');
    BlockOut.addEventListener('mousedown', (e) => { e.stopImmediatePropagation(); if (e.target == BlockOut) {this.ToggleBase_()} })
  }
  ToggleBase_() {
    if (BlockOut.classList.toggle('grid-items-center'))
    { N_.ClientStatus(8, "User"); document.removeEventListener('keydown', this.EscBtn); document.addEventListener('keydown', this.EscBtn); } 
    else {N_.ClientStatus(8, "Off"); document.removeEventListener('keydown', this.EscBtn); };
  }

  RenderContent_() {
    this.Base.innerHTML = `
      <div class='Popup_Main'>
        <h3>${this.DATA.title}</h3>
        ${this.MainContent_()}
        <span>
          <button class='Popup_Reject'>${this.DATA.reject}</button>
          <button class='Popup_Accept ${this.ButtonColor[this.DATA.color] || ''}'>${this.DATA.accept}</button>
        </span>
      </div>
      ${this.DATA.secondary ? this.SecondaryContent_() : ''}
    `;
    this.ToggleBase_();
  }
  MainContent_(content=``) {
    switch(this.PopupType) {
      case('AcceptCancel') : {
        content = `<p>${this.DATA.text}</p>`; break;
      }
      case('NewSpan') : {
        content = `<input class='Popup_Input Popup_Input_Name' max-length='128' type='text' placeholder='Name...' autocomplete='new-password'></input>`; break;
      }
      case('NewFolder') : {
        content = `
          <div class='Popup_Dropdown' style='top: 12px; right: 15px;'>
            <div class='Popup_Location' title='Location' ${createLocation(this.DATA.RCE)}</div>
          </div>
          <input class='Popup_Input Popup_Input_Name' max-length='128' type='text' placeholder='Name...' autocomplete='new-password'></input>
        `;
        this.dropdown = true;
        break;
      }
      case('Download') : {
        content = `
          <h5> - ${N_.TextMultiple(this.DATA.download.length, "Item")}</h5>

          <div class='Switch SW_DL' style='top: 11px;right: 15px;'>
            <div class='Slider SL_DL'></div>
            <div>Me</div> <div>Share</div>
          </div>

          <input class='Popup_Input Popup_Input_Name' max-length='128' type='text' placeholder='Name...' value='${this.DATA.name}' autocomplete='new-password'></input>
        `;
        this.switch = true;
        break;
      }
      case('Rename') : {
        content = `<input class='Popup_Input Popup_Input_Name' max-length='128' type='text' placeholder='New Name...' autocomplete='new-password' value='${App.Nodes[this.DATA.nodeID].data.name}'></input>`; break;
      }
    }
    return content;
  }
  SecondaryContent_(content=``) {
    switch(this.PopupType) {
      case('NewFolder') : {
        content = `
          <div class='Popup_Secondary'>
            <h4>Optional</h4>
            <textarea class='Popup_Option_Desc' placeholder='Add a Description...' maxlength='100'></textarea>
            <button class='Popup_Option_Colour'>Choose a Colour...</button>
            <input class='Popup_Option_Pass' placeholder='Set a Password...' type='password' autocomplete='off' maxlength='128'></input>
            <input class='Popup_Option_Pin' placeholder='Set a Pin...' type='number' autocomplete='off' maxlength='20'></input>
          </div>
        `;
        this.colorPicker = true;
        break;
      }
    }
    return content;
  }

  SetListeners_() {
    this.Base.querySelector('.Popup_Reject').addEventListener('click', () => { this.ToggleBase_() })

    this.Base.querySelector('.Popup_Accept').addEventListener('click', async (e) => {
      let selectedItem = this.Target;
      let selectedItemID = selectedItem?.getAttribute('node-id') || null;

      if (this.Action == 'Delete') {
        if (selectedItem.getAttribute('rc') == "Homepage_Span") { // EMPTY THE SPAN FIRST DOES THIS CAUSE ISSUES? IE CONTENTS NOT BEING DELETED PERM
          if (App.Spans[selectedItem.parentNode.getAttribute('node-id')]) {
            selectedItemID = selectedItem.parentNode?.getAttribute('node-id')
          } else {
            return console.log('Invalid Span ID');
          }
        }
        let forDeletion = App.NodeSelected.size > 0 ? Array.from(App.NodeSelected) : [selectedItemID];
        
        Main.NodeAPI('edit', {"action": "BIN", "section": App.Section, "id": forDeletion, "path": Main.NodeID});
      }
      else if (this.Action == 'NewSpan') {
        Main.NodeAPI('create', { 
          "section": App.Section,
          "path": Main.NodeID,
          "parent": Main.NodeID,
          "type": "Span",
          "name": document.querySelector('.Popup_Input_Name').value || 'New Span'
        });
      }
      else if (this.Action == 'NewFolder') {
        Main.NodeAPI('create', {
          "section": App.Section,
          "path": Main.NodeID,
          "type": "Folder",
          "parent": (Main.NodeID=="homepage" ? this.Base.querySelector('.Popup_Location').getAttribute('value') : Main.NodeID),
          "name": this.Base.querySelector('.Popup_Input_Name').value || 'New Folder',
          "options": {
            "description": this.Base.querySelector('.Popup_Option_Desc').value,
            "color": N_.RGBtoHex(this.Base.querySelector('.Popup_Option_Colour').value),
            "pass": this.Base.querySelector('.Popup_Option_Pass').value,
            "pin": this.Base.querySelector('.Popup_Option_Pin').value
          }
        })
      }
      else if (this.Action == 'Download') {
        let centralInput = this.Base.querySelector('.Popup_Input_Name');
        
        if (this.DATA.requestSent === false) {
          this.DATA.requestSent = true;

          let res = await App.API_Post({url: `/download`, body: {
            "forUser": this.DATA.forShare ? "SHARE" : "SELF",
            "name": centralInput.value,
            "items": this.DATA.download,
            "section": App.Section,
          }});

          centralInput.value = 'Zipping...';
  
          if (res.Error) {
            centralInput.value = 'An Error Occured. Close and Try Again.';
            centralInput.style.borderColor = 'var(--red)';
          } else if (res.Link) {
            this.DownloadLink = res.Link;
            e.target.innerText = 'Visit Link';
            centralInput.value = `https://link.nanode.one/download/${res.Link}`;
            centralInput.style.borderColor = 'var(--green)';
          }
        } else {
          window.open(`https://link.nanode.one/download/${this.DownloadLink}`)
        }
      }
      else if (this.Action == 'Rename') {
        Main.NodeAPI('edit', {
          "action": "DATA",
          "section": App.Section,
          "id": [this.DATA.nodeID],
          "data": { "name": document.querySelector('.Popup_Input_Name').value || App.Nodes[this.DATA.nodeID].data.name },
          "path": Main.NodeID
        }, true);
      }

      if (!this.DATA.dontClose) this.ToggleBase_();
    })

    if (this.colorPicker) {
      this.Base.querySelector('.Popup_Option_Colour').addEventListener('click', (e) => {
        new CreateColorPicker(e.target, function(chosenColor) { e.target.value = chosenColor; e.target.style.background = chosenColor; e.target.setAttribute('color', chosenColor) })
      })
    }
    if (this.dropdown) {
      const DropDown_Options = this.Base.querySelectorAll('.Popup_Dropdown_Content a');
      DropDown_Options.forEach(option => {
        option.addEventListener('click', (e) => {
          this.Base.querySelector('.Popup_Location').setAttribute('value', e.target.getAttribute('value'));
          this.Base.querySelector('.Popup_Location').querySelector('p').innerText = e.target.innerText
        })
      })
    }
    if (this.switch) {
      this.Base.querySelector('.Switch.SW_DL').addEventListener('click', (e) => {
        if (this.DATA.requestSent) { return; }
        this.Base.querySelector('.Slider.SL_DL').style.transform = `translateX(${this.DATA.forShare ? 0 : 50}px)`;
        this.DATA.forShare = !this.DATA.forShare;
      })
    }
  }
  EscBtn(e=window.event) { if (e.keyCode == 27) { Popup.prototype.ToggleBase_() } } // this.ToggleBase_() wont work.. NO idea why.
}

async function PopUp_Download(Item, Caller) {
  let Zipping, CurrentLink, DownloadName = {}, DownloadIDs = [];

  if (Item.id && Caller == 'ItemInfo') { // Item Info
    [DownloadIDs, DownloadName, Zipping] = [[Item.id], Item.name, !Item.type.file];
  } else if (Caller == 'ContextMenu') { // ContextMenu
    DownloadIDs = Array.from(App.NodeSelected);
    DownloadName = DownloadIDs.length > 1 ? 'Drive_Download' : App.Nodes[DownloadIDs[0]].data.name;
    Zipping = DownloadIDs.length === 1 ? (App.Nodes[DownloadIDs[0]].data.mime == 'FOLDER' ? true : false) : true;
  } else { return; }


  if (Zipping == false) {
    let dl_btn = document.createElement('a')
    dl_btn.download = DownloadName;
    dl_btn.href = `/storage/${DownloadIDs[0]}`;
    dl_btn.target = '_blank';
    dl_btn.click();
  } else {
    new Popup('Download', null, 'Download',
      {title: 'Download', reject: 'Cancel', accept: 'Download', download: DownloadIDs, name: DownloadName, forShare: false, requestSent: false, dontClose: true});
  }
}



async function ViewItem(Type, nodeID) {
  if (Type == 'unknown') { return };

  Popup.prototype.LoadBase_();
  Popup.prototype.ToggleBase_();
  BlockOut.innerHTML = `
    <div class='Preview grid-items-center'>
      ${N_.Loading('medium')}
    </div>`;

  if (Type == "image") {
    document.querySelector('.Preview').innerHTML = `<img class='ViewImage' rc='Preview_Image' node-id='${nodeID}' src='/storage/${nodeID}'></img>`;
  }
  else if (Type == "video") {
    document.querySelector('.Preview').innerHTML = `<video class='ViewImage' controls name='video' src='/storage/${nodeID}'></video`;
  }
  else if (Type == "text") {
    document.querySelector('.Preview').innerHTML = `<div class='ViewText'><pre>${ await App.API_Fetch({url: `/storage/${nodeID}`, conv: 'text'}) }</pre></div>`;
  }
  else if (Type == 'font') {
    document.querySelector('.Preview').innerHTML = `
      <div class='ViewFont'>
        <style>@font-face {font-family: "fetched-font";src: url("/storage/${nodeID}") format('${App.Nodes[nodeID].data.mime.split('/')[1]}');}</style>
        <p>1234567890
      </div>
    `;
  }
  else if (Type == 'audio') {
    document.querySelector('.Preview').innerHTML = `
      <audio controls><source src='/storage/${nodeID}' type='${App.Nodes[nodeID].data.mime}'></audio>`;
  }
  else {console.log(Type);}
}



function miniView(e) {
  // <i class='miniPreviewBtn fas fa-compress' title='Show in MiniPlayer' onclick='miniView(this)'></i>
  // color: var(--text-dull); font-size: 18px; place-self: end; padding: 10px; cursor: pointer;
  console.log(e || 'RC Call ?');
}