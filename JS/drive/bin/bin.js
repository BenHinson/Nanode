const binPage = document.querySelector('.bin_Page');

// ====================================

const BinController = () => {
  const binConfig = {
    binSubSection: 'main',
    binSections: {1: 'main', 2: 'blocks', 3: 'codex'},
    binReminderTriggered: false,
    binSizeColors: {'FOLDER': '#f3cc2d', 'image': '#2df377', 'text': '#b7c6d0', 'video': '#c8524c'},
    Bin_Nodes: {},
    itemActionProcessed: [],
    binSectionItemCount: 0
  }
  const binElem = {
    binPageContainer: binPage.querySelector('.PageContainer'),
    binPageInfo: binPage.querySelector('.PageInformation'),
    binSize: binPage.querySelector('.binSize'),
    binUsage: binPage.querySelector('.binUsage'),
  }

  SetListeners_ = () => { Switch(); }
  SetEvents_ = () => { ReminderPopup(); }
  
  // ====================================

  // Listeners
  Switch = () => {
    const switchElem = document.querySelector(`.Switch.SW_Bin`);
    const sliderElem = document.querySelector(`.Slider.SL_Bin`);
  
    switchElem.querySelectorAll('div:not(.SL_Bin)').forEach((option) => {
      option.addEventListener('click', function (e) {
        if (!this.classList.contains('SwitchSelected')) {
          let switchOptionPos = this.getAttribute('swOpPos');
          let sliderWidth = (this.parentElement.clientWidth / 3);
          switchElem.querySelector('.SwitchSelected').classList.remove('SwitchSelected');
          this.classList.add('SwitchSelected');
          binElem.binPageContainer.querySelector('.binContainer > div').innerHTML = N_.Loading('medium');
          binConfig.binSubSection = binConfig.binSections[switchOptionPos];
          ItemCall();
          sliderElem.style.transform = `translateX(${(sliderWidth*(switchOptionPos - 1))}px)`
        }
      })
    })
  }
  ItemClickListeners = (binContainer) => {
    let currentlySelected;
  
    binContainer.querySelectorAll('tr[node-id]').forEach((item) => {
      item.addEventListener('click', (e) => {
        if (!e.currentTarget.classList.contains('ItemSelected')) {
          currentlySelected ? currentlySelected.classList.remove('ItemSelected') : '';
          currentlySelected = e.currentTarget;
          ItemInfoCall(e.currentTarget.getAttribute('node-id'));
        }
        e.currentTarget.classList.toggle('ItemSelected');
      })
    })

    N_.Find('.refreshBinBtn', false, binContainer).addEventListener('click', RefreshBin)
    
  }
  RestoreDeleteListener = (binItemData, RequestInfo) => {
    N_.Find('.binRestoreBtn', false, binItemData).addEventListener('click', (e) => {RestoreDeletePost(RequestInfo.id, 'RESTORE', e.target)})
    N_.Find('.binDeleteBtn', false, binItemData).addEventListener('click', (e) => {RestoreDeletePost(RequestInfo.id, 'DELETE', e.target)})
  }
  VisitRestoredItem = (binItemData, nodeData) => {
    N_.Find('.binVisitBtn', false, binItemData).addEventListener('click', () => {
      pageSwitch(nodeData.parentSection).then(() => {
        Navigate.Shortcut(nodeData.parentID, nodeData.nodeID);
      });
    })
  }


  // Events
  ReminderPopup = () => {
    if (binConfig.binReminderTriggered === false) {
      binConfig.binReminderTriggered = true;
      N_.InfoPopup({'parent':binElem.binPageContainer, 'type': 'info', 'text':"Items left in the bin will be permanently deleted after 30 days.", 'displayDelay':5000, 'displayTime':10000});
    }
  }
  RefreshBin = () => {ItemCall(); DataCall();}


  // Render
  BinList = (data) => {
    const binContainer = binElem.binPageContainer.querySelector('.binContainer > div');

    if (typeof data.Contents == 'object' && Object.entries(data.Contents).length) { // Check if Data has been Returned and render
      renderNodes = (content=``) => {      
        for (const [nodeID, nodeData] of Object.entries(binConfig.Bin_Nodes)) {
          content += `
            <tr type='${nodeData.data.type.general}' node-id='${nodeID}' rc='Bin_Item' rcOSP='TD'>
              <td><img loading='lazy' height='38' width='38' src='${N_.FileIcon(nodeData.data, 38, 38, 'bin')}'></img></td>
              <td>${N_.CapFirstLetter(nodeData.data.name)}</td>
              <td>${nodeData.data.type.short}</td>
              <td>${N_.DateFormatter(nodeData.data.deleted.stamp)}</td>
              <td>${nodeData.data.size > 1 ? N_.ConvertSize(nodeData.data.size) : "-"}</td>
            </tr>
          `;
        }; return content;
      };
    
      binContainer.innerHTML = `
        <table class='binTable tableTemplate'>
          <thead><tr>
            <td><p class='binItemCount'>${N_.TextMultiple(binConfig.binSectionItemCount, 'item')}<p></td>
            <td><i class="fas fa-sync-alt refreshBinBtn"></i></td> </tr>
          </thead>
          <tbody>${renderNodes()}</tbody>
        </table>
      `;

      this.ItemClickListeners(binContainer);
      
    } else {
      binContainer.innerHTML = this.BinEmpty();
    }
  }
  BinEmpty = () => {
    return `
      <div class='section_Empty grid-items-center transform-center'>
        <img src='/assets/nanode/logo/logo.svg' alt='This Bin Section is Empty.'>
        <div class='flex-column-cent'>
          <p>Bin section empty</p>
          <p class='italic-small'>Deleted items will show here<br>for 30 days</p>
        </div>
      </div>
  `;
  }
  ItemInfo = (binItemData, RequestInfo) => {
    binItemData.innerHTML = `
      <p>${RequestInfo.name}</p>
      
      <table>
        <tbody>
          <tr><td>Parent</td> <td>${RequestInfo.parent.name}</td></tr>
          <tr><td>Contents</td> <td>${N_.TextMultiple(RequestInfo.count, 'Item')}</td></tr>
          <tr><td>Size</td> <td>${N_.ConvertSize(RequestInfo.size)}</td></tr>
          <tr><td>Type</td> <td>${RequestInfo.type.short}</td></tr>
          <tr><td>Deleted</td> <td>${N_.DateFormatter(RequestInfo.deleted.stamp)}</td></tr>
        </tbody>
      </table>

      <button class='rb-btn-full blue-light binRestoreBtn'>Restore</button>
      <button class='rb-btn-full red-light binDeleteBtn'>Delete</button>
    `;
    RestoreDeleteListener(binItemData, RequestInfo);
  }

  RestoredItemInfo = (nodeData) => {
    const {nodeName, parentID} = nodeData;
    let binItemData = binElem.binPageInfo.querySelector('.binItemData');

    binItemData.innerHTML = `
      <p>${nodeName}</p>
      <button class='rb-btn-full blue-light binVisitBtn'>Visit Restored Item</button>
    `;
    VisitRestoredItem(binItemData, nodeData);
  }
  DeletedItemInfo = (nodeData) => {
    binElem.binPageInfo.querySelector('.binItemData').innerHTML = ``;
    N_.InfoPopup({'parent':binElem.binPageContainer, 'type': 'success', 'text':`Successfully Deleted - ${nodeData.nodeName}`, 'displayDelay':500, 'displayTime':2000});
  }


  // API
  DataCall = async() => {
    const req = await API_Fetch({url: `/account/bin`});
    
    if (req && req.size.bin) {
      let totalSize = Object.values(req.size.bin).reduce((a, b) => a + b);
      binElem.binSize.innerText = `Bin Size: ${N_.ConvertSize(totalSize)}`
    
      let sizeMap = new Map(Object.entries(req.size.bin))
      sizeMap = new Map([...sizeMap].sort((a,b) => a[1] === b[1] ? b[0] - a[0] : a[1] - b[1]))  // Sorts the object values from lowest to highest
    
      let rotation = 0, offset = [];

      binElem.binUsage.innerHTML = '<div></div>';
        
      for (const [type, size] of sizeMap) {
        let sizePercentage = (size / totalSize);
        if (sizePercentage < 0.01) {continue};
    
        let typeColor = binConfig.binSizeColors[type] || '#474d50';
    
        binElem.binUsage.innerHTML += `
          <svg class='binSize_SVG' viewBox='0 0 100 100'>
            <circle cx='50' cy='50' r='45' style='stroke-dashoffset: 283; transform: rotate(${360 * rotation}deg); stroke: ${typeColor};'></circle>
          </svg>`;
    
        binElem.binUsage.children[0].innerHTML += `
          <span style='color: ${typeColor};'>
            <p>⬤ ${N_.CapFirstLetter(type)}</p><p>${N_.ConvertSize(size)} - ${(sizePercentage * 100).toFixed()}%</p>
          </span>`;
    
        offset.push( Math.floor(283 - (283 * sizePercentage)) );
        rotation += sizePercentage;
      }
    
      setTimeout(() => { // Adds the transition to each element.
        binElem.binUsage.querySelectorAll('svg > circle').forEach((e, i) => {
          e.style.strokeDashoffset = offset[i];
        });
      }, 100)
    
    } else {
      binElem.binSize.innerText = `Bin is Empty`
    }
  }
  ItemCall = async() => {
    let res = await API_Fetch({url:`/folder/home?s=bin&sub=${binConfig.binSubSection.toLowerCase()}`});
    if (res.Parent) {
      binConfig.itemActionProcessed = [];
      binConfig.Bin_Nodes = {};
      if (typeof res.Contents == 'object') {
        binConfig.binSectionItemCount = 0;
        for (const [id, data] of Object.entries(res.Contents).reverse()) {
          binConfig.binSectionItemCount++;
          binConfig.Bin_Nodes[id] = new Node(data, id, res.Parent.name);
        }
      }
      this.BinList(res);
    }
  }
  ItemInfoCall = async(nodeID) => {
    const binItemData = binElem.binPageInfo.querySelector('.binItemData');

    if (!binItemData.innerHTML.length) binItemData.innerHTML = N_.Loading('small');
  
    const RequestInfo = await( await fetch(`https://drive.nanode.one/user/bin/${nodeID}`) ).json();
  
    RequestInfo[nodeID].id = nodeID;
    let NodeInfo = new Node(RequestInfo[nodeID]);
    this.ItemInfo(binItemData, NodeInfo.data);
  }
  RestoreDeletePost = async(nodeID, action, btnElement) => {
    if (binConfig.itemActionProcessed.includes(nodeID)) {return}
    binConfig.itemActionProcessed.push(nodeID);
    btnElement.innerHTML = N_.Loading('button');
    
    if (nodeID) {
      let res = await API_Post({url: `/bin`, body: {'subSection': binConfig.binSubSection, action, 'id': nodeID}})

      let nodeData = {'nodeName':binConfig.Bin_Nodes[nodeID].data.name, nodeID, 'parentSection': binConfig.binSubSection}

      setTimeout(() => {
        if (res.status == 'successful') {
          binConfig.binSectionItemCount--; // Cannot place within TextMultiple, seems to do the calculation afterwards
          N_.Find('td > p.binItemCount').innerText = N_.TextMultiple(binConfig.binSectionItemCount, 'item');
          N_.Find(`tr[node-id='${nodeID}']`).remove(); // Add an animation here. Blue glow for restore, transforms right. Red glow for delete, transforms left.
          delete binConfig.Bin_Nodes[nodeID];
          DataCall();
          
          if (action == 'RESTORE' && res.parent) { RestoredItemInfo({...nodeData, ...{'parentID':res.parent}}); }
          else if (action == 'DELETE') { DeletedItemInfo(nodeData)}
          else {
            btnElement.innerHTML = `${N_.CapFirstLetter(action)} Failed`;
            N_.InfoPopup({'parent':binElem.binPageContainer, 'type': 'error', 'text':`Something went wrong during: ${N_.CapFirstLetter(action)}`, 'displayDelay':500, 'displayTime':5000});
          }
        } else {
          btnElement.innerHTML = `${N_.CapFirstLetter(action)} Failed`;
        }
      }, 500)
    }
  }

  // ====================================

  this.SetListeners_(), this.SetEvents_();
  this.DataCall(), this.ItemCall();
}

BinController();