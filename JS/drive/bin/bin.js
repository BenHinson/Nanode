const binPage = document.querySelector('.bin_Page');

// ====================================

const BinController = () => {
  const binConfig = {
    binSubSection: 'main',
    binSections: {1: 'main', 2: 'blocks', 3: 'codex'},
    binReminderTriggered: false,
    binSizeColors: {'FOLDER': '#f3cc2d', 'image': '#2df377', 'text': '#b7c6d0', 'video': '#c8524c'},
    Bin_Nodes: {},
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
          binElem.binPageContainer.querySelector('.binContainer').innerHTML = N_.Loading('medium');
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
  }


  // Events
  ReminderPopup = () => {
    if (binConfig.binReminderTriggered === false) {
      binConfig.binReminderTriggered = true;
      N_.InfoPopup(binElem.binPageContainer, "Items left in the bin will be permanently deleted after 30 days.", 5000);
    }
  }


  // Render
  BinList = (data) => {
    const binContainer = binElem.binPageContainer.querySelector('.binContainer');

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
      binConfig.Bin_Nodes = {};
      if (typeof res.Contents == 'object') {
        for (const [id, data] of Object.entries(res.Contents).reverse()) {
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
  
    let NodeInfo = new Node(RequestInfo[nodeID]);
    this.ItemInfo(binItemData, NodeInfo.data);
  }

  // ====================================

  this.SetListeners_(), this.SetEvents_();
  this.DataCall(), this.ItemCall();
}

BinController();