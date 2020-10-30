DownloadItems = [];
dirPathPass = false;

// indianred --- lovely colour

//////////////////////////

const fileContainer = document.getElementById('fileContainer');
const ItemInfo = document.getElementsByClassName('fileInformationContent')[0];

///////////////////////////////////////////

function homepageNewSpan() {
  fileContainer.innerHTML += `<div class='directoryControlNewSpan' id='directoryControlNewSpan'>New Span</div>`;
  $("#directoryControlNewSpan").on("click", function() { displayCentralActionMain("New Span", "Create") });
}

function uploadDirectoryLocation(Page, location) {
  let dirLocBtn = $("#uploadDirectory")[0];
  dirLocBtn.innerText = location;
  $(dirLocBtn).off()

  if (Page == "Homepage" && NanoID == Page) {
    dirLocBtn.style.cursor = "pointer";
    dirLocBtn.title = "Choose Span to Upload Into";

    // Choose Which Span to Upload Into
    $(dirLocBtn).on("click", function() {

      if ( $(".uploadSpanContainer") ) { $(".uploadSpanContainer").remove() }
      
      let uploadSpanContainer = document.createElement('div');
      uploadSpanContainer.setAttribute("class", "uploadSpanContainer");
      dropdownPos = document.getElementById("uploadDirectory").getBoundingClientRect();
      document.body.appendChild(uploadSpanContainer);

      spans = [];
      pageContent.forEach(function(span) {
        spans.push(span.Parent)
        uploadSpanContainer.innerHTML += "<div span='"+span.Parent+"' class='UploadSpanOption'>"+span.Parent+"</div>";
      })
      if (!spans.includes("Uploads")) { uploadSpanContainer.innerHTML += "<div span='Uploads' class='UploadSpanOption'>Uploads</div>"; }
      
      $(uploadSpanContainer).css({"left": dropdownPos.left, "top": dropdownPos.top - $(uploadSpanContainer).height() - 9});
      
      $(".fileInformationContent")[0].style.height = "calc(100% - "+ ($(uploadSpanContainer).height() + 225) +"px)";

      $(".UploadSpanOption").on("click", function(e) {
        $("#uploadDirectory")[0].innerText = e.target.getAttribute('span');
        $("#uploadDirectory")[0].setAttribute('span', e.target.getAttribute('span'))
        $(".uploadSpanContainer").remove();
      })
      setTimeout(function() {
        $(document).on("click", function(e) {
          $(".uploadSpanContainer").remove();
          $(".fileInformationContent")[0].style.height = "";
          $(document).off()
        })
      }, 200)
      


    })
  }
}

function ItemsPath(Parent, Name) {
  if (directoryPath == "Homepage") {
    return Parent+" > "+Name;
  } else {
    let path = "";
    for (let i=0; i<Directory_Route.length; i++) {
      path += Directory_Route[i].Text+" > "
    }
    path += Name;
    return path;
  }
}

////////////////////////////////////////////////////////////////////////
////////////////////////////   VIEW   //////////////////////////////////
////////////////////////////////////////////////////////////////////////

function viewContentAsBlock(NanoID) {
  fileContainer.innerHTML = '';

  for (i=0; i<pageContent.length; i++) {

    fileContainer.innerHTML += `
      <div class='ContentContainer' ${NanoID == "Homepage" ? `rc='File_Container'` : ``}>
        ${NanoID == "Homepage" ? `<a contenteditable='true'>${pageContent[i].Parent}</a>` : ``}
      </div>
    `
    let Container = $(".ContentContainer")[i];

    for (const [object, item] of Object.entries(pageContent[i].Contents)) {
      let parent = pageContent[i].Parent ? pageContent[i].Parent : "";

      Container.innerHTML += `
        <div class='Item' directory='${ItemsPath(parent, item.Name)}' type='${ItemChecker(item.Type)}' nano-id='${item.OID}' rc='${!item.Type.isFi ? "Nano_Folder" : "Nano_File"}' rcOSP='DIV,IMG' title='${ItemsPath(parent, item.Name)}' onclick='clickedItem(this)' ${item.Tags.Color ? "style='border-bottom: 2px solid "+item.Tags.Color+"'" : ""}>
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
    $('.ContentContainer > a').on('click', function(e) { renameSpan(e) })
    homepageNewSpan();
  }
  clientStatus("CS7", "Ok", 400);
}

function viewContentAsList(NanoID) {
  $(".fileContainer").empty()
  fileContainer.innerHTML = '';

  for (i=0; i<pageContent.length; i++) {

    fileContainer.innerHTML += `
    <div class='ListContentContainer' ${NanoID == "Homepage" ? `rc='Homepage_Span' Home-Span=${pageContent[i].Parent}` : "style='margin: 1px 0px;'" }>
        ${NanoID == "Homepage" ? `<a contenteditable='true'>${pageContent[i].Parent}</a>` : ``}
        <table class='ListContentTable' style='${NanoID == "Homepage" ? "" : 'margin: 25px 0 0 0'}'>
          <tbody>
            <tr> <th></th> <th></th> <th>Type</th> <th>Modified</th> <th>Size</th> </tr>
          </tbody>
        </table>
      </div>
    `;

    let Table = fileContainer.querySelectorAll('tbody')[i];

    for (const [object, item] of Object.entries(pageContent[i].Contents)) {
      parent = pageContent[i].Parent ? pageContent[i].Parent : "";

      Table.innerHTML += `
        <tr directory='${ItemsPath(parent, item.Name)}' type='${ItemChecker(item.Type)}' nano-id='${item.OID}' rc='${!item.Type.isFi ? "Nano_Folder" : "Nano_File"}' rcOSP='TD' title='${ItemsPath(parent, item.Name)}' onclick='clickedItem(this)' ${item.Tags.Color ? "style='box-shadow: "+item.Tags.Color+" -3px 0' " : ""}>
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
    $('.ListContentContainer > a').on('click', function(e) { renameSpan(e) })
    homepageNewSpan();
  }

  clientStatus("CS7", "Ok", 400);
}

/////////////////////////   INFORMATION   //////////////////////////////


// Create Download Link - Name.


TimeKey = {"CreaT":"Created", "OpenT":"Opened", "ModiT": "Modified", "CreaW": "Created By", "ModiW": "Modified By", "OpenW": "Opened By", "DeleT": "Deleted", "RecovT": "Recovered"}
SecureKey = {0: "No", 1: "Secured", 2: "Multiple", 3: "Max"}

async function callItemInformation(selected) {
  if (typeof RCElement !== 'undefined' && selected == "RCElement") {selected = RCElement}
  clientStatus("CS2", "True", 500); clientStatus("CS4", "Wait", 400);
  clientStatus("CS5", "Wait", 300); clientStatus("CS7", "Wait", 300);

  if (!SideBarOpen) {displaySideBar()};

  const SelectedID = selected.getAttribute('nano-id');
  const NanoPath = selected.getAttribute('directory');

  const Request = await fetch('//drive.nanode.one/user/files/'+SelectedID);
  const RequestInfo = await Request.json();
  clientStatus("CS3", "True", 600);

  // console.log(RequestInfo)

  ItemInfo.innerHTML = `

    <input class='ItemInfo_Name' contenteditable='true' value='${RequestInfo.Name.Cur}'>
    <p class='ItemInfo_UUID' title='This Items Unique Identifier'>${RequestInfo.UUID}</p>

    ${RequestInfo.Type.isImg ? "<img loading='lazy' height='128' width='auto' src='/storage/"+RequestInfo.UUID+"?h=128&w=null'></img>" : ""}

    <input class='ItemInfo_Directory' value='${NanoPath}' title='Shift-Click to Visit:  ${NanoPath}' readonly=true>

    <span style='margin: 8px 0 0 0;'>
      <button class='ItemInfo_Shortcut' title='Create Shortcut Here'><i class='fas fa-thumbtack'></i>Shortcut</button>
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
    <span> <input style='border-color: red;' class='ItemInfo_Share_Input' type='text' placeholder='Enter username or email'></span>

    <sub>LINK - view only</sub>
    <span> <input class='ItemInfo_Link_Input' type='text' placeholder='Click to create link' readonly=true style='cursor: pointer;'></span>

    <sub>DOWNLOAD LINK</sub>
    <span> <input class='ItemInfo_Download_Input' type='text' placeholder='Click to create link' readonly=true style='cursor: pointer'> </span>
  `
  // <i class='fas fa-chevron-down Input_Ops_Btn ItemInfo_Share_Btn'></i>
  // <i class='fas fa-chevron-down Input_Ops_Btn ItemInfo_Link_Btn'></i> 

  const ItemInfoTable = $(ItemInfo).find('tbody')[0];
  for (let key in RequestInfo.Time) {
    if (RequestInfo.Time[key].length && key != "DeleT") {
      ItemInfoTable.innerHTML += `<tr><td>${TimeKey[key]}</td><td title=${RequestInfo.Time[key]}>${dateFormater(RequestInfo.Time[key])}</td></tr>`
    }
  }
  ItemInfoTable.innerHTML += `<tr><td>Colour</td><td><input class='ItemInfo_Color' type='color' ${RequestInfo.Tags.Color ? "value="+RGBtoHEX(RequestInfo.Tags.Color) : ""}></td></tr>`

  ItemInfoListeners(RequestInfo);
}

function ItemInfoListeners(ItemRequest) {

  // ######## Name
  $(".ItemInfo_Name").on("change", function(e) {
    FolderCall = false;
    socket.emit('ItemEdit', {"Action": "Edit", "Item": "FileFolder", "ID": ItemRequest.UUID, "Path": NanoID, "EditData":{"Name": {"Cur": e.target.value}}  })
  })

  // Path -> Navigate To on Shift-Click
  $(".ItemInfo_Directory").on("click", function(e) {
    if (keyMap[16] == true || keyMap[17] == true) {
      // Runs of the same architecure as the shortcut. Need to work out a way of sorting out the directory route.
      // Select the item when I move: use the nano-id to find the item and select it. Scroll page too so its in frame.
    }
  })

  // Shortcut -> Create Here
  $(".ItemInfo_Shortcut").on("click", function(e) {
    // Create Item on Server > Dupe of Selected Item > Change ID > Shortcut True > Add to NanoID (parent).
  })

  // ######## Download
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

  // ######## Colour Change
  $(".ItemInfo_Color").on("change", function(e) {
    socket.emit('ItemEdit', {"Action": "Edit", "Item": "FileFolder", "ID": ItemRequest.UUID, "EditData":{"Tags": {"Color": e.target.value}} })
  })

  // ######## Description
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

  $(".ItemInfo_Download_Input").on("click", function(e) {
    if (!e.target.value) { socket.emit('downloadItems', "SHARE", [ItemRequest.UUID]); }
  })
}
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

function displayConfirmCancelBox(Action, Title, Accept, Decline, Text) {
  
  let BlockOut = document.createElement('div');
  BlockOut.setAttribute('class', "BlockOut")
  BlockOut.innerHTML = " <div class='centralActionMain'>"+Title+"<p class='centralDirectoryInfoText'>"+Text+"</p> <div class='AMAccept'>"+Accept+"</div> <div class='AMCancel'>"+Decline+"</div> </div> "
  document.body.appendChild(BlockOut);

  $(".AMCancel")[0].addEventListener("click", function() { BlockOut.remove(); clientStatus("CS8", "Off"); });
  $(".AMAccept")[0].addEventListener("click", function() {
    if (Action == "Delete") {
      if (!RCElement.hasAttribute('nano-id') && RCElement.getAttribute('rc').includes('Span')) {
        let TestSpanName = RCElement.childNodes[0].innerText;
        for (i=0; i<pageContent.length; i++) {
          if (pageContent[i].Parent.includes(TestSpanName)) {
            let SpanName = TestSpanName;
            socket.emit('ItemEdit', {"Action": "Delete", "Item": "Span", "ID": SpanName})
          }
        }
      } else if (RCElement.hasAttribute('nano-id')) {
        socket.emit('ItemEdit', {"Action": "Delete", "Item": "FileFolder", "Path": NanoID, "ID": RCElement.getAttribute('nano-id')})
      }
    }
    BlockOut.remove();
  });
}


function displayCentralActionMain(Title, Accept, Span) {
  
  clientStatus("CS7", "Wait", 400); clientStatus("CS8", "User");

  if ($(".BlockOut")) {
    $(".BlockOut").remove();
  }

  // Creates Blockout and the Main Central Box, with Input area, Accept and Cancel Buttons
  let BlockOut = document.createElement('div');
  BlockOut.setAttribute('class', "BlockOut")
  BlockOut.innerHTML = " <div class='centralActionMain'>"+Title+"<input type='text' class='AMEntry' placeholder='"+Title+"...'> <div class='AMAccept'>"+Accept+"</div> <div class='AMCancel'>Cancel</div> </div> "
  document.body.appendChild(BlockOut);


  if (Title == "New Folder" || Title == "New File") {
    var CustomTagsContainer = document.createElement('div');
    CustomTagsContainer.setAttribute('class', "centralActionMain customTagsContainer");
    BlockOut.appendChild(CustomTagsContainer);

    let itemSettings = document.createElement('table');
    itemSettings.setAttribute('class', "customTagsTable")
    itemSettings.innerHTML = spanDropdown()+"<tr><td>Colour</td><td><div id='colorSettingsBtn' CusTag='colour' class='settingsInput' style='padding-top: 2px;cursor: pointer;' >Choose Colour</div></td></tr>  <tr><th colspan='2'>Security</th></tr> <tr><td>Password</td><td> <input CusTag='password' type='text' class='settingsInput' placeholder='Password...'></td></tr> <tr><td>Pin Code</td><td> <input CusTag='pinCode' type='text' class='settingsInput' placeholder='Pin Code • 1-9'></td></tr> <tr><td>Open Times</td><td> <input CusTag='OpenStart' type='text' class='settingsInput settingsInputHalf' placeholder='Start • 09:00'><input CusTag='OpenEnd' type='text' class='settingsInput settingsInputHalf' style='margin-left: 15px;' placeholder='End • 17:00'></td></tr>"
    CustomTagsContainer.appendChild(itemSettings);

    chooseSpanDropdownListener();
  }

  function spanDropdown() {
    if (directoryPath == "Homepage") { return "<tr><td>Span</td><td> <div id='ChooseSpanDropdown' class='settingsInput' style='padding-top: 2px; cursor: pointer;'>"+(!Span ? "Quick Access" : Span)+"<i class='fas fa-caret-down' style='float:right; padding: 6px 10px;'></i></td></tr>" } return "";
  }

  $('#colorSettingsBtn').on('click', function() {
    displayColorPicker("ISC", function(chosenColor) {
      $('#colorSettingsBtn')[0].innerText = chosenColor;
    });
  })

  $(".AMCancel")[0].addEventListener("click", function() { BlockOut.remove(); clientStatus("CS8", "Off"); });
  $(".AMAccept")[0].addEventListener("click", function() {

      let UICOL = $("#colorSettingsBtn")[0]; let UIPWD = $("input[CusTag]")[0]; let UIPIN = $("input[CusTag]")[1]; let UIST = $("input[CusTag]")[2]; let UIET = $("input[CusTag]")[3];
      let acceptInputs = false;

      if (!ActionMainEntry.value) {
        acceptInputs = false; ActionMainEntry.style.border = "2px solid crimson";
      } else { ActionMainEntry.style.border = ""; acceptInputs = true; }

      if (UIPIN && UIPIN.value) {
        acceptInputs = (/^[0-9]+$/).test(UIPIN.value);
        if (!acceptInputs) { UIPIN.style.borderColor = "crimson"; acceptInputs = false; } else { UIPIN.style.borderColor = ""; acceptInputs = true; }
      }

      if (UIST) {
        if ( (UIST.value && !UIET.value) || (!UIST.value && UIET.value) ) {
          acceptInputs = false; UIST.style.borderColor = "crimson"; UIET.style.borderColor = "crimson";
        } else if ( UIST.value && UIET.value ) {
          acceptInputs = (/^([01]\d|2[0-3]):?([0-5]\d)$/g).test((UIST.value) && (UIET.value));
          if (!acceptInputs || (UIST.value.replace(":", "") > UIET.value.replace(":", ""))) { acceptInputs = false; UIST.style.borderColor = "crimson"; UIET.style.borderColor = "crimson"; } else { UIST.style.borderColor = ""; UIET.style.borderColor = ""; acceptInputs = true; }
        }
      }


      if (acceptInputs) {
        if ((Title == "New File") && !ActionMainEntry.value.includes(".txt")) {
          ActionMainEntry.value += ".txt";
        }
        if (Title == "New Span") {
          socket.emit('ItemManager', {Directory:directoryPath, Type:Title, Name:ActionMainEntry.value})
        } else {
          clientStatus("CS2", "True", 400);
          customTags = [ UICOL.value, UIPWD.value, UIPIN.value, UIST.value, UIET.value]
          if (directoryPath == "Homepage") {
            socket.emit('ItemManager', {Directory:directoryPath, Type:Title, Name:ActionMainEntry.value, Span:$("#ChooseSpanDropdown")[0].textContent, Tags:customTags})
          } else {
            socket.emit('ItemManager', {Directory:NanoID, Path:directoryPath, Type:Title, Name:ActionMainEntry.value, Tags:customTags})
          }
        }
        BlockOut.remove();
      }
  });
}


function chooseSpanDropdownListener() {
  $("#ChooseSpanDropdown").off();
  $("#ChooseSpanDropdown").on("click", function(e) {
    if ($(".spanOptionsContainer")) {$(".spanOptionsContainer").remove()};
    let spanOptionsContainer = document.createElement('div');
    spanOptionsContainer.setAttribute('class', "spanOptionsContainer")
    dropdownPos = document.getElementById("ChooseSpanDropdown").getBoundingClientRect();
    $(spanOptionsContainer).css({"z-index": 10,"left": dropdownPos.left, "top": dropdownPos.top+26});
    $(".BlockOut")[0].appendChild(spanOptionsContainer);

    let spans = [];
    pageContent.forEach(function(span) { spans.push(span.Parent) })

    spans.forEach(function(span) {
      let spanOption = document.createElement('div');
      spanOption.setAttribute('class', "SpanDropdownOption");
      spanOption.innerText = span;
      spanOptionsContainer.appendChild(spanOption);
    })
    if (!spans.includes("Quick Access")) {
      let spanOption = document.createElement('div');
      spanOption.setAttribute('class', "SpanDropdownOption");
      spanOption.innerText = "Quick Access";
      spanOptionsContainer.appendChild(spanOption);
    }


    $(".SpanDropdownOption").on("click", function(e) {
      $("#ChooseSpanDropdown")[0].innerHTML = "<i class='fas fa-caret-down' style='float:right; padding: 4px 10px;'></i>"+e.target.innerText;
      $(".spanOptionsContainer").remove();
    })

  })
}

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////



function displaySecurityEntry(itemSecurity) {
  clientStatus("CS7", "Wait", 400); clientStatus("CS6", "False");

  if (!SideBarOpen) {displaySideBar(); }
  $(".fileInformationContent").empty();

  for (i=0; i<itemSecurity.length; i++) {
    securityContainer = document.createElement('span');
    $(".fileInformationContent")[0].appendChild(securityContainer)

    secureIcon = document.createElement('i');
    if (itemSecurity[i] == "Password") { secureIcon.setAttribute("class", "itemLockIcon far fa-keyboard"); }
    if (itemSecurity[i] == "Pin") { secureIcon.setAttribute("class", "itemLockIcon fas fa-th"); }
    if (itemSecurity[i] == "Time") { secureIcon.setAttribute("class", "itemLockIcon far fa-clock"); }
    securityContainer.appendChild(secureIcon);

    secureInput = document.createElement('input');
    secureInput.setAttribute("class", "panelSecureInput");
    if (itemSecurity[i] == "Password") { secureInput.setAttribute("placeholder", "Password"); secureInput.setAttribute("inputType", "pass"); }
    if (itemSecurity[i] == "Pin") { secureInput.setAttribute("placeholder", "Pin Code • 1-9"); secureInput.setAttribute("inputType", "pin"); }
    secureInput.setAttribute("type", "password");
    if (itemSecurity[i] == "Time") { secureInput.setAttribute("value", "Time Restricted"); secureInput.setAttribute("readOnly", true); secureInput.setAttribute("type", "text"); secureInput.setAttribute("inputType", "time"); }
    securityContainer.appendChild(secureInput);
  }

  $(".fileInformationContent")[0].innerHTML += " <span class='securityEntry' id='securityEntryBtn'><input type='button' class='panelSecureInput' readOnly value='Submit'></input></span> "

  securityEntries = function() {
    let inputs = {};
    for (i=0; i<itemSecurity.length; i++) {
      inputs[$(".panelSecureInput")[i].getAttribute("inputType")] = $(".panelSecureInput")[i].value;
    }
    return inputs;
  }

  $("#securityEntryBtn").on("click", function() {
    socket.emit('ItemLockEntries', [securityEntries(), NanoSelected]);
    clientStatus("CS2", "True", 300); clientStatus("CS5", "User", 600);
  })
}


currentUpDownOverlay = false;
function displayUploadDownloadOverlay(Title, ContextMenu) {
  clientStatus("CS7", "Wait", 600);

  if (currentUpDownOverlay != Title) {
    currentUpDownOverlay = Title;
    if ($(".UpDownOverlayContainer")[0]) {
      $(".UpDownOverlayContainer")[0].remove();
    }
    
    $(".fileInformationContent")[0].style.height = "calc(100% - 415px)";
    var UpDownOverlayContainer = document.createElement('div');
    UpDownOverlayContainer.setAttribute('class', "UpDownOverlayContainer")   // UpDownOverlayContainer
    $('.fileInformation')[0].appendChild(UpDownOverlayContainer);

    if (Title == "Upload") {
      DownloadItems = [];
      UpDownOverlayContainer.innerHTML = "<div class='uploadOverlayBtn UOFolder' id='uploadFolderBtn'>Folder</div>"+
      "<div class='uploadOverlayBtn UOFile' id='uploadFileBtn'>File</div>"+
      "<div class='uploadOverlayBtn UOCancel' id='UpDownCancelBtn'>Cancel</div>"+
      "<div class='UpDownOverlayItems' id='UpDownOverlayItems'></div>";

      $("#uploadFileBtn").on("click", function() { $("#fileUploadBtn").click(); })
      $("#uploadFolderBtn").on("click", function() { $("#folderUploadBtn").click(); })

    } else if (Title == "Download") {
      DownloadItems = [];
      downloadSelection = true;
      UpDownOverlayContainer.innerHTML = "<div class='DODownload'>Download</div> <div class='uploadOverlayBtn UOCancel' id='UpDownCancelBtn'>Cancel</div> <div class='UpDownOverlayItems' id='UpDownOverlayItems'></div>";
    }
  }

  if (Title == "Download") {
    if ( $(".downloadStatus")[0] ) {$(".downloadStatus")[0].remove();}
    if (ContextMenu == "ContextMenu") {
      if (!DownloadItems.includes(RCElement.getAttribute('nano-id'))) { 
        DownloadItems.push( RCElement.getAttribute('nano-id') )
        $("#UpDownOverlayItems")[0].innerText += (UserSettings.ViewT == 0 ? RCElement.childNodes[1].innerText :  RCElement.childNodes[3].innerText)+ "\n";
      }
      if ( $("[selected='true']") ) { 
        $("[selected='true']").each(function(index, item) {
          if (!DownloadItems.includes(item.getAttribute('nano-id'))) { 
            DownloadItems.push(item.getAttribute('nano-id')) 
            $("#UpDownOverlayItems")[0].innerText += (UserSettings.ViewT == 0 ? item.childNodes[1].innerText :  item.childNodes[3].innerText)+ "\n";
          }
        })
      }
      $(".DODownload").off();
      $(".DODownload").on("click", function(e) {

        $(".DODownload").off();
        socket.emit('downloadItems', "SELF", DownloadItems)
        DownloadItems = [];
        $("#UpDownOverlayItems")[0].innerHTML = "<div class='downloadIcon'></div><div class='downloadStatus'>Downloading</div>";

        socket.on('DownloadURLID', function(url) { window.open("https://link.Nanode.one/download/"+url);})
        setTimeout(function() { cancelUploadDownloadItems(); }, 5000)

      })
    }
  }
  

  $("#UpDownCancelBtn").on("click", function() {
    cancelUploadDownloadItems();
  })

}


////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////

function displayColorPicker(calledBy, callback) {
  clientStatus("CS7", "Wait", 400); clientStatus("CS8", "User");

  if ($(".colorContainer")[0]) {$(".colorContainer")[0].remove();}

  let colorContainer = document.createElement('div');
  colorContainer.setAttribute('class', "colorContainer");
  colorContainer.innerHTML = "<i id='closeColorPicker' class='fas fa-times' title='Close Picker'></i> <input type='text' id='colorPickEntry' class='colorPickEntry' placeholder='#000000'></input> <div class='colorOptionsContainer'></div><i id='acceptColorPicked' class='fas fa-check' title='Accept Colour'></i>";
  document.body.appendChild(colorContainer);

  if (typeof RCElement !== 'undefined' && RCElement.hasAttribute('style')) {
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

function displayImageLarge(selected, table) {
  clientStatus("CS7", "Wait", 500); clientStatus("CS8", "User");
  const BlockOut = document.createElement('div');
  BlockOut.setAttribute('class', "BlockOut")
  document.body.appendChild(BlockOut);

  const centralImageOpen = document.createElement('img');
  centralImageOpen.setAttribute('class', "displayImageLarge")
  centralImageOpen.style.cssText = "top:50%; left:50%; transform: translateX(-50%) translateY(-50%);";
  centralImageOpen.src = $(selected).find('img')[0].src.split('?')[0];

  BlockOut.appendChild(centralImageOpen);

  $(".BlockOut")[0].addEventListener("click", function(e){ e.stopImmediatePropagation(); if (e.target == $(".BlockOut")[0]) {e.target.remove()}; clientStatus("CS8", "Off");});

  $(".BlockOut")[0].addEventListener('keydown', function(e) {
    if (e.keyCode == 37) {
      if (selected.previousSibling.childNodes[0].hasAttribute("src")) {
        centralImageOpen.setAttribute('src', selected.previousSibling.childNodes[0].getAttribute("src"))
      } else {centralImageOpen.setAttribute('src', "/BlankImage.png")}
      selected = selected.previousSibling;
    } else if (e.keyCode == 39) {
      if (selected.nextSibling.childNodes[0].hasAttribute("src")) {
        centralImageOpen.setAttribute('src', selected.nextSibling.childNodes[0].getAttribute("src"))
      } else {centralImageOpen.setAttribute('src', "/BlankImage.png")}
      selected = selected.nextSibling;
    }
  });
}

function displayTextContent(selected, table) {
  clientStatus("CS7", "Wait", 500); clientStatus("CS8", "User"); clientStatus("CS4", "Wait", 400);
  
  document.body.innerHTML += `
    <div class='BlockOut'>
      <div class='displayTextContainer'>
        <input class='displayTextTitle' value=${table == "table" ? selected.childNodes[1].innerText : selected.childNodes[0].innerText}>
        <textarea class='displayTextContent'></textarea>
      </div>
    </div>
  `

  $(".BlockOut")[0].addEventListener("click", function(e){e.stopImmediatePropagation(); if(e.target == $(".BlockOut")[0]) {e.target.remove()}; clientStatus("CS8", "Off");});
}