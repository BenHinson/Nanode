// HTML with attribute of 'rc-name' |  right-click-name of the object  |  rc-name="centralContentBox"   |   RCE = Right Click Element
// NodeCall({"Folder":NodeID, "Reload":false});
const RightClickObjectMenu = {
  "File_Container": [
    {_id: '1', title: 'New Folder', CMD: 'NEWPopup', VAR: ['NewFolder']},
    {_id: '2', title: 'Refresh', CMD: 'NodeCall', VAR: [{"Reload":false}]},
    {split: true},
    {_id: '3', rc_var: 'Layout', CMD: 'ToggleView', VAR :[]},
    {_id: '4', rc_var: 'Change_Theme', CMD: 'ToggleTheme', VAR :[]},
    {split: true},
    {_id: '5', title: 'Upload', CMD: 'PopUp_Upload', VAR: ['Upload']},
  ],
  "Homepage_Span": [
    {_id: '1', title: 'New Folder', CMD: 'NEWPopup', VAR: ['NewFolder']},
    {split: true},
    {_id: '2', rc_var: 'Collapse', CMD: 'collapseSpan', VAR :[]},
    {split: true},
    {_id: '3', title: 'Delete', class: 'red-text', CMD: 'NEWPopup', VAR: ['AcceptCancel', null, 'Delete', {title: 'Are you Sure?', reject: 'Cancel', accept: 'Delete', color: 'warning', text: 'Spans and their content <u>cannot</u> be reclaimed.'}]},
  ],
  "Node_Folder": [
    {_id: '1', title: 'Open', CMD: 'ItemActions', VAR: []},
    {_id: '2', title: 'View Details', CMD: 'FetchItemInformation', VAR: ["RCElement"]},
    {_id: '3', title: 'Security', class: 'disabled-text', CMD: '', VAR: []},
    {split: true},
    {_id: '4', title: 'Move To', class: 'disabled-text', CMD: '', VAR: []},
    {_id: '5', title: 'Create Shortcut', class: 'disabled-text', CMD: '', VAR: []},
    {split: true},
    {_id: '6', title: 'Change Colour', CMD: 'NEWColorPicker', VAR: ["RC"]},
    {_id: '7', title: 'Rename', CMD: 'renameItem', VAR: []},
    {_id: '8', title: 'Delete', class: 'red-text', CMD: 'NEWPopup', VAR: ['AcceptCancel', null, 'Delete', {title: 'Are you Sure?', reject: 'Cancel', accept: 'Delete', color: 'warning', text: 'Send Folders and their contents to the Bin, where they can be reclaimed for 30 days.'}]},
    {split: true},
    {_id: '9', title: 'Download', CMD: 'PopUp_Download', VAR: ["Download", "ContextMenu"]},
  ],
  "Node_File": [
    {_id: '1', title: 'Open', CMD: 'ItemActions', VAR: []},
    {_id: '2', title: 'View Details', CMD: 'FetchItemInformation', VAR: ["RCElement"]},
    {_id: '3', title: 'Security', class: 'disabled-text', CMD: '', VAR: []},
    {split: true},
    {_id: '4', title: 'Copy To', class: 'disabled-text', CMD: '', VAR: []},
    {_id: '5', title: 'Move To', class: 'disabled-text', CMD: '', VAR: []},
    {_id: '6', title: 'Create Shortcut', class: 'disabled-text', CMD: '', VAR: []},
    {split: true},
    {_id: '7', title: 'Change Colour', CMD: 'NEWColorPicker', VAR: ["RC"]},
    {_id: '8', title: 'Rename', CMD: 'renameItem', VAR: []},
    {_id: '9', title: 'Delete', class: 'red-text', CMD: 'NEWPopup', VAR: ['AcceptCancel', null, 'Delete', {title: 'Are you Sure?', reject: 'Cancel', accept: 'Delete', color: 'warning', text: 'Send Files to the Bin, where they can be reclaimed for 30 days.'}]},
    {split: true},
    {_id: '10', title: 'Share', class: 'disabled-text', CMD: '', VAR: []},
    {_id: '11', title: 'Download', CMD: 'PopUp_Download', VAR: ["Download", "ContextMenu"]},
  ],
  "Recent_Node": [
    {_id: '1', title: 'Open', CMD: 'ItemActions', VAR: []},
    {_id: '2', title: 'View Details', CMD: 'FetchItemInformation', VAR: ["RCElement"]},
    {split: true},
    {_id: '3', title: 'Go to', CMD: 'Shortcut', VAR: ["RCElement"]},
  ]
}

// ========================================

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
    for (let item of this.menu) {
      let menuText = item.rc_var ? RC_Var[item.rc_var](this.event) : item.title;
      elements += item.split == true ? `<divide></divide>` : `<button class='${item.class || ''}'  RC_ID='${item._id+"'>"+menuText}</button>`;
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
        let RC_ID = e.currentTarget.getAttribute('RC_ID');
        let func = this.menu.find(e => e._id == RC_ID);
        window[func.CMD](func.VAR[0], func.VAR[1], func.VAR[2], func.VAR[3], func.VAR[4])
        if (NodeSelected.length == 1) { SelectItem(RCElement); }
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

// ========================================

RC_Var = async() => {
  function Collapse(e) { return (N_PareAttr(e.target, 'collapsed') || e.target.hasAttribute('collapsed')) ? "Expand" : "Collapse"; }
  function Layout(e) { return UserSettings.local.layout == 0 ? "List View" : "Block View"; }
  function Change_Theme(e) { return UserSettings.local.theme == 0 ? "Light Theme" : "Dark Theme"; }

  RC_Var.Collapse = Collapse;
  RC_Var.Layout = Layout;
  RC_Var.Change_Theme = Change_Theme;
}

function NEWColorPicker(caller, callback) { new CreateColorPicker(caller, callback) }

function NEWPopup(type, caller, action, data) {
  if (type == 'NewFolder') {new Popup('NewFolder', null, 'NewFolder', {title: 'New Folder', reject: 'Cancel', accept: 'Create', color: '', RCE: '', secondary: true})}
  else {new Popup(type, RCElement, action, data)}
}


RC_Var();