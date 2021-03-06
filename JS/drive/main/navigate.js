Navigate = () => {
  const navConfig = {
    Directory_Tree: [],  // Array of Trees, Uses Last Tree, New Tree on More than 1 Step. ie: Home / dirBtn. Saves Forward/Backward
    Directory_Route: [], // The Current Route, is whats used for the dir btns. Doesnt Store Forward
    Tree_Number: 0, // Current Tree Index
    Tree_Steps: 0, // Current Index in Tree
  }
  const navElem = {
    navigateForward: document.querySelector('.navigateForward'),
    navigateBackward: document.querySelector('.navigateBackward'),
    directoryLocation: document.querySelector('.directoryLocation'),
  }

  SetListeners_ = () => { this.NavigationArrows(); }

  // ====================================

  // Listeners
  NavigationArrows = () => {
    navElem.navigateForward.addEventListener('click', () => {
      if (navConfig.Directory_Tree[navConfig.Tree_Number].Route[navConfig.Tree_Steps]) {
        navConfig.Directory_Route = navConfig.Directory_Tree[navConfig.Tree_Number].Route.slice(0, navConfig.Tree_Steps + 1);
        navConfig.Tree_Steps = navConfig.Directory_Route.length;
      } else if (navConfig.Directory_Tree[navConfig.Tree_Number + 1]) {
        navConfig.Directory_Route = navConfig.Directory_Tree[navConfig.Tree_Number + 1].Route;
        navConfig.Tree_Number++;
        navConfig.Tree_Steps = navConfig.Directory_Tree[navConfig.Tree_Number].Start;
      } else { return; }
      
      NodeCall({"Folder":navConfig.Directory_Tree[navConfig.Tree_Number].Route[ navConfig.Tree_Steps - 1 ].Node, "Reload": false});
    })
    navElem.navigateBackward.addEventListener('click', () => {
      if ( navConfig.Tree_Steps > navConfig.Directory_Tree[navConfig.Tree_Number].Start) {
        navConfig.Directory_Route = navConfig.Directory_Route.slice(0, navConfig.Tree_Steps - 1 );
      } else if (navConfig.Directory_Tree[navConfig.Tree_Number - 1]) {
        navConfig.Directory_Route = navConfig.Directory_Tree[navConfig.Tree_Number - 1].Route;
        navConfig.Tree_Number--;
      } else { return; }
      
      navConfig.Tree_Steps = navConfig.Directory_Route.length;
    
      NodeCall({"Folder":navConfig.Directory_Route[navConfig.Tree_Steps - 1].Node, "Reload": false});
    })
  }
  DirButtons = () => {
    N_.Find('.dirBtn', true, navElem.directoryLocation).forEach(btn => {
      btn.addEventListener('click', (e) => {
        let NodeID = e.target.getAttribute("node-id");
        let Route_Obj = navConfig.Directory_Route.find(o => o.Node === NodeID); // Find Object with Node=NodeID in navConfig.Directory_Route
        navConfig.Directory_Route = navConfig.Directory_Route.slice(0, navConfig.Directory_Route.indexOf(Route_Obj) + 1 ); // Remove objects after the Index
        
        if (JSON.stringify(navConfig.Directory_Tree[navConfig.Tree_Number].Route) !== JSON.stringify(navConfig.Directory_Route))
        {navConfig.Tree_Number++;   navConfig.Tree_Steps = navConfig.Directory_Route.length;   navConfig.Directory_Tree.push({"Start":navConfig.Tree_Steps, "Route": navConfig.Directory_Route});}
      
        NodeCall({"Folder":NodeID, "Reload":false});
      })
    })
  }

  // Events
  Navigate.Shortcut = async(parentID, nodeID) => {
    if (typeof RCElement !== 'undefined' && parentID == "RCElement") {
      parentID = RCElement.getAttribute('parent-node');
      nodeID = RCElement.getAttribute('node-id');
    }
    if (parentID !== NodeID) await NodeCall({"Folder": parentID});
    if (nodeID) HighlightNode(nodeID);
  }

  // Helper
  Navigate.ItemsPath = (Parent, Name) => {
    return NodeName == 'homepage' ? `${Parent} > ${Name}` : navConfig.Directory_Route.reduce((a,b) => a + `${b.Text} > `, `` ) + Name;
  }

  // Render
  Navigate.Route = (Node_Path, Text_Path) => {
    if (FolderCall == true) {
      if (navConfig.Directory_Route.length && navConfig.Directory_Route[navConfig.Directory_Route.length - 1].Node == Node_Path) {
        // This was a return statement, but that breaks going forward into a locked folder.
      } else {
        navConfig.Directory_Route.push({"Node": Node_Path, "Text": Text_Path})
        if (navConfig.Directory_Tree.length > 1 && navConfig.Directory_Tree[navConfig.Tree_Number].Route[navConfig.Tree_Steps + 1] != ({"Node": Node_Path, "Text": Text_Path})) {
          navConfig.Directory_Tree = navConfig.Directory_Tree.slice(0, navConfig.Tree_Number + 1);
        }
        if (!navConfig.Directory_Tree[navConfig.Tree_Number]) { navConfig.Directory_Tree[navConfig.Tree_Number] = {"Start": 1, "Route": []} }
        navConfig.Directory_Tree[navConfig.Tree_Number].Route = navConfig.Directory_Route;
        navConfig.Tree_Steps++;
      }
    }
    FolderCall = true;
  
    this.RenderDirPath();

    this.DirButtons();
  }
  
  RenderDirPath = () => {
    navElem.directoryLocation.innerHTML =
    navConfig.Directory_Route.map(e => `<button class='dirBtn' node-id='${e.Node}' title='${e.Text}'>${e.Text}</button>`).toString().replaceAll(',', '<i></i>');

    navConfig.Directory_Tree[navConfig.Tree_Number].Route[navConfig.Tree_Steps] || navConfig.Directory_Tree[navConfig.Tree_Number + 1]
      ? navElem.navigateForward.classList.remove('notActive')
      : navElem.navigateForward.classList.add('notActive');
  
    navConfig.Directory_Route.length > 1 || navConfig.Directory_Tree[navConfig.Tree_Number - 1]
      ? navElem.navigateBackward.classList.remove('notActive')
      : navElem.navigateBackward.classList.add('notActive');
  }

  // ====================================

  this.SetListeners_();
}

Navigate();



// @ = Movement
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

    $("[dir-nodes] tr[node-id]").draggable({
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
            <img src='${NodeSelected.size > 1 ? '/assets/drive/file_icons/multiple.svg' : e.currentTarget.children[0].children[0].src}'></img>
            <h5>${NodeSelected.size > 1 ? 'Moving '+NodeSelected.size+' items' : e.currentTarget.children[1].children[0].value }</h5>
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

const moveToTarget = function(drop, item, type='table') {
  let targetID = drop.target.getAttribute('node-id');
  if (!NodeSelected.has(targetID) && targetID !== NodeID && targetID) {
    NodeAPI('edit', {"action": "MOVE", "section": Section, "id": NodeSelected, "to": targetID, "path": false})
    
    NodeSelected.forEach(itemID => N_.Find(`${type == 'table' ? 'tr' : 'div'}[node-id='${itemID}']`).remove())
    
    NodeSelected.clear();
    N_.Find('.listItem-Placeholder').remove();
  }
}

// @ = Click & Drag Select
const DragSelection = new SelectionArea({
  selectables: ['[dir-nodes] > tr'],
  startareas: ['.PageData', '.PageInformation'],
  // boundaries: ['.PageInformation'],
  // boundaries: ['.PageData', '.PageInformation'],
  boundaries: ['.PageData'],
  startThreshold: 10,
}).on('beforestart', ({event}) => {
  N_.Find('.main_Page').classList.add('no-select');
  return !event.target.tagName.match(/TD|INPUT|BUTTON/);
}).on('start', ({store, event}) => {
  if (!event.ctrlKey && !event.metaKey) {
    for (const el of store.stored) {
      el.classList.remove('ItemSelected');
      el.removeAttribute('selected');
      NodeSelected.delete(el.getAttribute('node-id'));
    }
    NodeSelected.clear();
    DragSelection.clearSelection();
  }
}).on('move', ({store: {changed: {added, removed}}}) => {
  for (const el of added) {
    NodeSelected.add(el.getAttribute('node-id'));
    el.setAttribute('selected', true);
    el.classList.add('ItemSelected');
  }
  for (const el of removed) {
    NodeSelected.delete(el.getAttribute('node-id'));
    el.removeAttribute('selected');
    el.classList.remove('ItemSelected');
  }
}).on('stop', () => {
  N_.Find('.main_Page').classList.remove('no-select');
  DragSelection.keepSelection();
});