pageContent = '';
NanoSelected = "";
UserSettings = {};

directoryPath = "Homepage";

// document.getElementsByClassName("Sec2")[0].scrollIntoView({behavior: 'smooth', block: 'center'}); Possible Usage Somewhere

//////////////////////////////////////////
//////////////////////////////////////////

document.addEventListener('DOMContentLoaded', function() {

  // Connect to socket.io
  window.socket = io.connect('https://Nanode.one');

  // Check for Connection
  if (socket !== undefined) {

    // setTimeout(function() { clientStatus("CS0", "Wait") }, 200)
    socket.emit('CallSettings', "Read");
    socket.emit('directoryLocation', (directoryPath))

    socket.on('connect', function() { setTimeout(function() { clientStatus("CS0", "Ok") }, 1000) })
    socket.on('connect_error', function() { clientStatus("CS0", "False"); })
    socket.on('connect_failed', function() { clientStatus("CS0", "Wait"); })
    socket.on("connection:sockid", function(sockID) { document.cookie = "sockID="+sockID+";domain=Nanode.one;secure;HttpOnly" })


    socket.on("Directory", ({Parent_Path, Contents}) => {
      clientStatus("CS3", "True", 800);
      clientStatus("CS7", "Wait", 400);
      if (Parent_Path != "Homepage") {directoryInfo = Contents.shift();}
      NanoPath = Parent_Path; directoryPath = (NanoPath == "Homepage" ? "Homepage" : directoryInfo.Name);
      pageContent = Contents;
      if (Parent_Path == "Homepage") { UserSettings.ViewT == 0 ? viewHomepageContentAsBlock() : viewHomepageContentAsList() }
      else { UserSettings.ViewT == 0 ? viewContentAsBlock() : viewContentAsList() }
      setupFileMove();

      uploadDirectory = NanoPath == "Homepage" ? "Uploads" : directoryInfo.Name;
      uploadDirectoryLocation(NanoPath, uploadDirectory);

      Route_WIP("Directory", NanoPath, (NanoPath == "Homepage" ? "Homepage" : directoryInfo.Name))
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
      displaySecurityEntry(itemSecurity);
    })
    socket.on('ItemEntryRefused', function() {
      for (i=0; i < $("div.securityContainer").length; i++) {
        $("div.securityContainer")[i].style.cssText = 'color: crimson;'
      }
    })

    socket.on('ReturnFolderInformation', function(ReturnedInformation) {
      clientStatus("CS3", "True", 600);
      displayItemInformation(ReturnedInformation);
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


shortcutKeys = {
  "Ctrl+A": "All",
  "Ctrl+N": "New",
  "Delete": "Delete",
  "Arrow_Up": "Move Up an Item",
  "Arrow_Down": "Move Down an Item",
  "Arrow_Left": "Back a directory",
  "Arrow_Right": "Forward a directory",
}
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


function clickedItem(selected, fromRC) {

  if (keyMap[16] == true || keyMap[17] == true) {
    if (selected.hasAttribute('selected')) {
      selected.removeAttribute('selected')
      selected.style.background = "";
    } else {
      selected.setAttribute('selected', true)
      selected.style.background = "rgba(118,128,138,0.5)";
    }
    return;
  }

  if (fromRC) { selected = selected.currentTarget; }

  if (!$(selected).hasClass('noOpen')) {
    if (!selected.hasAttribute('selected') && displayDetails()) {
      if ($("tr[selected='true']").length >= 1) {
        $("tr[selected='true']").each(function(index, item) {
          item.style.background = '';
          item.removeAttribute('selected');
        })
      }
      selected.setAttribute('selected', true)
      selected.style.background = "rgba(118,128,138,0.5)";
      callItemInformation(selected);
      clientStatus("CS5", "User");
    } else {
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
    socket.emit('directoryLocation', (selected.getAttribute('nano-path')));
  } else if (type == 'text') {
    socket.emit('readTextContent', {"directoryPath":NanoPath})
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
        droppedItem.draggable[0].remove();
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
          droppedItem.draggable[0].remove();
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
  }

  else if (UserSettings.ViewT == 1) {
    var hoveringOver;

    $( "tr[nano-path]" ).draggable({
      containment: "#databaseBackgroundMain",
      connectToSortable: ".ListContentTable",
      revert: "invalid",

      delay: 150,
      cursor: "move",
      tolerance: 'pointer',
      scroll: false,
      cursorAt: { top: 18, left: 20 },
      helper: function(e) {
        return $( "<div class='listItem-Placeholder' nano-path="+e.currentTarget.getAttribute('nano-path')+"><img src="+$(e.currentTarget).find('img')[0].getAttribute('src')+" ></img>"+e.currentTarget.childNodes[1].innerText+"<h5>"+e.currentTarget.getAttribute('directory')+"</h5></div>" );
      },
    }).disableSelection();


    $("tr[type=folder]").droppable({
      accept: "tr[nano-path]",
      hoverClass: "listItem-Hover",
      tolerance: 'pointer',
      greedy: true,
      over: function(e) {
        clearTimeout(hoveringOver)
        hoveringOver = setTimeout(function() {
          console.log("OPEN FOLDER AFTER LONG HOVER OVER")
          // socket.emit('directoryLocation', (e.target.getAttribute("Nano-Path")));
        }, 1500)
      },
      out : function() {
        clearTimeout(hoveringOver)
      },
      drop: function(e, droppedItem) {
        droppedItem.draggable[0].remove(); 
        socket.emit('ItemEdit', {"Action": "Move", "OID": droppedItem.draggable[0].getAttribute('nano-path'), "To": e.target.getAttribute('nano-path'), "ToType": "Folder" });
      },
    })

    $("[Home-Span]").droppable({
      accept: "tr[nano-path]",
      hoverClass: "listSpan-Hover",
      tolerance: 'pointer',
      drop: function(e, droppedItem) {
        if (!e.target.contains(droppedItem.draggable[0])) {
          droppedItem.draggable[0].remove();
          socket.emit('ItemEdit', {"Action": "Move", "OID": droppedItem.draggable[0].getAttribute('nano-path'), "To": e.target.getAttribute('home-span'), "ToType": "Span" });
        }
      },
    })

    $(".dirBtn").droppable({
      accept: "tr[nano-path]",
      hoverClass: "dirBtn-Hover",
      tolerance: 'pointer',
      drop: function(e, droppedItem) {
        droppedItem.draggable[0].remove();
        socket.emit('ItemEdit', {"Action": "Move", "OID": droppedItem.draggable[0].getAttribute('nano-path'), "To": e.target.getAttribute('nano-path'), "ToType": "Directory" });
      }
    })
  }
}



Directory_Route = []; // The Current Route, is whats used for the dir btns. Doesnt Store Forward
Directory_Tree = [];  // Array of Trees, Uses Last Tree, New Tree on More than 1 Step. ie: Home / dirBtn. Saves Forward/Backward
TreeNumber = 0; // Current Tree Index
TreeSteps = 0; // Current Index in Tree Index
FolderCall = true; // If Route Was Called by Clicking on a Folder

function Route_WIP(Action, Nano_Path, Text_Path) {

  if (Action == "Directory" && FolderCall == true) {
    Directory_Route.push({"Nano": Nano_Path, "Text": Text_Path})
    if (Directory_Tree.length && Directory_Tree[TreeNumber][TreeSteps + 1] != ({"Nano": Nano_Path, "Text": Text_Path})) {
      Directory_Tree = Directory_Tree.slice(0, TreeNumber + 1)
    }
    Directory_Tree[TreeNumber] = Directory_Route;
    TreeSteps++;
  }

  FolderCall = true;

  // Shortcuts
  // Refresh dupes last item;

  // Be able to drag an item into that path and have it open.
  // Have it work for locked items too. if locked stay locked.
  // Have it work for shortcuts.

  $("#directoryLocation")[0].innerHTML = " <div class='dirBtn' nano-path='"+Directory_Route[0].Nano+"' title='"+Directory_Route[0].Text+"' >"+Directory_Route[0].Text+"</div> ";
  for (i=1; i<Directory_Route.length; i++) {
    $("#directoryLocation")[0].innerHTML += "<div class='dirArrow'></div>   <div class='dirBtn' nano-path='"+Directory_Route[i].Nano+"' title='"+Directory_Route[i].Text+"' >"+Directory_Route[i].Text+"</div> ";
  }
  $(".dirBtn").last()[0].classList.add('currentDirBtn');


  // Path Buttons
  $(".dirBtn").on("click", function(e) {
    NanoPath = e.target.getAttribute("Nano-path");

    let Route_Obj = Directory_Route.find(o => o.Nano === NanoPath); // Find Index of selected Nano-Path in Directory_Route
    Directory_Route = Directory_Route.slice(0, Directory_Route.indexOf(Route_Obj) ); // Remove objects after the Index
    
    if (Directory_Tree[TreeNumber] != Directory_Route) { Directory_Tree.push(Directory_Route); TreeNumber++; TreeSteps = Directory_Route.length;}
    
    socket.emit('directoryLocation', (NanoPath));
    clientStatus("CS2", "True", 400); clientStatus("CS4", "Wait", 500);
  })


  // Forward
  $("#directoryControlForward").off();
  if (Directory_Tree[TreeNumber][TreeSteps] || Directory_Tree[TreeNumber + 1]) {
    $("#directoryControlForward")[0].classList.remove('notActive')
    $("#directoryControlForward").on("click", function(e) {
      if ( Directory_Tree[TreeNumber][TreeSteps] ) {
        Directory_Route = Directory_Tree[TreeNumber].slice(0, TreeSteps + 1);
      } else if (Directory_Tree[TreeNumber + 1]) {
        Directory_Route = Directory_Tree[TreeNumber + 1];
        TreeNumber++;
      }
      TreeSteps = Directory_Route.length;

      FolderCall = false;
      socket.emit('directoryLocation', (Directory_Tree[TreeNumber][TreeSteps - 1].Nano))
      clientStatus("CS2", "True", 400); clientStatus("CS4", "Wait", 500);
    })
  } else { $("#directoryControlForward")[0].classList.add('notActive'); }

  // Back
  $("#directoryControlBack").off();
  if ( TreeNumber > 0 || (TreeNumber == 0 && TreeSteps > 1)) {
    $("#directoryControlBack")[0].classList.remove('notActive')
    $("#directoryControlBack").on("click", function(e) {
      if ( Directory_Route.length > 1 ) {
        var callingFor = Directory_Route[Directory_Route.length - 2].Nano;
        Directory_Route = Directory_Route.slice(0, Directory_Route.length - 1 );
      } else if (Directory_Tree.length > 1) {
        Directory_Route = Directory_Tree[TreeNumber - 1];
        var callingFor = Directory_Route[Directory_Route.length - 1].Nano;
        TreeNumber--;
      } else {return;}
      
      FolderCall = false;
      TreeSteps = Directory_Route.length;
      socket.emit('directoryLocation', (callingFor))
      clientStatus("CS2", "True", 400); clientStatus("CS4", "Wait", 500);
    })
  } else { $("#directoryControlBack")[0].classList.add('notActive'); };
  
  // Home
  $("#returnToHomepage").off();
  if (JSON.stringify(Directory_Tree[TreeNumber]) !== JSON.stringify([{"Nano": "Homepage", "Text": "Homepage"}])) {
    $("#returnToHomepage")[0].classList.remove('notActive')
    $("#returnToHomepage").on("click", function() {
      Directory_Route = [];
      Directory_Tree.push(Directory_Route);

      TreeNumber++;
      TreeSteps = 1;

      NanoPath = "Homepage"; directoryPath = 'Homepage';

      socket.emit('directoryLocation', (NanoPath));
      clientStatus("CS2", "True", 400); clientStatus("CS4", "Wait", 500);
    })
  } else { $("#returnToHomepage")[0].classList.add('notActive'); }


  $("#directoryControlRefresh").off();
  $("#directoryControlRefresh").mousedown( function() {
    FolderCall = false;
    socket.emit('directoryLocation', (NanoPath));
    clientStatus("CS2", "True", 400); clientStatus("CS4", "Wait", 500);
  })
}




// Long hold over a folder opens it? So you can move files deep into folders in one go. 
// Ctrl+Z to undo Moves?
// Mayyyybeee allow you to move files into codex? 
// Scrap Path for Items, its kinda useless and just adds more problems, can be worked out on the client end anyway.
// Change up the 'share' on files to allow shorter links, also save the state of share (public / link / one time only) into the json file.
// One Time / limited time View / Share - Show Error page / image if view limit exceeded
// Change up the file information sidebar - adding notes, color choice, all times, add security, share, prevent share links.
// Loading icon for stuff. It is quick atm but might not be all the time / in the future.


// Add descriptions to files in the 'details panel'
// Details panel allows the creation of shortcuts inside other files, or in a 'related' object of another file
// Different Search types - names / in details / type / size etc




// Added Features
// Allow the ability to move files between spans on the homepage
// Complete Rework of the Directory Path System, Adding Forward / Backward / Home / Path Buttons, with multiple layers so you can get back to where you were.