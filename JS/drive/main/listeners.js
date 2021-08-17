
function ItemClickListener(View) {
  let Items = (View == 0
    ? fileContainer.querySelectorAll('div.Item[node-id]:not([home-span]):not([Sub-Span]), .baseFolders > div') // Block View
    : fileContainer.querySelectorAll('tbody tr[node-id], .baseFolders > div') // List View
  );

  Items.forEach(item => {
    item.addEventListener('click', function(selected) {
      if (selected.currentTarget.hasAttribute('focus')) { return; }

      if (keyMap["Shift"] == true || keyMap["Control"] == true) { return SelectItem(selected.currentTarget); }

      if (!selected.currentTarget.classList.contains('noOpen')) {
        ItemActions(selected.currentTarget);
        N_.ClientStatus(5, "Ok", 500);
      }
    })
  })
}

function SelectItem(item, force) {
  if (!item) {return;}
  $(document.body).off("click");

  if (item.hasAttribute('selected') && !force) { // Remove from Selected
    DragSelection.deselect(item);
  } else if (item.hasAttribute('node-id')) { // Add to Selected
    DragSelection.select(item);
  }

  if (NodeSelected.size) { // Add Listener to Document for Off-Clicks
    setTimeout(function() {
      $(document.body).on("click",function(e) {
        if (!$(e.target).parents('.fileContainer').length && !$(e.target).parents('.RightClickContainer').length) {
          NodeSelected.clear();
          $('[selected=true]').each((index, item) => {
            $(item).removeAttr('selected');
            $(item).removeClass('ItemSelected');
          })
          $(document.body).off("click");
        }
      });
    }, 20)
  }
}

function ItemActions(selected) {
  if (!selected && RCC.RCElement) { selected = RCC.RCElement }

  let clicked = selected.getAttribute("node-id");
  let type = selected.getAttribute("type");

  if (type == "folder") { NodeCall({"Folder":selected.getAttribute('node-id')}); }
  else { ViewItem(type, clicked) }
  // else if (type.match(/image|text|video/g)) { ViewItem(type, clicked) }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

function collapseSpan(span, expand=false) {
  span = span ? (UserSettings.local.layout == 0 ? span.parentNode : span.closest('table')) : RCC.RCElement;
  if (UserSettings.local.layout == 0) {
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
  return  NodeName == "homepage" 
    ? `value= '${RCE == 'RCE' ? N_.PareAttr(RCC.RCElement, 'node-id') : "_General_"}'><span class='flex-between-cent'><p>${RCE == 'RCE' ? N_.PareAttr(RCC.RCElement, 'home-span') : "General"}</p><i class="fas fa-angle-down"></i></span><div class='Popup_Dropdown_Content'>${spanList()}</div>`
    : `value='${NodeID}'><p>Current</p>`;
  function spanList() {
    let HTML_Spans = "";
    for (let [id,data] of Object.entries(Spans)) { if (id=='_MAIN_') {continue};
    HTML_Spans += `<a value='${id}'>${data.name}</a>` };
    return HTML_Spans; }
}

function renameItem(e) {
  let focusedElement = RCC.RCElement;
  
  let targetInput = $(focusedElement).find('input')[0] || $(focusedElement).find('textarea')[0];
  focusedElement.setAttribute('focus', "true")
  targetInput.removeAttribute('disabled');
  targetInput.style = '';
  targetInput.focus();
  targetInput.select();

  targetInput.addEventListener('input', function(e) {
    this.value = this.value.replace(/\n/g,'')
  });

  targetInput.addEventListener('change', function() {
    ReturnItemState();
    NodeAPI('edit', {"action": "DATA", "section": Section, "id": [focusedElement.getAttribute('node-id')], "data": { "name": targetInput.value }, "path": NodeID}, true)
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