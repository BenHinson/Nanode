DownloadItems = [];
dirPathPass = false;

const TimeKey = {"CreaT":"Created", "OpenT":"Opened", "ModiT": "Modified", "CreaW": "Created By", "ModiW": "Modified By", "OpenW": "Opened By", "DeleT": "Deleted", "RecovT": "Recovered"}
const SecureKey = {0: "No", 1: "Secured", 2: "Multiple", 3: "Max"}
const sec_icons = {"Password": "far fa-keyboard", "Pin": "fas fa-th", "Time": "far fa-clock"}
const sec_values = {
  "Password": " 'placeholder='Password' inputType='Pass' type='password'' ",
  "Pin": " 'placeholder='Pin Code • 1-9' inputType='Pin' type='password'' ",
  "Time": " 'value='Time Restricted' readOnly type='text' inputType='Time'' "
}

const fileContainer = document.getElementsByClassName('fileContainer')[0];
const ItemInfo = document.getElementsByClassName('ItemInformation')[0];

const UploadContainer = document.getElementsByClassName('Upload_Container')[0];
const UC_Queue_Viewer = document.getElementsByClassName('UC_Queue_Viewer')[0];
const UC_Queue_Viewer_Table = document.querySelector('.UC_Queue_Viewer  table  tbody');

////////////////////////////   VIEW   //////////////////////////////////

async function ViewItem(Type, NanoID) {
  let BlockOut = PopUpBase();
  BlockOut.innerHTML = `
    <div class='Preview'>
      <svg class='Loading_SVG medium' title='Loading' viewBox='0 0 100 100' xmlns='https://www.w3.org/2000/svg'> <circle cx='50' cy='50' r='45'></circle> </svg>
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

  for (i=0; i<Directory_Content.length; i++) {

    fileContainer.innerHTML += `
      <div class='ContentContainer' ${NanoID == "Homepage" ? `rc='File_Container'` : ``}>
        <a ${NanoID == "Homepage" ? `contenteditable='true' onclick='renameSpan(this)'>${Directory_Content[i].Parent}` : `>${NanoName}` }</a>
      </div>
    `

    let Container = $(".ContentContainer")[i];

    for (const [object, item] of Object.entries(Directory_Content[i].Contents)) {
      let parent = Directory_Content[i].Parent ? Directory_Content[i].Parent : "";

      Container.innerHTML += `
        <div class='Item' directory='${ItemsPath(parent, item.Name)}' type='${ItemChecker(item.Type)}' nano-id='${item.OID}' rc='${!item.Type.isFi ? "Nano_Folder" : "Nano_File"}' rcOSP='DIV,IMG' title='${ItemsPath(parent, item.Name)}' ${item.Tags.Color ? "style='border-bottom: 2px solid "+item.Tags.Color+"'" : ""}>
          <h4>${capFirstLetter(item.Name)}</h4>
          <img loading='lazy' height='90' width='${!item.Type.isFi ? 90 : 120}' src='${ItemImage(item.Type, item.OID, "Block")}'></img>
        </div>
      `
    }

    $($("div[type='folder']", Container).get().reverse()).each(function(i, folder) {
      $(folder).insertAfter( Container.children[0]);
    })
  }

  if (NanoID == "Homepage") {
    fileContainer.innerHTML += `<div class='NewSpan' onclick='PopUp_New_Span()'>New Span</div>`;
  }

  ItemClickListener(UserSettings.ViewT);
  clientStatus("CS7", "Ok", 400);
}

function viewContentAsList(NanoID) {
  fileContainer.innerHTML = '';

  for (i=0; i<Directory_Content.length; i++) {

    fileContainer.innerHTML += `
    <div class='ListContentContainer' ${NanoID == "Homepage" ? `Home-Span='${Directory_Content[i].Parent}'` : "" }>
      <table class='ListContentTable' ${NanoID == "Homepage" ? `rc='Homepage_Span'` : ``}>
          <tbody>
            <tr ${NanoID == "Homepage" ? `rcOSP='TH'` : ``} > <th><input ${NanoID == "Homepage" ? `spanName value='${Directory_Content[i].Parent}'` : `spanName= disabled value='${NanoName}'` }></input></th> <th></th> <th>Type</th> <th>Modified</th> <th>Size</th> </tr>
          </tbody>
        </table>
      </div>
    `;

    let Table = fileContainer.querySelectorAll('tbody')[i];

    for (const [object, item] of Object.entries(Directory_Content[i].Contents)) {
      parent = Directory_Content[i].Parent ? Directory_Content[i].Parent : "";

      Table.innerHTML += `
        <tr directory='${ItemsPath(parent, item.Name)}' type='${ItemChecker(item.Type)}' nano-id='${item.OID}' rc='${!item.Type.isFi ? "Nano_Folder" : "Nano_File"}' rcOSP='TD' title='${ItemsPath(parent, item.Name)}' ${item.Tags.Color ? "style='box-shadow: "+item.Tags.Color+" -3px 0' " : ""}>
          <td><img loading='lazy' height='32' width='32' src='${ItemImage(item.Type, item.OID)}'></img></td>
          <td>${capFirstLetter(item.Name)}</td>
          <td>${capFirstLetter(ItemChecker(item.Type))}</td>
          <td>${dateFormater(item.ModiT)}</td>
          <td>${item.Size ? convertSize(item.Size) : "-"}</td>
        </tr>
      `
    }

    $($("tr[type='folder']", Table).get().reverse()).each(function(i, folder) {
      $(folder).insertAfter( Table.children[0]);
    })
  }

  if (NanoID == "Homepage") {
    fileContainer.innerHTML += `<div class='NewSpan' onclick='PopUp_New_Span()'>New Span</div>`;
    fileContainer.querySelectorAll('input[spanName]').forEach(function(name) {
      name.addEventListener('change', function(e) {
        socket.emit('ItemEdit', {"Action": "Edit", "Item": "Span", "ID": e.target.defaultValue, EditData: {"Name": e.target.value} })
      })
  })
  }
  
  ItemClickListener(UserSettings.ViewT);
  clientStatus("CS7", "Ok", 400);

}

/////////////////////////   RIGHT BAR   //////////////////////////////

async function callItemInformation(selected) {
  if (typeof RCElement !== 'undefined' && selected == "RCElement") {selected = RCElement}
  clientStatus("CS2", "True", 500); clientStatus("CS4", "Wait", 400);
  clientStatus("CS5", "Wait", 300); clientStatus("CS7", "Wait", 300);

  const SelectedID = selected.getAttribute('nano-id');
  const NanoPath = selected.getAttribute('directory');

  ItemInfo.innerHTML = "<svg class='Loading_SVG medium' style='position:absolute;top: calc(50% - 18px); left: calc(50% - 18px);' title='Loading' viewBox='0 0 100 100' xmlns='https://www.w3.org/2000/svg'> <circle cx='50' cy='50' r='45'></circle> </svg>";

  const Request = await fetch('https://drive.nanode.one/user/files/'+SelectedID);
  const RequestInfo = await Request.json();
  clientStatus("CS3", "True", 600);

  // console.log(RequestInfo)
  ItemInfo.innerHTML = `
    <input class='ItemInfo_Name' contenteditable='true' value='${RequestInfo.Name.Cur}'>
    <p class='ItemInfo_UUID' title='This Items Unique Identifier'>${RequestInfo.UUID}</p>

    ${RequestInfo.Type.isImg ? "<img loading='lazy' height='128' width='auto' src='/storage/"+RequestInfo.UUID+"?h=128&w=null'></img>" : ""}

    <input class='ItemInfo_Directory' value='${NanoPath}' title='${NanoPath}' readonly=true>

    <span style='margin: 8px 0 0 0;'>
      <button class='ItemInfo_Tab' title='Open in New Tab (non shareable)' ${RequestInfo.Type.isFi ? "" : "style='cursor: not-allowed'" } ><i class='fas fa-external-link-alt'></i>New Tab</button>
      <button class='ItemInfo_Download' title='Download This File'><i class='fas fa-cloud-download-alt'></i>Download</button>
    </span>

    <table>
      <tbody>
        <tr><td>Size</td><td title='${RequestInfo.Size} bytes'>${convertSize(RequestInfo.Size)}</td></tr>
        <tr><td>Type</td><td title=${RequestInfo.Type.mimeT ? RequestInfo.Type.mimeT : ""}>${RequestInfo.Type.isFi ? (RequestInfo.Type.isImg ? "Image" : "File"): "Folder"}</td></tr>
        <tr><td>Secured</td><td>${SecureKey[RequestInfo.Security]}</td></tr>
      </tbody>
    </table>

    <sub>DESCRIPTION</sub>
    <textarea class='ItemInfo_Description' placeholder='Add a Description...' maxlength='100'>${RequestInfo.Description ? RequestInfo.Description : ""}</textarea>

    <sub>SHARE - with another Nanode account</sub>
    <span> <input class='ItemInfo_Share_Input' type='text' placeholder='Enter username or email'></span>

    <sub>LINK - view only</sub>
    <span> <input class='ItemInfo_Link_Input' type='text' placeholder='Click to create link' readonly=true style='cursor: pointer;'></span>

    <sub>DOWNLOAD LINK</sub>
    <span> <input class='ItemInfo_Download_Input' type='text' placeholder='Click to create link' readonly=true style='cursor: pointer'> </span>
  `
  // <i class='fas fa-chevron-down Input_Ops_Btn ItemInfo_Share_Btn'></i>
  // <i class='fas fa-chevron-down Input_Ops_Btn ItemInfo_Link_Btn'></i> 

  const ItemInfoTable = $(ItemInfo).find('tbody')[0];
  for (let key in RequestInfo.Time) {
    if (RequestInfo.Time[key].length && key.match(/CreaT|ModiT|OpenT|RecovT/g)) {
      ItemInfoTable.innerHTML += `<tr><td>${TimeKey[key]}</td><td title=${RequestInfo.Time[key]}>${dateFormater(RequestInfo.Time[key])}</td></tr>`
    }
  }
  ItemInfoTable.innerHTML += `<tr><td>Colour</td><td><input class='ItemInfo_Color' type='color' ${RequestInfo.Tags.Color ? "value="+RGBtoHEX(RequestInfo.Tags.Color) : ""}></td></tr>`

  ItemInfoListeners(RequestInfo);
}
function ItemInfoListeners(ItemRequest) {

  $(".ItemInfo_Name").on("change", function(e) {
    FolderCall = false;
    socket.emit('ItemEdit', {"Action": "Edit", "Item": "FileFolder", "ID": ItemRequest.UUID, "Path": NanoID, "EditData":{"Name": {"Cur": e.target.value}}  })
  })

  $(".ItemInfo_Tab").on("click", function(e) {
    if (ItemRequest.Type.isFi) {
      let nt_btn = document.createElement('a');
      nt_btn.href = `/storage/${ItemRequest.Contents}`;
      nt_btn.target = '_blank';
      nt_btn.click();
    }
  })

  $(".ItemInfo_Download").on("click", function(e) {
    if (ItemRequest.Type.isFi) {
      let dl_btn = document.createElement('a')
      dl_btn.download = ItemRequest.Name.Cur;
      dl_btn.href = '/storage/'+ItemRequest.UUID;
      dl_btn.target = '_blank';
      dl_btn.click();
    } else {
      e.target.innerText = "Zipping..."; $(".ItemInfo_Download").off();
      socket.emit('downloadItems', "SELF", [ItemRequest.UUID] )
      socket.on('DownloadURLID', function(url) { window.open("https://link.Nanode.one/download/"+url); e.target.innerText = "Downloaded" })
    }
  })

  $(".ItemInfo_Color").on("change", function(e) {
    socket.emit('ItemEdit', {"Action": "Edit", "Item": "FileFolder", "ID": ItemRequest.UUID, "EditData":{"Tags": {"Color": e.target.value}} })
  })

  $(".ItemInfo_Description").on("change", function(e) {
    socket.emit('ItemEdit', {"Action": "Edit", "Item": "FileFolder", "ID": ItemRequest.UUID, "EditData":{"Description": e.target.value}})
  })




  // Share
  $(".ItemInfo_Share_Input").on("click", function(e) {
    console.log("Call server for account with that username / email and return their profile image and display below the input.")
    // to add after: $(".parent > h2:nth-child(1)").after("<h6>html text to add</h6>");
  })

  // Link
  // Write the link ID to the object. On read of the object data. If link / shared, add: block links, and fill in Link to the link. Options still work, allowing change.
  $(".ItemInfo_Link_Input").on("click", function(e) {
    if (!e.target.value) { socket.emit('Share', ({Action: "Link", objectID: ItemRequest.UUID})); }
  })

  // Download Link
  $(".ItemInfo_Download_Input").on("click", function(e) {
    if (!e.target.value) { socket.emit('downloadItems', "SHARE", [ItemRequest.UUID]); }
  })
}


function RightBar_Security_Inputs(itemSecurity) {
  clientStatus("CS7", "Wait", 400); clientStatus("CS5", "False");

  ItemInfo.innerHTML = '<div class="Locked"><span><h3>Locked</h3><i class="far fa-times-circle"></i></span><h5>Enter the items credentials to view</h5></div>';

  for (i=0; i<itemSecurity.length; i++) {
    ItemInfo.getElementsByTagName("div")[0].innerHTML +=
    `<span class='security_option'>
      <i class='${sec_icons[ itemSecurity[i] ]}'></i>
      <input class='SecurityInputs ${sec_values[ itemSecurity[i] ]}' ></input>
    </span>`
  }
  
  ItemInfo.getElementsByTagName("div")[0].innerHTML += ` <span class='securityEntry'> <input type='button' class='SecurityInputs' readOnly value='Submit' ></input> </span> `;

  securityEntries = function( Values={} ) {
    for (i=0; i<itemSecurity.length; i++) {
      Values[$(".SecurityInputs")[i].getAttribute("inputType")] = $(".SecurityInputs")[i].value;
    }
    return Values;
  }
  
  document.querySelector('.Locked > span > i').addEventListener("click", function() { ItemInfo.innerHTML = ''; })

  document.querySelector('.securityEntry').addEventListener("click", async() => {
    let res = await fetch('https://drive.nanode.one/auth', {
      method:'POST',
      headers: {'Content-Type': 'application/json'},
      body: new Blob( [ JSON.stringify( {"Entries": securityEntries(), "Item": NanoSelected} ) ], { type: 'text/plain' } ),
    })

    switch (await res.status) {
      case 200: { ItemInfo.innerHTML = ''; clientStatus("CS5", "Ok", 400); Directory_Call(false, true, true, await res.json()); break;}
      case 401: { $(".security_option > i").each( function(i, val) { $(val)[0].style.cssText = 'color: crimson'; } );  break;}
    }
  })
}

 
//////////////////////////   POP UPS   /////////////////////////////////

function PopUpBase() {
  clientStatus("CS7", "Wait", 500); clientStatus("CS8", "User");

  if (document.querySelector('.BlockOut')) { return document.querySelector('.BlockOut'); }
  let BlockOut = document.createElement('div');
  BlockOut.setAttribute('class', "BlockOut")
  document.body.appendChild(BlockOut)
  BlockOut.addEventListener("click", function(e) { e.stopImmediatePropagation(); if (e.target == BlockOut) { BlockOut.remove(); clientStatus("CS8", "Off"); } })
  return BlockOut;
}


function PopUp_Accept_Cancel(Action, Title, Accept, Decline, Text) {
  let BlockOut = PopUpBase();
  BlockOut.innerHTML = `
    <div class='Popup_Container'>
      <div class='Popup_Main'>
        <h3>${Title}</h3>
        <p>${Text}</p>
        <span>
          <button class='Popup_Reject'>${Decline}</button>
          <button class='Popup_Accept'>${Accept}</button>
        </span>
      </div>
    </div>
  `

  $(".Popup_Reject")[0].addEventListener("click", function() { BlockOut.remove(); });
  $(".Popup_Accept")[0].addEventListener("click", function() {
    if (Action == "Delete") {
      if (!RCElement.hasAttribute('nano-id') && RCElement.getAttribute('rc').includes('Span')) {
        let TestSpanName = RCElement.childNodes[0].innerText;
        for (i=0; i<Directory_Content.length; i++) {
          if (Directory_Content[i].Parent.includes(TestSpanName)) {
            let SpanName = TestSpanName;
            socket.emit('ItemEdit', {"Action": "Delete", "Item": "Span", "ID": SpanName})
          }
        }
      } else if (RCElement.hasAttribute('nano-id')) {
        FolderCall = false;
        socket.emit('ItemEdit', {"Action": "Delete", "Item": "FileFolder", "Path": NanoID, "ID": RCElement.getAttribute('nano-id')})
      }
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
  document.querySelector('.Popup_Accept').addEventListener('click', function() {
    if (!$(".Popup_Input_Name")[0].value) { $(".Popup_Input_Name")[0].style.borderColor = "crimson"; return; }

    FolderCall = false;
    socket.emit('ItemCreate', {Directory: NanoID, Type: "Span", Name: $(".Popup_Input_Name")[0].value});

    clientStatus("CS2", "True", 400); clientStatus("CS8", "Off");
    BlockOut.remove();
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

  $(".Popup_Dropdown_Content a").on("click", function(e) { $(".Popup_Location")[0].value = e.target.innerText; $(".Popup_Location p")[0].innerText = e.target.innerText; })
  document.querySelector(".Popup_Option_Colour").addEventListener("click", function(e) { ColorPicker("ISC", function(chosenColor) { e.target.value = chosenColor; e.target.style.background = chosenColor; }) })
  document.querySelector(".Popup_Reject").addEventListener("click", function() { BlockOut.remove(); clientStatus("CS8", "Off"); })
  document.querySelector(".Popup_Accept").addEventListener("click", function() {

    if (!$(".Popup_Input_Name")[0].value) { $(".Popup_Input_Name")[0].style.borderColor = "crimson"; return; }

    let Options = {
      Description: $(".Popup_Option_Desc")[0].value,
      Colour: RGBtoHEX($(".Popup_Option_Colour")[0].value),
      Pass: $(".Popup_Option_Pass")[0].value,
      Pin: $(".Popup_Option_Pin")[0].value
    }
    clientStatus("CS2", "True", 400); clientStatus("CS8", "Off");

    FolderCall = false;
    socket.emit('ItemCreate', {Directory: NanoID, Type: "Folder", Name: $(".Popup_Input_Name")[0].value, Options: Options, Span: (NanoID == "Homepage" ? $(".Popup_Location p")[0].innerText : "NULL"), Path: (NanoID == "Homepage" ? NanoName : "NULL") });

    BlockOut.remove();
  })
}

function PopUp_Upload() {
  clientStatus("CS7", "Wait", 600);
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


function PopUp_Download() {
  if (RCElement) {
    if (RCElement.getAttribute('type') != "folder" && RCElement.getAttribute('rc') == "Nano_File") {
      let dl_btn = document.createElement('a')
      dl_btn.download = RCElement.getAttribute('directory').split(' > ').shift();
      dl_btn.href = '/storage/'+RCElement.getAttribute('nano-id');
      dl_btn.target = '_blank';
      dl_btn.click();
    } else {
      socket.emit('downloadItems', "SELF", [RCElement.getAttribute('nano-id')] )
      socket.on('DownloadURLID', function(url) { window.open("https://link.Nanode.one/download/"+url);})
    }
  }
}

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

function ColorPicker(calledBy, callback) {
  clientStatus("CS7", "Wait", 400); clientStatus("CS8", "User");

  if ($(".colorContainer")[0]) {$(".colorContainer")[0].remove();}

  let colorContainer = document.createElement('div');
  colorContainer.setAttribute('class', "colorContainer");
  colorContainer.innerHTML = "<i id='closeColorPicker' class='fas fa-times' title='Close Picker'></i> <input type='text' id='colorPickEntry' class='colorPickEntry' placeholder='#000000'></input> <div class='colorOptionsContainer'></div><i id='acceptColorPicked' class='fas fa-check' title='Accept Colour'></i>";
  document.body.appendChild(colorContainer);

  if (typeof RCElement === 'object' && RCElement.hasAttribute('style')) {
    let HexColor = UserSettings.ViewT == 0 ? RGBtoHEX($(RCElement).css('borderBottom')) : RGBtoHEX($(RCElement).css('boxShadow'));

    $("#colorPickEntry")[0].value = HexColor
    $("#colorPickEntry")[0].style.color = HexColor;
  }

  const colorOptions = [
    "#ffffff", "#d2d2d2", "#ababab", "#464646", "#000000", 
    "#ff0000", "#cc7575", "#c83939", "#720000", "#460000",
    "#f000ff", "#f4bdf7", "#f99aff", "#9c2ba3", "#630169",
    "#66cfd4", "#6ec5e7", "#6697d4", "#4e4cb3", "#2825ca",
    "#00ff4f", "#bdf7cf", "#60b179", "#148a39", "#004816",
    "#f9fd00", "#fdff93", "#a8a95c", "#8e9000", "#474800",
    "#ff7500", "#ff9133", "#a34b00", "#69370b", "#401e00",
  ]

  for (i=0; i<colorOptions.length; i++) {
    let colorOption = document.createElement('div');
    colorOption.setAttribute('color', colorOptions[i]);
    colorOption.style.background = colorOptions[i];
    $(".colorOptionsContainer")[0].appendChild(colorOption);
  }

  $("#colorPickEntry").keypress(function(e) {
    if ($(".selectedCol")[0]) {$(".selectedCol")[0].classList.remove('selectedCol')}
    if ($("#colorPickEntry")[0].value.length > 9) { e.preventDefault() }
    $("#colorPickEntry")[0].style.color = $("#colorPickEntry")[0].value + String.fromCharCode(e.keyCode);
  })

  $(".colorOptionsContainer > div").on("click", function(e) {
    selectedColor = e.target.getAttribute('color');
    $("#colorPickEntry")[0].value = selectedColor
    $("#colorPickEntry")[0].style.color = selectedColor;
    if ($(".selectedCol")[0]) {$(".selectedCol")[0].classList.remove('selectedCol')}
    e.target.classList.add('selectedCol');
  })

  $("#closeColorPicker").on("click", function() {
    $(".colorContainer")[0].remove();
  })
  $("#acceptColorPicked").on("click", function() {
    if ( !$("#colorPickEntry")[0].style.color ) { let ColorPicked = null }
    let ColorPicked = $("#colorPickEntry")[0].style.color;
    $(".colorContainer")[0].remove();

    if (typeof RCElement !== 'undefined' && calledBy == "RC") {
      socket.emit('ItemEdit', {"Action": "Edit", "Item": "FileFolder", "Path": NanoID, "ID": RCElement.getAttribute('nano-id'), "EditData":{"Tags": {"Color": ColorPicked}} })
      return;
    }
    callback(ColorPicked);
  })

  dragElement($(".colorContainer")[0]);
}

function dragElement(element) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  element.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    if (e.target != element) { return; }
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}