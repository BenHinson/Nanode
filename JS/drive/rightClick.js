// HTML with attribute of 'rc-name' |  right-click-name of the object  |  rc-name="centralContentBox"   |   RCE = Right Click Element

const RightClickObjectMenu = {
  "File_Container" : {
    "New Folder": [{"Command": "PopUp_New_Folder"}],
    "Refresh": [{"Command": "refreshDirectory"}],
    "Node_SPLIT_1": "",
    "RC_VAR_Switch_View": [{"Command": 'ToggleView'}], 
    "RC_VAR_Change_Theme": [{"Command":'ToggleTheme'}],
    "Node_SPLIT_2": "", 
    "Upload": [{"Command": "PopUp_Upload", 'Var1':'Upload'}],
  },
  "Homepage_Span" : {
    "New Folder": [{"Command": "PopUp_New_Folder", "Var1": "RCE"}],
    "Node_SPLIT_1": "", 
    "RC_VAR_Collapse": [{"Command": "collapseSpan"}],
    "Node_SPLIT_2": "", 
    "Delete": [{"Command": "PopUp_Accept_Cancel", "Var1": "Delete", "Var2": "Are you Sure?", "Var3": "Delete", "Var4": "Cancel", "Var5": "Spans and their content <u>cannot</u> be reclaimed."}]
  },
  "Node_Folder" : {
    "Open": [{"Command": "ItemActions"}],
    "View Details": [{"Command": "FetchItemInformation", "Var1": "RCElement"}],
    "Security": "",
    "Node_SPLIT_1": "",
    "Move To": "",
    "Create Shotcut": "",
    "Node_SPLIT_2": "",
    "Change Colour": [{"Command": "ColorPicker", "Var1": "RC"}],
    "Rename": [{"Command": "renameItem"}],
    "Delete": [{"Command": "PopUp_Accept_Cancel", "Var1": "Delete", "Var2": "Are you Sure?", "Var3": "Delete", "Var4": "Cancel", "Var5": "Send Folders and their contents to the Bin, where they can be reclaimed for 30 days."}],
    "Node_SPLIT_3": "",
    "Download": [{"Command": "PopUp_Download", "Var1": "Download", "Var2": "ContextMenu"}],
  },
  "Node_File" : {
    "Open": [{"Command": "ItemActions"}],
    "View Details": [{"Command": "FetchItemInformation", "Var1": "RCElement"}],
    "Security": "",
    "Node_SPLIT_1": "",
    "Copy To": "",
    "Move To": "",
    "Create Shotcut": "",
    "Node_SPLIT_2": "",
    "Change Colour": [{"Command": "ColorPicker", "Var1": "RC"}],
    "Rename": [{"Command": "renameItem"}],
    "Delete": [{"Command": "PopUp_Accept_Cancel", "Var1": "Delete", "Var2": "Are you Sure?", "Var3": "Delete", "Var4": "Cancel", "Var5": "Send Files to the Bin, where they can be reclaimed for 30 days."}],
    "Node_SPLIT_3": "",
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

  if (e.target.hasAttribute('rcPar') || e.target.parentNode.hasAttribute('rcPar')) { RCElement = e.path[ e.target.getAttribute('rcPar') || e.target.parentNode.getAttribute('rcPar') ] }
  if (e.path[1].hasAttribute("rcOSP") && e.path[1].getAttribute("rcOSP").includes(e.target.tagName)) { RCElement = e.target.parentNode; }
  if (e.target.hasAttribute('rc') && e.target.getAttribute('rc').match(/Node_Folder|Node_File/)) { RCElement = e.target; };

  SelectItem(RCElement, "FORCE");

  if (e.target.hasAttribute("rc") || RCElement) {    
    if (!RCElement) { RCElement = e.target }

    let menuName = RCElement.getAttribute("rc");  
    new RightClickContainer(RightClickObjectMenu[menuName], e, RCElement);
  }
})


class RightClickContainer {
  constructor(menu, event, element) {
    [this.menu, this.event, this.target] = [menu, event, element];
    this.container = document.querySelector('.RightClickContainer');
    this._Initalise();
  }

  _Initalise() {
    this.RenderMenu_();
    this.PositionMenu_();
    this.SetListeners_();
  }
  RenderMenu_() {
    let elements = ``;
    for (let item in this.menu) {
      let menuText = item.includes('RC_VAR_') ? window[item](this.event) : item;
      elements += item.includes('Node_SPLIT') ? `<divide></divide>` : `<button RCAction='${item+"'>"+menuText}</button>`;
    }
    this.container.innerHTML = elements;
    this.container.style.display = 'table';
  }
  PositionMenu_() {
    let menuHeight = this.container.offsetHeight;
    let [targetPosY, targetPosX] = [this.event.pageY, this.event.pageX]

    this.container.style.cssText = `
      top: ${(document.body.offsetHeight < (targetPosY + menuHeight) ? targetPosY - menuHeight : targetPosY) - 5}px;
      left: ${(document.body.offsetWidth < (targetPosX + 185) ? targetPosX - 185 : targetPosX - 5)}px;`;

    $(this.container).fadeIn(100, startFocusOut());
  }
  SetListeners_() {
    this.container.querySelectorAll('button:not(divide)').forEach((option) => {
      option.addEventListener('click', (e) => {
        SelectItem(RCElement);
        let RCAction = e.currentTarget.getAttribute("RCAction");
        this.menu[RCAction].forEach((func) => {
          window[func.Command](func.Var1, func.Var2, func.Var3, func.Var4, func.Var5)
        })
      })
    })
  }
}


function startFocusOut() {  // Called from PositionMenu_ in RightClickContainer. Needs replacing with non jquery version.
  setTimeout(function() {
    $(document).on("click", () => {
      $('.RightClickContainer').empty();
      $(".RightClickContainer").hide();
      $(document).off("click");
    });
  }, 20)
}


function RC_VAR_Collapse(e) { return (N_PareAttr(e.target, 'collapsed') || e.target.hasAttribute('collapsed')) ? "Expand" : "Collapse"; }
function RC_VAR_Switch_View(e) { return UserSettings.local.layout == 0 ? "List View" : "Block View"; }
function RC_VAR_Change_Theme(e) { return UserSettings.local.theme == 0 ? "Light Theme" : "Dark Theme"; }