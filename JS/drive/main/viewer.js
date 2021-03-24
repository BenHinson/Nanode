DownloadItems = [];
dirPathPass = false;

const SecureKey = {0: "No", 1: "Secured", 2: "Multiple", 3: "Max"}
const sec_icons = {"Password": "far fa-keyboard", "Pin": "fas fa-th", "Time": "far fa-clock"}
const sec_values = {
"Password": " 'placeholder='Password' inputType='pass' type='password'' ",
"Pin": " 'placeholder='Pin Code • 1-9' inputType='pin' type='password'' ",
"Time": " 'value='Time Restricted' readOnly type='text' inputType='Time'' "
}

const fileContainer = document.getElementsByClassName('fileContainer')[0];
const ItemInfo = document.getElementsByClassName('ItemInformation')[0];

const UploadContainer = document.getElementsByClassName('Upload_Container')[0];
const UC_Queue_Viewer = document.getElementsByClassName('UC_Queue_Viewer')[0];
const UC_Queue_Viewer_Table = document.querySelector('.UC_Queue_Viewer table tbody');

// ========================

// Socket IO Removal - Why? Although very useful.
//    Have to load code and Connect everytime.
//    A loss of connection requires manually reconnecting.
//    If a socket request is the first event after a cookie has ran out, you cant set the new cookie on the server.

// Fix of Navigation

  // File Move for Block.

  // The Multiple Update:
      // Selection Box - Shows Selection Data at the bottom. Narrow Bar like VSCode blue bar.
      // Multi-Move

  // The Right-Click Update:
      // Security. Including removal.
      // Copy To
      // Move To
      // Create Shortcut
      // Share

  // Settings Review, JS, Functions and Page Revision.

  // Icons for Different File types.

  // Search Implementation - Remember to check the previous names settings too for items.

////////////////////////////   VIEW   //////////////////////////////////

async function ViewItem(Type, NanoID) {
  let BlockOut = PopUpBase();
  BlockOut.innerHTML = `
    <div class='Preview'>
      ${N_Loading('medium')}
    </div>`;

  if (Type == "image") {
    let res = await fetch(`https://drive.nanode.one/storage/${NanoID}`);
    let blob = await res.blob();
    document.querySelector('.Preview').innerHTML = `<img class='ViewImage' src='${URL.createObjectURL(blob)}'></img>`;
  }

  if (Type == "video") {
    document.querySelector('.BlockOut div').insertAdjacentHTML('afterbegin', `<video class='ViewImage' controls name='video' src='https://drive.nanode.one/storage/${NanoID}'></video`);
  }

  if (Type == "text") {
    let res = await fetch(`https://drive.nanode.one/storage/${NanoID}`)
    document.querySelector('.BlockOut div').insertAdjacentHTML('afterbegin', `<div class='ViewText'><pre></pre></div>`);
    document.querySelector('.ViewText > pre').innerText = await res.text();
  }
}


function viewContentAsBlock(NanoID) {
  fileContainer.innerHTML = '';
  document.querySelector('.Slider.SL_View').style.transform = 'translateX(28px)';

  let SpanCount = 0;
  for (const [span, data] of Object.entries(Directory_Content))  {

    fileContainer.innerHTML += `
      <div class='ContentContainer' nano-id='${span}' ${NanoID == "homepage" ? `Home-Span='${data.name}' rc='Homepage_Span'` : "Sub-Span" }>
        <input ${NanoID == "homepage" ? `spanName value='${data.name}'` : `spanName=disabled disabled value='${NanoName}'` }></input>
      </div>
    `    

    let Container = document.querySelectorAll('.ContentContainer')[SpanCount];

    for (const [object, item] of Object.entries(data.contents)) {
      let parent = N_CapFirstLetter(data.name) || "";

      Container.innerHTML += `
        <div class='Item' directory='${N_ItemsPath(parent, item.name)}' type='${N_ItemChecker(item.mime)}' nano-id='${object}' rc='${item.mime == "FOLDER" ? "Nano_Folder" : "Nano_File"}' rcOSP='TEXTAREA,IMG' title='${N_ItemsPath(parent, item.name)}' ${item.color ? "style='border-bottom: 2px solid "+item.color+"'" : ""}>
          <img loading='lazy' height='90' width='${!item.mime == "FOLDER" ? 90 : 120}' src='${N_ItemImage({"type":item.mime, "oID": object, "section": "main", "h": 90, "w": 120})}'></img>
          <textarea rcpar='1' disabled style='pointer-events:none;'>${N_CapFirstLetter(item.name)}</textarea>
        </div>
      `
    }

    $($("div[type='folder']", Container).get().reverse()).each(function(i, folder) {
      $(folder).insertAfter( Container.children[0]);
    })
    SpanCount++;
  }

  if (NanoID == "homepage") {
    fileContainer.innerHTML += `<div class='NewSpan' onclick='PopUp_New_Span()'>New Span</div>`;

    fileContainer.querySelectorAll('input[spanName]').forEach(function(name) {
      name.addEventListener('change', function(e) {
        // socket.emit('ItemEdit', {"Action": "DATA", "Item": "Span", "section": "main", "ID": e.target.defaultValue, EditData: {"name": e.target.value} })
        EditPOST({"action": "DATA", "section": "main", "id": e.target.defaultValue, "data": { "name": e.target.value }, "path": NanoID})
      })
    })
  }

  ItemClickListener(UserSettings.ViewT);
  N_ClientStatus("CS7", "Ok", 400);
}

function viewContentAsList(NanoID) {
  fileContainer.innerHTML = '';
  document.querySelector('.Slider.SL_View').style.transform = 'translateX(0px)';

  let SpanCount = 0;
  for (const [span, data] of Object.entries(Directory_Content)) {

    fileContainer.innerHTML += `
    <div class='ListContentContainer' nano-id='${span}' ${NanoID == "homepage" ? `Home-Span='${data.name}'` : "" }>
      <table class='ListContentTable' ${NanoID == "homepage" ? `rc='Homepage_Span'` : ``}>
          <tbody>
            <tr ${NanoID == "homepage" ? `rcOSP='TH'` : ``} > <th><input ${NanoID == "homepage" ? `spanName value='${data.name}'` : `spanName=disabled disabled value='${NanoName}'` }></input></th> <th></th> <th>Type</th> <th>Modified</th> <th>Size</th> </tr>
          </tbody>
        </table>
      </div>
    `;

    let Table = fileContainer.querySelectorAll('tbody')[SpanCount];

    for (const [object, item] of Object.entries(data.contents)) {
      let parent = N_CapFirstLetter(data.name) || "";

      Table.innerHTML += `
        <tr directory='${N_ItemsPath(parent, item.name)}' type='${N_ItemChecker(item.mime)}' nano-id='${object}' rc='${item.mime == "FOLDER" ? "Nano_Folder" : "Nano_File"}' rcOSP='TD' title='${N_ItemsPath(parent, item.name)}' ${item.color ? "style='box-shadow: "+item.color+" -3px 0' " : ""}>
          <td><img loading='lazy' height='32' width='32' src='${N_ItemImage({"type":item.mime, "oID": object, "section": "main", "h": 90, "w": 120})}'></img></td>
          <td><input rcPar='2' value='${N_CapFirstLetter(item.name)}' disabled style='pointer-events:none;'></input></td>
          <td>${N_CapFirstLetter(N_TypeChecker(item.mime, "TRIM"))}</td>
          <td>${N_DateFormater(item.time.modified || item.time.created)}</td>
          <td>${item.size > 1 ? N_ConvertSize(item.size) : "-"}</td>
        </tr>
      `
    }
    // <td>${N_CapFirstLetter(item.name)}</td>

    $($("tr[type='folder']", Table).get().reverse()).each(function(i, folder) {
      $(folder).insertAfter( Table.children[0]);
    })
    SpanCount++;
  }

  if (NanoID == "homepage") {
    fileContainer.innerHTML += `<div class='NewSpan' onclick='PopUp_New_Span()'>New Span</div>`;
    fileContainer.querySelectorAll('input[spanName]').forEach(function(name) {
      name.addEventListener('change', function(e) {
        console.log("160");
        EditPOST({"action": "DATA", "section": "main", "id": e.target.defaultValue, "data": { "name": e.target.value }, "path": NanoID})
        // socket.emit('ItemEdit', {"Action": "DATA", "Item": "Span", "section": "main", "ID": e.target.defaultValue, EditData: {"name": e.target.value} })
      })
  })
  }
  
  ItemClickListener(UserSettings.ViewT);
  N_ClientStatus("CS7", "Ok", 400);
}

/////////////////////////     SEARCH    //////////////////////////////

function renderSearch(results) {
  searchResults.parentNode.classList.add('display');
  searchResults.innerHTML = '';

  if (results.Found.length == 0) {
    searchResults.innerHTML = ` <div class='searchInfoBtn searchNoMatch'>No Matches Found</div> `
  }

  results.Found.forEach((item) => {
    searchResults.innerHTML += `
      <tr type='${N_ItemChecker(item.type.mime)}' nano-id='${item.id}' rc='Bin_Item' rcOSP='TD'>
        <td><img loading='lazy' height='38' width='38' src='${N_ItemImage({"type":item.type.mime, "oID": item.id, "section": "main", "h": 38, "w": 38})}'></img></td>
        <td>${N_CapFirstLetter(item.name)}</td>
        <td>${N_CapFirstLetter(N_TypeChecker(item.type.mime, "TRIM"))}</td>
        <td>${N_DateFormater(item.time?.modified?.stamp || item.time?.created?.stamp)}</td>
        <td>${item.size > 1 ? N_ConvertSize(item.size) : "-"}</td>
      </tr>
    `
  })
  if (results.Found.length == 5) {
    searchResults.innerHTML += ` <div class='searchInfoBtn searchLoadMore'>Load More</div> `
  }
}

function paramListeners() {
  document.querySelectorAll('.searchBy input').forEach(input => {
    input.addEventListener('change', (e) => {
      if (e.target.checked) {
        let option = e.target.value;
        if (option == 'size') {
          // Set Min Max Input 
        }
      }
    })
  })
}

getSearchParams = () => {
  searchParamsContainer.querySelectorAll('input:checked').forEach((option) => {
    console.log(option.value)
  })
}

/////////////////////////   RIGHT BAR   //////////////////////////////

async function callItemInformation(selected) {
  if (typeof RCElement !== 'undefined' && selected == "RCElement") {selected = RCElement}
  N_ClientStatus("CS2", "True", 500); N_ClientStatus("CS4", "Wait", 400);
  N_ClientStatus("CS5", "Wait", 300); N_ClientStatus("CS7", "Wait", 300);

  const SelectedID = selected.getAttribute('nano-id');
  const NanoPath = selected.getAttribute('directory');

  ItemInfo.innerHTML = N_Loading('medium');

  const Request = await fetch('https://drive.nanode.one/user/files/'+SelectedID);
  let RequestInfo = await Request.json();
  RequestInfo = RequestInfo[SelectedID];
  N_ClientStatus("CS3", "True", 600);

  // console.log(RequestInfo);
  ItemInfo.innerHTML = `
    <section class='IIData'>
      <input class='ItemInfo_Name' contenteditable='true' value='${RequestInfo.name}'>
      <p class='ItemInfo_UUID' title='This Items Unique Identifier'>${RequestInfo.id}</p>

      ${RequestInfo.type.mime.includes('image') ? "<img loading='lazy' height='128' width='auto' src='/storage/"+RequestInfo.id+"?h=128&w=null'></img>" : ""}

      <input class='ItemInfo_Directory' value='${NanoPath}' title='${NanoPath}' readonly=true>

      <span style='margin: 8px 0 0 0;'>
        <button class='ItemInfo_Tab' title='Open in New Tab (non shareable)' ${RequestInfo.type.file ? "" : "style='cursor: not-allowed'" } ><i class='fas fa-external-link-alt'></i>New Tab</button>
        <button class='ItemInfo_Download' title='Download This ${RequestInfo.type.file ? "File" : "Folder"}'><i class='fas fa-cloud-download-alt'></i>Download</button>
      </span>

      <table>
        <tbody>
          <tr><td>Size</td><td title='${RequestInfo.size} bytes'>${N_ConvertSize(RequestInfo.size)}</td></tr>
          <tr><td>Type</td><td title=${RequestInfo.type.mime}>${RequestInfo.type.file ? ( N_TypeChecker(RequestInfo.type.mime, "TRIM")) : "Folder"}</td></tr>
          <tr><td>Secured</td><td>${SecureKey[RequestInfo.security]}</td></tr>
        </tbody>
      </table>

      <sub>DESCRIPTION</sub>
      <textarea class='ItemInfo_Description' placeholder='Add a Description...' maxlength='100'>${RequestInfo.description || ""}</textarea>
    </section>

    <section class='IIShare'>
      <sub>SHARE - with another Nanode account</sub>
      <span> <input class='ItemInfo_Share_Input' type='text' placeholder='Enter username or email'></span>

      <sub>LINK - view only</sub>
      <span> <input class='ItemInfo_Link_Input' type='text' placeholder='Click to create link' readonly=true style='cursor: pointer;' value='${RequestInfo.share ? 'https://link.nanode.one/'+ RequestInfo.share.link.url : ''}'></span>
    </section>
  `

  document.querySelector('.ItemInfo_Name').title = RequestInfo.previous ? 'Previous : '+RequestInfo.previous.toString().replace(',', ', ') : 'No Previous Names';
  // <i class='fas fa-chevron-down Input_Ops_Btn ItemInfo_Share_Btn'></i>
  // <i class='fas fa-chevron-down Input_Ops_Btn ItemInfo_Link_Btn'></i> 

  const ItemInfoTable = $(ItemInfo).find('tbody')[0];
  for (let key in RequestInfo.time) {
    ItemInfoTable.innerHTML += `<tr><td>${N_CapFirstLetter(key)}</td><td title=${new Date(RequestInfo.time[key].stamp).toGMTString()}>${N_DateFormater(RequestInfo.time[key].stamp)}</td></tr>`
  }
  ItemInfoTable.innerHTML += `<tr><td>Colour</td><td><input class='ItemInfo_Color' type='color' ${RequestInfo.color ? "value="+N_RGBtoHex(RequestInfo.color) : ""}></td></tr>`

  ItemInfoListeners(RequestInfo);
}

function ItemInfoListeners(ItemRequest) {

  document.querySelector('.ItemInfo_Name').addEventListener('change', function(e) {
    // socket.emit('ItemEdit', {"action": "DATA", "section": Section, "ID": ItemRequest.id, "EditData": {"name": e.target.value}, "Path": NanoID} )
    EditPOST({"action": "DATA", "section": Section, "id": ItemRequest.id, "data": { "name": e.target.value }, "path": NanoID})
  })

  document.querySelector('.ItemInfo_Tab').addEventListener('click', function() {
    if (ItemRequest.type.file) {
      let nt_btn = document.createElement('a');
      nt_btn.href = `/storage/${ItemRequest.id}`;
      nt_btn.target = '_blank';
      nt_btn.click();
    }
  })

  document.querySelector('.ItemInfo_Download').addEventListener('click', function() {
    PopUp_Download(ItemRequest, "ItemInfo");
  })

  document.querySelector('.ItemInfo_Color').addEventListener('change', function(e) {
    // socket.emit('ItemEdit', {"action": "DATA", "section": Section, "ID": ItemRequest.id, "EditData": {"color": e.target.value}, "Path": NanoID })
    EditPOST({"action": "DATA", "section": Section, "id": ItemRequest.id, "data": { "color": e.target.value }, "path": NanoID})
  })

  document.querySelector('.ItemInfo_Description').addEventListener('change', function(e) {
    // socket.emit('ItemEdit', {"action": "DATA", "section": Section, "ID": ItemRequest.id, "EditData": {"description": e.target.value}})
    EditPOST({"action": "DATA", "section": Section, "id": ItemRequest.id, "data": { "description": e.target.value }})
  })



  $(".ItemInfo_Share_Input").on("click", function(e) {  // Share
    console.log("Call server for account with that username / email and return their profile image and display below the input.")
    // to add after: $(".parent > h2:nth-child(1)").after("<h6>html text to add</h6>");
  })

  document.querySelector('.ItemInfo_Link_Input').addEventListener('click', async function(e) { // Link
    if (!e.target.value) {

      const Form = { 
        "ACTION": "LINK",
        "oID": ItemRequest.id,
        "SECTION": Section,
      }
      
      let res = await fetch('https://drive.nanode.one/share', {
        method:'POST',
        headers: {'Content-Type': 'application/json'},
        body: new Blob( [ JSON.stringify(Form) ], { type: 'text/plain' }),
      })
  
      N_ClientStatus("CS3", "True", 500)
      let resp = await res.json();
      resp.link ? e.target.value = resp.link : e.target.style.color = 'crimson';
    }
    e.target.select();
    document.execCommand('copy');
  })
}



function RightBar_Security_Inputs(itemLocked) {
  N_ClientStatus("CS7", "Wait", 400); N_ClientStatus("CS5", "False");

  ItemInfo.innerHTML = '<section class="Locked"><span><h3>Locked</h3><i class="far fa-times-circle"></i></span><h5>Enter the items credentials to view</h5></section>';

  for (i=0; i<itemLocked.Auth.length; i++) {
    ItemInfo.getElementsByTagName("section")[0].innerHTML +=
      `<span class='security_option'>
        <i class='${sec_icons[ itemLocked.Auth[i] ]}'></i>
        <input class='SecurityInputs ${sec_values[ itemLocked.Auth[i] ]}' ></input>
      </span>`
  }
  
  ItemInfo.getElementsByTagName("section")[0].innerHTML += ` <span class='securityEntry'> <input type='button' class='SecurityInputs' readOnly value='Submit' ></input> </span> `;

  securityEntries = function( Values={} ) {
    for (i=0; i<itemLocked.Auth.length; i++) {
      Values[$(".SecurityInputs")[i].getAttribute("inputType")] = $(".SecurityInputs")[i].value;
    }
    return Values;
  }
  
  document.querySelector('.Locked > span > i').addEventListener("click", function() { ItemInfo.innerHTML = ''; })

  document.querySelector('.securityEntry').addEventListener("click", async() => {
    let res = await fetch('https://drive.nanode.one/auth', {
      method:'POST',
      headers: {'Content-Type': 'application/json'},
      body: new Blob( [ JSON.stringify( {"entries": securityEntries(), "oID": itemLocked.Item, "section": Section} ) ], { type: 'text/plain' } ),
    })

    switch (await res.status) {
      case 200:
        ItemInfo.innerHTML = '';
        N_ClientStatus("CS5", "Ok", 400)
        HomeCall({"Reload":true, "Skip": true}, await res.json());
        break;
      case 401:
        $(".security_option > i").each( function(i, val) { 
          $(val)[0].style.cssText = 'color: crimson'; } );
        break;
    }
  })
}

//////////////////////////   POP UPS   /////////////////////////////////

function PopUpBase() {
  N_ClientStatus("CS7", "Wait", 500); N_ClientStatus("CS8", "User");

  if (document.querySelector('.BlockOut')) { return document.querySelector('.BlockOut'); }
  let BlockOut = document.createElement('div');
  BlockOut.setAttribute('class', "BlockOut")
  document.body.appendChild(BlockOut)
  BlockOut.addEventListener("mousedown", function(e) { e.stopImmediatePropagation(); if (e.target == BlockOut) { BlockOut.remove(); N_ClientStatus("CS8", "Off"); } })
  return BlockOut;
}


function PopUp_Accept_Cancel(Action, Title, Accept, Decline, Text) { // Delete (Items & Spans)
  let BlockOut = PopUpBase();
  selectedItem = RCElement;
  let Accept_Color = {"Delete": "PUA_Red"}

  BlockOut.innerHTML = `
    <div class='Popup_Container'>
      <div class='Popup_Main'>
        <h3>${Title}</h3>
        <p>${Text}</p>
        <span>
          <button class='Popup_Reject'>${Decline}</button>
          <button class='Popup_Accept ${Accept_Color[Accept]}'>${Accept}</button>
        </span>
      </div>
    </div>
  `

  $(".Popup_Reject")[0].addEventListener("click", function() { BlockOut.remove(); });
  $(".Popup_Accept")[0].addEventListener("click", function() {
    if (Action == "Delete") {
      if (selectedItem.getAttribute('rc') == "Homepage_Span") { // EMPTY THE SPAN FIRST DOES THIS CAUSE ISSUES? IE CONTENTS NOT BEING DELETED PERM
        if (Directory_Content[selectedItem.parentNode.getAttribute('nano-id')]) {selectedItem = selectedItem.parentNode}
        else {console.log('Invalid Span ID'); return;}
      }
      let forDeletion = NanoSelected.length ? NanoSelected : [selectedItem.getAttribute('nano-id')];
      // socket.emit('ItemEdit', {"action": "MOVE", "section": Section, "ID": forDeletion, "To": "bin", "Path": NanoID})
      // socket.emit('ItemEdit', {"action": "DELETE", "section": Section, "ID": forDeletion, "Path": NanoID})
      EditPOST({"action": "DELETE", "section": Section, "id": forDeletion, "path": NanoID})
    }
    BlockOut.remove();
  });
}

function PopUp_New_Span() {
  let BlockOut = PopUpBase();
  BlockOut.innerHTML = `
    <div class='Popup_Container'>
      <div class='Popup_Main'>
        <h3>New Span</h3>
        <input class='Popup_Input Popup_Input_Name' max-length='128' type='text' placeholder='Name...' autocomplete='off'></input>
        <span>
          <button class='Popup_Reject'>Cancel</button>
          <button class='Popup_Accept'>Create</button>
        </span>
      </div>
    </div>
  `

  document.querySelector('.Popup_Reject').addEventListener('click', function() { BlockOut.remove(); })
  document.querySelector('.Popup_Accept').addEventListener('click', async function() {
    let created = await CreatePOST(
      { 
        "section": Section,
        "path": NanoID,
        "type": "Span",
        "name": document.querySelector('.Popup_Input_Name').value || 'New Span'
      }
    )
    if (created.Error) { console.log(created.Error) }
    else { BlockOut.remove(); }
  })
}

function PopUp_New_Folder() {

  let BlockOut = PopUpBase();

  BlockOut.innerHTML = `
    <div class='Popup_Container'>
      <div class='Popup_Main'>
        <h3>New Folder</h3>
        <div class='Popup_Dropdown' style='top: 15px; right: 15px;'>
          <div class='Popup_Location' title='Location' ${createLocation()}</div>
        </div>
        <input class='Popup_Input Popup_Input_Name' max-length='128' type='text' placeholder='Name...' autocomplete='off'></input>
        <span>
          <button class='Popup_Reject'>Cancel</button>
          <button class='Popup_Accept'>Create</button>
        </span>
      </div>

      <div class='Popup_Secondary'>
        <h4>Optional</h4>
        <textarea class='Popup_Option_Desc' placeholder='Add a Description...' maxlength='100'></textarea>
        <button class='Popup_Option_Colour'>Choose a Colour...</button>
        <input class='Popup_Option_Pass' placeholder='Set a Password...' type='password' autocomplete='off' maxlength='128'></input>
        <input class='Popup_Option_Pin' placeholder='Set a Pin...' type='number' autocomplete='off' maxlength='20'></input>
      </div>

    </div>
  `

  const Popup_Dropdown = BlockOut.querySelector('.Popup_Dropdown');
  const Popup_Location = BlockOut.querySelector('.Popup_Location');
  const Popup_Name = BlockOut.querySelector('.Popup_Input_Name');

  const Popup_Description = BlockOut.querySelector('.Popup_Option_Desc');
  const Popup_Colour = BlockOut.querySelector('.Popup_Option_Colour');
  const Popup_Pass = BlockOut.querySelector('.Popup_Option_Pass');
  const Popup_Pin = BlockOut.querySelector('.Popup_Option_Pin');

  if (NanoID == "homepage") {
    const DropDown_Options = Popup_Dropdown.querySelectorAll('.Popup_Dropdown_Content a');
    DropDown_Options.forEach(option => {
      option.addEventListener('click', (e) => {
        Popup_Location.setAttribute('value', e.target.getAttribute('value'));
        Popup_Location.querySelector('p').innerText = e.target.innerText
      })
    })
  }

  Popup_Colour.addEventListener("click", function(e) { 
    ColorPicker("ISC", function(chosenColor) { e.target.value = chosenColor; e.target.style.background = chosenColor; })
  })


  BlockOut.querySelector(".Popup_Reject").addEventListener("click", function() { 
    BlockOut.remove(); N_ClientStatus("CS8", "Off");
  })

  BlockOut.querySelector(".Popup_Accept").addEventListener("click", async function() {
    let created = await CreatePOST(
      {
        "section": Section,
        "path": NanoID,
        "type": "Folder",
        "parent": (NanoID=="homepage" ? Popup_Location.getAttribute('value') : NanoID),
        "name": Popup_Name.value || 'New Folder',
        "options": {
          "description": Popup_Description.value,
          "color": N_RGBtoHex(Popup_Colour.value),
          "pass": Popup_Pass.value,
          "pin": Popup_Pin.value
        }
      }
    );

    if (created.Error) { console.log(created.Error) }
    else { BlockOut.remove(); }
  })
}

function PopUp_Upload() {
  N_ClientStatus("CS7", "Wait", 600);
  Upload_Visuals.Status("Choose", "Choose Items");
  Upload_Values[0].innerText = '0 Items';
  Upload_Values[1].innerText = '0 B';
  UploadContainer.style.visibility = "visible";

  PopUp_Upload.Close = function() {
    UploadContainer.style.visibility = 'hidden';
    UploadContainer.querySelectorAll('span i')[0].classList = 'fas fa-chevron-up'
    UC_Queue_Viewer.classList.remove('UC_Showing');
    Progress_Div.classList.remove('UC_Showing');
    Upload_Actions.Reset_Upload();
  };
}

async function PopUp_Download(Item, Caller) {
  let DownloadIDs = []; let DownloadName = {}; let Zipping; let CurrentLink;

  if (Item.id && Caller == 'ItemInfo') { // Item Info
    DownloadIDs = [Item.id];
    DownloadName = Item.name;
    Zipping = !Item.type.file;
  } else if (Caller == 'ContextMenu') { // ContextMenu
    DownloadIDs = NanoSelected;
    DownloadName = DownloadIDs.length > 1 ? 'Drive_Download' : RCElement.getAttribute('directory').split(' > ').pop();
    Zipping = (DownloadIDs.length === 1 && RCElement) ? (RCElement.getAttribute('type') == 'folder' ? true : false) : true;
  } else { return; }


  if (Zipping == false) {
    let dl_btn = document.createElement('a')
    dl_btn.download = DownloadName;
    dl_btn.href = `/storage/${DownloadIDs[0]}`;
    dl_btn.target = '_blank';
    dl_btn.click();
  } else {
    let isForShare = false;
    let RequestSent = false;

    let BlockOut = PopUpBase();
    BlockOut.innerHTML = `
      <div class='Popup_Container'>
        <div class='Popup_Main'>
          <h3>Download</h3> <h5> - ${N_TextMultiple(DownloadIDs.length, "Item")}</h5>

          <div class='Switch SW_DL' style='top: 11px;right: 15px;'>
            <div class='Slider SL_DL'></div>
            <div>Me</div>
            <div>Share</div>
          </div>

          <input class='Popup_Input Popup_Input_Name' max-length='128' type='text' placeholder='Name...' value='${DownloadName}' autocomplete='off'></input>
          <span>
            <button class='Popup_Reject'>Cancel</button>
            <button class='Popup_Accept'>Download</button>
          </span>
        </div>

      </div>
    `;

    let CentralTextInput = document.querySelector('.Popup_Input_Name');
    CentralTextInput.addEventListener('change', (e) => { DownloadName = e.target.value; })

    document.querySelector('.Switch.SW_DL').addEventListener('click', () => {
      document.querySelector('.Slider.SL_DL').style.transform = `translateX(${isForShare ? 0 : 50}px)`;
      isForShare = !isForShare;
    })
    
    document.querySelector(".Popup_Reject").addEventListener("click", () => { 
      BlockOut.remove(); N_ClientStatus("CS8", "Off"); 
    })

    document.querySelector('.Popup_Accept').addEventListener('click', async(e) => {
      if (RequestSent === false) {
        RequestSent = true;
        e.target.innerText = 'Zipping...';

        const Form = { 
          "FOR": isForShare ? "SHARE" : "SELF",
          "NAME": DownloadName,
          "ITEMS": DownloadIDs,
          "SECTION": Section,
        }
        
        let res = await fetch('https://drive.nanode.one/download', {
          method:'POST',
          headers: {'Content-Type': 'application/json'},
          body: new Blob( [ JSON.stringify(Form) ], { type: 'text/plain' }),
        })

        let Reply = await res.json();
        if (Reply.Error) {
          CentralTextInput.value = 'An Error Occured. Close and Try Again.'; CentralTextInput.style.borderColor = 'crimson';
        } else if (Reply.Link) {
          e.target.innerText = 'Zipped';
          CentralTextInput.value = 'https://link.nanode.one/download/'+Reply.Link;
          CentralTextInput.style.borderColor = '#0bc30b';
          if (!isForShare) {
            console.log('Download Now.', Reply.Link)
            // window.open( 'https://link.nanode.one/download/a/'+Reply.link );
          }
        }
      }
    })
  }
}