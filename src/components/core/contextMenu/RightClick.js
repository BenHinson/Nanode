import ReactDOM from 'react-dom';
import {useState, useEffect, useCallback, Component} from 'react'
import * as N_ from '../../../JS/tools';
// import {UserSettings} from './Layout'


const RightClickObjectMenu = {
  "File_Container": [
    {_id: '1', title: 'New Folder', CMD: 'NEWPopup', VAR: ['NewFolder']},
    {_id: '2', title: 'Refresh', CMD: 'NodeCall', VAR: [{"Reload":false}]},
    {split: true},
    {_id: '3', rc_var: 'Layout', CMD: 'PARENT_ToggleView', VAR :[]},
    {_id: '4', rc_var: 'Change_Theme', CMD: 'PARENT_ToggleTheme', VAR :[]},
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
    {_id: '3', title: 'Go to', CMD: 'PARENT_Shortcut', VAR: ["RCElement"]},
  ],

  "Preview_Image": [
    {_id: '1', title: 'Open in New Tab', CMD: 'PARENT_ExternalTab', CUS_VAR: "NODEID", VAR: []},
    {_id: '2', title: 'Open in Mini Preview', class: 'disabled-text', CMD: 'miniPreview', VAR: []},
    {split: true},
    {_id: '3', title: 'Close', CMD: 'PROTO_ToggleBase_', VAR: []},
  ]
}


export class ContextMenu extends Component {
  constructor(props) {
    super(props)
    this.state = {
      xPos: 0,
      yPos: 0,
      showMenu: false,
      height: 0
    }
  }


  componentDidMount() { // Runs after the render method
    document.addEventListener("click", this.handleClick);
    document.addEventListener("contextmenu", this.handleContextMenu);
  }
  componentDidUpdate() {
    const $this = ReactDOM.findDOMNode(this)?.offsetHeight
    if ($this+this.state.yPos > document.body.offsetHeight) {
      this.setState({yPos: (this.state.yPos - ($this+this.state.yPos+30 - document.body.offsetHeight))})
    }
  }
  componentWillUnmount() {
    document.removeEventListener("click", this.handleClick);
    document.removeEventListener("contextmenu", this.handleContextMenu);
  }

  // ========

  handleClick = (e) => {
    if (this.state.showMenu) this.setState({ showMenu: false });
  };

  handleContextMenu = (e) => {
    e.preventDefault();

    if (e.target.hasAttribute('rc') && RightClickObjectMenu[e.target.getAttribute('rc')]) {
      this.setState({
        yPos: (document.body.offsetHeight < (e.pageY + this.state.height) ? e.pageY - this.state.height : e.pageY) - 5,
        xPos: (document.body.offsetWidth < (e.pageX + 185) ? e.pageX - 185 : e.pageX - 5),
        showMenu: true,
        content: RightClickObjectMenu[e.target.getAttribute('rc')]
      });
    } else {
      this.setState({showMenu: false})
    }
  };

  // ========

  render() {
    const { showMenu, xPos, yPos, content } = this.state;

    if (showMenu) {
      return (
        <table className='RightClickContainer' style={{top: `${yPos}px`, left: `${xPos}px`, display: 'block'}} >
          {content.map((item) => item.split === true
            ? <divide></divide>
            : <button className={item.class || ''} rc_id={item._id}>{item.rc_var ? RC_Var(item.rc_var, this.event) : item.title}</button>)}
        </table>
      );
    } else {return null};
  }
}

function RC_Var(variable, e) {
  switch(variable) {
    case ('Collapse'): { return (N_.PareAttr(e.target, 'collapsed') || e.target.hasAttribute('collapsed')) ? "Expand" : "Collapse"; }
    // case ('Layout'): { return UserSettings.local.layout === 0 ? "List View" : "Block View"; }
    // case ('Change_Theme'): { return UserSettings.local.theme === 0 ? "Light Theme" : "Dark Theme"; }
  }
}