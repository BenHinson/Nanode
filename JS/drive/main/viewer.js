const SecureKey = {0: "No", 1: "Secured", 2: "Multiple", 3: "Max"}

const fileContainer = document.getElementsByClassName('fileContainer')[0];
const PageInfo = document.getElementsByClassName('PageInformation')[0];

const BlockOut = document.querySelector('.BlockOut');

const UploadContainer = document.getElementsByClassName('Upload_Container')[0];
const UC_Queue = document.getElementsByClassName('UC_Queue')[0];
const UC_Queue_Table = document.querySelector('.UC_Queue table tbody');

// ========================

const makeReplaceElem = (parent, target, base) => {
  if (!parent.querySelector(target)) { parent.innerHTML += base }
  return parent.querySelector(target);
}


// @ == VIEW
function renderContent(content=``) {
  fileContainer.innerHTML = N_Loading();
  let layout = UserSettings.local.layout; // 0=block, 1=list
  let homepage = NodeID == 'homepage';
  let titles = true;

  Object.values(Spans).forEach(span => {
    if (span.id == '_MAIN_') { content += renderBaseFolders(span); return; }
    content += `${layout ? listContainer(span) : blockContainer(span)}`;
    titles = false;
  })
  
  if (homepage) content += `<button class='NewSpan'>New Span</button>`;

  fileContainer.innerHTML = content;

  if (NodeID == 'homepage') {
    renderRecents();

    N_Find('.NewSpan').addEventListener('click', () => {
      new Popup('NewSpan', null, 'NewSpan', {title: 'New Span', reject: 'Cancel', accept: 'Create', color: ''})
    });

    N_Find('input[spanName]', true, fileContainer).forEach(name => {
      name.addEventListener('change', (e) => {
        let nodeID = e.target.parentNode.parentNode.getAttribute('node-id');
        NodeAPI('edit', {"action": "DATA", "section": "main", "id": nodeID, "data": { "name": e.target.value }, "path": NodeID});
      })
    })
  } else {
    Filter(fileContainer.querySelector('.Filter'), fileContainer);
  }

  ItemClickListener(layout);
  N_ClientStatus(7, "Ok", 400);

  /////////////////////////////////////////////////

  function listContainer(span) {
    listNode = (parent, nodes, content=``) => {
      if (nodes.length === 0 && !homepage) { return emptyContainer(); }
      nodes.forEach(nodeID => { let nodeData = Nodes[nodeID].data;
        content += `
          <tr directory='${N_ItemsPath(parent, nodeData.name)}' type='${nodeData.type.general}' node-id='${nodeID}' rc='${nodeData.mime == "FOLDER" ? "Node_Folder" : "Node_File"}' rcOSP='TD' title='${N_ItemsPath(parent, nodeData.name)}' ${nodeData.color ? "style='box-shadow: "+nodeData.color+" -3px 0' " : ""}>
            <td><img loading='lazy' height='32' width='32' src='${N_FileIcon(nodeData, 90, 120, 'main')}'></img></td>
            <td><input rcPar='2' value='${N_CapFirstLetter(nodeData.name)}' disabled style='pointer-events:none;'></input></td>
            <td>${nodeData.type.short}</td>
            <td>${N_DateFormatter(nodeData.time.modified || nodeData.time.created)}</td>
            <td>${nodeData.size > 1 ? N_ConvertSize(nodeData.size) : "-"}</td>
          </tr>
        `;
      }); return content;
    };

    return `
      <div node-id='${span.id}' ${homepage ? `Home-Span='${span.name}'` : "" }>
        <table class='tableTemplate' ${homepage ? `rc='Homepage_Span'` : ``} >
          <thead>
            <tr ${homepage ? 'rcPar=3' : ''} node-id='${span.id}'>
              <th><input value='${span.name}' ${homepage ? 'spanName' : 'spanName=disabled disabled '}></th>
              <th>${homepage ? '' : '<div class="Filter"><i class="fas fa-filter"></i><input type="text" placeholder="Filter..."></div>'}</th>
              ${titles ? '<th>Type</th> <th>Modified</th> <th>Size</th>' : '<th></th> <th></th> <th></th>'}
            </tr>
          </thead>

          <tbody dir-nodes>
            ${listNode(span.name, span.nodes)}
          </tbody>
        </table>
      </div>
    `;
  };

  function blockContainer(span) {
    blockNode = (parent, nodes, content=``) => {
      if (nodes.length === 0 && !homepage) { return emptyContainer(); }
      nodes.forEach(nodeID => { let nodeData = Nodes[nodeID].data;
        content += `
          <div class='Item' directory='${N_ItemsPath(parent, nodeData.name)}' type='${nodeData.type.general}' node-id='${nodeID}' rc='${nodeData.mime == "FOLDER" ? "Node_Folder" : "Node_File"}' rcOSP='TEXTAREA,IMG' title='${N_ItemsPath(parent, nodeData.name)}' ${nodeData.color ? "style='border-bottom: 2px solid "+nodeData.color+"'" : ""}>
            <img loading='lazy' height='90' width='${!nodeData.mime == "FOLDER" ? 90 : 120}' src='${N_FileIcon(nodeData, 90, 120, 'main')}'></img>
            <textarea rcpar='1' disabled style='pointer-events:none;'>${N_CapFirstLetter(nodeData.name)}</textarea>
          </div>
        `;
      }); return content;
    };


    return `
      <div node-id='${span.id}' class='ContentContainer' dir-nodes ${homepage && `Home-Span='${span.name}' rc='Homepage_Span'`}>
        <input value='${span.name}' ${homepage ? 'spanName' : 'spanName=disabled disabled '}>
        ${blockNode(span.name, span.nodes)}
      </div>
    `;
  };

  function emptyContainer() {
    return `
      <div class='section_Empty grid-items-center transform-center'>
        <img src='/assets/nanode/files.svg' alt='This Folder is Empty.'>
        <div class='flex-column-cent'>
          <p>Drop files here</p>
          <p class='italic-small'>or use the 'Upload' button</p>
        </div>
      </div>
    `;
  }
}



function renderBaseFolders(span) {
  renderFolders = (nodes, content=``) => {
    nodes.forEach(nodeID => { let nodeData = Nodes[nodeID].data;
      content += `
        <div directory='${N_ItemsPath('Main', nodeData.name)}' type='${nodeData.type.general}' node-id='${nodeData.id}'>
          <img loading='lazy' height='60' width='60' src='${N_FileIcon(nodeData, 90, 120, 'main')}'></img>
          <p title='${N_ItemsPath('Main', nodeData.name)}'>${N_CapFirstLetter(nodeData.name)}</p>
          <div></div>
        </div>
      `
    }); return content;
  };


  return `
    <div node-id='${span.id}' class='SpanMain'>
      <folders class='baseFolders flex-even-cent'> ${renderFolders(span.nodes)} </folders>
      <recents class='recentFiles flex-even-cent'></recents>
    </div>
  `;
}

async function renderRecents(content=``) {
  if (UserSettings.local.recents) {
    await API_Fetch({url: `/activity/recent/main`}).then(res => {
      for (const [object, item] of Object.entries(res.recent)) {
        item.mime = item.type.mime;
        let nodeData = Nodes[object] = new Node(item, object, item.parent);

        content += `
          <div parent-node='${item.parent}' type='${nodeData.data.type.general}' node-id='${object}' rc='Recent_Node' rcosp='P,IMG'>
            <img loading='lazy' height='48' width='48' src='${N_FileIcon(nodeData.data, 48, 48, 'main')}'></img>
            <p>${N_CapFirstLetter(item.name)}</p>
          </div>`
      };
    }).catch(err => { N_Error('Failed to Fetch Recents: '+err) })
  }
  fileContainer.querySelector('recents').innerHTML = (
    content += `<button class='toggleRecent trans300' onclick='ToggleRecents()'>${UserSettings.local.recents ? 'Hide Recent' : 'Show Recent'}</button>`);

  fileContainer.querySelectorAll('recents > div').forEach(item => {
    item.addEventListener('click', (e) => { ItemActions(e.currentTarget) })
  })
}


// @ == MISC
function HighlightNode(nodeID) {
  SelectItem( N_Find(`[dir-nodes] > [node-id='${nodeID}']`), "force" );
}

function ExternalTab(nodeID) {
  let nt_btn = document.createElement('a');
  nt_btn.href = `/storage/${nodeID}`;
  nt_btn.target = '_blank';
  nt_btn.click();
}


// @ == Right-bar
async function FetchItemInformation (selected, node=false) {
  N_ClientStatus(2, "True", 500); N_ClientStatus(4, "Wait", 400);
  N_ClientStatus(5, "Wait", 300); N_ClientStatus(7, "Wait", 300);

  if (!node && typeof RCElement !== 'undefined' && selected == "RCElement") {selected = RCElement}
  const SelectedID = node ? selected : selected.getAttribute('node-id');

  const ItemInfo = makeReplaceElem(PageInfo, '.ItemInfo', '<div class="ItemInfo"></div>');
  ItemInfo.innerHTML = N_Loading('small');

  let req = await API_Fetch({url: `/user/files/${SelectedID}`})
  let NodeInfo = new Node(req[SelectedID]);
  renderItemInfo(ItemInfo, NodeInfo.data)
}

renderItemInfo = (ItemInfo, RequestInfo) => {
  ItemInfo.innerHTML = `
    <section class='IIData flex-column-cent'>
      <input class='ItemInfo_Name' contenteditable='true' value='${RequestInfo.name}' title='${RequestInfo.previous ? 'Previous : '+RequestInfo.previous.toString().replace(',', ', ') : 'No Previous Names'}'>
      <p class='ItemInfo_UUID' title='This Items Unique Identifier'>${RequestInfo.id}</p>

      ${RequestInfo.type.general == 'image' ? "<img loading='lazy' height='128' width='auto' src='/storage/"+RequestInfo.id+"?h=128&w=null'></img>" : ""}

      <span class='flex-even-cent'>
        <button class='ItemInfo_Tab flex-even-cent' title='Open in New Tab (non shareable)' ${RequestInfo.type.file ? "" : "style='cursor: not-allowed'" } ><i class='fas fa-external-link-alt'></i>New Tab</button>
        <button class='ItemInfo_Download flex-even-cent' title='Download This ${RequestInfo.type.file ? "File" : "Folder"}'><i class='fas fa-cloud-download-alt'></i>Download</button>
      </span>

      <table>
        <tbody>
          <tr><td>Size</td><td title='${RequestInfo.size} bytes'>${N_ConvertSize(RequestInfo.size)}</td></tr>
          <tr><td>Type</td><td title=${RequestInfo.type.mime}>${RequestInfo.type.short}</td></tr>
          <tr><td>Secured</td><td>${SecureKey[RequestInfo.security]}</td></tr>
        </tbody>
      </table>

      <textarea class='ItemInfo_Description' placeholder='Add a Description...' maxlength='100'>${RequestInfo.description || ""}</textarea>

    </section>

    <section class='IIShare'>
      <sub>SHARE - with another Nanode account</sub>
      <input class='ItemInfo_Share_Input' type='text' placeholder='Enter username or email'>

      <sub>LINK - view only</sub>
      <input class='ItemInfo_Link_Input' type='text' placeholder='Click to create link' readonly=true value='${RequestInfo.share ? 'https://link.nanode.one/'+RequestInfo.share.link.url : ''}'>
    </section>
  `

  const ItemInfoTable = ItemInfo.querySelector('tbody');

  for (let key in RequestInfo.time) {
    ItemInfoTable.innerHTML += `<tr><td>${N_CapFirstLetter(key)}</td><td title='${new Date(RequestInfo.time[key].stamp).toGMTString()}'>${N_DateFormatter(RequestInfo.time[key].stamp)}</td></tr>`
  }
  ItemInfoTable.innerHTML += `<tr><td>Colour</td><td><input class='ItemInfo_Color' type='color' ${RequestInfo.color ? "value="+N_RGBtoHex(RequestInfo.color) : ""}></td></tr>`

  ItemInfoListeners(RequestInfo);
}

ItemInfoListeners = (ItemRequest) => {

  N_Find('.ItemInfo_Name').addEventListener('change', (e) => {
    NodeAPI('edit', {"action": "DATA", "section": Section, "id": ItemRequest.id, "data": { "name": e.target.value }, "path": NodeID})
  })

  N_Find('.ItemInfo_Tab').addEventListener('click', () => {
    if (ItemRequest.type.file) ExternalTab(ItemRequest.id);
  })

  N_Find('.ItemInfo_Download').addEventListener('click', () => {
    PopUp_Download(ItemRequest, "ItemInfo");
  })

  N_Find('.ItemInfo_Color').addEventListener('change', (e) => {
    NodeAPI('edit', {"action": "DATA", "section": Section, "id": ItemRequest.id, "data": { "color": e.target.value }, "path": NodeID})
  })

  N_Find('.ItemInfo_Description').addEventListener('change', (e) => {
    NodeAPI('edit', {"action": "DATA", "section": Section, "id": ItemRequest.id, "data": { "description": e.target.value }});
  })

  N_Find('.ItemInfo_Share_Input').addEventListener('click', (e) => {
    console.log("Call server for account with that username / email and return their profile image and display below the input.")
  })

  N_Find('.ItemInfo_Link_Input').addEventListener('click', async (e) => { // Link
    if (!e.target.value) {
      let res = await API_Post({url: `/share`, body: {
        "ACTION": "LINK",
        "oID": ItemRequest.id,
        "SECTION": Section,
      }});

      res.link ? e.target.value = res.link : e.target.style.color = 'crimson';
    }
    e.target.select();
    document.execCommand('copy');
  })
}


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
    N_ClientStatus(5, "User");
    this.container = makeReplaceElem(PageInfo, '.ItemLocked', '<div class="ItemLocked"></div>');
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
      let res = await API_Post({url: `/auth`, body: {
        "entries": this.GetEntries_(),
        "oID": this.response.Item,
        "section": Section,
      }});

      if (res.Error) {
        this.container.style.boxShadow = 'inset 0 0 0 1px var(--red)';
      } else {
        NodeCall({"Reload":true, "Skip": true}, res);
        this.container.remove();
      }
    })

  }
  GetEntries_(val={}) {
    this.container.querySelectorAll('input').forEach(elem => {val[elem.getAttribute('inputType')] = elem.value})
    return val;
  }
}


// @ == Popups
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
    { N_ClientStatus(8, "User"); document.removeEventListener('keydown', this.EscBtn); document.addEventListener('keydown', this.EscBtn); } 
    else {N_ClientStatus(8, "Off"); document.removeEventListener('keydown', this.EscBtn); };
  }

  RenderContent_() {
    this.Base.innerHTML = `
      <div class='Popup_Main'>
        <h3>${this.DATA.title}</h3>
        ${this.MainContent_()}
        <span>
          <button class='Popup_Reject'>${this.DATA.reject}</button>
          <button class='Popup_Accept ${this.ButtonColor[this.DATA.color]}'>${this.DATA.accept}</button>
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
        content = `<input class='Popup_Input Popup_Input_Name' max-length='128' type='text' placeholder='Name...' autocomplete='off'></input>`; break;
      }
      case('NewFolder') : {
        content = `
          <div class='Popup_Dropdown' style='top: 12px; right: 15px;'>
            <div class='Popup_Location' title='Location' ${createLocation(this.DATA.RCE)}</div>
          </div>
          <input class='Popup_Input Popup_Input_Name' max-length='128' type='text' placeholder='Name...' autocomplete='off'></input>
        `;
        this.dropdown = true;
        break;
      }
      case('Download') : {
        content = `
          <h5> - ${N_TextMultiple(this.DATA.download.length, "Item")}</h5>

          <div class='Switch SW_DL' style='top: 11px;right: 15px;'>
            <div class='Slider SL_DL'></div>
            <div>Me</div> <div>Share</div>
          </div>

          <input class='Popup_Input Popup_Input_Name' max-length='128' type='text' placeholder='Name...' value='${this.DATA.name}' autocomplete='off'></input>
        `;
        this.switch = true;
        break;
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
          if (Spans[selectedItem.parentNode.getAttribute('node-id')]) {selectedItem = selectedItem.parentNode}
          else {console.log('Invalid Span ID'); return;}
        }
        let forDeletion = NodeSelected.length ? NodeSelected : [selectedItemID];
        NodeAPI('edit', {"action": "DELETE", "section": Section, "id": forDeletion, "path": NodeID});
      }
      else if (this.Action == 'NewSpan') {
        NodeAPI('create', { 
          "section": Section,
          "path": NodeID,
          "parent": NodeID,
          "type": "Span",
          "name": document.querySelector('.Popup_Input_Name').value || 'New Span'
        });
      }
      else if (this.Action == 'NewFolder') {
        NodeAPI('create', {
          "section": Section,
          "path": NodeID,
          "type": "Folder",
          "parent": (NodeID=="homepage" ? this.Base.querySelector('.Popup_Location').getAttribute('value') : NodeID),
          "name": this.Base.querySelector('.Popup_Input_Name').value || 'New Folder',
          "options": {
            "description": this.Base.querySelector('.Popup_Option_Desc').value,
            "color": N_RGBtoHex(this.Base.querySelector('.Popup_Option_Colour').value),
            "pass": this.Base.querySelector('.Popup_Option_Pass').value,
            "pin": this.Base.querySelector('.Popup_Option_Pin').value
          }
        })
      }
      else if (this.Action == 'Download') {
        let centralInput = this.Base.querySelector('.Popup_Input_Name');
        
        if (this.DATA.requestSent === false) {
          this.DATA.requestSent = true;

          let res = await API_Post({url: `/download`, body: {
            "FOR": this.DATA.forShare ? "SHARE" : "SELF",
            "NAME": centralInput.value,
            "ITEMS": this.DATA.download,
            "SECTION": Section,
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

      if (!this.DATA.dontClose) this.ToggleBase_();
    })

    if (this.colorPicker) {
      this.Base.querySelector('.Popup_Option_Colour').addEventListener('click', (e) => {
        new CreateColorPicker('ISC', function(chosenColor) { e.target.value = chosenColor; e.target.style.background = chosenColor; })
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
    DownloadIDs = NodeSelected;
    DownloadName = DownloadIDs.length > 1 ? 'Drive_Download' : Nodes[DownloadIDs[0]].data.name;
    Zipping = DownloadIDs.length === 1 ? (Nodes[DownloadIDs[0]].data.mime == 'FOLDER' ? true : false) : true;
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

function PopUp_Upload() {
  N_ClientStatus(7, "Wait", 600);
  Upload_Visuals.Status("Choose", "Choose Items");
  Upload_Values[0].innerText = '0 Items';
  Upload_Values[1].innerText = '0 B';
  UploadContainer.style.visibility = "visible";

  PopUp_Upload.Close = function() {
    UploadContainer.style.visibility = 'hidden';
    UploadContainer.querySelectorAll('span i')[0].classList = 'fas fa-chevron-up'
    UC_Queue.classList.remove('UC_Showing');
    Progress_Div.classList.remove('UC_Showing');
    Upload_Actions.Reset_Upload();
  };
}


async function ViewItem(Type, NodeID) {
  if (Type == 'unknown') { return };

  Popup.prototype.LoadBase_();
  Popup.prototype.ToggleBase_();
  BlockOut.innerHTML = `
    <div class='Preview grid-items-center'>
      ${N_Loading('medium')}
    </div>`;

  if (Type == "image") {
    document.querySelector('.Preview').innerHTML = `<img class='ViewImage' src='/storage/${NodeID}'></img>`;
  }
  else if (Type == "video") {
    document.querySelector('.Preview').innerHTML = `<video class='ViewImage' controls name='video' src='/storage/${NodeID}'></video`;
  }
  else if (Type == "text") {
    document.querySelector('.Preview').innerHTML = `<div class='ViewText'><pre>${ await API_Fetch({url: `/storage/${NodeID}`, conv: 'text'}) }</pre></div>`;
  }
  else if (Type == 'font') {
    document.querySelector('.Preview').innerHTML = `
      <div class='ViewFont'>
        <style>@font-face {font-family: "fetched-font";src: url("/storage/${NodeID}") format('${Nodes[NodeID].data.mime.split('/')[1]}');}</style>
        <p>1234567890
      </div>
    `;
  }
  else if (Type == 'audio') {
    document.querySelector('.Preview').innerHTML = `
      <audio controls><source src='/storage/${NodeID}' type='${Nodes[NodeID].data.mime}'></audio>`;
  }
  else {console.log(Type);}
}


// <i class='miniPreviewBtn fas fa-compress' title='Show in MiniPlayer' onclick='miniPreview(this)'></i>
// color: var(--text-dull); font-size: 18px; place-self: end; padding: 10px; cursor: pointer;
function miniPreview(e) {
  console.log(e);
}