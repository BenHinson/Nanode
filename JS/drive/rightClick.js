const RightClickObjectMenu = {
  "File_Container": [
    {_id: '1', title: 'New Folder', CMD: 'NEWPopup', VAR: ['NewFolder']},
    {_id: '2', title: 'Refresh', CMD: 'SubFunction', fName: 'NodeCall', VAR: [{"Reload":false}]},
    {split: true},
    {_id: '3', rc_var: 'Layout', CMD: 'SubFunction', fName: 'ToggleView', VAR :[]},
    {_id: '4', rc_var: 'Change_Theme', CMD: 'SubFunction', fName: 'ToggleTheme', VAR :[]},
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
    {_id: '2', title: 'View Details', CMD: 'SubFunction', fName: 'ItemInformation', VAR: ["RCElement"]},
    {_id: '3', title: 'Security', class: 'disabled-text', CMD: '', VAR: []},
    {split: true},
    {_id: '4', title: 'Move To', class: 'disabled-text', CMD: '', VAR: []},
    {_id: '5', title: 'Create Shortcut', class: 'disabled-text', CMD: '', VAR: []},
    {split: true},
    {_id: '6', title: 'Change Colour', CMD: 'SubFunction', fName: 'ColorPicker', VAR: ["RC"]},
    {_id: '7', title: 'Rename', CMD: 'renameItem', VAR: []},
    {_id: '8', title: 'Delete', class: 'red-text', CMD: 'NEWPopup', VAR: ['AcceptCancel', null, 'Delete', {title: 'Are you Sure?', reject: 'Cancel', accept: 'Delete', color: 'warning', text: 'Send Folders and their contents to the Bin, where they can be reclaimed for 30 days.'}]},
    {split: true},
    {_id: '9', title: 'Download', CMD: 'PopUp_Download', VAR: ["Download", "ContextMenu"]},
  ],
  "Node_File": [
    {_id: '1', title: 'Open', CMD: 'ItemActions', VAR: []},
    // {_id: '2', title: 'Open in New Tab', CMD: 'SubFunction', fName: 'ExternalTab', CUS_VAR: "NODEID", VAR: []},
    {_id: '3', title: 'View Details', CMD: 'SubFunction', fName: 'ItemInformation', VAR: ["RCElement"]},
    // {_id: '4', title: 'Security', class: 'disabled-text', CMD: '', VAR: []},
    {split: true},
    {_id: '5', title: 'Copy To', class: 'disabled-text', CMD: '', VAR: []},
    {_id: '6', title: 'Move To', class: 'disabled-text', CMD: '', VAR: []},
    {_id: '7', title: 'Create Shortcut', class: 'disabled-text', CMD: '', VAR: []},
    {split: true},
    {_id: '8', title: 'Change Colour', CMD: 'SubFunction', fName: 'ColorPicker', VAR: ["RC"]},
    {_id: '9', title: 'Rename', CMD: 'renameItem', VAR: []},
    {_id: '10', title: 'Delete', class: 'red-text', CMD: 'NEWPopup', VAR: ['AcceptCancel', null, 'Delete', {title: 'Are you Sure?', reject: 'Cancel', accept: 'Delete', color: 'warning', text: 'Send Files to the Bin, where they can be reclaimed for 30 days.'}]},
    {split: true},
    // {_id: '11', title: 'Share', class: 'disabled-text', CMD: '', VAR: []},
    {_id: '12', title: 'Download', CMD: 'PopUp_Download', VAR: ["Download", "ContextMenu"]},
  ],
  "Recent_Node": [
    {_id: '1', title: 'Open', CMD: 'ItemActions', VAR: []},
    {_id: '2', title: 'View Details', CMD: 'SubFunction', fName: 'ItemInformation', VAR: ["RCElement"]},
    {split: true},
    {_id: '3', title: 'Go to', CMD: 'SubFunction', fName: 'Shortcut', VAR: ["RCElement"]},
  ],

  "Preview_Image": [
    {_id: '1', title: 'Open in New Tab', CMD: 'SubFunction', fName: 'ExternalTab', CUS_VAR: "NODEID", VAR: []},
    {_id: '2', title: 'Open in Mini Preview', class: 'disabled-text', CMD: 'miniView', VAR: []},
    {split: true},
    {_id: '3', title: 'Close', CMD: 'SubFunction', fName: 'ToggleBase_', VAR: []},
  ]
}

// ========================================

const RCC = new class RightClickContainer {
  constructor() {
    [this.menu, this.event, this.RCElement] = [undefined, undefined, undefined];
    [this.menuHeight, this.posY, this.posX] = [0, 0, 0];
    this.container = document.querySelector('.RightClickContainer');
    this._ContextListener();
  }

  _ContextListener() {
    document.addEventListener("contextmenu", (e) => {
      // Return if the browser context menu should be shown.
      if (e.target.getAttribute('noRC') != null || e.target.tagName == 'INPUT') { return; }
    
      e.stopPropagation();
      e.preventDefault();
    
      // Sets the Right-click element to the correct target based on attributes
      this.RCElement = FindTarget();
      const rcName = this.RCElement?.getAttribute('rc');

      if (this.RCElement && RightClickObjectMenu[rcName]) {
        if (rcName.match(/Node_Folder|Node_File|Recent_Node/)) new Select(this.RCElement, 'force');
        this._Initialise(RightClickObjectMenu[rcName], e);
      }
    
      function FindTarget() {
        if (e.target.hasAttribute('rcPar') || e.target.parentNode.hasAttribute('rcPar')) { return e.path[ e.target.getAttribute('rcPar') || e.target.parentNode.getAttribute('rcPar') ] }
        else if (e.path[1].hasAttribute("rcOSP") && e.path[1].getAttribute("rcOSP").includes(e.target.tagName)) { return e.target.parentNode; }
        else if (e.target.hasAttribute('rc')) { return e.target; }
        else { return undefined }
      }
    })
  }

  _Initialise(menu, event) {
    [this.menu, this.event] = [menu, event];
    [this.posY, this.posX] = [event.pageY, event.pageX];
    
    this.RenderMenu_();
    this.PositionMenu_();
    this.SetListeners_();
  }

  // MainFunction ==========
  RenderMenu_() {
    this.container.innerHTML = this.menu.reduce((pre,item) => pre + (item.split === true
      ? `<divide></divide>`
      : `<button class='${item.class || ''}' RC_ID='${item._id}'>${item.rc_var ? this.RC_Var(item.rc_var, this.event) : item.title}</button>`
    ), '');
    this.container.style.display = 'table';
    this.menuHeight = this.container.offsetHeight;
  }
  PositionMenu_() {
    this.container.style.cssText = `
      top: ${(document.body.offsetHeight < (this.posY + this.menuHeight) ? (this.posY - (this.menuHeight+this.posY+30 - document.body.offsetHeight)) : this.posY) - 5}px;
      left: ${(document.body.offsetWidth < (this.posX + 185) ? this.posX - 185 : this.posX - 5)}px;
    `;

    N_.FadeInOut(this.container, 300, 'table')
  }
  SetListeners_() {
    this.container.querySelectorAll('button:not(divide)').forEach((option) => {
      option.addEventListener('click', (e) => {
        let RC_ID = e.currentTarget.getAttribute('RC_ID');
        let func = this.menu.find(e => e._id == RC_ID);

        let variableOne = func.CUS_VAR ? this.CUSTOM_Var(func.CUS_VAR, this.event.target) : func.VAR[0] || null;
        let variableOneName = typeof variableOne === 'object' ? 'OBJECT' : variableOne

        if (func.CMD == 'SubFunction') {
          this.SubFunction(func.fName, {[func.CUS_VAR || variableOneName]: variableOne, [func.VAR?.[1]]:func.VAR?.[1], [func.VAR?.[2]]:func.VAR?.[2], [func.VAR?.[3]]:func.VAR?.[3], [func.VAR?.[4]]:func.VAR?.[4]})
        } else {
          window[func.CMD](variableOne, func.VAR?.[1], func.VAR?.[2], func.VAR?.[3], func.VAR?.[4]) // ?. after the object name checks if it exists first.
          // Re-selects an item after an event is called ie: ColourPicker unselects the item and the user cannot see which item they are setting the colour for.
        }
        if (App.NodeSelected.size == 1) { new Select(this.RCElement); }
      })
    })
  }


  CUSTOM_Var(variableName, target) { // Used when calling functions to define target relative data, without the function needing to calculate it.
    switch(variableName) {
      case ('NODEID'): {return target.getAttribute('node-id') || RCC.RCElement.getAttribute('node-id'); }
    }
  }
  
  RC_Var(variableName, e) { // Used to toggle between Rightclick menu options. IE: Light OR Dark theme
    switch(variableName) {
      case ('Collapse'): { return (N_.PareAttr(e.target, 'collapsed') || e.target.hasAttribute('collapsed')) ? "Expand" : "Collapse"; }
      case ('Layout'): { return Settings.Local.layout === 0 ? "List View" : "Block View"; }
      case ('Change_Theme'): { return Settings.Local.theme === 0 ? "Light Theme" : "Dark Theme"; }
    }
  }
  
  SubFunction(funcName, params) {
    switch(funcName) {
      case ('ToggleTheme'): {return Settings.ToggleTheme() }
      case ('ToggleView'): {return Settings.ToggleView() }
      case ('ExternalTab'): {return N_.ExternalTab(params['NODEID']) }
      case ('Shortcut'): {return Navigate.Shortcut(params['RCElement']) }
      case ('ItemInformation'): {return ItemInformation.Load(params['RCElement'])}
      case ('NodeCall'): {return Main.NodeCall(params['OBJECT']);}
  
      case ('ColorPicker'): {return new CreateColorPicker(params['RC'], params['callback']) }
  
      case ('ToggleBase_'): {return Popup.prototype.ToggleBase_() }
    }
  }
}

// ========================================


function NEWPopup(type, caller, action, data) {
  if (type == 'NewFolder') { new Popup('NewFolder', null, 'NewFolder', {title: 'New Folder', reject: 'Cancel', accept: 'Create', color: '', RCE: '', secondary: true}); }
  else { new Popup(type, RCC.RCElement, action, data); }
}