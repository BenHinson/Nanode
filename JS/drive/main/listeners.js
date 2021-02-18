$("#directoryControlForward").on("click", function() {
  if ( Directory_Tree[Tree_Number].Route[Tree_Steps] ) {
    Directory_Route = Directory_Tree[Tree_Number].Route.slice(0, Tree_Steps + 1);
    Tree_Steps = Directory_Route.length;
  } else if (Directory_Tree[Tree_Number + 1]) {
    Directory_Route = Directory_Tree[Tree_Number + 1].Route;
    Tree_Number++;
    Tree_Steps = Directory_Tree[Tree_Number].Start;
  } else { return; }
  
  HomeCall({"Folder":Directory_Tree[Tree_Number].Route[ Tree_Steps - 1 ].Nano, "Reload": false});
})

$("#directoryControlBack").on("click", function(e) {
  if ( Tree_Steps > Directory_Tree[Tree_Number].Start) {
    Directory_Route = Directory_Route.slice(0, Tree_Steps - 1 );
  } else if (Directory_Tree[Tree_Number - 1]) {
    Directory_Route = Directory_Tree[Tree_Number - 1].Route;
    Tree_Number--;
  } else { return; }
  
  Tree_Steps = Directory_Route.length;

  HomeCall({"Folder":Directory_Route[Tree_Steps - 1].Nano, "Reload": false});
})

$(".New").on("click", function() {
  if (document.getElementsByClassName('NewOptions')[0]) { document.getElementsByClassName('NewOptions')[0].remove(); return; }
  $(".ItemInformation").before( `<span class='NewOptions'> <div id='uploadBtn' style='background:linear-gradient(40deg, #2993d8, #203ed3)'><i class='fas fa-cloud-upload-alt'></i>Upload</div> <div id='folderBtn' style='background:linear-gradient(40deg, #ddaa1f, #b35632)'><i class='fas fa-folder-plus'></i>Folder</div> </span>` )

  document.getElementById('uploadBtn').addEventListener("click", function() { PopUp_Upload() });
  document.getElementById('folderBtn').addEventListener("click", function() { PopUp_New_Folder() });
})

$(".Switch.SW_View").on("click", function() {
 ChangeView();
})

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

function ItemClickListener(View) {
  let Items = (View == 0 ? fileContainer.querySelectorAll('div[nano-id]:not([home-span]):not([Sub-Span])') : fileContainer.querySelectorAll('tr[nano-id]'));

  $(Items).on("click", function(selected) {
    if (selected.currentTarget.hasAttribute('focus')) { return; }
    selected = selected.currentTarget;

    if (keyMap["Shift"] == true || keyMap["Control"] == true) { SelectItem(selected); return; }

    if (!selected.classList.contains('noOpen')) {
      ItemActions(selected);
      clientStatus("CS5", "Ok", 500);
    }
  })
}

function SelectItem(item, force) {
  if (!item) {return;}
  $(document.body).off("click");


  if (item.hasAttribute('selected') && !force) { // Remove from Selected
    item.removeAttribute('selected');
    item.classList.remove('ItemSelected');
    NanoSelected = NanoSelected.filter(id => id !== item.getAttribute('nano-id'));
  } else if (item.hasAttribute('nano-id')) { // Add to Selected
    item.setAttribute('selected', true);
    item.classList.add('ItemSelected');
    NanoSelected.includes(item.getAttribute('nano-id')) ? '' : NanoSelected.push(item.getAttribute('nano-id'));
  }

  if (NanoSelected.length) { // Add Listener to Document for Off-Clicks
    setTimeout(function() {
      $(document.body).on("click",function(e) {
        if (!$(e.target).parents('.fileContainer').length && !$(e.target).parents('.RightClickContainer').length) {
          NanoSelected = [];
          $('[selected=true]').each((index, item) => {
            $(item).removeAttr('selected');
            $(item).removeClass('ItemSelected');
          })
          $(document.body).off("click");
        }
      });
    }, 20)
  }
}

function ItemActions(selected) {
  if (!selected && RCElement) { selected = RCElement }

  let clicked = selected.getAttribute("nano-id");
  let type = selected.getAttribute("type");

  if (type == "folder") { HomeCall({"Folder":selected.getAttribute('nano-id')}); }
  else if (type.match(/image|text|video/g)) { ViewItem(type, clicked) }
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
    let hoveringOver;

    $("tr[nano-id]").draggable({
      appendTo: '.PageContainer',
      containment: ".PageContainer",
      connectToSortable: ".ListContentTable",
      revert: true,

      refreshPositions: true,

      delay: 150,
      cursor: "move",
      tolerance: 'pointer',
      scroll: false,
      cursorAt: { top: 18, left: 20 },
      helper: function(e) {
        return $( "<div class='listItem-Placeholder' nano-id="+e.currentTarget.getAttribute('nano-id')+"><img src="+$(e.currentTarget).find('img')[0].src+"></img><h5>"+$(e.currentTarget).find('input')[0].value+"</h5></div>" );
      },
    }).disableSelection();

    $("tr[type=folder]").droppable({
      accept: "tr[nano-id]",
      hoverClass: "listItem-Hover",
      tolerance: 'pointer',
      greedy: true,

      over: function(e) {
        e.target.classList.add('listItem-Hover');
        clearTimeout(hoveringOver)
        hoveringOver = setTimeout(function() {
          HomeCall({"Folder":e.target.getAttribute("nano-id")});
        }, 2000)
      },
      out : function(e) {
        e.target.classList.remove('listItem-Hover');
        clearTimeout(hoveringOver)
      },
      drop: function(e, droppedItem) {
        clearTimeout(hoveringOver)
        socket.emit('ItemEdit', { "action": "MOVE", "section": Section, "ID": droppedItem.draggable[0].getAttribute('nano-id'), "To": e.target.getAttribute('nano-id') });
        droppedItem.draggable[0].remove();
      },
    })

    $(".ListContentContainer").droppable({
      accept: "tr[nano-id]",
      hoverClass: "listSpan-Hover",
      tolerance: 'pointer',
      drop: function(e, droppedItem) {
        if (!e.target.contains(droppedItem.draggable[0])) {
          FolderCall = false;
          socket.emit('ItemEdit', {"action": "MOVE", "section": Section, "ID": droppedItem.draggable[0].getAttribute('nano-id'), "To": e.target.getAttribute('nano-id'), "Path": NanoID});
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
          FolderCall = false;
          socket.emit('ItemEdit', {"action": "MOVE", "section": Section, "ID": droppedItem.draggable[0].getAttribute('nano-id'), "To": e.target.getAttribute('nano-id'), "Path": NanoID});
          droppedItem.draggable[0].remove();
          $(".listItem-Placeholder")[0].remove();
        }
      }
    })
  }
}

function Route(Nano_Path, Text_Path) {  
  if (FolderCall == true) {
    if (Directory_Route.length && Directory_Route[Directory_Route.length - 1].Nano == Nano_Path) { // This was a return statement, but that breaks going forward into a locked folder.
    } else {
      Directory_Route.push({"Nano": Nano_Path, "Text": Text_Path})
      if (Directory_Tree.length > 1 && Directory_Tree[Tree_Number].Route[Tree_Steps + 1] != ({"Nano": Nano_Path, "Text": Text_Path})) {
        Directory_Tree = Directory_Tree.slice(0, Tree_Number + 1);
      }
      if (!Directory_Tree[Tree_Number]) { Directory_Tree[Tree_Number] = {"Start": 1, "Route": []} }
      Directory_Tree[Tree_Number].Route = Directory_Route;
      Tree_Steps++;
    }
  }

  FolderCall = true;

  $("#directoryLocation")[0].innerHTML = "<div class='dirBtn' nano-id='homepage' title='homepage'>homepage</div>";
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

    HomeCall({"Folder":NanoID, "Reload":false});
  })


  if (Directory_Tree[Tree_Number].Route[Tree_Steps] || Directory_Tree[Tree_Number + 1])
  {$("#directoryControlForward")[0].classList.remove('notActive')} else {$("#directoryControlForward")[0].classList.add('notActive');}

  if (Directory_Route.length > 1 || Directory_Tree[Tree_Number - 1])
  {$("#directoryControlBack")[0].classList.remove('notActive')} else { $("#directoryControlBack")[0].classList.add('notActive');}

  // if (JSON.stringify(Directory_Tree[Tree_Number].Route) !== JSON.stringify([{"Nano": "homepage", "Text": "homepage"}]))
  // {$("#returnTohomepage")[0].classList.remove('notActive')} else { $("#returnTohomepage")[0].classList.add('notActive');}
}

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

function ChangeView() {
  let ListView = Boolean(UserSettings.ViewT); // 0=false, 1+ = true
  UserSettings.ViewT = ListView ? 0 : 1; // Inverts ViewT
  document.querySelector('.Slider.SL_View').style.transform = `translateX(${ListView ? 28 : 0}px)`;
  HomeCall({"Folder":NanoID, "Reload":false});
}

function refreshDirectory() {
  HomeCall({"Folder":NanoID, "Reload":false});
}

function collapseSpan(span, expand=false) {
  span = span ? (UserSettings.ViewT == 0 ? span.parentNode : span.parentNode.parentNode.parentNode) : RCElement;
  if (UserSettings.ViewT == 0) {
    expand = span.hasAttribute('collapsed') ? true : false;
    expand == true ? span.removeAttribute('collapsed') : span.setAttribute('collapsed', true)
    expand ? span.querySelector('button').remove() : span.innerHTML += `<button class='ExpandSpan VT_Block' onclick='collapseSpan(this, true)'>Expand</button>`

    let blocks = span.querySelectorAll('div');
    for (let i=0; i<blocks.length; i++) {
      blocks[i].style.cssText = (expand == true ? '' : 'visibility: collapse; display: none;');
    }

  } else {
    let rows = span.querySelectorAll('tr');
  
    for (let i=0; i<rows.length; i++) {
      if (i === 0) {
        expand = rows[0].hasAttribute('collapsed') ? true : false;
        rows[i].children[2].innerText = (expand == true ? "Type" : "");
        rows[i].children[3].innerText = (expand == true ? "Modified" : "");
        rows[i].children[4].innerHTML = (expand == true ? "Size" : `<button class='ExpandSpan' onclick='collapseSpan(this, true)'>Expand</button>`);
        expand == true ? rows[0].removeAttribute('collapsed') : rows[i].setAttribute('collapsed', true)
      } else {
        rows[i].style.cssText = (expand == true ? "visibility: visible; display: table-row;" : "visibility: collapse; display: none;")
      }
    }
  }
}

function createLocation() {
  return  NanoName == "homepage" 
    ? `value='_GENERAL_'><p>General</p><i class="fas fa-angle-down"></i><div class='Popup_Dropdown_Content'>${spanList()}</div>`
    : `value='${NanoID}'><p>Current</p>`;
  function spanList() { let HTML_Spans = ""; for (let [id,data] of Object.entries(Directory_Content)) { HTML_Spans += `<a value='${id}'>${data.name}</a>` }; return HTML_Spans; }
}

function renameItem(e) {
  let focusedElement = RCElement;

  let renameItemsID = focusedElement.getAttribute('nano-id');
  
  let targetInput = $(focusedElement).find('input')[0] || $(focusedElement).find('textarea')[0];
  focusedElement.setAttribute('focus', "true")
  targetInput.removeAttribute('disabled');
  targetInput.style = '';
  targetInput.focus();
  targetInput.select();

  targetInput.addEventListener('input', function(e) {
    this.value = this.value.replace(/\n/g,'')
  });

  targetInput.addEventListener('change', function() {
    ReturnItemState();
    socket.emit('ItemEdit', {"action": "DATA", "section": Section, "ID": renameItemsID, "EditData": {"name": targetInput.value}, "Path": NanoID} )
  });

  setTimeout(function() {
    $(document).on('click', function(e) {
      if (e.target != targetInput) { ReturnItemState(); }
    })
  }, 50);

  ReturnItemState = function() {
    $(document).off();
    focusedElement.removeAttribute('focus');
    targetInput.setAttribute('disabled', 'false');
    targetInput.style = 'pointer-events:none;'
  }
}