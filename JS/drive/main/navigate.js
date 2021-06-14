const navigateForward = document.querySelector('.navigateForward');
const navigateBackward = document.querySelector('.navigateBackward');
const directoryLocation = document.querySelector('.directoryLocation');


let Directory_Tree = [];  // Array of Trees, Uses Last Tree, New Tree on More than 1 Step. ie: Home / dirBtn. Saves Forward/Backward
let Directory_Route = []; // The Current Route, is whats used for the dir btns. Doesnt Store Forward
let Tree_Number = 0; // Current Tree Index
let Tree_Steps = 0; // Current Index in Tree

// ====================================

// @ = Shortcut Request
async function Shortcut(selected) {
  if (typeof RCElement !== 'undefined' && selected == "RCElement") {selected = RCElement}
  await NodeCall({"Folder":selected.getAttribute('parent-node')});
  HighlightNode(selected.getAttribute('node-id'));
}


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


  let contents = '';
  for (i=0; i<Tree_Steps; i++) { // Iterates through the steps, doesn't place an arrow before 'homepage'
    contents += `
      ${i!=0 ? '<i></i>' : ''}
      <button class='dirBtn ${i==Tree_Steps-1 ? "currentDirBtn" : ""}' node-id='${Directory_Route[i].Node}' title='${Directory_Route[i].Text}'>${Directory_Route[i].Text}</button>
    `;
  }
  directoryLocation.innerHTML = contents;


  N_Find('.dirBtn', true, directoryLocation).forEach(btn => {
    btn.addEventListener('click', (e) => {
      let NodeID = e.target.getAttribute("node-id");
      let Route_Obj = Directory_Route.find(o => o.Node === NodeID); // Find Object with Node=NodeID in Directory_Route
      Directory_Route = Directory_Route.slice(0, Directory_Route.indexOf(Route_Obj) + 1 ); // Remove objects after the Index
      
      if (JSON.stringify(Directory_Tree[Tree_Number].Route) !== JSON.stringify(Directory_Route))
      {Tree_Number++;   Tree_Steps = Directory_Route.length;   Directory_Tree.push({"Start":Tree_Steps, "Route": Directory_Route});}
    
      NodeCall({"Folder":NodeID, "Reload":false});
    })
  })

  Directory_Tree[Tree_Number].Route[Tree_Steps] || Directory_Tree[Tree_Number + 1]
    ? navigateForward.classList.remove('notActive')
    : navigateForward.classList.add('notActive');

  Directory_Route.length > 1 || Directory_Tree[Tree_Number - 1]
    ? navigateBackward.classList.remove('notActive')
    : navigateBackward.classList.add('notActive');
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
  
  NodeCall({"Folder":Directory_Tree[Tree_Number].Route[ Tree_Steps - 1 ].Node, "Reload": false});
})
navigateBackward.addEventListener('click', () => {
  if ( Tree_Steps > Directory_Tree[Tree_Number].Start) {
    Directory_Route = Directory_Route.slice(0, Tree_Steps - 1 );
  } else if (Directory_Tree[Tree_Number - 1]) {
    Directory_Route = Directory_Tree[Tree_Number - 1].Route;
    Tree_Number--;
  } else { return; }
  
  Tree_Steps = Directory_Route.length;

  NodeCall({"Folder":Directory_Route[Tree_Steps - 1].Node, "Reload": false});
})


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

    $("tbody tr[node-id]").draggable({
      appendTo: '.homePageContainer',
      containment: '.homePageContainer',
      connectToSortable: '.ListContentTable',
      revert: true,

      refreshPositions: true,

      delay: 150,
      cursor: 'move',
      tolerance: 'pointer',
      scroll: false,
      cursorAt: { top: 18, left: 20 },
      helper: function(e) {
        SelectItem(e.currentTarget, true);
        return `
          <div class='listItem-Placeholder'>
            <img src='${NodeSelected.length > 1 ? '/assets/drive/file_icons/multiple.svg' : e.currentTarget.children[0].children[0].src}'></img>
            <h5>${NodeSelected.length > 1 ? 'Moving '+NodeSelected.length+' items' : e.currentTarget.children[1].children[0].value }</h5>
          </div>
        `;
      },
    }).disableSelection();

    $("tr[type=folder]").droppable({
      accept: "tr[node-id]",
      hoverClass: "listItem-Hover FiveSecLoad",
      tolerance: 'pointer',
      greedy: true,

      over: function(e) {
        clearTimeout(hoveringOver)
        hoveringOver = setTimeout(function() {
          NodeCall({"Folder":e.target.getAttribute("node-id")});
        }, 2500)
      },
      out : function(e) {
        e.target.classList.remove('listItem-Hover', 'FiveSecLoad');
        clearTimeout(hoveringOver)
      },
      drop: function(e, droppedItem) {
        clearTimeout(hoveringOver);
        moveToTarget(e, droppedItem);
      },
    })

    $(".baseFolders > div").droppable({
      accept: "tr[node-id]",
      hoverClass: "baseFolder-Hover",
      tolerance: 'pointer',
      drop: moveToTarget,
    })

    $("thead").droppable({
      accept: "tr[node-id]",
      hoverClass: "listSpan-Hover",
      tolerance: 'pointer',
      drop: moveToTarget,
    })

    $(".dirBtn").droppable({
      accept: "tr[node-id]",
      hoverClass: "dirBtn-Hover",
      tolerance: 'pointer',
      drop: moveToTarget,
    })

  }
}

let moveToTarget = function(drop, item, type='table') {
  let targetID = drop.target.getAttribute('node-id');
  if (!NodeSelected.includes(targetID) && targetID !== NodeID && targetID) {
    NodeAPI('edit', {"action": "MOVE", "section": Section, "id": NodeSelected, "to": targetID, "path": false})
    
    NodeSelected.forEach(itemID => {
      N_Find(`${type == 'table' ? 'tr' : 'div'}[node-id='${itemID}']`).remove();
    })
    
    NodeSelected = [];
    N_Find('.listItem-Placeholder').remove();
  }
}