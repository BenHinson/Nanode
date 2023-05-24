import react, {useState, useLayoutEffect, useRef} from 'react'
import * as N_ from '../../JS/tools';
// import {UserSettings} from './Layout'


const RightClickObjectMenu = {
  "File_Container": [
    {_id: '1', title: 'New Folder', CMD: 'SubFunction', fName: 'Popup_NewFolder', VAR: []},
    {_id: '2', title: 'Refresh', CMD: 'SubFunction', fName: 'NodeCall', VAR: [{"reload":false}]},
    {split: true},
    {_id: '3', rc_var: 'Layout', CMD: 'SubFunction', fName: 'ToggleView', VAR :[]},
    {_id: '4', rc_var: 'Change_Theme', CMD: 'SubFunction', fName: 'ToggleTheme', VAR :[]},
    {split: true},
    {_id: '5', title: 'Upload', CMD: 'PopUp_Upload', VAR: ['Upload']},
  ],
  "Homepage_Span": [
    {_id: '1', title: 'New Folder', CMD: 'SubFunction', fName: 'Popup_NewFolder', VAR: []},
    {split: true},
    {_id: '2', rc_var: 'Collapse', CMD: 'collapseSpan', VAR :[]},
    {split: true},
    {_id: '3', title: 'Delete', class: 'red-text', CMD: 'SubFunction', fName: 'Popup_Delete', VAR: [{text:'Spans and their content <u>cannot</u> be reclaimed.'}]},
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
    {_id: '7', title: 'Rename', CMD: 'SubFunction', fName: 'Popup_Rename', CUS_VAR: "NODEID", VAR: []},
    {_id: '8', title: 'Delete', class: 'red-text', CMD: 'SubFunction', fName: 'Popup_Delete', VAR: [{text:'Send Folders and their contents to the Bin, they can be restored for 30 days.'}]},
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
    {_id: '9', title: 'Rename', CMD: 'SubFunction', fName: 'Popup_Rename', CUS_VAR: "NODEID", VAR: []},
    {_id: '10', title: 'Delete', class: 'red-text', CMD: 'SubFunction', fName: 'Popup_Delete', VAR: [{text:'Send Files to the Bin, where they can be reclaimed for 30 days.'}]},
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

export default function ContextMenu() {
  const [showMenu, setShowMenu] = useState(false);
  const [xPos, setXPos] = useState(0);
  const [yPos, setYPos] = useState(0);
  const [menuHeight, setMenuHeight] = useState(0);
  const [content, setContent] = useState([]);

  // ==============================

  const menuRef = useRef();
  useLayoutEffect(() => {
    setMenuHeight(menuRef.current.clientHeight);
  }, showMenu)

  // ==============================

  handleClick = (e) => {showMenu && setShowMenu(false)};

  handleContextMenu = (e) => {
    e.preventDefault();

    if (e.target.hasAttribute('rc') && RightClickObjectMenu[e.target.getAttribute('rc')]) {
      setXPos((document.body.offsetWidth < (e.pageX + 185) ? e.pageX - 185 : e.pageX - 5))
      setYPos((document.body.offsetHeight < (e.pageY + menuHeight) ? e.pageY - menuHeight : e.pageY) - 5)
      setShowMenu(true);
      setContent(RightClickObjectMenu[e.target.getAttribute('rc')])
    } else {
      setShowMenu(false);
    }
  };
  
  // ==============================

  return showMenu ? (
    <table className='RightClickContainer' style={{top: `${yPos}px`, left: `${xPos}px`, display: 'block'}} ref={menuRef} >
      {content.map((item) => {
        return item.split === true ? (
          <divide></divide>
        ) : (
          <button className={item.class || undefined} rc_id={item._id}>
            {item.rc_var ? RC_Var(item.rc_var, this.event) : item.title}
          </button>
        )
      })}
    </table>
  ) : undefined
}

// const CUSTOM_Var = (variableName, target) => { // Used when calling functions to define target relative data, without the function needing to calculate it.
//   switch(variableName) {
//     case ('NODEID'): {return target.getAttribute('node-id') || RCC.RCElement.getAttribute('node-id'); }
//   }
// }
  
// const RC_Var = (variableName, e) => { // Used to toggle between Rightclick menu options. IE: Light OR Dark theme
//   switch(variableName) {
//     case ('Collapse'): { return (N_.PareAttr(e.target, 'collapsed') || e.target.hasAttribute('collapsed')) ? "Expand" : "Collapse"; }
//     case ('Layout'): { return Settings.Local.layout === 0 ? "List View" : "Block View"; }
//     case ('Change_Theme'): { return Settings.Local.theme === 0 ? "Light Theme" : "Dark Theme"; }
//   }
// }

// const SubFunction = (funcName, params) => {
//   switch(funcName) {
//     case ('ToggleTheme'): {return Settings.ToggleTheme() }
//     case ('ToggleView'): {return Settings.ToggleView() }
//     case ('ExternalTab'): {return N_.ExternalTab(params['NODEID']) }
//     case ('Shortcut'): {return Navigate.Shortcut(params['RCElement']) }
//     case ('ItemInformation'): {return ItemInformation.Load(params['RCElement'])}
//     case ('NodeCall'): {return Main.NodeCall(params['OBJECT']);}

//     case ('ColorPicker'): {return new CreateColorPicker(params['RC'], params['callback']) }

//     case ('ToggleBase_'): {return Popup.prototype.ToggleBase_() }

//     case ('Popup_Rename'): {return new Popup('Rename', RCC.RCElement, 'Rename', {title: 'Rename', reject: 'Cancel', accept: 'Rename', nodeID: params['NODEID']});}
//     case ('Popup_NewFolder'): {return new Popup('NewFolder', null, 'NewFolder', {title: 'New Folder', reject: 'Cancel', accept: 'Create'});}
//     case ('Popup_Delete'): {return new Popup('AcceptCancel', RCC.RCElement, 'Delete', {title: 'Are you Sure?', reject: 'Cancel', accept: 'Delete', color: 'warning', text: params['OBJECT']?.text});}
//   }
// }


  // ==============================
  // ==============================
  // ==============================
  // ==============================
  // ==============================

// export class ContextMenu extends Component {

//   componentDidMount() { // Runs after the render method
//     document.addEventListener("click", this.handleClick);
//     document.addEventListener("contextmenu", this.handleContextMenu);
//   }
//   componentDidUpdate() {
//     const $this = ReactDOM.findDOMNode(this)?.offsetHeight
//     if ($this+this.state.yPos > document.body.offsetHeight) {
//       this.setState({yPos: (this.state.yPos - ($this+this.state.yPos+30 - document.body.offsetHeight))})
//     }
//   }
//   componentWillUnmount() {
//     document.removeEventListener("click", this.handleClick);
//     document.removeEventListener("contextmenu", this.handleContextMenu);
//   }
// }