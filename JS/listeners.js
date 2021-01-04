$("#directoryControlForward").on("click", function() {
  if ( Directory_Tree[Tree_Number].Route[Tree_Steps] ) {
    Directory_Route = Directory_Tree[Tree_Number].Route.slice(0, Tree_Steps + 1);
    Tree_Steps = Directory_Route.length;
  } else if (Directory_Tree[Tree_Number + 1]) {
    Directory_Route = Directory_Tree[Tree_Number + 1].Route;
    Tree_Number++;
    Tree_Steps = Directory_Tree[Tree_Number].Start;
  } else { return; }
  
  Directory_Call(Directory_Tree[Tree_Number].Route[ Tree_Steps - 1 ].Nano, false)
})

$("#directoryControlBack").on("click", function(e) {
  if ( Tree_Steps > Directory_Tree[Tree_Number].Start) {
    Directory_Route = Directory_Route.slice(0, Tree_Steps - 1 );
  } else if (Directory_Tree[Tree_Number - 1]) {
    Directory_Route = Directory_Tree[Tree_Number - 1].Route;
    Tree_Number--;
  } else { return; }
  
  Tree_Steps = Directory_Route.length;

  Directory_Call(Directory_Route[Tree_Steps - 1].Nano, false)
})

$(".toggleDetailsBtn").on("click", function() {
  let currDetails = displayDetails();
  currDetails = !currDetails;
  localStorage.setItem('displayDetails', currDetails);
  currDetails == true ? $(".toggleDetailsBtn").css({"text-align": "left", "color":UserSettings["HighL"]}) : $(".toggleDetailsBtn").css({"text-align": "right", "color":"#5b5b5f"});
})

$(".New").on("click", function() {
  if (document.getElementsByClassName('NewOptions')[0]) { document.getElementsByClassName('NewOptions')[0].remove(); return; }
  $(".ItemInformation").before( `<span class='NewOptions'> <div id='uploadBtn' style='background:linear-gradient(40deg, #2993d8, #203ed3)'><i class='fas fa-cloud-upload-alt'></i>Upload</div> <div id='folderBtn' style='background:linear-gradient(40deg, #ddaa1f, #b35632)'><i class='fas fa-folder-plus'></i>Folder</div> </span>` )

  document.getElementById('uploadBtn').addEventListener("click", function() { PopUp_Upload() });
  document.getElementById('folderBtn').addEventListener("click", function() { PopUp_New_Folder() });
})

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////


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

function ItemClickListener(View) {
  let Items = (View == 0 ? document.querySelectorAll('div[nano-id]') : document.querySelectorAll('tr[nano-id]'))
  $(Items).on("click", function(selected) {

    selected = selected.currentTarget;

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

    if (!selected.classList.contains('noOpen')) {
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

  })
}

function ItemActions(selected) {
  if (!selected && RCElement) { selected = RCElement }
  NanoSelected = selected.getAttribute("nano-id");
  type = selected.getAttribute("type");

  if (type == "folder") { Directory_Call(selected.getAttribute('nano-id')); }
  else if (type.match(/image|text|video/g)) { ViewItem(type, NanoSelected) }
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
          Directory_Call(e.target.getAttribute("nano-id"));
        }, 1500)
      },
      out : function() {
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
          socket.emit('ItemEdit', { "action": "MOVE", "section": Section, "ID": droppedItem.draggable[0].getAttribute('nano-id'), "To": e.target.getAttribute('nano-id'), "Path": NanoID });
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

          if (e.target.getAttribute('nano-id') == "homepage") { var dirTo = "General"; dirToType = "Span"; }
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
    if (Directory_Route.length && Directory_Route[Directory_Route.length - 1].Nano == Nano_Path) { return; }
    Directory_Route.push({"Nano": Nano_Path, "Text": Text_Path})
    if (Directory_Tree.length > 1 && Directory_Tree[Tree_Number].Route[Tree_Steps + 1] != ({"Nano": Nano_Path, "Text": Text_Path})) {
      Directory_Tree = Directory_Tree.slice(0, Tree_Number + 1);
    }
    if (!Directory_Tree[Tree_Number]) { Directory_Tree[Tree_Number] = {"Start": 1, "Route": []} }
    Directory_Tree[Tree_Number].Route = Directory_Route;
    Tree_Steps++;
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

    Directory_Call(NanoID, false);
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


function refreshDirectory() {
  Directory_Call(NanoID, false);
}

function collapseSpan(span, expand=false) {
  span = span ? span.parentNode.parentNode.parentNode : RCElement;
  let rows = span.querySelectorAll('tr');

  for (let i=0; i<rows.length; i++) {
    if (i === 0) {
      expand = rows[0].hasAttribute('collapsed') ? true : false;
      rows[i].children[2].innerText = (expand == true ? "Type" : "");
      rows[i].children[3].innerText = (expand == true ? "Modified" : "");
      rows[i].children[4].innerHTML = (expand == true ? "Size" : `<button class='expandBtn' onclick='collapseSpan(this, true)'>Expand</button>`);
      expand == true ? rows[0].removeAttribute('collapsed') : rows[i].setAttribute('collapsed', true)
    } else {
      rows[i].style.cssText = (expand == true ? "visibility: visible; display: table-row;" : "visibility: collapse; display: none;")
    }
  }

}

function createLocation() {
  return  NanoName == "homepage" ? `value='Uploads'><p>Uploads</p><i class="fas fa-angle-down"></i><div class='Popup_Dropdown_Content'>${spanList()}</div>` : `value='${NanoID}'><p>Current</p>`;
  function spanList() { let HTML_Spans = ""; for (i=0; i<Directory_Content.length; i++) { HTML_Spans += `<a>${Directory_Content[i].Parent}</a>` }; return HTML_Spans; }
}

function renameItem(e) { // Features in Right-Click
  if (e && e.target.getAttribute) { 
    var targetID = ItemNanoID; var nameInput = e.target;
    e.target.style.background = 'rgba(0,0,0,0.1)';
  } else if (RCElement) { 
    var targetID = RCElement.getAttribute('nano-id');
    var nameInput = UserSettings.ViewT == 0 ? RCElement.children[0] : RCElement.children[1];
    UserSettings.ViewT == 0 ? nameInput.classList.add("FolderNameEdit") : nameInput.style.cssText = "font-size: 16px; border-bottom: 1px solid #666;";
    nameInput.setAttribute('contenteditable', "true");
    nameInput.parentNode.classList.add("noHover", "noOpen");
  }
  currentItemName = nameInput.innerText;

  $(nameInput).keypress(function(e){ if (e.keyCode == 13) { e.preventDefault(); } })

  setTimeout(function() {
    $(document).on("click", function(element) {
      if (element.target != nameInput) {
        $(document).off("click");
        nameInput.style.cssText = '';
        if (typeof RCElement !== 'undefined' && RCElement) { if (nameInput.tagName != 'H3') {nameInput.removeAttribute('contenteditable');} nameInput.classList.remove("FolderNameEdit"); nameInput.parentNode.classList.remove("noHover", "noOpen");}
        if (nameInput.innerText != currentItemName && nameInput.innerText.length > 1) {
          let EditData = {"Name": {"Cur": nameInput.innerText}}
          socket.emit('ItemEdit', {"Action": "Edit", "Item": "FileFolder", "ID": targetID, "Path": NanoID, EditData})
        } else {
          nameInput.innerText = currentItemName;
        }
      }
    });
  }, 20)
}