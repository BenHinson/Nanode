const binContainer = document.querySelector('.binContainer');
const binInfoPopup = document.querySelector('.binInfoPopup');

let binSubSection = 'main'

BinCall = async() => {  
  let Resp = await Directory_Call({'Folder':'home', 'Section': 'Bin', 'subSection': binSubSection});
  if (Resp.Parent) {
    RenderBinList(Resp);
  }
}

BinCall();


function RenderBinList(data) {

  if (!Object.entries(data.Contents).length) {
    document.querySelector('.binIsEmpty').classList.add('displayBinIsEmpty')
    return;
  }

  binContainer.innerHTML += `
    <table class='binTable'>
      <tbody></tbody>
    </table>
  `;
  
  let Table = binContainer.querySelectorAll('tbody')[0];

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

  setTimeout(() => {
    binInfoPopup.classList.add('displayPopup');
  }, 5000)
}


binInfoPopup.querySelector('i').addEventListener('click', () => {
  binInfoPopup.classList.remove('displayPopup');
})


BinItemClickListeners = function() {
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
  console.log(nanoID);
}