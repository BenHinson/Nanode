$(".New").on("click", function() {
  if (document.getElementsByClassName('NewOptions')[0]) { document.getElementsByClassName('NewOptions')[0].remove(); return; }
  $(".ItemInformation").before( `<span class='NewOptions'> <div id='uploadBtn' style='background:linear-gradient(40deg, #2993d8, #203ed3)'><i class='fas fa-cloud-upload-alt'></i>Upload</div> <div id='folderBtn' style='background:linear-gradient(40deg, #ddaa1f, #b35632)'><i class='fas fa-folder-plus'></i>Folder</div> </span>` )

  document.getElementById('uploadBtn').addEventListener("click", function() { PopUp_Upload() });
  document.getElementById('folderBtn').addEventListener("click", function() { PopUp_New_Folder() });
})

$(".Switch.SW_View").on("click", function() {
 ChangeView();
})

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

function ItemClickListener(View) {
  let Items = (View == 0 ? fileContainer.querySelectorAll('div[nano-id]:not([home-span]):not([Sub-Span])') : fileContainer.querySelectorAll('tr[nano-id]'));

  $(Items).on("click", function(selected) {
    if (selected.currentTarget.hasAttribute('focus')) { return; }
    selected = selected.currentTarget;

    if (keyMap["Shift"] == true || keyMap["Control"] == true) { SelectItem(selected); return; }

    if (!selected.classList.contains('noOpen')) {
      ItemActions(selected);
      N_ClientStatus("CS5", "Ok", 500);
    }
  })
}

function SelectItem(item, force) {
  if (!item) {return;}
  $(document.body).off("click");


  if (item.hasAttribute('selected') && !force) { // Remove from Selected
    item.removeAttribute('selected');
    item.classList.remove('ItemSelected');
    NanoSelected = NanoSelected.filter(id => id !== item.getAttribute('nano-id'));
  } else if (item.hasAttribute('nano-id')) { // Add to Selected
    item.setAttribute('selected', true);
    item.classList.add('ItemSelected');
    NanoSelected.includes(item.getAttribute('nano-id')) ? '' : NanoSelected.push(item.getAttribute('nano-id'));
  }

  if (NanoSelected.length) { // Add Listener to Document for Off-Clicks
    setTimeout(function() {
      $(document.body).on("click",function(e) {
        if (!$(e.target).parents('.fileContainer').length && !$(e.target).parents('.RightClickContainer').length) {
          NanoSelected = [];
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

  let clicked = selected.getAttribute("nano-id");
  let type = selected.getAttribute("type");

  if (type == "folder") { HomeCall({"Folder":selected.getAttribute('nano-id')}); }
  else if (type.match(/image|text|video/g)) { ViewItem(type, clicked) }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

document.querySelector('input.search').addEventListener('change', async(e) => { // Search
  let searchInput = e.target.value;
  let searchParams = {"mine": "up"}
  if (searchInput) {
    let req = await fetch(`https://drive.nanode.one/search/${searchInput}`, {
      method:'POST',
      headers: {'Content-Type': 'application/json'},
      body: new Blob( [ JSON.stringify(searchParams) ], { type: 'text/plain' }),
    })
    let request = await req.json();
    console.log(request);

    // Stretch search to whole topbar.
    //      Add Search Icon
    //      Add X Icon to close search
    //      Add below the search input a box with options.
    //      Changing Options requests the search again with new params?
    //      ONLY show first 5 items when in dropdown search mode. Have 'show more' button for full request.  View All Results
    //      Full request loads the items into the directory instead.

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

function ChangeView() {
  let ListView = Boolean(UserSettings.ViewT); // 0=false, 1+ = true
  UserSettings.ViewT = ListView ? 0 : 1; // Inverts ViewT
  document.querySelector('.Slider.SL_View').style.transform = `translateX(${ListView ? 28 : 0}px)`;
  HomeCall({"Folder":NanoID, "Reload":false});
}

function collapseSpan(span, expand=false) {
  span = span ? (UserSettings.ViewT == 0 ? span.parentNode : span.parentNode.parentNode.parentNode) : RCElement;
  if (UserSettings.ViewT == 0) {
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

function createLocation() {
  return  NanoName == "homepage" 
    ? `value='_GENERAL_'><p>General</p><i class="fas fa-angle-down"></i><div class='Popup_Dropdown_Content'>${spanList()}</div>`
    : `value='${NanoID}'><p>Current</p>`;
  function spanList() { let HTML_Spans = ""; for (let [id,data] of Object.entries(Directory_Content)) { HTML_Spans += `<a value='${id}'>${data.name}</a>` }; return HTML_Spans; }
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
    EditPOST({"action": "DATA", "section": Section, "id": focusedElement.getAttribute('nano-id'), "data": { "name": targetInput.value }, "path": NanoID}, true)
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