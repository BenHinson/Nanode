const fileContainer = document.getElementsByClassName('fileContainer')[0];
const PageInfo = document.getElementsByClassName('PageInformation')[0];

const BlockOut = document.querySelector('.BlockOut');

// ========================

const renderContent = (renderNodes) => {
  const renderConfig = {
    layout: Settings.Local.layout, // 0=block, 1=list
    homepage: NodeID == 'homepage',
    titles: true,
  };

  SetListeners_ = () => {
    if (NodeID == 'homepage') {
      renderContent.renderRecents();
      this.NewSpan();
      this.SpanName();
    } else {
      Filter(renderConfig.layout, fileContainer.querySelector('.Filter'), fileContainer);
      Order.Listeners(renderConfig.layout, fileContainer.querySelector('table'));
      Order.SetOrderVisuals();
    }
    if (renderConfig.layout === 0) ColorChange();
    ItemClickListener(renderConfig.layout);
  }

  // ====================================

  // Render
  Content = (content=``) => {
    fileContainer.innerHTML = N_.Loading();
    
    Object.values(App.Spans).forEach(span => {
      if (span.id == '_MAIN_') { content += this.renderBaseFolders(span); return; }
      content += `${renderConfig.layout ? this.listContainer(span) : this.blockContainer(span)}`;
      renderConfig.titles = false;
    })
    if (renderConfig.homepage) content += `<button class='NewSpan'>New Span</button>`;

    fileContainer.innerHTML = renderConfig.homepage ? `<div rcpar='2'>${content}</div>` : content;
    
    this.SetListeners_();
    
    N_.ClientStatus(7, "Ok", 400);
  }
  renderBaseFolders = (span) => {
    renderFolders = (nodes, content=``) => {
      nodes.forEach(nodeID => { let nodeData = App.Nodes[nodeID].data;
        content += `
          <div directory='${Navigate.ItemsPath('Main', nodeData.name)}' type='${nodeData.type.general}' node-id='${nodeData.id}'>
            <img loading='lazy' height='60' width='60' src='${N_.FileIcon(nodeData, 90, 120, 'main')}'></img>
            <p title='${Navigate.ItemsPath('Main', nodeData.name)}'>${N_.CapFirstLetter(nodeData.name)}</p>
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
  renderContent.renderRecents = async(content=``) => {
    if (Settings.Local.recents === 1) {
      await this.RecentNodesCall().then(res => {
        if (res.recent == 'Empty Query') {
          return N_.InfoPopup({'parent':N_.Find('.main_Page .PageData'), 'type': 'warning', 'text':"No recent files or folders found", 'displayDelay':100, 'displayTime':5000});
        } else {
          for (const [object, item] of Object.entries(res.recent)) {
            item.mime = item.type.mime;
            let nodeData = App.Nodes[object] = new Node(item, object, item.parent);
    
            content += `
              <div parent-node='${item.parent}' type='${nodeData.data.type.general}' node-id='${object}' rc='Recent_Node' rcosp='P,IMG'>
                <img loading='lazy' height='48' width='48' src='${N_.FileIcon(nodeData.data, 48, 48, 'main')}'></img>
                <p>${N_.CapFirstLetter(item.name)}</p>
              </div>`;
          };
        }
      }).catch(err => { N_.Error('Failed to Fetch Recents: '+err) })
    }

    if (!fileContainer.querySelector('recents')) { return console.log('Recents Called without recents element. IE: Not on homepage?'); }
    fileContainer.querySelector('recents').innerHTML = 
      (content += `<button class='toggleRecent trans300' onclick='Settings.ToggleRecents()'>${Settings.Local.recents ? 'Hide Recent' : 'Show Recent'}</button>`);
  
    this.RecentNodesListener();
  }
  DirectoryEmpty = () => {
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

  
  // Listeners
  NewSpan = () => {
    N_.Find('.NewSpan').addEventListener('click', () => {
      new Popup('NewSpan', null, 'NewSpan', {title: 'New Span', reject: 'Cancel', accept: 'Create', color: ''})
    });
  }
  SpanName = () => {
    N_.Find('input[spanName]', true, fileContainer).forEach(name => {
      name.addEventListener('change', (e) => {
        let nodeID = e.target.parentNode.parentNode.getAttribute('node-id');
        NodeAPI('edit', {"action": "DATA", "section": "main", "id": [nodeID], "data": { "name": e.target.value }, "path": NodeID});
      })
    })
  }
  RecentNodesListener = () => {
    fileContainer.querySelectorAll('recents > div').forEach(item => {
      item.addEventListener('click', (e) => ItemActions(e.currentTarget))
    })
  }
  ColorChange = () => {
    fileContainer.querySelectorAll('color').forEach(e => {
      e.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        new CreateColorPicker(e.target.parentNode);
      })
    })
  }

  
  // API
  RecentNodesCall = async () => {
    return await App.API_Fetch({url: `/activity/recent/main`})
  }
  
  

  // File Render

  listContainer = (span) => {
    return `
      <div node-id='${span.id}' ${renderConfig.homepage ? `Home-Span='${span.name}'` : ""} rcpar='2'>
        <table class='tableTemplate' ${renderConfig.homepage ? `rc='Homepage_Span'` : ``} >
          <thead>
            <tr ${renderConfig.homepage ? 'rcPar=3' : ''} node-id='${span.id}'>
              <th><input value='${span.name}' ${renderConfig.homepage ? 'spanName' : 'spanName=disabled disabled '}></th>
              <th>${renderConfig.homepage ? '' : '<div class="Filter"><i class="fas fa-filter"></i><input type="text" placeholder="Filter..."></div>'}</th>
              ${renderConfig.titles ? '<th>Type</th> <th order="modified">Modified<i></i></th> <th order="size">Size<i></i></th>' : '<th></th> <th></th> <th></th>'}
            </tr>
          </thead>

          <tbody dir-nodes>
            ${renderContent.listNode({"parent": span.name, "nodeIDs": span.nodes})}
          </tbody>
        </table>
      </div>
    `;
  };
  blockContainer = (span) => {
    return `
      <div node-id='${span.id}' class='ContentContainer ${!renderConfig.homepage && 'lout_grid'}' dir-nodes ${renderConfig.homepage && `Home-Span='${span.name}' rc='Homepage_Span'`}>
        <input value='${span.name}' ${renderConfig.homepage ? 'spanName' : 'spanName=disabled disabled '}>
        ${renderContent.blockNode({"parent": span.name, "nodes": span.nodes})}
      </div>
    `;
  };

  renderContent.listNode = (data={}, content=``) => {
    let {parent=App.NodeName, nodeIDs=[], skipOrder=false} = data;

    nodeIDs = Order.OrderNodes(App.Nodes) || nodeIDs;

    if (nodeIDs.length === 0 && !renderConfig.homepage) { return this.DirectoryEmpty(); }
    nodeIDs.forEach(nodeID => { let nodeData = App.Nodes[nodeID].data;
      content += `
        <tr directory='${Navigate.ItemsPath(parent, nodeData.name)}' type='${nodeData.type.general}' node-id='${nodeID}' rc='${nodeData.mime == "FOLDER" ? "Node_Folder" : "Node_File"}' rcOSP='TD' title='${Navigate.ItemsPath(parent, nodeData.name)}' ${nodeData.color ? "style='box-shadow: inset "+nodeData.color+" 3px 0' " : ""}  color='${nodeData.color || ''}'>
          <td><img loading='lazy' height='32' width='32' src='${N_.FileIcon(nodeData, 90, 120, 'main')}'></img></td>
          <td><input rcPar='2' value='${N_.CapFirstLetter(nodeData.name)}' disabled style='pointer-events:none;'></input></td>
          <td>${nodeData.type.short}</td>
          <td>${N_.DateFormatter(nodeData.time.modified || nodeData.time.created)}</td>
          <td>${nodeData.size > 1 ? N_.ConvertSize(nodeData.size) : "-"}</td>
        </tr>
      `;
    }); return content;
  };
  renderContent.blockNode = (data={}, content=``) => {
    const {parent=App.NodeName, nodes} = data;

    if (nodes.length === 0 && !renderConfig.homepage) { return this.DirectoryEmpty(); }
    nodes.forEach(nodeID => { let nodeData = App.Nodes[nodeID].data;
      content += `
        <div class='Item' directory='${Navigate.ItemsPath(parent, nodeData.name)}' type='${nodeData.type.general}' node-id='${nodeID}' rc='${nodeData.mime == "FOLDER" ? "Node_Folder" : "Node_File"}' rcOSP='TEXTAREA,IMG,P' title='${Navigate.ItemsPath(parent, nodeData.name)}' color='${nodeData.color || ''}'>
          ${nodeData.color ? "<color style='background:"+nodeData.color+"'></color>" : ''}
          <img loading='lazy' height='90' width='${!nodeData.mime == "FOLDER" ? 90 : 120}' src='${N_.FileIcon(nodeData, 90, 120, 'main')}'></img>
          <textarea rcpar='1' disabled style='pointer-events:none;'>${N_.CapFirstLetter(nodeData.name)}</textarea>
          <p>${N_.CapFirstLetter(nodeData.type.general)}${nodeData.size > 1 ? ' - '+N_.ConvertSize(nodeData.size) : ''}</p>
        </div>
      `;
    }); return content;
  };

  // ====================================

  this.Content();
}

// @ == MISC
function HighlightNode(nodeID) {
  let targetNode = N_.Find(`[dir-nodes] > [node-id='${nodeID}']`);
  SelectItem( targetNode, "force" );
  targetNode.scrollIntoView({behavior: 'smooth'})
}


// @ == Right-bar
async function FetchItemInformation (selected, node=false) {
  N_.ClientStatus(2, "True", 500); N_.ClientStatus(4, "Wait", 400);
  N_.ClientStatus(5, "Wait", 300); N_.ClientStatus(7, "Wait", 300);

  if (!node && typeof RCC.RCElement !== 'undefined' && selected == "RCElement") {selected = RCC.RCElement}
  const SelectedID = node ? selected : selected.getAttribute('node-id');

  const ItemInfo = N_.MakeReplaceElem(PageInfo, '.ItemInfo', '<div class="ItemInfo"></div>');
  ItemInfo.innerHTML = N_.Loading('small');

  let req = await App.API_Fetch({url: `/user/files/${SelectedID}`})
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
          <tr><td>Size</td><td title='${RequestInfo.size} bytes'>${N_.ConvertSize(RequestInfo.size)}</td></tr>
          <tr><td>Type</td><td title=${RequestInfo.type.mime}>${RequestInfo.type.short}</td></tr>
          <tr><td>Secured</td><td>${{0: "No", 1: "Secured", 2: "Multiple", 3: "Max"}[RequestInfo.security]}</td></tr>
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
    ItemInfoTable.innerHTML += `<tr><td>${N_.CapFirstLetter(key)}</td><td title='${new Date(RequestInfo.time[key].stamp).toGMTString()}'>${N_.DateFormatter(RequestInfo.time[key].stamp)}</td></tr>`
  }
  ItemInfoTable.innerHTML += `<tr><td>Colour</td><td><input class='ItemInfo_Color' type='color' ${RequestInfo.color ? "value="+N_.RGBtoHex(RequestInfo.color) : ""}></td></tr>`

  ItemInfoListeners(RequestInfo);
}

ItemInfoListeners = (ItemRequest) => {

  N_.Find('.ItemInfo_Name').addEventListener('change', (e) => {
    NodeAPI('edit', {"action": "DATA", "section": App.Section, "id": [ItemRequest.id], "data": { "name": e.target.value }, "path": NodeID})
  })

  N_.Find('.ItemInfo_Tab').addEventListener('click', () => {
    if (ItemRequest.type.file) N_.ExternalTab(ItemRequest.id);
  })

  N_.Find('.ItemInfo_Download').addEventListener('click', () => {
    PopUp_Download(ItemRequest, "ItemInfo");
  })

  N_.Find('.ItemInfo_Color').addEventListener('change', (e) => {
    NodeAPI('edit', {"action": "DATA", "section": App.Section, "id": [ItemRequest.id], "data": { "color": e.target.value }, "path": NodeID})
  })

  N_.Find('.ItemInfo_Description').addEventListener('change', (e) => {
    NodeAPI('edit', {"action": "DATA", "section": App.Section, "id": [ItemRequest.id], "data": { "description": e.target.value }});
  })

  N_.Find('.ItemInfo_Share_Input').addEventListener('click', (e) => {
    console.log("Call server for account with that username / email and return their profile image and display below the input.")
  })

  N_.Find('.ItemInfo_Link_Input').addEventListener('click', async (e) => { // Link
    if (!e.target.value) {
      let res = await App.API_Post({url: `/share`, body: {
        "action": "LINK",
        "oID": ItemRequest.id,
        "section": App.Section,
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
    N_.ClientStatus(5, "User");
    this.container = N_.MakeReplaceElem(PageInfo, '.ItemLocked', '<div class="ItemLocked"></div>');
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
        "oID": this.response.Item,
        "section": App.Section,
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
      else {NodeAPI('edit', {'action': 'DATA', 'section': Section, 'id': [this.element.getAttribute('node-id')], 'data': {'color': this.colorEntry.value}, 'path': NodeID})}
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
        
        NodeAPI('edit', {"action": "BIN", "section": App.Section, "id": forDeletion, "path": NodeID});
      }
      else if (this.Action == 'NewSpan') {
        NodeAPI('create', { 
          "section": App.Section,
          "path": NodeID,
          "parent": NodeID,
          "type": "Span",
          "name": document.querySelector('.Popup_Input_Name').value || 'New Span'
        });
      }
      else if (this.Action == 'NewFolder') {
        NodeAPI('create', {
          "section": App.Section,
          "path": NodeID,
          "type": "Folder",
          "parent": (NodeID=="homepage" ? this.Base.querySelector('.Popup_Location').getAttribute('value') : NodeID),
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
            "For": this.DATA.forShare ? "SHARE" : "SELF",
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

function PopUp_Upload() {
  const UploadContainer = document.getElementsByClassName('Upload_Container')[0];

  N_.ClientStatus(7, "Wait", 600);
  Upload_Visuals.Status("Choose", "Choose Items");
  uploadElem.Upload_Values[0].innerText = '0 Items';
  uploadElem.Upload_Values[1].innerText = '0 B';
  UploadContainer.style.visibility = "visible";

  PopUp_Upload.Close = function() {
    UploadContainer.style.visibility = 'hidden';
    UploadContainer.querySelectorAll('span i')[0].classList = 'fas fa-chevron-up'
    uploadElem.UC_Queue.classList.remove('UC_Showing');
    uploadElem.Progress_Div.classList.remove('visible');
    Upload_Actions.Reset_Upload();
  };
}


async function ViewItem(Type, NodeID) {
  if (Type == 'unknown') { return };

  Popup.prototype.LoadBase_();
  Popup.prototype.ToggleBase_();
  BlockOut.innerHTML = `
    <div class='Preview grid-items-center'>
      ${N_.Loading('medium')}
    </div>`;

  if (Type == "image") {
    document.querySelector('.Preview').innerHTML = `<img class='ViewImage' rc='Preview_Image' node-id='${NodeID}' src='/storage/${NodeID}'></img>`;
  }
  else if (Type == "video") {
    document.querySelector('.Preview').innerHTML = `<video class='ViewImage' controls name='video' src='/storage/${NodeID}'></video`;
  }
  else if (Type == "text") {
    document.querySelector('.Preview').innerHTML = `<div class='ViewText'><pre>${ await App.API_Fetch({url: `/storage/${NodeID}`, conv: 'text'}) }</pre></div>`;
  }
  else if (Type == 'font') {
    document.querySelector('.Preview').innerHTML = `
      <div class='ViewFont'>
        <style>@font-face {font-family: "fetched-font";src: url("/storage/${NodeID}") format('${App.Nodes[NodeID].data.mime.split('/')[1]}');}</style>
        <p>1234567890
      </div>
    `;
  }
  else if (Type == 'audio') {
    document.querySelector('.Preview').innerHTML = `
      <audio controls><source src='/storage/${NodeID}' type='${App.Nodes[NodeID].data.mime}'></audio>`;
  }
  else {console.log(Type);}
}


// <i class='miniPreviewBtn fas fa-compress' title='Show in MiniPlayer' onclick='miniPreview(this)'></i>
// color: var(--text-dull); font-size: 18px; place-self: end; padding: 10px; cursor: pointer;
function miniPreview(e) {
  console.log(e || 'RC Call ?');
}