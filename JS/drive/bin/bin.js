let binSubSection = 'main';
const binSections = {1: 'main', 2: 'blocks', 3: 'codex'}
let binReminderTriggered = false;

const binContainer = document.querySelector('.binContainer');
const binInfoPopup = document.querySelector('.binInfoPopup');
const binItemData = document.querySelector('.binItemData');

// @ == Initialise Bin Page
BinDataCall();
BinItemCall();
binSwitchController();

async function BinDataCall() {
  console.log('Fetch from server user bin size and data breakdown.')
}

async function BinItemCall() {  
  let Resp = await Directory_Call({'Folder':'home', 'Section': 'Bin', 'subSection': binSubSection});
  if (Resp.Parent) { RenderBinList(Resp); }
}


RenderBinList = function(data) {

  if (typeof data.Contents == 'object' && Object.entries(data.Contents).length) { // Check if Data has been Returned and render
    document.querySelector('.binIsEmpty').classList.remove('displayBinIsEmpty');

    binContainer.innerHTML = `
      <table class='binTable'>
        <tbody></tbody>
      </table>
    `;
    
    let Table = binContainer.querySelector('tbody');
  
    for (const [object, item] of Object.entries(data.Contents)) {
      Table.insertAdjacentHTML('afterBegin',
      `
        <tr type='${N_ItemChecker(item.type.mime)}' nano-id='${object}' rc='Bin_Item' rcOSP='TD'>
          <td><img loading='lazy' height='38' width='38' src='${N_ItemImage({"type":item.type.mime, "oID": object, "section": "bin", "h": 38, "w": 38})}'></img></td>
          <td>${N_CapFirstLetter(item.name)}</td>
          <td>${N_CapFirstLetter(N_TypeChecker(item.type.mime, "TRIM"))}</td>
          <td>${N_DateFormater(item.deleted.stamp)}</td>
          <td>${item.size > 1 ? N_ConvertSize(item.size) : "-"}</td>
        </tr>
      `)
    }
  
    // ====== Interactive Functions
  
    BinItemClickListeners();
    binReminderPopup();
    
  } else {
    document.querySelector('.binIsEmpty').classList.add('displayBinIsEmpty');
    binContainer.innerHTML = ``;
  }
}


// @ == Item Listeners

function BinItemClickListeners() {
  let DeletedItems = binContainer.querySelectorAll('tr[nano-id]');
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
        FetchBinItemInformation(selected.getAttribute('nano-id'));
      }
    })
  })
}

FetchBinItemInformation = async(nanoID) => {
  binItemData.innerHTML = N_Loading('small');

  let FileRequest = await fetch(`https://drive.nanode.one/user/bin/${nanoID}`);
  let RequestInfo = await FileRequest.json();
  RequestInfo = RequestInfo[nanoID];

  binItemData.innerHTML = `
    <p>${RequestInfo.name}</p>
    
    <table>
      <tbody>
        <tr><td>Parent</td> <td>${RequestInfo.parent.name}</td></tr>
        <tr><td>Size</td> <td>${N_ConvertSize(RequestInfo.size)}</td></tr>
        <tr><td>Type</td> <td>${N_TypeChecker(RequestInfo.type.mime)}</td></tr>
        <tr><td>Deleted</td> <td>${N_DateFormater(RequestInfo.deleted.stamp)}</td></tr>
        <tr><td>Contents</td> <td>${N_TextMultiple(RequestInfo.count, 'Item')}</td></tr>
      </tbody>
    </table>

    <button class='binBtn binRestoreBtn'>Restore</button>
    <button class='binBtn binDeleteBtn'>Delete</button>
  `
  // <tr><td>Deleted By</td> <td>${RequestInfo.deleted.who}</td></tr>

  // binItemData.querySelectorAll('button').forEach((btn) => {

  // })

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
        binContainer.innerHTML = N_Loading('medium');
        binSubSection = binSections[switchOptionPos];
        BinItemCall()
        sliderElem.style.transform = `translateX(${(sliderWidth*(switchOptionPos - 1))}px)`
      }
    })
  })
}

binReminderPopup = function() {
  if (binReminderTriggered === false) {
    binReminderTriggered = true;
    setTimeout(() => {
      binInfoPopup.classList.add('displayPopup');
      binInfoPopup.querySelector('i').addEventListener('click', () => {
        binInfoPopup.classList.remove('displayPopup');
      });
    }, 5000)
  }
}