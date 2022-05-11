function ItemClickListener(View) {
  let Items = (View == 0
    ? Directory.fileContainer.querySelectorAll('div.Item[node-id]:not([home-span]):not([Sub-Span]), .baseFolders > div') // Block View
    : Directory.fileContainer.querySelectorAll('tbody tr[node-id], .baseFolders > div') // List View
  );

  Items.forEach(item => item.addEventListener('click', (selected) => {
    if (selected.currentTarget.hasAttribute('focus')) { return }

    if (keyMap["Shift"] == true || keyMap["Control"] == true) { return new Select(selected.currentTarget); }

    if (!selected.currentTarget.classList.contains('noOpen')) {
      ItemActions(selected.currentTarget);
      N_.ClientStatus(5, "Ok", 500);
    }
  }))
}


class Select {
  static OffClick = document.body;

  constructor(item, force=false) {
    if (!item || !item.hasAttribute('node-id')) { return }
    Select.OffClick.removeEventListener('click', Select.RemoveSelected, true);
    
    Select.Toggle(item, force);
  }
  
  static Toggle(item, force) {
    const targetElement = item?.hasAttribute('node-id') ? item : N_.Find(`[dir-nodes] [node-id='${item}']`);
    const targetId = targetElement.getAttribute('node-id');

    if (targetElement.hasAttribute('selectedNode') && !force) {
      targetElement.removeAttribute('selectedNode');
      targetElement.classList.remove('ItemSelected');
      App.NodeSelected.delete(targetId);
    } else {
      targetElement.setAttribute('selectedNode', true);
      targetElement.classList.add('ItemSelected');
      App.NodeSelected.add(targetId);
      setTimeout(() => Select.OffClick.addEventListener('click', Select.RemoveSelected, true), 20)
    }

  }
  static RemoveSelected(target) {
    if (!target.path.includes(Directory.fileContainer) && !target.path.includes(RCC.container)) {
      App.NodeSelected.clear();
      N_.Find('[selectedNode]', true).forEach(item => {
        item.removeAttribute('selectedNode');
        item.classList.remove('ItemSelected');
      })
      Select.OffClick.removeEventListener('click', Select.RemoveSelected, true);
    }
  }
}


function ItemActions(selected) {
  if (!selected && RCC.RCElement) { selected = RCC.RCElement }

  let nodeId = selected.getAttribute("node-id");
  let nodeType = selected.getAttribute("type");

  if (nodeType == "folder") { Main.NodeCall({"folder":selected.getAttribute('node-id')}); }
  else { ViewItem(nodeType, nodeId) }
  // else if (nodeType.match(/image|text|video/g)) { ViewItem(nodeType, nodeId) }
}


// @ = Click & Drag Select
const DragSelection = new SelectionArea({
  selectables: ['[dir-nodes] > tr'],
  boundaries: ['.main_Page .PageData'],
  startareas: ['.main_Page .PageData'],
  startThreshold: 10,
}).on('beforestart', ({event}) => {
  N_.Find('.main_Page').classList.add('no-select');
  return !event.target.tagName.match(/TD|INPUT|BUTTON/) && !ItemInformation.PageInfo.contains(event.target);
}).on('start', ({store, event}) => {
  if (!event.ctrlKey && !event.metaKey) {
    N_.Find('[selectedNode]', true).forEach(item => {
      item.classList.remove('ItemSelected');
      item.removeAttribute('selectedNode');
    })

    App.NodeSelected.clear();
    DragSelection.clearSelection();
  }
}).on('move', ({store: {changed: {added, removed}}}) => {
  for (const el of added) {
    App.NodeSelected.add(el.getAttribute('node-id'));
    el.setAttribute('selectedNode', true);
    el.classList.add('ItemSelected');
  }
  for (const el of removed) {
    App.NodeSelected.delete(el.getAttribute('node-id'));
    el.removeAttribute('selectedNode');
    el.classList.remove('ItemSelected');
  }
}).on('stop', () => {
  N_.Find('.main_Page').classList.remove('no-select');
  DragSelection.keepSelection();
});

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

function collapseSpan(span, expand=false) {
  span = span ? (Settings.Local.layout == 0 ? span.parentNode : span.closest('table')) : RCC.RCElement;
  if (Settings.Local.layout == 0) {
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

function createLocation(RCE) {
  spanList = () => { return Object.entries(App.Spans).reduce((pre, span) => pre + (span[0] !== '_MAIN_' ? `<a value='${span[0]}'>${span[1].name}</a>` : ''), '') }

  return Main.NodeName == "homepage" 
    ? `value= '${RCE == 'RCE' ? N_.PareAttr(RCC.RCElement, 'node-id') : "_General_"}'>
        <span class='flex-between-cent'>
          <p>${RCE == 'RCE' ? N_.PareAttr(RCC.RCElement, 'home-span') : "General"}</p>
          <i class="fas fa-angle-down"></i>
        </span>
        <div class='Popup_Dropdown_Content'>${spanList()}</div>`
    : `value='${Main.NodeID}'><p>Current</p>`;
}