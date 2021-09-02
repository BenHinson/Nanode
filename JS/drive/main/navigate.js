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
      
      Main.NodeCall({"Folder":navConfig.Directory_Tree[navConfig.Tree_Number].Route[ navConfig.Tree_Steps - 1 ].Node, "Reload": false});
    })
    navElem.navigateBackward.addEventListener('click', () => {
      if ( navConfig.Tree_Steps > navConfig.Directory_Tree[navConfig.Tree_Number].Start) {
        navConfig.Directory_Route = navConfig.Directory_Route.slice(0, navConfig.Tree_Steps - 1 );
      } else if (navConfig.Directory_Tree[navConfig.Tree_Number - 1]) {
        navConfig.Directory_Route = navConfig.Directory_Tree[navConfig.Tree_Number - 1].Route;
        navConfig.Tree_Number--;
      } else { return; }
      
      navConfig.Tree_Steps = navConfig.Directory_Route.length;
    
      Main.NodeCall({"Folder":navConfig.Directory_Route[navConfig.Tree_Steps - 1].Node, "Reload": false});
    })
  }
  DirButtons = () => {
    N_.Find('.dirBtn:not([node-id=SEARCH])', true, navElem.directoryLocation).forEach(btn => {
      btn.addEventListener('click', (e) => {
        let nodeID = e.target.getAttribute("node-id");
        let Route_Obj = navConfig.Directory_Route.find(o => o.Node === nodeID); // Find Object with Node=nodeID in navConfig.Directory_Route
        navConfig.Directory_Route = navConfig.Directory_Route.slice(0, navConfig.Directory_Route.indexOf(Route_Obj) + 1 ); // Remove objects after the Index
        
        if (JSON.stringify(navConfig.Directory_Tree[navConfig.Tree_Number].Route) !== JSON.stringify(navConfig.Directory_Route)) {
          navConfig.Tree_Number++;
          navConfig.Tree_Steps = navConfig.Directory_Route.length;
          navConfig.Directory_Tree.push({"Start":navConfig.Tree_Steps, "Route": navConfig.Directory_Route});
        }
        Main.NodeCall({"Folder":nodeID, "Reload":false});
      })
    })
  }

  // Events
  Navigate.Shortcut = async(parentID, nodeID) => {
    if (typeof RCC.RCElement !== 'undefined' && parentID == "RCElement") {
      parentID = RCC.RCElement.getAttribute('parent-node');
      nodeID = RCC.RCElement.getAttribute('node-id');
    }
    if (parentID !== nodeID) await Main.NodeCall({"Folder": parentID});
    if (nodeID) Directory.highlightNode(nodeID);
  }

  // Helper
  Navigate.ItemsPath = (Parent, Name) => {
    return Main.NodeName == 'homepage' ? `${Parent} > ${Name}` : navConfig.Directory_Route.reduce((a,b) => a + `${b.Text} > `, `` ) + Name;
  }

  // Render
  Navigate.Route = (Node_Path, Text_Path) => {
    if (Main.NodeID=='SEARCH') { // NodeName
      // ! Honestly. How tf, does one correctly implement this. Its a mess. Windows just creates its own branch, but allows you to go back into it.
      // ! Do I cache the search results? What happens if you search within a search. 'Current Directory' param defaults to homepage via this. What about opening a folder within the search. Does it get added to the branch? What happens when you press back then? Back to the search results?
      // ! A search within a search surely, just removes the previous search branch. Right? What about going through a search branch, clicking back (creating a new branch), then searching. What happens then. Does the second branch of the search get a param that says its a search branch, therefore is also removed upon search. What. A. Mess. Time for bed.
      navConfig.Tree_Steps++; // ? Works by itself. But creates dupe steps when opening a folder within a search result. ie: search > documents. Back goes to documents. then documents again (where search is, then previous folder.)
      // navConfig.Directory_Route.push({'Node': Main.NodeID, 'Text': NodeName, 'Search': true})

      // ? When opening a search directory. This Generates a new tree branch for that search. With param 'SEARCH'. You can not navigate out and back into this.
      navConfig.Directory_Route = [{'Node': Main.NodeID, 'Text': Main.NodeName}];
      navConfig.Tree_Number++;
      navConfig.Tree_Steps = navConfig.Directory_Route.length;
      navConfig.Directory_Tree.push({"Start":navConfig.Tree_Steps, "Route": navConfig.Directory_Route, 'SEARCH': true});



    } else if (Main.FolderCall == true) {
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
    Main.FolderCall = true;
  
    this.RenderDirPath();
  }
  
  RenderDirPath = () => {
    navElem.directoryLocation.innerHTML = (
      navConfig.Directory_Route.map(e =>
        `<button class='dirBtn' node-id='${e.Node}' title='${e.Text}'>${e.Text == 'homepage' ? 'Home' : N_.CapFirstLetter(e.Text)}</button>`
      ).toString().replaceAll(',', '<i></i>')
      // + (Main.NodeID == 'SEARCH' ? `<i></i> <button class='dirBtn' node-id='${Main.NodeID}' title='${NodeName}'>${NodeName}` : '') // Add if going for ONLY navConfig.Tree_Steps++; method.
    )

    navConfig.Directory_Tree[navConfig.Tree_Number].Route[navConfig.Tree_Steps] || navConfig.Directory_Tree[navConfig.Tree_Number + 1]
      ? navElem.navigateForward.classList.remove('notActive')
      : navElem.navigateForward.classList.add('notActive');
  
    navConfig.Directory_Route.length > 1 || navConfig.Directory_Tree[navConfig.Tree_Number - 1]
      ? navElem.navigateBackward.classList.remove('notActive')
      : navElem.navigateBackward.classList.add('notActive');
    
    this.DirButtons();
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

  else if (Settings.Local.layout == 0) {
    $(".ContentContainer").sortable({
      items: "div[node-id]",
    })
  }

  else if (Settings.Local.layout == 1) {
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
        new Select(e.currentTarget, true);
        return `
          <div class='listItem-Placeholder'>
            <img src='${App.NodeSelected.size > 1 ? '/assets/drive/file_icons/multiple.svg' : e.currentTarget.children[0].children[0].src}'></img>
            <h5>${App.NodeSelected.size > 1 ? 'Moving '+App.NodeSelected.size+' items' : e.currentTarget.children[1].children[0].value }</h5>
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
          Main.NodeCall({"Folder":e.target.getAttribute("node-id")});
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
  if (!App.NodeSelected.has(targetID) && targetID !== Main.NodeID && targetID) {
    Main.NodeAPI('edit', {"action": "MOVE", "section": App.Section, "id": App.NodeSelected, "to": targetID, "path": false})
    
    App.NodeSelected.forEach(itemID => N_.Find(`${type == 'table' ? 'tr' : 'div'}[node-id='${itemID}']`).remove())
    
    App.NodeSelected.clear();
    N_.Find('.listItem-Placeholder').remove();
  }
}