// HTML with attribute of 'rc-name' |  right-click-name of the object  |  rc-name="centralContentBox"

// FOR ISSUE RELATING TO THE LARGE GAP ON SUB PAGES. REMOVE FLEX-BOX AND -WEBKIT-BOX FOR THE FILE CONTAINER (warning... Fucks homepage. Need to add special case for this. reee)

RightClickObjectMenu = {
  "File_Container" : {
    "New Folder": [{"Command": "displayCentralActionMain", 'Var1':'New Folder', 'Var2':'Create'}], 
    "New File": [{"Command": "displayCentralActionMain", 'Var1':'New File', 'Var2':'Create'}], 
    "Refresh": [{"Command": "directoryRefresh"}],
    "Nano_SPLIT_1": "", 
    "RC_VAR_Details": [{"Command": "displayItemInformation"}],
    "RC_VAR_Switch_View": [{"Command": "toggleContentView"}], 
    "Change Theme": [{'Command':'changeTheme'}],
    "Nano_SPLIT_2": "", 
    "Upload": [{"Command": "displayUploadDownloadOverlay", 'Var1':'Upload'}],
  },
  "Homepage_Span" : {
    "Rename": [{"Command": "renameSpan"}], 
    "RC_VAR_Collapse": [{"Command": "collapseSpan"}],
    "Nano_SPLIT_1": "", 
    "Delete": [{"Command": "displayConfirmCancelBox", "Var1": "Delete", "Var2": "Are you Sure?", "Var3": "Delete", "Var4": "Cancel", "Var5": "Deletion of Individual Files will be sent to the Bin.<br>Folders, Spans and their content <u>cannot</u> be reclaimed."}]
  },
  "Nano_Folder" : {
    "Open": [{"Command": "ItemActions"}],
    "View Details": [{"Command": "callItemInformation", "Var1": "RCElement"}],
    "Security": "",
    "Nano_SPLIT_1": "",
    "Move To": "",
    "Create Shotcut": "",
    "Nano_SPLIT_2": "",
    "Change Colour": [{"Command": "displayColorPicker", "Var1": "RC"}],
    "Rename": [{"Command": "renameItem"}],
    "Delete": [{"Command": "displayConfirmCancelBox", "Var1": "Delete", "Var2": "Are you Sure?", "Var3": "Delete", "Var4": "Cancel", "Var5": "Deletion of Individual Files will be sent to the Bin<br>Folders and Spans <u>cannot</u> be reclaimed"}],
    "Nano_SPLIT_3": "",
    "Download": [{"Command": "displayUploadDownloadOverlay", "Var1": "Download", "Var2": "ContextMenu"}],
  },
  "Nano_File" : {
    "Open": [{"Command": "ItemActions"}],
    "View Details": [{"Command": "callItemInformation", "Var1": "RCElement"}],
    "Security": "",
    "Nano_SPLIT_1": "",
    "Copy To": "",
    "Move To": "",
    "Create Shotcut": "",
    "Nano_SPLIT_2": "",
    "Change Colour": [{"Command": "displayColorPicker", "Var1": "RC"}],
    "Rename": [{"Command": "renameItem"}],
    "Delete": [{"Command": "displayConfirmCancelBox", "Var1": "Delete", "Var2": "Are you Sure?", "Var3": "Delete", "Var4": "Cancel", "Var5": "Deletion of Individual Files will be sent to the Bin<br>Folders and Spans <u>cannot</u> be reclaimed"}],
    "Nano_SPLIT_3": "",
    "Share": "",
    "Download": [{"Command": "displayUploadDownloadOverlay", "Var1": "Download", "Var2": "ContextMenu"}],
  },

  "Codex_Item" : {
    "Open": [{"Command": "codexItemAction", "Var1": "Click", "Var2": "RCElement"}],
    "Rename": [{"Command": "codexItemAction", "Var1": "Rename", "Var2": "RCElement"}],
    "Delete" : [{"Command": "codexItemAction", "Var1": "Delete", "Var2": "RCElement"}]
  }
}

document.addEventListener("contextmenu", function(e) {

  if (e.target.getAttribute('noRC') != null) { return; }

  e.stopPropagation();
  e.preventDefault();
  RCElement = '';

  if (e.path[1].hasAttribute("rcOSP") && e.path[1].getAttribute("rcOSP").includes(e.target.tagName)) {
    RCElement = e.target.offsetParent;
  }

  if (e.target.hasAttribute("rc") || RCElement) {    
    if (!RCElement) { RCElement = e.target }

    var menuName = RCElement.getAttribute("rc");
    let menuItems = RightClickObjectMenu[menuName];
  
    $("#rightClickContainer").empty();

    for (var Option in menuItems) {
      if (menuItems.hasOwnProperty(Option)) {
        let VarOption = Option;
        if (Option.includes("RC_VAR_")) {  VarOption = window[Option](Option, e) };
        let newOption = document.createElement('li');
        !Option.includes("Nano_SPLIT") ? newOption.innerText = VarOption : newOption.setAttribute("class", "Nano_SPLIT");
        newOption.setAttribute("RCAction", Option)
        document.getElementById('rightClickContainer').appendChild(newOption);
      }
    }

    let MenuHeight = $("#rightClickContainer").height();
    $("#rightClickContainer").css("top", (($("body").height() < (e.pageY + MenuHeight)) ? (e.pageY - (MenuHeight - 5)) : (e.pageY - 5) ))
    $("#rightClickContainer").css("left", (($("body").width() < (e.pageX + 185)) ? (e.pageX - 185) : (e.pageX - 5) ))
    $("#rightClickContainer").fadeIn(100, startFocusOut());

    $("#rightClickContainer > li").unbind();
    $("#rightClickContainer > li").not( $(".Nano_SPLIT") ).click(function(e) {
      let RCAction = e.currentTarget.getAttribute("RCAction");
      RCAction = RightClickObjectMenu[menuName][RCAction];
      window[RCAction[0].Command](RCAction[0].Var1, RCAction[0].Var2, RCAction[0].Var3, RCAction[0].Var4, RCAction[0].Var5);
      if (RCAction[1]) {
        window[RCAction[1].Command](RCAction[1].Var1, RCAction[1].Var2, RCAction[1].Var3, RCAction[1].Var4, RCAction[1].Var5);
      }
    });
  }
})


function startFocusOut() {
  setTimeout(function() {
    $(document).on("click",function(){
      $('#rightClickContainer').empty();
      $("#rightClickContainer").hide();
      $(document).off("click");
    });
  }, 20)
}




function RC_VAR_Collapse(Option, e) {
  return (e.target.hasAttribute('collapsed')) ? "Expand" : "Collapse";
}
function RC_VAR_Details(Option, e) {
  return SideBarOpen ? "Hide Details" : "Display Details";
}
function RC_VAR_Switch_View(Option, e) {
  return UserSettings.ViewT == 0 ? "List View" : "Block View";
}


