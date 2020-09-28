NanoSelected = "";
TempParent = "";
directoryPath = "Homepage";
TempdirectoryPath = "";
previousDirectorys = [];
currentViewType = '';
UserSettings = {};

//////////////////////////////////////////
//////////////////////////////////////////

document.addEventListener('DOMContentLoaded', function() {

  // Connect to socket.io
  window.socket = io.connect('https://Nanode.one');

  // Check for Connection
  if (socket !== undefined) {

    setTimeout(function() { clientStatus("CS0", "Wait") }, 200)
    socket.emit('CallSettings', "Read");
    socket.emit('directoryLocation', {directoryPath})

    socket.on('connect', function() {
      setTimeout(function() { clientStatus("CS0", "Ok") }, 400)
    })
    socket.on('connect_error', function() {
      clientStatus("CS0", "False");
    })
    socket.on('connect_failed', function() {
      clientStatus("CS0", "Wait");
    })
    socket.on('error', function() {
      console.log("Connection Error.");
    })
    socket.on("connection:sockid", function(sockID) {
      document.cookie = "sockID="+sockID+";domain=Nanode.one;secure;HttpOnly"
    })


    socket.on('HomepageFolders', function(FoldersAndSpans) {
      Parent = "Homepage"; directoryPath = "Homepage";
      clientStatus("CS3", "True", 800);
      displayHomepageDirectory(FoldersAndSpans);

      setupFileMove();
    })
    socket.on('DirectoryFolders', function(dirContents) {
      Parent = TempParent; directoryPath = TempdirectoryPath;

      NanoPath = dirContents[0][0];
      clientStatus("CS3", "True", 700);
      displayDirectory(dirContents);

      setupFileMove();
    })


    socket.on("CodexContent", function(codexContents) {
      readCodex(codexContents);
    })
    socket.on('CodexProgress', function(itemNumber) {
      codexUploadProgress(itemNumber)
    })
    socket.on('BinContent', function(binContent) {
      readBin(binContent);
    })
    socket.on('Settings', function(UserSettings) {
      readSettings(UserSettings);
    })
    socket.on("NoLoggedSettings", function() {
      noSettings();
    })


    socket.on('ItemLocked', function(itemSecurity) {
      NanoPath = PreviousNanoPath.pop(); directoryPath = PreviousTextPath.pop();
      displaySecurityEntry(itemSecurity);
    })
    socket.on('ItemEntryRefused', function() {
      for (i=0; i < $("div.securityContainer").length; i++) {
        $("div.securityContainer")[i].style.cssText = 'color: crimson;'
      }
    })

    socket.on('ReturnFolderInformation', function(ReturnedInformation) {
      clientStatus("CS3", "True", 600);
      displayFolderInformation(ReturnedInformation);
    })
    socket.on('ShareableLink', function(shareableLink) {
      clientStatus("CS3", "True", 500);
      $(".shareableLinkInput")[0].value = shareableLink.shareableLink;
      $(".shareableLinkInput").select();
      document.execCommand('copy');
    })

    socket.on('UploadProgress', function(UploadProgress) {
      clientStatus("CS9", "Wait", 300);
      $("#uploadPercentage")[0].value = UploadProgress.uploadPercentage;
      if (UploadProgress.uploadPercentage == 100) {
        clientStatus("CS1", "Ok", 1000); clientStatus("CS9", "Ok", 700);
        $("#uploadPercentage")[0].value = 0;
        $("#fileBeingUploaded")[0].innerText = "";
        ToBeUploaded = [];
        uploadStatus = false;
        $("#uploadItemCount")[0].innerText = "Item Count";
        $("#uploadSizeCount")[0].innerText = "Upload Max - 100 MB";
        $("#uploadStartStopButton")[0].innerText = "Upload";
        $("#uploadStartStopButton")[0].title = "Drag and Drop or Select Items to Upload";
        $("#uploadClearItems")[0].style.cursor = "not-allowed";
        $("#uploadClearItems")[0].style.display = "block";
      }
    })
  }
});


var keyMap = {};
onkeydown = onkeyup = function(e) {
  keyMap[e.keyCode] = e.type == 'keydown';
}

function clientStatus(Light, Status, Time) {
  lightColours = {"Off": "None", "True": "White", "False": "Red", "Ok": "#00ff00", "Wait": "Yellow", "User": "Cyan"};
  document.getElementById(Light).style.cssText = "background: "+lightColours[Status]+"; color:"+lightColours[Status]+";";
  if (Time) {
    setTimeout(function() {
      document.getElementById(Light).style.cssText = "background: none; color: none;";
    }, Time)
  }
}


downloadSelection = false;
function clickedItem(selected, fromRC) {

  if (keyMap[16] == true || keyMap[17] == true) {
    if (selected.hasAttribute('selected')) {
      selected.removeAttribute('selected')
      selected.style.background = "";
      return;
    } else {
      selected.setAttribute('selected', true)
      selected.style.background = "rgba(118,128,138,0.5)";
      return;
    }
  }

  if (fromRC) {selected = selected.currentTarget}

  if (!selected.hasAttribute('class') || !selected.getAttribute('class').includes("noOpen")) {
    if (!selected.hasAttribute('selected') && displayDetails()) {
      if ($("tr[selected='true']").length >= 1) {
        $("tr[selected='true']").each(function(index, item) {
          item.style.background = '';
          item.removeAttribute('selected');
        })
      }
      selected.setAttribute('selected', true)
      selected.style.background = "rgba(118,128,138,0.5)";
      callFolderInformation(selected);
      clientStatus("CS5", "User");
    } else {
      selected.removeAttribute('selected');
      selected.style.background = '';
      ItemActions(selected);
      clientStatus("CS5", "Ok", 500);
    }
  }
}


function ItemActions(selected) {
  if (!selected && RCElement) { selected = RCElement }
  NanoSelected = selected.getAttribute("Nano-Path");
  type = selected.getAttribute("type");
  if (type == 'image') {
    selected.tagName == 'TR' ? displayImageLarge(selected, "table") : displayImageLarge(selected);
  } else if (type == 'folder') {
    TempParent = currentViewType == "Block" ? selected.childNodes[0].innerText : selected.childNodes[1].innerText;
    PreviousNanoPath.push(NanoPath); PreviousTextPath.push(directoryPath);
    TempNanoPath = selected.getAttribute("Nano-Path");
    ForwardNanoPath.pop(); ForwardTextPath.pop();
    TempdirectoryPath = selected.getAttribute('directory');
    socket.emit('directoryLocation', {directoryPath:TempNanoPath});
  } else if (type == 'text') {
    socket.emit('readTextContent', {directoryPath:NanoPath})
    selected.tagName == 'TR' ? displayTextContent(selected, "table") : displayTextContent(selected);
  }
}


function setupFileMove(Caller) {
  if (Caller == "Codex") {
    $(".codexWrapper").sortable({
      items : ".codexItem",
      cancel : ".codexItemFolder",
      fixed: ".codexItemFolder",
      containment: ".CodexContainer",
      delay: 150,
      cursor: "move",
      tolerance: 'pointer',
      placeholder: "codexItem-Placeholder",
      forcePlaceholderSize: true,
      helper: "clone",

      start: function() {
        $('.codexItemFolder').each(function() {
            $(this).data('pos', $(this).index());
        });
      },
      change: function(e) {
        toChange = $(this);
        firstItem = $('<div></div>').prependTo(this);
        $('.codexItemFolder').detach().each(function() {
            var target = $(this).data('pos');
            $(this).insertAfter($('div', toChange).eq(target));
        });
        firstItem.remove();
      }
      
    }).disableSelection();

    $("div > .codexItemFolder").droppable({
      accept: ".codexItem",
      hoverClass: "codexItem-Hover",
      drop: function(e, droppedItem) {
        let dropItem = droppedItem.draggable[0];
        dropItem.remove();
        if ($(e.target).hasClass('codexItemFolder')) {
          let emitAction = "Move"; let Data = {"OID": droppedItem.draggable[0].getAttribute('nano-path'), "To": e.target.getAttribute('nano-path')}
          socket.emit('Codex', {emitAction, CodexWanted, CodexPath, Data});
        }
      },
    })

    $(".CC_Directory").droppable({
      accept: ".codexItem",
      hoverClass: "CC_Dir-Hover",
      drop: function(e, droppedItem) {
        if (CodexPath != "Home") {
          let dropItem = droppedItem.draggable[0];
          dropItem.remove();
          let emitAction = "Move"; let Data = {"OID": droppedItem.draggable[0].getAttribute('nano-path'), "To": CodexDirPath_Nano[CodexDirPath_Nano.length - 2]};
          socket.emit('Codex', {emitAction, CodexWanted, CodexPath, Data});
        }
      }
    })
  }

  else if (UserSettings.ViewT == 0) {
    $(".ContentContainer").sortable({
      items: "div[nano-path]",
    })
  } else if (UserSettings.ViewT == 1) {
    $(".ListContentTable").sortable({
      items: "tr[nano-path]",                 // YES
      connectWith: ".ListContentTable",       // YES
      containment: ".fileContainer",          // YES
      delay: 150,                             // Maybe
      // axis: "y",                              Maybe
      cursor: "move",                         // Likely
      
      tolerance: 'pointer',
      
      // forceHelperSize: true,
      forcePlaceholderSize: true,
      helper: "clone",
      
      placeholder: "placeholder",
      // placeholder: '<tr class="LCTHighlight></tr>',
      // start: function (event, ui) { ui.item.toggleClass("LCTHighlight"); },
      // stop: function (event, ui) { ui.item.toggleClass("LCTHighlight"); },
    })
  }
  // $(".fileContainer").sortable();
}