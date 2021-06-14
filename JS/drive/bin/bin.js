let binSubSection = 'main';
const binSections = {1: 'main', 2: 'blocks', 3: 'codex'}
let binReminderTriggered = false;
const binSizeColors = {'FOLDER': '#f3cc2d', 'image': '#2df377', 'text': '#b7c6d0'}

const binPage = document.querySelector('.bin_Page');

const binPageContainer = binPage.querySelector('.PageContainer');
const binPageInfo = binPage.querySelector('.PageInformation');

let Bin_Nodes = {};

// ====================================

// @ == Initialise Bin Page
BinDataCall();
BinItemCall();
binSwitchController();

// ====================================

async function BinDataCall() {
  let req = await API_Fetch({url: `/account/bin`})

  const binSize = binPageInfo.querySelector('.binSize');
  const binUsage = binPageInfo.querySelector('.binUsage');

  if (req && req.size.bin) {
    let totalSize = Object.values(req.size.bin).reduce((a, b) => a + b);
    binSize.innerText = `Bin Size: ${N_ConvertSize(totalSize)}`

    let sizeMap = new Map(Object.entries(req.size.bin))
    sizeMap = new Map([...sizeMap].sort((a,b) => a[1] === b[1] ? b[0] - a[0] : a[1] - b[1]))  // Sorts the object values from lowest to highest

    let rotation = 0, offset = [];
      
    for (const [type, size] of sizeMap) {
      let sizePercentage = (size / totalSize);
      if (sizePercentage < 0.01) {continue};

      let typeColor = binSizeColors[type] || '#474d50';

      binUsage.innerHTML += `
        <svg class='binSize_SVG' viewBox='0 0 100 100'>
          <circle cx='50' cy='50' r='45' style='stroke-dashoffset: 283; transform: rotate(${360 * rotation}deg); stroke: ${typeColor};'></circle>
        </svg>`;

      binUsage.children[0].innerHTML += `
        <span style='color: ${typeColor};'>
          <p>⬤ ${N_CapFirstLetter(type)}</p><p>${N_ConvertSize(size)} - ${(sizePercentage * 100).toFixed()}%</p>
        </span>`;

      offset.push( Math.floor(283 - (283 * sizePercentage)) );
      rotation += sizePercentage;
    }

    setTimeout(() => { // Adds the transition to each element.
      binUsage.querySelectorAll('svg > circle').forEach((e, i) => {
        e.style.strokeDashoffset = offset[i];
      });
    }, 100)

  } else {
    binSize.innerText = `Bin is Empty`
  }
}

async function BinItemCall() {
  let res = await API_Fetch({url:`/folder/home?s=bin&sub=${binSubSection.toLowerCase()}`});
  if (res.Parent) {

    Bin_Nodes = {};
    if (typeof res.Contents == 'object') {
      for (const [id, data] of Object.entries(res.Contents).reverse()) {
        Bin_Nodes[id] = new Node(data, id, res.Parent.name);
      }
    }

    RenderBinList(res);
  }
}


RenderBinList = function(data) {
  const binContainer = binPageContainer.querySelector('.binContainer');

  if (typeof data.Contents == 'object' && Object.entries(data.Contents).length) { // Check if Data has been Returned and render
    document.querySelector('.binIsEmpty').classList.remove('display-opacity');

    renderNodes = (content=``) => {      
      for (const [nodeID, nodeData] of Object.entries(Bin_Nodes)) {
        content += `
          <tr type='${nodeData.data.type.general}' node-id='${nodeID}' rc='Bin_Item' rcOSP='TD'>
            <td><img loading='lazy' height='38' width='38' src='${N_FileIcon(nodeData.data, 38, 38, 'bin')}'></img></td>
            <td>${N_CapFirstLetter(nodeData.data.name)}</td>
            <td>${nodeData.data.type.short}</td>
            <td>${N_DateFormater(nodeData.data.deleted.stamp)}</td>
            <td>${nodeData.data.size > 1 ? N_ConvertSize(nodeData.data.size) : "-"}</td>
          </tr>
        `;
      }; return content;
    };
  
    binContainer.innerHTML = `
      <table class='binTable tableTemplate'>
        <tbody>${renderNodes()}</tbody>
      </table>
    `;
    
    // ====== Interactive Functions
  
    BinItemClickListeners(binContainer);
    binReminderPopup();
    
  } else {
    document.querySelector('.binIsEmpty').classList.add('display-opacity');
    binContainer.innerHTML = ``;
  }
}


// @ == Item Listeners

function BinItemClickListeners(binContainer) {
  let DeletedItems = binContainer.querySelectorAll('tr[node-id]');
  let currentlySelected;

  DeletedItems.forEach((item) => {
    item.addEventListener('click', (selected) => {
      selected = selected.currentTarget;
      if (selected.classList.contains('ItemSelected')) {
        selected.classList.remove('ItemSelected');
      } else {
        currentlySelected ? currentlySelected.classList.remove('ItemSelected') : '';
        currentlySelected = selected;
        selected.classList.add('ItemSelected');
        FetchBinItemInformation(selected.getAttribute('node-id'));
      }
    })
  })
}


async function FetchBinItemInformation(nodeID) {
  const binItemData = binPageInfo.querySelector('.binItemData');

  if (!binItemData.innerHTML.length) binItemData.innerHTML = N_Loading('small');

  let FileRequest = await fetch(`https://drive.nanode.one/user/bin/${nodeID}`);
  let RequestInfo = await FileRequest.json();

  let NodeInfo = new Node(RequestInfo[nodeID]);
  renderBinItemInfo(binItemData, NodeInfo.data);
}

renderBinItemInfo = (binItemData, RequestInfo) => {
  binItemData.innerHTML = `
    <p>${RequestInfo.name}</p>
    
    <table>
      <tbody>
        <tr><td>Parent</td> <td>${RequestInfo.parent.name}</td></tr>
        <tr><td>Contents</td> <td>${N_TextMultiple(RequestInfo.count, 'Item')}</td></tr>
        <tr><td>Size</td> <td>${N_ConvertSize(RequestInfo.size)}</td></tr>
        <tr><td>Type</td> <td>${RequestInfo.type.short}</td></tr>
        <tr><td>Deleted</td> <td>${N_DateFormater(RequestInfo.deleted.stamp)}</td></tr>
      </tbody>
    </table>

    <button class='rb-btn-full blue-light binRestoreBtn'>Restore</button>
    <button class='rb-btn-full red-light binDeleteBtn'>Delete</button>
  `;
}

// @ == Page Interactivity

function binSwitchController(switchName) {
  let switchElem = document.querySelector(`.Switch.SW_Bin`);
  let sliderElem = document.querySelector(`.Slider.SL_Bin`);

  switchElem.querySelectorAll('div:not(.SL_Bin)').forEach((option) => {
    option.addEventListener('click', function (e) {
      if (!this.classList.contains('SwitchSelected')) {
        let switchOptionPos = this.getAttribute('swOpPos');
        let sliderWidth = (this.parentElement.clientWidth / 3);
        switchElem.querySelector('.SwitchSelected').classList.remove('SwitchSelected');
        this.classList.add('SwitchSelected');
        binPageContainer.querySelector('.binContainer').innerHTML = N_Loading('medium');
        binSubSection = binSections[switchOptionPos];
        BinItemCall()
        sliderElem.style.transform = `translateX(${(sliderWidth*(switchOptionPos - 1))}px)`
      }
    })
  })
}

binReminderPopup = () => {
  if (binReminderTriggered === false) {
    binReminderTriggered = true;
    N_InfoPopup(binPageContainer, "Items left in the bin will be permanently deleted after 30 days.", 5000);
  }
}