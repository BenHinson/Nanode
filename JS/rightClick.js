// HTML with attribute of 'rc-name' |  right-click-name of the object  |  rc-name="centralContentBox"

RightClickObjectMenu = {
  "File_Container" : {
    "New Folder": [{"Command": "displayCentralActionMain", 'Var1':'New Folder', 'Var2':'Create'}],
    "Refresh": [{"Command": "refreshDirectory"}],
    "Nano_SPLIT_1": "",
    "RC_VAR_Switch_View": [{"Command": 'changeSetting', 'Var1': 'ViewT'}], 
    "RC_VAR_Change_Theme": [{"Command":'changeSetting', 'Var1': 'Theme'}],
    "Nano_SPLIT_2": "", 
    "Upload": [{"Command": "PopUp_Upload", 'Var1':'Upload'}],
  },
  "Homepage_Span" : {
    "RC_VAR_Collapse": [{"Command": "collapseSpan"}],
    "Nano_SPLIT_1": "", 
    "Delete": [{"Command": "PopUp_Accept_Cancel", "Var1": "Delete", "Var2": "Are you Sure?", "Var3": "Delete", "Var4": "Cancel", "Var5": "Deletion of Individual Files will be sent to the Bin.<br>Folders, Spans and their content <u>cannot</u> be reclaimed."}]
  },
  "Nano_Folder" : {
    "Open": [{"Command": "ItemActions"}],
    "View Details": [{"Command": "callItemInformation", "Var1": "RCElement"}],
    "Security": "",
    "Nano_SPLIT_1": "",
    "Move To": "",
    "Create Shotcut": "",
    "Nano_SPLIT_2": "",
    "Change Colour": [{"Command": "ColorPicker", "Var1": "RC"}],
    "Rename": [{"Command": "renameItem"}],
    "Delete": [{"Command": "PopUp_Accept_Cancel", "Var1": "Delete", "Var2": "Are you Sure?", "Var3": "Delete", "Var4": "Cancel", "Var5": "Deletion of Individual Files will be sent to the Bin<br>Folders and Spans <u>cannot</u> be reclaimed"}],
    "Nano_SPLIT_3": "",
    "Download": [{"Command": "PopUp_Download", "Var1": "Download", "Var2": "ContextMenu"}],
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
    "Change Colour": [{"Command": "ColorPicker", "Var1": "RC"}],
    "Rename": [{"Command": "renameItem"}],
    "Delete": [{"Command": "PopUp_Accept_Cancel", "Var1": "Delete", "Var2": "Are you Sure?", "Var3": "Delete", "Var4": "Cancel", "Var5": "Deletion of Individual Files will be sent to the Bin<br>Folders and Spans <u>cannot</u> be reclaimed"}],
    "Nano_SPLIT_3": "",
    "Share": "",
    "Download": [{"Command": "PopUp_Download", "Var1": "Download", "Var2": "ContextMenu"}],
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
  
    $(".RightClickContainer").empty();

    for (var Option in menuItems) {
      if (menuItems.hasOwnProperty(Option)) {
        let VarOption = Option;
        if (Option.includes("RC_VAR_")) {  VarOption = window[Option](Option, e) };
        let newOption = document.createElement('li');
        !Option.includes("Nano_SPLIT") ? newOption.innerText = VarOption : newOption.setAttribute("class", "Nano_SPLIT");
        newOption.setAttribute("RCAction", Option)
        $('.RightClickContainer')[0].appendChild(newOption);
      }
    }

    let MenuHeight = $(".RightClickContainer").height();
    $(".RightClickContainer").css("top", (($("body").height() < (e.pageY + MenuHeight)) ? (e.pageY - (MenuHeight - 5)) : (e.pageY - 5) ))
    $(".RightClickContainer").css("left", (($("body").width() < (e.pageX + 185)) ? (e.pageX - 185) : (e.pageX - 5) ))
    $(".RightClickContainer").fadeIn(100, startFocusOut());

    $(".RightClickContainer > li").unbind();
    $(".RightClickContainer > li").not( $(".Nano_SPLIT") ).click(function(e) {
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
      $('.RightClickContainer').empty();
      $(".RightClickContainer").hide();
      $(document).off("click");
    });
  }, 20)
}


function RC_VAR_Collapse(Option, e) { return (e.target.parentNode.hasAttribute('collapsed')) ? "Expand" : "Collapse"; }
function RC_VAR_Switch_View(Option, e) { return UserSettings.ViewT == 0 ? "List View" : "Block View"; }
function RC_VAR_Change_Theme(Option, e) { return UserSettings.Theme == 0 ? "Light Theme" : "Dark Theme"; }