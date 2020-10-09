DownloadItems = [];
dirPathPass = false;

var ItemChecker = function(checkObj) {
  if (!checkObj.isFi) { return "folder" }
  if (checkObj.isImg) { return "image" }
  if (checkObj.mimeT) {
    if (checkObj.mimeT.includes("video")) { return "video" }
    if (checkObj.mimeT.includes("audio")) { return "audio" }
    if (checkObj.mimeT.includes("text")) { return "text" }
    return "file";
  }
  if (checkObj.End == "txt") { return "text" }
  return "unknown";
}

///////////////////////////////////////////

function homepageNewSpan() {
  $(".fileContainer")[0].innerHTML += " <div class='directoryControlNewSpan' id='directoryControlNewSpan'>New Span</div>";
  $("#directoryControlNewSpan").on("click", function() { displayCentralActionMain("New Span", "Create") });
}

function uploadDirectoryLocation(Page, location) {
  let dirLocBtn = $("#uploadDirectory")[0];
  dirLocBtn.innerText = location;
  $(dirLocBtn).off()

  if (Page == "Homepage" && NanoPath == Page) {
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
        spans.push(span[0])
        uploadSpanContainer.innerHTML += "<div span='"+span[0]+"' class='UploadSpanOption'>"+span[0]+"</div>";
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

////////////////////////////////////////////////////////////////////////
///////////////////////////   BLOCK   //////////////////////////////////
////////////////////////////////////////////////////////////////////////

function viewHomepageContentAsBlock() {
  $(".fileContainer").empty();
  // $(".fileContainer > *:not('.blockItem-Placeholder')").remove();
  for (i=0; i<pageContent.length; i++) {
    
    $(".fileContainer")[0].innerHTML += "<div class='ContentContainer' rc='ContentContainer'><a contenteditable='true'>"+pageContent[i][0]+"</a></div>"

    pageContent[i][1].forEach(function(spanItem, index) {
      generateBlockFolder(true, spanItem, index, $(".ContentContainer")[i]);
    })
  }

  $('.ContentContainer > a').on('click', function(e) { renameSpan(e) })

  homepageNewSpan();
  clientStatus("CS7", "Ok", 400);
} 

function viewContentAsBlock() {
  $(".fileContainer").empty();
  // $(".fileContainer > *:not('.blockItem-Placeholder')").remove();
  $(".fileContainer")[0].innerHTML += "<div class='ContentContainer'></div>"

  pageContent[0][1].forEach(function(Item, index) {
    generateBlockFolder(false, Item, index, $(".ContentContainer")[0]);
  })

  $("div[type='folder']").each(function(i, folder) {
    $(".ContentContainer")[0].prepend(folder);
  })

  clientStatus("CS7", "Ok", 400);
}

function generateBlockFolder(isHomepage, Item, index, Parent) {
  let ItemType = ItemChecker(Item[2]);

  Parent.innerHTML += "<div class='Item' directory='"+(!isHomepage ? Item[1] : pageContent[i][0]+"\\"+Item[0])+"' title='"+(!isHomepage ? Item[1] : pageContent[i][0]+"\\"+Item[0])+"' type='"+ItemType+"' rc='"+(!Item[2].isFi ? 'Nano_Folder' : 'Nano_File')+"' rcOSP='DIV,IMG' onclick='clickedItem(this)' nano-path='"+Item[6]+"'><h4>"+Item[0]+"</h4><img loading='lazy'></img></div>"

  let Block_Item = Parent.querySelectorAll('.Item')[index];
  let Item_Img = Block_Item.childNodes[1];

  if (!Item[2].isFi) {
    Item_Img.height = "90"; Item_Img.width = '90';
    Item_Img.src = "https://drive.Nanode.one/assets/FileIcons/Folder.svg";
  } else {
    if (!Item[2].isImg) {
      Item_Img.setAttribute('class', "Item_Image");
      Item_Img.style.cssText = "width: 80px; left: calc(50% - 40px)";
      if (ItemType == "text") {
        Item_Img.src = "https://drive.Nanode.one/assets/FileIcons/TextFile.svg";
      } else if (ItemType == "audio") {
        Item_Img.src = "https://drive.Nanode.one/assets/FileIcons/AudioFile.svg";
        Item_Img.style.cssText = "width: 70px; left: calc(50% - 35px)";
      } else if (ItemType == 'video') {
        Item_Img.src = "https://drive.Nanode.one/assets/FileIcons/VideoFile.svg";
        Item_Img.style.cssText = "width: 60px; left: calc(50% - 30px)";
      }
       else {
        Item_Img.src = "https://drive.Nanode.one/assets/FileIcons/File.svg";
      }
    } else {
      Item_Img.height = "90"; Item_Img.width = "120";
      Item_Img.src = '/storage/'+Item[6]+"?h=90&w=120";
      Item_Img.setAttribute("class", "File_Image File");
    }
  }
  if (Item[5].Color) { Block_Item.style.borderBottom = "2px solid "+ Item[5].Color}
}

////////////////////////////////////////////////////////////////////////
///////////////////////////    LIST    /////////////////////////////////
////////////////////////////////////////////////////////////////////////

function viewHomepageContentAsList() {
  $(".fileContainer > *:not('.listItem-Placeholder')").remove();
  for (i=0; i<pageContent.length; i++) {

    $(".fileContainer")[0].innerHTML += "<div class='ListContentContainer' rc='Homepage_Span' Home-Span='"+pageContent[i][0]+"'><a contenteditable='true'>"+pageContent[i][0]+"</a><table class='ListContentTable'></table></div>";
    let Table = $('.ListContentTable')[i];

    let rowData = ["", " ", "Type", "Modified", "Size", ""];
    addTableRow(Table, "th", rowData);

    pageContent[i][1].forEach(function(spanItem, index) {
      rowData = ["", spanItem[0], ItemChecker(spanItem[2]), dateFormater(spanItem[3]), spanItem[4], pageContent[i][0]+"\\"+spanItem[0], spanItem[6]]
      if (ItemChecker(spanItem[2]) != "folder") { rowData[0] = pageContent[i][1][index][2] }
      addTableRow(Table, "td", rowData, index, spanItem, spanItem[5].Color);
    })

    $($("tr[type='folder']", Table).get().reverse()).each(function(i, folder) {
      $(folder).insertAfter( Table.children[0]);
    })
  }

  $('.ListContentContainer > a').on('click', function(e) { renameSpan(e) })

  homepageNewSpan();
  clientStatus("CS7", "Ok", 400);
}

function viewContentAsList() {
  $(".fileContainer > *:not('.listItem-Placeholder')").remove();

  let ContentContainer = document.createElement('div');
  ContentContainer.setAttribute("class", "ListContentContainer");
  ContentContainer.style.margin = "0";
  $(".fileContainer")[0].appendChild(ContentContainer);

  ListContentTable = document.createElement('table');
  ListContentTable.setAttribute("class", "ListContentTable");
  ContentContainer.appendChild(ListContentTable);
  
  rowData = ["", " ", "Type", "Modified", "Size", ""];
  addTableRow(ListContentTable, "th", rowData);

  pageContent[0][1].forEach(function(Item, index) {
    let ItemType = ItemChecker(Item[2]);
    rowData = ["", Item[0], ItemType, Item[3], Item[4], Item[1], Item[6]]
    if (ItemType != "folder") { rowData[0] = Item[3] }
    addTableRow(ListContentTable, "td", rowData, index, Item, Item[5].Color);
  })

  $("div[type='folder']").each(function(i, folder) {
    $(".fileContainer")[0].prepend(folder);
  })

  clientStatus("CS7", "Ok", 400);
}

function addTableRow(Table, type, data, index, Item, Color) {
  let tableRow = document.createElement('tr');
  if (type == "td" && data[5]) {
    tableRow.setAttribute("directory", data[5])
    tableRow.setAttribute("onclick", "clickedItem(this)");
    tableRow.setAttribute("type", data[2]);
    tableRow.setAttribute("Nano-Path", data.pop())
    tableRow.setAttribute("rc", (data[2] == "folder" ? "Nano_Folder" : "Nano_File")  )
    tableRow.setAttribute("rcOSP", "TD");
    tableRow.title = data[5];
  }

  for (q=0; q<data.length - 1; q++) {
    let tableInformation = document.createElement(type);
    if (q != 0) { tableInformation.innerText = data[q] == "" ? "-" : isNaN(data[q].toString().charAt(0)) ? data[q].charAt(0).toUpperCase() + data[q].slice(1): data[q]; }

    if (q == 4) {if(data[q] && !isNaN(data[q])){ tableInformation.innerText = convertSize(data[q]) }}

    if (type == "td" && q == 0) {
      let tableImage = document.createElement('img');
      tableImage.setAttribute('loading', "lazy");
      tableImage.height = "32"; tableImage.width = "32";

      if (data[2] == "folder")        tableImage.src = "/assets/FileIcons/Folder.svg"
      else if (data[2] == "unknown")  tableImage.src = "/assets/FileIcons/File.svg";
      else if (data[2] == "image")    tableImage.src = '/storage/'+Item[6]+"?h=32&w=32";
      else                            tableImage.src = "/assets/FileIcons/"+data[2]+"File.svg";
      
      tableInformation.appendChild(tableImage);
    }
    tableRow.appendChild(tableInformation);
  }
  if (Color) { tableRow.style.boxShadow = Color+" -3px 0px"}
  Table.appendChild(tableRow);
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
      if (!RCElement.hasAttribute('Nano-path') && RCElement.getAttribute('rc').includes('Span')) {
        let TestSpanName = RCElement.childNodes[0].innerText;
        for (i=0; i<pageContent.length; i++) {
          if (pageContent[i][0].includes(TestSpanName)) {
            let SpanName = TestSpanName;
            socket.emit('ItemEdit', {"Action": "Delete", "Item": "Span", "ID": SpanName})
          }
        }
      } else if (RCElement.hasAttribute('Nano-path')) {
        socket.emit('ItemEdit', {"Action": "Delete", "Item": "FileFolder", "Path": NanoPath, "ID": RCElement.getAttribute('Nano-path')})
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
            socket.emit('ItemManager', {Directory:NanoPath, Path:directoryPath, Type:Title, Name:ActionMainEntry.value, Tags:customTags})
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
    pageContent.forEach(function(span) { spans.push(span[0]) })

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

function callItemInformation(selected) {
  if (typeof RCElement !== 'undefined' && selected == "RCElement") {selected = RCElement}
  if (displayDetails()) {
    ItemNanoPath = selected.getAttribute('Nano-path');
    ItemsTextPath = selected.getAttribute('directory');
    clientStatus("CS2", "True", 500); clientStatus("CS5", "Wait", 300); clientStatus("CS4", "Wait", 400);
    socket.emit('ItemInformation', {"Path":ItemNanoPath});

    $('.fileInformationContent').empty();
    clientStatus("CS7", "Wait", 300);

    let folderName = document.createElement('h3');
    folderName.setAttribute('class', "itemInformation itemInformationName");
    folderName.setAttribute("contenteditable", "true");
    folderName.innerText = UserSettings.ViewT == 0 ? selected.childNodes[0].innerText : selected.childNodes[1].innerText;
    $('.fileInformationContent')[0].appendChild(folderName);

    let folderUUID = document.createElement('p');
    folderUUID.setAttribute('class', "itemInformationUUID");
    folderUUID.innerText = selected.getAttribute('Nano-path');
    $('.fileInformationContent')[0].appendChild(folderUUID);

    let folderDirectory = document.createElement('p');
    folderDirectory.setAttribute('class', "itemInformation itemInformationBlock")
    folderDirectory.innerHTML = "Path<br><input class='itemInformationDirectory' value='"+ItemsTextPath+"' title="+ItemsTextPath+" readonly><br>";
    $('.fileInformationContent')[0].appendChild(folderDirectory);

    if (selected.getAttribute("type") != "folder") {
      let shareLinkIcon = document.createElement('i');
      shareLinkIcon.setAttribute('class', "shareLinkIcon fas fa-link")
      shareLinkIcon.title = "Get a Shareable Link for this item"
      $('.fileInformationContent')[0].appendChild(shareLinkIcon);
  
      let shareableLinkInput = document.createElement('input');
      shareableLinkInput.setAttribute('class', "shareableLinkInput")
      shareableLinkInput.setAttribute('placeholder', "Generate Shareable Link");
      shareableLinkInput.setAttribute('readonly', true);
      $('.fileInformationContent')[0].appendChild(shareableLinkInput);
  
      $(".shareLinkIcon").on("click", function() {
        if (!shareableLinkInput.value) {
          clientStatus("CS2", "True", 600); clientStatus("CS5", "User", 500);
          socket.emit("GenerateShareableLink", {Path: ItemNanoPath})
        }
      })
  
      $(".shareableLinkInput").on("click", function(e) {
        $(".shareableLinkInput").select();
        document.execCommand('copy');
      })
    }
    
    $('.itemInformationName').on('click', function(e) { renameItem(e) })
  }
}

TimeKey = {"CreaT":"Created", "OpenT":"Opened", "ModiT": "Modified", "CreaW": "Created By", "ModiW": "Modified By", "OpenW": "Opened By", "DeleT": "Deleted", "RecovT": "Recovered"}

function displayItemInformation(ReturnedInformation) {
  clientStatus("CS7", "Wait", 400); clientStatus("CS5", "User", 600);
  let itemInfo = document.createElement('table');
  itemInfo.setAttribute('class', "itemInformation itemInformationBlock itemInformationTable");
  let IType = ReturnedInformation[1].isFi ? ReturnedInformation[1].isImg ? "Image" : "File" : "Folder";
  let ISize = (ReturnedInformation[2] !== null && ReturnedInformation[2] != "") ? (ReturnedInformation[2] / 1024 / 1024).toFixed(2)+" MB" : "-";
  if (ISize.charAt(0) == "0") ISize = (ReturnedInformation[2] / 1024).toFixed(2)+' KB';

  itemInfo.innerHTML = "<tr><td>Size</td><td>"+ISize+"</td></tr> <tr><td>Type</td><td>"+IType+"</td></tr> <tr><td>Secured</td><td>"+ReturnedInformation[6]+"</td></tr> ";

  for (var key in ReturnedInformation[3]) if (ReturnedInformation[3][key] != "" && key != "DeleT") {itemInfo.innerHTML += "<tr><td>"+TimeKey[key]+"</td><td>"+dateFormater(ReturnedInformation[3][key])+"</td></tr>" }

  $('.fileInformationContent')[0].appendChild(itemInfo);
}

////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////


function displaySecurityEntry(itemSecurity) {
  clientStatus("CS7", "Wait", 400); clientStatus("CS6", "False");

  if (!fileInformationOpen) {displayItemInformation(); }
  $(".fileInformationContent").empty();

  for (i=0; i<itemSecurity.length; i++) {
    securityContainer = document.createElement('div');
    securityContainer.setAttribute("class", "securityContainer");
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

  document.getElementById("fileInformationContent").innerHTML += " <div class='securityContainer securityEntry' id='securityEntryBtn' style='margin'><input type='button' class='panelSecureInput' readOnly value='Enter' style='width:188px; padding-left: 0px; cursor:pointer;'></input></div> "

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
      if (!DownloadItems.includes(RCElement.getAttribute('Nano-path'))) { 
        DownloadItems.push( RCElement.getAttribute('Nano-path') )
        $("#UpDownOverlayItems")[0].innerText += (UserSettings.ViewT == 0 ? RCElement.childNodes[0].innerText :  RCElement.childNodes[1].innerText)+ "\n";
      }
      if ( $("[selected='true']") ) { 
        $("[selected='true']").each(function(index, item) {
          if (!DownloadItems.includes(item.getAttribute('Nano-path'))) { 
            DownloadItems.push(item.getAttribute('Nano-path')) 
            $("#UpDownOverlayItems")[0].innerText += (UserSettings.ViewT == 0 ? item.childNodes[0].innerText :  item.childNodes[1].innerText)+ "\n";
          }
        })
      }
      $(".DODownload").off();
      $(".DODownload").on("click", function() {
        socket.emit('downloadItems', DownloadItems)
        DownloadItems = [];
        $("#UpDownOverlayItems")[0].innerHTML = "<div class='downloadIcon'></div><div class='downloadStatus'>Downloading</div>";

        socket.on('DownloadURLID', function(url) {
          window.open("https://drive.Nanode.one/download?q="+url);
          setTimeout(function() {
            cancelUploadDownloadItems();
          }, 5000)
        })
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
    let RGBColor = UserSettings.ViewT == 0 ? $(RCElement).css('borderBottom').replace(/^.*rgba?\(([^)]+)\).*$/,'$1').split(',') : $(RCElement).css('boxShadow').replace(/^.*rgba?\(([^)]+)\).*$/,'$1').split(',');
    let HexColor = "#" + ("0" + parseInt(RGBColor[0],10).toString(16)).slice(-2) + ("0" + parseInt(RGBColor[1],10).toString(16)).slice(-2) + ("0" + parseInt(RGBColor[2],10).toString(16)).slice(-2);
    $("#colorPickEntry")[0].value = HexColor
    $("#colorPickEntry")[0].style.color = HexColor;
  }

  colorOptions = [
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
      socket.emit('ItemEdit', {"Action": "Edit", "Item": "FileFolder", "Path": NanoPath, "ID": RCElement.getAttribute('Nano-path'), "EditData":{"Tags": {"Color": ColorPicked}} })
      return;
    }
    callback(ColorPicked)
  })

  dragElement($(".colorContainer")[0]);
}

function displayImageLarge(selected, table) {
  clientStatus("CS7", "Wait", 500); clientStatus("CS8", "User");
  var selectedFile = selected;
  var BlockOut = document.createElement('div');
  BlockOut.setAttribute('class', "BlockOut")
  document.body.appendChild(BlockOut);

  var centralImageOpen = document.createElement('img');
  centralImageOpen.setAttribute('class', "displayImageLarge")
  centralImageOpen.style.cssText = "left:50%;transform: translateX(-50%) translateY(-50%);top:50%;";
  if (table == "table") { centralImageOpen.setAttribute('src', selectedFile.childNodes[0].childNodes[0].getAttribute("src").split('?')[0]) } 
  else {  centralImageOpen.setAttribute('src', selectedFile.childNodes[1].getAttribute("src").split('?')[0]); }
  BlockOut.appendChild(centralImageOpen);

  $(".BlockOut")[0].addEventListener("click", function(e){e.stopImmediatePropagation(); if(e.target == $(".BlockOut")[0]) {e.target.remove()}; clientStatus("CS8", "Off");});

  $(".BlockOut")[0].addEventListener('keydown', function(e) {
    if (e.keyCode == 37) {
      if (selectedFile.previousSibling.childNodes[0].hasAttribute("src")) {
        centralImageOpen.setAttribute('src', selectedFile.previousSibling.childNodes[0].getAttribute("src"))
      } else {centralImageOpen.setAttribute('src', "/BlankImage.png")}
      var selectedFile = selectedFile.previousSibling;
    } else if (e.keyCode == 39) {
      if (selectedFile.nextSibling.childNodes[0].hasAttribute("src")) {
        centralImageOpen.setAttribute('src', selectedFile.nextSibling.childNodes[0].getAttribute("src"))
      } else {centralImageOpen.setAttribute('src', "/BlankImage.png")}
      var selectedFile = selectedFile.nextSibling;
    }
  });
}


function displayTextContent(selected, table) {
  clientStatus("CS7", "Wait", 500); clientStatus("CS8", "User"); clientStatus("CS4", "Wait", 400);
  
  var BlockOut = document.createElement('div');
  BlockOut.setAttribute('class', "BlockOut");
  document.body.appendChild(BlockOut);

  var displayTextContainer = document.createElement('div');
  displayTextContainer.setAttribute('class', "displayTextContainer");
  BlockOut.appendChild(displayTextContainer);

  var displayTextTitle = document.createElement('input');
  displayTextTitle.setAttribute('class', "displayTextTitle");
  table == "table" ? displayTextTitle.value = selected.childNodes[1].innerText : displayTextTitle.value = selected.childNodes[0].innerText;
  displayTextContainer.appendChild(displayTextTitle);

  var displayTextContent = document.createElement('textarea');
  displayTextContent.setAttribute('class', "displayTextContent");
  displayTextContainer.appendChild(displayTextContent);
  $(".BlockOut")[0].addEventListener("click", function(e){e.stopImmediatePropagation(); if(e.target == $(".BlockOut")[0]) {e.target.remove()}; clientStatus("CS8", "Off");});
}