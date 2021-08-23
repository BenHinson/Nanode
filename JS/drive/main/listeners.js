function ItemClickListener(View) {
  let Items = (View == 0
    ? Directory.fileContainer.querySelectorAll('div.Item[node-id]:not([home-span]):not([Sub-Span]), .baseFolders > div') // Block View
    : Directory.fileContainer.querySelectorAll('tbody tr[node-id], .baseFolders > div') // List View
  );

  Items.forEach(item => item.addEventListener('click', (selected) => {
      if (selected.currentTarget.hasAttribute('focus')) { return }

      if (keyMap["Shift"] == true || keyMap["Control"] == true) { return SelectItem(selected.currentTarget); }

      if (!selected.currentTarget.classList.contains('noOpen')) {
        ItemActions(selected.currentTarget);
        N_.ClientStatus(5, "Ok", 500);
      }
    })
  )
}

function SelectItem(item, force) {
  if (!item || !item.hasAttribute('node-id')) { return }

  if (item.hasAttribute('selected') && !force) {
    return DragSelection.deselect(item)
    } else {DragSelection.select(item);
  }

  setTimeout(() => {document.addEventListener('click', RemoveSelected)}, 20)
  
  function RemoveSelected(e) {
    if (!e.path.includes(N_.Find('.fileContainer')) || !e.path.includes(N_.Find('.RightClickContainer'))) { // Checks if the target is a child of fileContainer or RightClickContainer
      App.NodeSelected.clear();
      N_.Find('[selected=true]', true).forEach(item => {
        item.removeAttribute('selected');
        item.classList.remove('ItemSelected');
      })
      document.removeEventListener('click', RemoveSelected);
    }
  }
}

function ItemActions(selected) {
  if (!selected && RCC.RCElement) { selected = RCC.RCElement }

  let nodeID = selected.getAttribute("node-id");
  let nodeType = selected.getAttribute("type");

  if (nodeType == "folder") { Main.NodeCall({"Folder":selected.getAttribute('node-id')}); }
  else { ViewItem(nodeType, nodeID) }
  // else if (nodeType.match(/image|text|video/g)) { ViewItem(nodeType, nodeID) }
}

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

function renameItem(e) { // Convert this to a Popup.
  let focusedElement = RCC.RCElement;
  
  const targetInput = $(focusedElement).find('input')[0] || $(focusedElement).find('textarea')[0];
  focusedElement.setAttribute('focus', "true")
  targetInput.removeAttribute('disabled');
  targetInput.style = '';
  targetInput.focus();
  targetInput.select();

  targetInput.addEventListener('input', function() {
    this.value = this.value.replace(/\n/g,'')
  });

  targetInput.addEventListener('change', function() {
    ReturnItemState();
    Main.NodeAPI('edit', {"action": "DATA", "section": App.Section, "id": [focusedElement.getAttribute('node-id')], "data": { "name": targetInput.value }, "path": Main.NodeID}, true)
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