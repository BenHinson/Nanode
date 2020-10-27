directoryPath = "Homepage";
Directory_Tree = [];  // Array of Trees, Uses Last Tree, New Tree on More than 1 Step. ie: Home / dirBtn. Saves Forward/Backward
Directory_Route = []; // The Current Route, is whats used for the dir btns. Doesnt Store Forward
Tree_Number = 0; // Current Tree Index
Tree_Steps = 0; // Current Index in Tree
FolderCall = true; // If Route Was Called by Clicking on a Folder

pageContent = '';
NanoSelected = "";
UserSettings = {};

// List page that shows all links to 'download', 'view' or 'share' that the user has created. 'Shows size and names of contents' removal deleted item.
// centralActionMain NEEEDS a rework.
// Share on Item Information uses Icon  'location-arrow'  to send it.

// Added Features ------------------------------ October
// Drag Files and Folders into and out of directories, between Spans, and navigate through directories by hovering over folders. (List Only atm)
// Complete Rework of the Directory Path System, Adding Forward / Backward / Home / Path Buttons, with multiple layers so you can get back to where you were.
// Long hold over a folder opens it. So you can move files deep into folders in one go.
// Item information TOTAL rework. Server api support to return file object. -> drive.nanode.one/user/ x / x / x eg: codex/text/home
// Mobile Rework of navigation bar. Can now access left bar.
// Server change of time-saving. now full string. And logging more times.
// Server change of return clipped image. now accepts null.   storage/ ObjectID ?h=128&w=null. Will scale to fit.
// Now using nodemon on the server to help with restarts. bless nodemon.
// New helpfully functions on client: RGBtoHEX && Date/Time Converter.
// Calling file Information is now consistent with the sidebar. (opens side-bar is called).
// Rework and condense of the file display system. No longer two different functions for homepage and non homepage.
// New global functions: capFirstLetter (capatalize first letter), ItemImage. and Refining of ItemChecker (The Items Type).
// Dragging and Dropping Non-Files while over the client doest run the upload code that subsequently errors as its not a file.
// Along With File Information Rework, download has been reworked, improved, and code shortened. Also No longer calling user file for each item.
// Generating a link for items has been developed, with each link looking like so in the database:
//    {"_id": {"url": `the url path pointer. 16 character nanoid.`}, {"owner:" `uuid`}, {"object": `object id in users database`}, {"file": `name of item`}, {"mime": `mime-type of item`}}
// Easier Method on server end to read and write account information, reducing development time for account info related features.


// Connect to socket.io
window.socket = io.connect('https://Nanode.one');

//////////////////////////////////////////
//////////////////////////////////////////

document.addEventListener('DOMContentLoaded', function() {

  // Check for Connection
  if (socket !== undefined) {

    socket.emit('CallSettings', "Read");
    socket.emit('directoryLocation', (directoryPath))

    socket.on('connect', function() { setTimeout(function() { clientStatus("CS0", "Ok") }, 1000) })
    socket.on('connect_error', function() { clientStatus("CS0", "False"); })
    socket.on('connect_failed', function() { clientStatus("CS0", "Wait"); })
    socket.on("connection:sockid", function(sockID) { document.cookie = "sockID="+sockID+";domain=Nanode.one;secure;HttpOnly" })


    socket.on("Directory", ({Parent_Path, Contents}) => {
      clientStatus("CS3", "True", 800); clientStatus("CS7", "Wait", 400);
      if (Parent_Path != "Homepage") {directoryInfo = Contents.shift();}
      NanoID = Parent_Path; directoryPath = (NanoID == "Homepage" ? "Homepage" : directoryInfo.Name);
      pageContent = Contents;
      UserSettings.ViewT == 0 ? viewContentAsBlock(NanoID) : viewContentAsList(NanoID);
      
      uploadDirectory = NanoID == "Homepage" ? "Uploads" : directoryInfo.Name;
      uploadDirectoryLocation(NanoID, uploadDirectory);
      
      Route(NanoID, (NanoID == "Homepage" ? "Homepage" : directoryInfo.Name))
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
      displaySecurityEntry(itemSecurity);
    })
    socket.on('ItemEntryRefused', function() {
      for (i=0; i < $("div.securityContainer").length; i++) {
        $("div.securityContainer")[i].style.cssText = 'color: crimson;'
      }
    })

    socket.on('Link_Return', function(Returned) {
      clientStatus("CS3", "True", 500);
      $(".ItemInfo_Link_Input")[0].value = Returned;
      $(".ItemInfo_Link_Input").on("click", function() {
        $(".ItemInfo_Link_Input")[0].select();
        document.execCommand('copy');
      })
    });

    socket.on('UploadProgress', function(UploadProgress) {
      clientStatus("CS9", "Wait", 300);
      $("#uploadPercentage")[0].value = UploadProgress.uploadPercentage;
      if (UploadProgress.uploadPercentage == 100) {
        clientStatus("CS1", "Ok", 1000); clientStatus("CS9", "Ok", 700);
        $("#uploadPercentage")[0].value = 0;
        $("#fileBeingUploaded")[0].innerText = "";
        ToBeUploaded = [];
        uploadStatus = false;
        $(".uploadNumber")[0].innerText = "Max - 100 MB";
        $("#uploadStartStopButton")[0].innerText = "Upload";
        $("#uploadStartStopButton")[0].title = "Drag and Drop or Select Items to Upload";
        $("#uploadClearItems")[0].style.cursor = "not-allowed";
        $("#uploadClearItems")[0].style.display = "block";
      }
    })
  }
});



function clientStatus(Light, Status, Time) {
  lightColours = {"Off": "None", "True": "White", "False": "Red", "Ok": "#00ff00", "Wait": "Yellow", "User": "Cyan"};
  if (document.getElementById(Light) != undefined) {
    document.getElementById(Light).style.cssText = "background: "+lightColours[Status]+"; color:"+lightColours[Status]+";";
    if (Time) {
      setTimeout(function() {
        document.getElementById(Light).style.cssText = "background: none; color: none;";
      }, Time)
    }
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
  NanoSelected = selected.getAttribute("nano-id");
  type = selected.getAttribute("type");
  if (type == 'image') {
    displayImageLarge(selected);
  } else if (type == 'folder') {
    socket.emit('directoryLocation', (selected.getAttribute('nano-id')));
  } else if (type == 'text') {
    socket.emit('readTextContent', {"directoryPath":NanoID})
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
          let emitAction = "Move"; let Data = {"OID": droppedItem.draggable[0].getAttribute('nano-id'), "To": e.target.getAttribute('nano-id')}
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
          let emitAction = "Move"; let Data = {"OID": droppedItem.draggable[0].getAttribute('nano-id'), "To": CodexDirPath_Nano[CodexDirPath_Nano.length - 2]};
          socket.emit('Codex', {emitAction, CodexWanted, CodexPath, Data});
        }
      }
    })
  }

  else if (UserSettings.ViewT == 0) {
    $(".ContentContainer").sortable({
      items: "div[nano-id]",
    })
  }

  else if (UserSettings.ViewT == 1) {
    var hoveringOver;

    $( "tr[nano-id]" ).draggable({
      appendTo: '#databaseBackgroundMain',
      containment: "#databaseBackgroundMain",
      connectToSortable: ".ListContentTable",
      revert: true,

      refreshPositions: true,

      delay: 150,
      cursor: "move",
      tolerance: 'pointer',
      scroll: false,
      cursorAt: { top: 18, left: 20 },
      helper: function(e) {
        return $( "<div class='listItem-Placeholder' nano-id="+e.currentTarget.getAttribute('nano-id')+"><img src="+$(e.currentTarget).find('img')[0].src+" ></img>"+e.currentTarget.childNodes[3].innerText+"<h5>"+e.currentTarget.getAttribute('directory')+"</h5></div>" );
      },
    }).disableSelection();

    $("tr[type=folder]").droppable({
      accept: "tr[nano-id]",
      hoverClass: "listItem-Hover",
      tolerance: 'pointer',
      greedy: true,

      over: function(e) {
        clearTimeout(hoveringOver)
        hoveringOver = setTimeout(function() {
          socket.emit('directoryLocation', (e.target.getAttribute("nano-id")));
        }, 1500)
      },
      out : function() {
        clearTimeout(hoveringOver)
      },
      drop: function(e, droppedItem) {
        clearTimeout(hoveringOver)
        socket.emit('ItemEdit', {"Action": "Move", "OID": droppedItem.draggable[0].getAttribute('nano-id'), "To": e.target.getAttribute('nano-id'), "ToType": "Folder" });
        droppedItem.draggable[0].remove();
      },
    })

    $(".ListContentContainer").droppable({
      accept: "tr[nano-id]",
      hoverClass: "listSpan-Hover",
      tolerance: 'pointer',
      drop: function(e, droppedItem) {
        if (!e.target.contains(droppedItem.draggable[0])) {

          if (e.target.hasAttribute('home-span')) { var dirTo = e.target.getAttribute('home-span'); dirToType = "Span"; }
          else { var dirTo = NanoID; dirToType = "Folder" }

          FolderCall = false;
          socket.emit('ItemEdit', {"Action": "Move", "Path": NanoID, "OID": droppedItem.draggable[0].getAttribute('nano-id'), "To": dirTo, "ToType": dirToType });
          droppedItem.draggable[0].remove();
          $(".listItem-Placeholder")[0].remove();
        }
      },
    })

    $(".dirBtn").droppable({
      accept: "tr[nano-id]",
      hoverClass: "dirBtn-Hover",
      tolerance: 'pointer',
      drop: function(e, droppedItem) {
        if (e.target.getAttribute('nano-id') != NanoID) {

          if (e.target.getAttribute('nano-id') == "Homepage") { var dirTo = "General"; dirToType = "Span"; }
          else { var dirTo = e.target.getAttribute('nano-id'); dirToType = "Folder" }
          
          FolderCall = false;
          socket.emit('ItemEdit', {"Action": "Move", "OID": droppedItem.draggable[0].getAttribute('nano-id'), "To": dirTo, "ToType": dirToType });
          droppedItem.draggable[0].remove();
          $(".listItem-Placeholder")[0].remove();
        }
      }
    })
  }
}

function Route(Nano_Path, Text_Path) {

  if (FolderCall == true) {
    Directory_Route.push({"Nano": Nano_Path, "Text": Text_Path})
    if (Directory_Tree.length > 1 && Directory_Tree[Tree_Number].Route[Tree_Steps + 1] != ({"Nano": Nano_Path, "Text": Text_Path})) {
      Directory_Tree = Directory_Tree.slice(0, Tree_Number + 1);
    }
    if (!Directory_Tree[Tree_Number]) { Directory_Tree[Tree_Number] = {"Start": 1, "Route": []} }
    Directory_Tree[Tree_Number].Route = Directory_Route;
    Tree_Steps++;
  }

  FolderCall = true;

  $("#directoryLocation")[0].innerHTML = "<div class='dirBtn' nano-id='Homepage' title='Homepage' >Homepage</div>";
  for (i=1; i<Tree_Steps; i++) {
    $("#directoryLocation")[0].innerHTML += "<div class='dirArrow'></div>   <div class='dirBtn' nano-id='"+Directory_Route[i].Nano+"' title='"+Directory_Route[i].Text+"' >"+Directory_Route[i].Text+"</div> ";
  }
  $(".dirBtn").last()[0].classList.add('currentDirBtn');


  $(".dirBtn").on("click", function(e) {
    let NanoID = e.target.getAttribute("nano-id");
    let Route_Obj = Directory_Route.find(o => o.Nano === NanoID); // Find Object with Nano=NanoID in Directory_Route
    Directory_Route = Directory_Route.slice(0, Directory_Route.indexOf(Route_Obj) + 1 ); // Remove objects after the Index
    
    if (JSON.stringify(Directory_Tree[Tree_Number].Route) !== JSON.stringify(Directory_Route))
    {Tree_Number++;   Tree_Steps = Directory_Route.length;   Directory_Tree.push({"Start":Tree_Steps, "Route": Directory_Route});}
    
    FolderCall = false;

    socket.emit('directoryLocation', (NanoID));
    clientStatus("CS2", "True", 400); clientStatus("CS4", "Wait", 500);
  })


  if (Directory_Tree[Tree_Number].Route[Tree_Steps] || Directory_Tree[Tree_Number + 1])
  {$("#directoryControlForward")[0].classList.remove('notActive')} else {$("#directoryControlForward")[0].classList.add('notActive');}

  if (Directory_Route.length > 1 || Directory_Tree[Tree_Number - 1])
  {$("#directoryControlBack")[0].classList.remove('notActive')} else { $("#directoryControlBack")[0].classList.add('notActive');}

  if (JSON.stringify(Directory_Tree[Tree_Number].Route) !== JSON.stringify([{"Nano": "Homepage", "Text": "Homepage"}]))
  {$("#returnToHomepage")[0].classList.remove('notActive')} else { $("#returnToHomepage")[0].classList.add('notActive');}
}
