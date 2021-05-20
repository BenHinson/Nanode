const navigateForward = document.querySelector('.navigateForward');
const navigateBackward = document.querySelector('.navigateBackward');
const directoryLocation = document.querySelector('.directoryLocation');

let Directory_Tree = [];  // Array of Trees, Uses Last Tree, New Tree on More than 1 Step. ie: Home / dirBtn. Saves Forward/Backward
let Directory_Route = []; // The Current Route, is whats used for the dir btns. Doesnt Store Forward
let Tree_Number = 0; // Current Tree Index
let Tree_Steps = 0; // Current Index in Tree

let FolderCall = true; // If Route Was Called by Clicking on a Folder

// ====================================
HomeCall({"Folder":NodeName});
// Send Recieve

async function HomeCall(CallData, Resp) {
  const {Folder=NodeName, Reload=true, Skip=false} = CallData;

  FolderCall = Reload;

  if (Skip === false) {
    Resp = await Directory_Call({'Folder': Folder, 'Section': 'main', 'subSection': ''})
  }

  if (Resp.Auth) { RightBar_Security_Inputs(Resp);}
  else if (Resp.Parent) {
    NodeName = Resp.Parent.id == "homepage" ? "homepage" : Resp.Parent.name;
    NodeID = Resp.Parent.id;
    NodeSelected = [];
    Directory_Content = Resp.Contents;

    Route(NodeID, NodeName);
    UserSettings.local.layout == 0 ? viewContentAsBlock(NodeID) : viewContentAsList(NodeID);
    uploadDirectory = NodeName == "homepage" ? "_GENERAL_" : NodeName;
    setupFileMove();
  }
}

refreshDirectory = () => {
  HomeCall({"Folder":NodeID, "Reload":false});
}

EditPOST = async (Form, Skip=true) => {
  // Skip Etiquette: IF Path GIVEN in Form. Skip must be TRUE or BLANK. Only False if Path NOT given, but call must happen. (IN which case... just give path..?)

  let res = await fetch('https://drive.nanode.one/edit', {
    method:'POST',
    headers: {'Content-Type': 'application/json'},
    body: new Blob( [ JSON.stringify(Form) ], { type: 'text/plain' }),
  })
  let response = await res.json();
  N_ClientStatus(2, "True", 400); N_ClientStatus(8, "Off");
  if (response.Error) { return response; }

  HomeCall({"Skip": Skip, 'Reload': false}, response);
  return {};
}

CreatePOST = async (Form) => {
  let res = await fetch('https://drive.nanode.one/create', {
    method:'POST',
    headers: {'Content-Type': 'application/json'},
    body: new Blob( [ JSON.stringify(Form) ], { type: 'text/plain' }),
  })
  let response = await res.json();
  N_ClientStatus(2, "True", 400); N_ClientStatus(8, "Off");
  if (response.Error) { return response; }

  HomeCall({'Skip':true, 'Reload': false}, response);
  return {};
}

// Navigation Buttons

navigateForward.addEventListener('click', () => {
  if (Directory_Tree[Tree_Number].Route[Tree_Steps]) {
    Directory_Route = Directory_Tree[Tree_Number].Route.slice(0, Tree_Steps + 1);
    Tree_Steps = Directory_Route.length;
  } else if (Directory_Tree[Tree_Number + 1]) {
    Directory_Route = Directory_Tree[Tree_Number + 1].Route;
    Tree_Number++;
    Tree_Steps = Directory_Tree[Tree_Number].Start;
  } else { return; }
  
  HomeCall({"Folder":Directory_Tree[Tree_Number].Route[ Tree_Steps - 1 ].Node, "Reload": false});
})

navigateBackward.addEventListener('click', () => {
  if ( Tree_Steps > Directory_Tree[Tree_Number].Start) {
    Directory_Route = Directory_Route.slice(0, Tree_Steps - 1 );
  } else if (Directory_Tree[Tree_Number - 1]) {
    Directory_Route = Directory_Tree[Tree_Number - 1].Route;
    Tree_Number--;
  } else { return; }
  
  Tree_Steps = Directory_Route.length;

  HomeCall({"Folder":Directory_Route[Tree_Steps - 1].Node, "Reload": false});
})

// Directory Path

function Route(Node_Path, Text_Path) {
  if (FolderCall == true) {
    if (Directory_Route.length && Directory_Route[Directory_Route.length - 1].Node == Node_Path) {
      // This was a return statement, but that breaks going forward into a locked folder.
    } else {
      Directory_Route.push({"Node": Node_Path, "Text": Text_Path})
      if (Directory_Tree.length > 1 && Directory_Tree[Tree_Number].Route[Tree_Steps + 1] != ({"Node": Node_Path, "Text": Text_Path})) {
        Directory_Tree = Directory_Tree.slice(0, Tree_Number + 1);
      }
      if (!Directory_Tree[Tree_Number]) { Directory_Tree[Tree_Number] = {"Start": 1, "Route": []} }
      Directory_Tree[Tree_Number].Route = Directory_Route;
      Tree_Steps++;
    }
  }

  FolderCall = true;

  $(directoryLocation)[0].innerHTML = "<div class='dirBtn' node-id='homepage' title='homepage'>homepage</div>";
  for (i=1; i<Tree_Steps; i++) {
    $(directoryLocation)[0].innerHTML += "<div class='dirArrow'></div>   <div class='dirBtn' node-id='"+Directory_Route[i].Node+"' title='"+Directory_Route[i].Text+"' >"+Directory_Route[i].Text+"</div> ";
  }
  $(".dirBtn").last()[0].classList.add('currentDirBtn');


  $(".dirBtn").on("click", function(e) {
    let NodeID = e.target.getAttribute("node-id");
    let Route_Obj = Directory_Route.find(o => o.Node === NodeID); // Find Object with Node=NodeID in Directory_Route
    Directory_Route = Directory_Route.slice(0, Directory_Route.indexOf(Route_Obj) + 1 ); // Remove objects after the Index
    
    if (JSON.stringify(Directory_Tree[Tree_Number].Route) !== JSON.stringify(Directory_Route))
    {Tree_Number++;   Tree_Steps = Directory_Route.length;   Directory_Tree.push({"Start":Tree_Steps, "Route": Directory_Route});}

    HomeCall({"Folder":NodeID, "Reload":false});
  })


  if (Directory_Tree[Tree_Number].Route[Tree_Steps] || Directory_Tree[Tree_Number + 1])
  {$(navigateForward)[0].classList.remove('notActive')} else {$(navigateForward)[0].classList.add('notActive');}

  if (Directory_Route.length > 1 || Directory_Tree[Tree_Number - 1])
  {$(navigateBackward)[0].classList.remove('notActive')} else { $(navigateBackward)[0].classList.add('notActive');}

  // if (JSON.stringify(Directory_Tree[Tree_Number].Route) !== JSON.stringify([{"Node": "homepage", "Text": "homepage"}]))
  // {$("#returnTohomepage")[0].classList.remove('notActive')} else { $("#returnTohomepage")[0].classList.add('notActive');}
}

// Movement

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
            let target = $(this).data('pos');
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
          let emitAction = "Move"; let Data = {"OID": droppedItem.draggable[0].getAttribute('node-id'), "To": e.target.getAttribute('node-id')}
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
          let emitAction = "Move"; let Data = {"OID": droppedItem.draggable[0].getAttribute('node-id'), "To": CodexDirPath_Node[CodexDirPath_Node.length - 2]};
          socket.emit('Codex', {emitAction, CodexWanted, CodexPath, Data});
        }
      }
    })
  }

  else if (UserSettings.local.layout == 0) {
    $(".ContentContainer").sortable({
      items: "div[node-id]",
    })
  }

  else if (UserSettings.local.layout == 1) {
    let hoveringOver;

    $("tr[node-id]").draggable({
      appendTo: '.homePageContainer',
      containment: ".homePageContainer",
      connectToSortable: ".ListContentTable",
      revert: true,

      refreshPositions: true,

      delay: 150,
      cursor: "move",
      tolerance: 'pointer',
      scroll: false,
      cursorAt: { top: 18, left: 20 },
      helper: function(e) {
        return $( "<div class='listItem-Placeholder' node-id="+e.currentTarget.getAttribute('node-id')+"><img src="+$(e.currentTarget).find('img')[0].src+"></img><h5>"+$(e.currentTarget).find('input')[0].value+"</h5></div>" );
      },
    }).disableSelection();

    $("tr[type=folder]").droppable({
      accept: "tr[node-id]",
      hoverClass: "listItem-Hover",
      tolerance: 'pointer',
      greedy: true,

      over: function(e) {
        e.target.classList.add('listItem-Hover');
        clearTimeout(hoveringOver)
        hoveringOver = setTimeout(function() {
          HomeCall({"Folder":e.target.getAttribute("node-id")});
        }, 2000)
      },
      out : function(e) {
        e.target.classList.remove('listItem-Hover');
        clearTimeout(hoveringOver)
      },
      drop: function(e, droppedItem) {
        clearTimeout(hoveringOver);
        EditPOST({"action": "MOVE", "section": Section, "id": droppedItem.draggable[0].getAttribute('node-id'), "to": e.target.getAttribute('node-id')}, false)
        removeDroppedListItem(droppedItem);
      },
    })

    $(".ListContentContainer").droppable({
      accept: "tr[node-id]",
      hoverClass: "listSpan-Hover",
      tolerance: 'pointer',
      drop: function(e, droppedItem) {
        if (!e.target.contains(droppedItem.draggable[0])) {
          EditPOST({"action": "MOVE", "section": Section, "id": droppedItem.draggable[0].getAttribute('node-id'), "to": e.target.getAttribute('node-id'), "path": NodeID});
          removeDroppedListItem(droppedItem);
        }
      },
    })

    $(".dirBtn").droppable({
      accept: "tr[node-id]",
      hoverClass: "dirBtn-Hover",
      tolerance: 'pointer',
      drop: function(e, droppedItem) {
        if (e.target.getAttribute('node-id') != NodeID) {
          EditPOST({"action": "MOVE", "section": Section, "id": droppedItem.draggable[0].getAttribute('node-id'), "to": e.target.getAttribute('node-id'), "path": NodeID})
          removeDroppedListItem(droppedItem);
        }
      }
    })

    let removeDroppedListItem = function(droppedItem) {
      droppedItem.draggable[0].remove();
      document.querySelector('.listItem-Placeholder').remove();
    }
  }
}