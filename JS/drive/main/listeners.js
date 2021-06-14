const search = document.querySelector('input.search');
const searchContainer = document.getElementsByClassName('searchContainer')[0];
const searchDropdown = document.getElementsByClassName('searchDropdown')[0];
const searchResults = document.querySelector('.searchResults tbody');
const searchParams = document.getElementsByClassName('searchParams')[0];
const searchParamsContainer = document.getElementsByClassName('searchParamsContainer')[0];
let paramListenersCalled = false

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

function ItemClickListener(View) {
  let Items = (View == 0 ? fileContainer.querySelectorAll('div[node-id]:not([home-span]):not([Sub-Span])') : fileContainer.querySelectorAll('tbody tr[node-id], .baseFolders > div'));

  Items.forEach(item => {
    item.addEventListener('click', function(selected) {
      if (selected.currentTarget.hasAttribute('focus')) { return; }

      if (keyMap["Shift"] == true || keyMap["Control"] == true) { SelectItem(selected.currentTarget); return; }

      if (!selected.currentTarget.classList.contains('noOpen')) {
        ItemActions(selected.currentTarget);
        N_ClientStatus(5, "Ok", 500);
      }
    })
  })
}

function SelectItem(item, force) {
  if (!item) {return;}
  $(document.body).off("click");


  if (item.hasAttribute('selected') && !force) { // Remove from Selected
    item.removeAttribute('selected');
    item.classList.remove('ItemSelected');
    NodeSelected = NodeSelected.filter(id => id !== item.getAttribute('node-id'));
  } else if (item.hasAttribute('node-id')) { // Add to Selected
    item.setAttribute('selected', true);
    item.classList.add('ItemSelected');
    NodeSelected.includes(item.getAttribute('node-id')) ? '' : NodeSelected.push(item.getAttribute('node-id'));
  }

  if (NodeSelected.length) { // Add Listener to Document for Off-Clicks
    setTimeout(function() {
      $(document.body).on("click",function(e) {
        if (!$(e.target).parents('.fileContainer').length && !$(e.target).parents('.RightClickContainer').length) {
          NodeSelected = [];
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
  if (!selected && RCElement) { selected = RCElement }

  let clicked = selected.getAttribute("node-id");
  let type = selected.getAttribute("type");

  if (type == "folder") { NodeCall({"Folder":selected.getAttribute('node-id')}); }
  else { ViewItem(type, clicked) }
  // else if (type.match(/image|text|video/g)) { ViewItem(type, clicked) }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

search.addEventListener('click', (e) => {
  if (!searchContainer.classList.contains('searchActive')) {
    // Open Search
    searchContainer.classList.add('searchActive');
    searchDropdown.classList.add('display');

    searchResults.innerHTML.length ? searchResults.parentNode.classList.add('display') : searchResults.parentNode.classList.remove('display') 
    
    // Close Search
    document.addEventListener('mousedown', closeSearch);
    function closeSearch(e) {
      if (!searchContainer.contains(e.target)) {
        searchContainer.classList.remove('searchActive');
        searchDropdown.classList.remove('display');
        if (!search.value) searchResults.innerHTML = '';
        document.removeEventListener('click', closeSearch)
      }
    }
  }  
})

searchParams.addEventListener('click', (e) => {
  searchParamsContainer.classList.toggle('display');
  if (!paramListenersCalled) {paramListeners(); paramListenersCalled = true; }
})

search.addEventListener('change', async(e) => { // Search
  let searchParams = {"input": e.target.value}
  if (searchParams.input) {
    let req = await fetch(`https://drive.nanode.one/search`, {
      method:'POST',
      headers: {'Content-Type': 'application/json'},
      body: new Blob( [ JSON.stringify(searchParams) ], { type: 'text/plain' }),
    })
    let request = await req.json();
    console.log(request);

    renderSearch(request);

    // Stretch search to whole topbar.
    //      Add Search Icon
    //      Add X Icon to close search
    //      Add below the search input a box with options.
    //      Changing Options requests the search again with new params?
    //      ONLY show first 5 items when in dropdown search mode. Have 'show more' button for full request.  View All Results
    //      Full request loads the items into the directory instead.

    // Save dropdown search results on client so when user 'off-clicks' and clicks back on, the results are loaded.

    // Go to directory button.
    //      Gets parent and loads directory. If a span... ?
    //      Loading spans does work: https://drive.nanode.one/folder/_GENERAL_?s=main

    // Save the current directory?
    // Load the new items just like a normal directory.
    // Change nav path to being the search query?
    // Back button moves you to the normal directory you were in.

    // Show Max 50 per Page.
    //      Save id of last item of 50 finds (server)
    //      On 'request another 50' start search from last item.

    // ALTERNATIVE:
    // Load requests in real time and display in a dropdown menu from the search
  }
})

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

// FILTER
// console.log(Object.values(Nodes).filter(node => {
//   return Object.values(node.data).some(s => s.toString().toLowerCase().includes('nanode'))
// }))

    // $($("tr[type='folder']", Table).get().reverse()).each(function(i, folder) {
    //   $(folder).insertAfter( Table.children[0]);
    // })

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

function collapseSpan(span, expand=false) {
  span = span ? (UserSettings.local.layout == 0 ? span.parentNode : span.closest('table')) : RCElement;
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
    ? `value= '${RCE == 'RCE' ? N_PareAttr(RCElement, 'node-id') : "_General_"}'><span class='flex-between-cent'><p>${RCE == 'RCE' ? N_PareAttr(RCElement, 'home-span') : "General"}</p><i class="fas fa-angle-down"></i></span><div class='Popup_Dropdown_Content'>${spanList()}</div>`
    : `value='${NodeID}'><p>Current</p>`;
  function spanList() {
    let HTML_Spans = "";
    for (let [id,data] of Object.entries(Spans)) { if (id=='_MAIN_') {continue};
    HTML_Spans += `<a value='${id}'>${data.name}</a>` };
    return HTML_Spans; }
}

function renameItem(e) {
  let focusedElement = RCElement;
  
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
    NodeAPI('edit', {"action": "DATA", "section": Section, "id": focusedElement.getAttribute('node-id'), "data": { "name": targetInput.value }, "path": NodeID}, true)
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