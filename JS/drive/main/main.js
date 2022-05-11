class Main {
  static folderCall = false;  // If Route Was Called by Clicking on a Folder
  static NodeID = 'homepage';
  static NodeName = 'home';

  static loadSkeleton;

  constructor() {
    Main.NodeCall({"folder":this.NodeName});
  }

  static async NodeCall(CallData, res={}) {
    const {folder=this.NodeID || this.NodeName, reload=true, skip=false} = CallData;
    
    this.folderCall = reload;

    this.loadSkeleton = setTimeout(() => { N_.Find('.fileContainer').innerHTML = (folder === 'homepage' ? Skeleton.Homepage() : Skeleton.Table()); }, 500)
    
    if (skip === false) { res = await App.API_Fetch({url:`/folder/${folder}?s=main`}) }
    
    if (res.Auth) {
      new SecurityInputContainer(res);
    } else if (res.Parent) {
      Main.NodeSetup(res, folder);
    }
  }

  static NodeSetup(res, folder) {
    this.NodeName = res.Parent.id == "homepage" ? "homepage" : res.Parent.name;
    this.NodeID = res.Parent.id;
    document.title = (this.NodeName !== 'homepage' ? this.NodeName : 'My Drive');
    
    App.Spans = {}, App.Nodes = {}, App.NodeSelected.clear();
  
    if (res.Contents.name) { // This is a scenario of viewing a homepage span as a folder. ie: via search. We need to re-jig the content and variables for this.
      this.NodeID = folder;
      this.NodeName = res.Contents.name;
      res.Contents = {[res.Contents.name]: res.Contents};
    }
  
    for (const [spanID, spanContent] of Object.entries(res.Contents)) {
      App.Spans[spanID] = {"id": spanID, "name": spanContent.name, "nodes": Object.keys(spanContent.contents)};
      for (const [nodeID, nodeData] of Object.entries(spanContent.contents)) {
        App.Nodes[nodeID] = new Node(nodeData, nodeID, spanID);
      }
    }
  
    Navigate.Route(this.NodeID, this.NodeName);
    Directory.Render();
    setupFileMove();
  }

  static async NodeAPI(location, form, skip=true) { // For Creating or Editing Nodes
    // Skip Etiquette: IF Path GIVEN in Form. Skip must be TRUE or BLANK.
    // Only False if Path NOT given, but call must happen. (IN which case... just give path..?)

    form.id ? form.id = Array.from(form.id) : '';

    let res = await App.API_Post({url: `/${location}`, body: form, skipErr:true});

    N_.ClientStatus(2, "True", 400); N_.ClientStatus(8, "Off");
    if (res.error) {
      N_.InfoPopup({'parent':N_.Find('.main_Page .PageData'), 'type': 'error', 'text':res.error, 'displayDelay':100, 'displayTime':4000});
      return N_.Error(res.error);
    } else if (res?.action !== 'MOVE') { // This will trigger the reload of the directory. This is unnecessary for a MOVE.
      Main.NodeCall({skip, 'reload': false}, res);
    }
    return {};
  }
}
new Main();


// =================


class Directory {
  static onHomepage = true;
  static fileContainer = N_.Find('.fileContainer');

  static Render() {
    this.showTitles = true;
    this.onHomepage = (Main.NodeID === 'homepage');

    // this.fileContainer.innerHTML = N_.Loading();
    clearTimeout(Main.loadSkeleton);

    let content = ``; // Processed at the end to render the page.

    Object.values(App.Spans).forEach(span => { // [id: '', name: '', nodes: []]
      if (span.id === '_MAIN_') { return content += (Directory.baseFolders(span) +  Recent.Base())}

      content += Directory.Content(span);

      this.showTitles = false;
    })

    if (this.onHomepage) content += Directory.newSpan();

    this.fileContainer.innerHTML = this.onHomepage
      ? `<div rcpar='2'>${content}</div>`
      : content ;

    Directory.SetListeners_();
  }

  // ========== Rendering

  static Content(span) {
    if (Settings.Local.layout) {
      return `
        <div node-id='${span.id}' ${this.onHomepage ? `Home-Span='${span.name}'` : ""} rcpar='2'>
          <table class='tableTemplate' ${this.onHomepage ? `rc='Homepage_Span'` : ``} >
            <thead>
              <tr ${this.onHomepage ? 'rcPar=3' : ''} node-id='${span.id}'>
                <th><input value='${span.name}' ${this.onHomepage ? 'spanName' : 'spanName=disabled disabled '}></th>
                <th>${this.onHomepage ? '' : '<div class="Filter"><i class="fas fa-filter"></i><input type="text" placeholder="Filter..."></div>'}</th>
                ${this.showTitles ? '<th>Type</th> <th order="modified">Modified<i></i></th> <th order="size">Size<i></i></th>' : '<th></th> <th></th> <th></th>'}
              </tr>
            </thead>
    
            <tbody dir-nodes>
              ${Directory.listNode({"parent": span.name, "nodeIDs": span.nodes})}
            </tbody>
          </table>
        </div>
      `;
    } else { // Block Layout
      return `
        <div node-id='${span.id}' class='ContentContainer ${!this.onHomepage && 'lout_grid'}' dir-nodes ${this.onHomepage && `Home-Span='${span.name}' rc='Homepage_Span'`}>
          <input value='${span.name}' ${this.onHomepage ? 'spanName' : 'spanName=disabled disabled '}>
          ${Directory.blockNode({"parent": span.name, "nodes": span.nodes})}
        </div>
      `;
    }
  }

  static listNode = (data={}, content=``) => {
    let {parent=Main.NodeName, nodeIDs=[], skipOrder=false} = data;

    if (!this.onHomepage && !nodeIDs.length) return Directory.directoryIsEmpty();

    nodeIDs = Order.OrderNodes(App.Nodes) || nodeIDs;

    nodeIDs.forEach(nodeID => { const nodeData = App.Nodes[nodeID].data;
      content += `
        <tr directory='${Navigate.ItemsPath(parent, nodeData.name)}' type='${nodeData.type.general}' node-id='${nodeID}' rc='${nodeData.mime == "FOLDER" ? "Node_Folder" : "Node_File"}' rcOSP='TD' title='${Navigate.ItemsPath(parent, nodeData.name)}' ${nodeData.color ? "style='box-shadow: inset "+nodeData.color+" 3px 0' " : ""}  color='${nodeData.color || ''}'>
          <td><img loading='lazy' height='32' width='32' src='${N_.FileIcon(nodeData, 90, 120, 'main')}'></img></td>
          <td><input rcPar='2' value='${N_.CapFirstLetter(nodeData.name)}' disabled style='pointer-events:none;'></input></td>
          <td>${nodeData.type.short}</td>
          <td>${N_.DateFormatter(nodeData.time.modified || nodeData.time.created)}</td>
          <td>${nodeData.size > 1 ? N_.ConvertSize(nodeData.size) : "-"}</td>
        </tr>
      `;
    });
    return content;
  };
  static blockNode = (data={}, content=``) => {
    const {parent=Main.NodeName, nodes} = data;

    if (!this.onHomepage && !nodes.length) return Directory.directoryIsEmpty();

    nodes.forEach(nodeID => { const nodeData = App.Nodes[nodeID].data;
      content += `
        <div class='Item' directory='${Navigate.ItemsPath(parent, nodeData.name)}' type='${nodeData.type.general}' node-id='${nodeID}' rc='${nodeData.mime == "FOLDER" ? "Node_Folder" : "Node_File"}' rcOSP='TEXTAREA,IMG,P' title='${Navigate.ItemsPath(parent, nodeData.name)}' color='${nodeData.color || ''}'>
          ${nodeData.color ? "<color style='background:"+nodeData.color+"'></color>" : ''}
          <img loading='lazy' height='90' width='${!nodeData.mime == "FOLDER" ? 90 : 120}' src='${N_.FileIcon(nodeData, 90, 120, 'main')}'></img>
          <textarea rcpar='1' disabled style='pointer-events:none;'>${N_.CapFirstLetter(nodeData.name)}</textarea>
          <p>${N_.CapFirstLetter(nodeData.type.general)}${nodeData.size > 1 ? ' - '+N_.ConvertSize(nodeData.size) : ''}</p>
        </div>
      `;
    });
    return content;
  };


  static baseFolders(span) {
    return `
      <folders node-id='${span.id}' class='baseFolders flex-even-cent'> ${renderFolders(span.nodes)} </folders>
    `;

    function renderFolders(nodeList, content=``) {
      nodeList.forEach(nodeID => {
        let nodeData = App.Nodes[nodeID].data;

        content += `
          <div directory='${Navigate.ItemsPath('Main', nodeData.name)}' type='${nodeData.type.general}' node-id='${nodeData.id}'>
            <img loading='lazy' height='60' width='60' src='${N_.FileIcon(nodeData, 90, 120, 'main')}'></img>
            <p title='${Navigate.ItemsPath('Main', nodeData.name)}'>${N_.CapFirstLetter(nodeData.name)}</p>
            <div></div>
          </div>
        `
      })
      return content;
    }
  }

  static newSpan() {
    return `<button class='NewSpan'>New Span</button>`
  }

  static directoryIsEmpty() {
    return `
      <empty class='section_Empty grid-items-center transform-center'>
        <img src='/assets/nanode/files.svg' alt='This Folder is Empty.'>
        <div class='flex-column-cent'>
          <p>Drop files here</p>
          <p class='italic-small'>or use the 'Upload' button</p>
        </div>
      </empty>
    `;
  }

  // ==========

  static highlightNode(nodeID) {
    let targetNode = N_.Find(`[dir-nodes] > [node-id='${nodeID}']`);
    new Select(targetNode, "force");
    targetNode.scrollIntoView({behavior: 'smooth'})
  }

  // ==========

  static SetListeners_() {
    if (this.onHomepage === true) {
      Recent.Load();
      Directory.SpanListeners();
    }
    else {
      Filter(Settings.Local.layout, this.fileContainer.querySelector('.Filter'), this.fileContainer);
      Order.Listeners(Settings.Local.layout, this.fileContainer.querySelector('table'));
      Order.SetOrderVisuals();
    }
    if (Settings.Local.layout === 0) {
      this.fileContainer.querySelectorAll('color').forEach(e => {
        e.addEventListener('click', (e) => {
          e.stopImmediatePropagation();
          new CreateColorPicker(e.target.parentNode);
        })
      })
    };
    ItemClickListener(Settings.Local.layout);
  }
  
  static SpanListeners() {
    N_.Find('.NewSpan').addEventListener('click', () => {
      new Popup('NewSpan', null, 'NewSpan', {title: 'New Span', reject: 'Cancel', accept: 'Create', color: ''})
    });
  
    N_.Find('input[spanName]', true, this.fileContainer).forEach(name => {
      name.addEventListener('change', (e) => {
        let nodeID = e.target.parentNode.parentNode.getAttribute('node-id');
        Main.NodeAPI('edit', {"action": "DATA", "section": "main", "id": [nodeID], "data": { "name": e.target.value }, "path": Main.NodeID});
      })
    })
  }
}
new Directory();



class Recent {
  static async Load() {
    const recentContainer = Directory.fileContainer?.querySelector('recents');

    if (!recentContainer) { return console.log('Recents Called without recents element. IE: Not on homepage?'); }

    this.content = ``;

    if (Settings.Local.recents === 1) {
      const res = await App.API_Fetch({url: `/activity/recent/main`}) || {};
      if (res?.err) { return N_.Error('Failed to Fetch Recents: '+err) }

      res.recent === 'Empty Query'
        ? N_.InfoPopup({'parent':N_.Find('.main_Page .PageData'), 'type': 'warning', 'text':"No recent files or folders found", 'displayDelay':100, 'displayTime':5000})
        : this.Render(res.recent);
    }

    recentContainer.children[0].innerHTML = this.content;
    recentContainer.children[1].innerText = Settings.Local.recents ? 'Hide Recent' : 'Show Recent';

    Recent.Listeners();
  }

  static Base() {
    return `
      <recents class='recentFiles flex-even-cent'>
        <div class='recentContainer flex-even-cent'></div>
        <button class='toggleRecent trans300' onclick='Settings.ToggleRecents()'></button>
      </recents>
    `
  }

  static Render(recent) {
    for (const [object, item] of Object.entries(recent)) {
      item.mime = item.type.mime;
      const nodeData = App.Nodes[object] = new Node(item, object, item.parent);

      this.content += `
        <div parent-node='${item.parent}' type='${nodeData.data.type.general}' node-id='${object}' rc='Recent_Node' rcosp='P,IMG'>
          <img loading='lazy' height='48' width='48' src='${N_.FileIcon(nodeData.data, 48, 48, 'main')}'></img>
          <p>${N_.CapFirstLetter(item.name)}</p>
        </div>
      `;
    };

  }

  static Listeners() {
    Directory.fileContainer.querySelectorAll('.recentContainer > div').forEach(item => {
      item.addEventListener('click', (e) => ItemActions(e.currentTarget))
    })
  }
}
new Recent();



class ItemInformation {
  static PageInfo = document.getElementsByClassName('PageInformation')[0];
  static SelectedID = '';
  static ItemInfoElem = '';
  static NodeInfo = '';

  static async Load(target, node=false) {
    N_.ClientStatus(2, "True", 500); N_.ClientStatus(4, "Wait", 400);
    N_.ClientStatus(5, "Wait", 300); N_.ClientStatus(7, "Wait", 300);

    if (!node && typeof RCC.RCElement !== 'undefined' && target === 'RCElement') {
      target = RCC.RCElement;
    }
    this.SelectedID = node ? target : target.getAttribute('node-id');

    this.ItemInfoElem = N_.MakeReplaceElem(this.PageInfo, '.ItemInfo', '<div class="ItemInfo"></div>');
    this.ItemInfoElem.innerHTML = N_.Loading('small');
  
    let req = await App.API_Fetch({url: `/user/files/${this.SelectedID}`})
    this.NodeInfo = new Node(req[this.SelectedID]).data;

    ItemInformation.Render();
  }

  static Render() {
    this.ItemInfoElem.innerHTML = `
      <section class='IIData flex-column-cent'>
        <input class='ItemInfo_Name' contenteditable='true' value='${this.NodeInfo.name}' title='${this.NodeInfo.previous ? 'Previous : '+this.NodeInfo.previous.toString().replace(',', ', ') : 'No Previous Names'}'>
        <p class='ItemInfo_UUID' title='This Items Unique Identifier'>${this.NodeInfo.id}</p>

        ${this.NodeInfo.type.general == 'image' ? "<img loading='lazy' height='128' width='auto' src='/storage/"+this.NodeInfo.id+"?h=128&w=null'></img>" : ""}

        <span class='flex-even-cent'>
          <button class='ItemInfo_Tab flex-even-cent' title='Open in New Tab (non shareable)' ${this.NodeInfo.type.file ? "" : "style='cursor: not-allowed'" } ><i class='fas fa-external-link-alt'></i>New Tab</button>
          <button class='ItemInfo_Download flex-even-cent' title='Download This ${this.NodeInfo.type.file ? "File" : "Folder"}'><i class='fas fa-cloud-download-alt'></i>Download</button>
        </span>

        <table>
          <tbody>
            <tr><td>Size</td><td title='${this.NodeInfo.size} bytes'>${N_.ConvertSize(this.NodeInfo.size)}</td></tr>
            <tr><td>Type</td><td title=${this.NodeInfo.type.mime}>${this.NodeInfo.type.short}</td></tr>
            <tr><td>Secured</td><td>${{0: "No", 1: "Secured", 2: "Multiple", 3: "Max"}[this.NodeInfo.security]}</td></tr>
            ${Object.keys(this.NodeInfo.time).reduce((pre, key) => 
                pre + `<tr><td>${N_.CapFirstLetter(key)}</td><td title='${new Date(this.NodeInfo.time[key].stamp).toGMTString()}'>${N_.DateFormatter(this.NodeInfo.time[key].stamp)}</td></tr>`, '')
            }
            <tr><td>Colour</td><td><input class='ItemInfo_Color' type='color' ${this.NodeInfo.color ? "value="+N_.RGBtoHex(this.NodeInfo.color) : ""}></td></tr>
          </tbody>
        </table>

        <textarea class='ItemInfo_Description' placeholder='Add a Description...' maxlength='100'>${this.NodeInfo.description || ""}</textarea>

      </section>

      <section class='IIShare'>
        <sub>SHARE - with another Nanode account</sub>
        <input class='ItemInfo_Share_Input' type='text' placeholder='Enter username or email'>

        <sub>LINK - view only</sub>
        <input class='ItemInfo_Link_Input' type='text' placeholder='Click to create link' readonly=true value='${this.NodeInfo.share ? 'https://link.nanode.one/'+this.NodeInfo.share.link.url : ''}'>
      </section>
    `;

    ItemInformation.Listeners();
  }

  static Listeners() {
    N_.Find('.ItemInfo_Name').addEventListener('change', (e) => {
      Main.NodeAPI('edit', {"action": "DATA", "section": App.Section, "id": [this.NodeInfo.id], "data": { "name": e.target.value }, "path": Main.NodeID})
    })
  
    N_.Find('.ItemInfo_Tab').addEventListener('click', () => {
      if (this.NodeInfo.type.file) N_.ExternalTab(this.NodeInfo.id);
    })
  
    N_.Find('.ItemInfo_Download').addEventListener('click', () => {
      PopUp_Download(this.NodeInfo, "ItemInfo");
    })
  
    N_.Find('.ItemInfo_Color').addEventListener('change', (e) => {
      Main.NodeAPI('edit', {"action": "DATA", "section": App.Section, "id": [this.NodeInfo.id], "data": { "color": e.target.value }, "path": Main.NodeID})
    })
  
    N_.Find('.ItemInfo_Description').addEventListener('change', (e) => {
      Main.NodeAPI('edit', {"action": "DATA", "section": App.Section, "id": [this.NodeInfo.id], "data": { "description": e.target.value }});
    })
  
    N_.Find('.ItemInfo_Share_Input').addEventListener('click', (e) => {
      console.log("Call server for account with that username / email and return their profile image and display below the input.")
    })
  
    N_.Find('.ItemInfo_Link_Input').addEventListener('click', async (e) => { // Link
      if (!e.target.value) {
        const res = await App.API_Post({url: `/share`, body: {
          "action": "LINK",
          "nodeId": this.NodeInfo.id,
          "section": App.Section,
        }});
        res.link ? e.target.value = res.link : e.target.style.color = 'crimson';
      }
      e.target.select();
      document.execCommand('copy');
    })
  }

}
new ItemInformation();