// *
// ?
// !
/**
 * @param  {} e
 * This is a function that is called by {@link ViewItem}
*/
///////////////////////////////////////////////////////////////////////////////////////////////////

let SearchNodes = {};

// TODO  Searching for a homepage span item and Shortcutting to it doesnt work. the data doesnt load.

Search = async() => {
  const ele_search = document.querySelector('input.search');
  const ele_searchContainer = document.getElementsByClassName('searchContainer')[0];
  const ele_searchDropdown = document.getElementsByClassName('searchDropdown')[0];
  const ele_searchResults = document.querySelector('.searchResults tbody');
  const ele_searchParams = document.getElementsByClassName('searchParams')[0];
  const ele_searchParamsContainer = document.getElementsByClassName('searchParamsContainer')[0];

  let searchNodeElements, searchNodeSelected, arrowCycleIndex = 0;

  // @ == Listeners
  Listeners = () => {
    ele_search.addEventListener('click', (e) => {
      if (!ele_searchContainer.classList.contains('searchActive')) Open();
    })

    ele_search.addEventListener('keydown', async(e) => { // Search
      if (e.keyCode === 13) {
        e.preventDefault();
        let ele_searchParams = {"input": e.target.value}
      
        //   ele_searchParamsContainer.querySelectorAll('input:checked').forEach((option) => {
        //     console.log(option.value)
        //   })

        if (ele_searchParams.input) {
          FetchSearch(ele_searchParams)
        }
      }
    })

    ele_searchParams.addEventListener('click', (e) => {
      ele_searchParamsContainer.classList.toggle('display');
    })
  }

  ResultListeners = () => {

    N_Find('tr > [sNode-event]', true, ele_searchResults).forEach(el => el.addEventListener('click', (e) => {
      e.stopPropagation();
      let nodeID = el.parentNode.getAttribute('node-id');
      let searchEvent = el.getAttribute('sNode-event');

      if (searchEvent == 'visit-loc') {
        Shortcut(SearchNodes[nodeID].data.parent, nodeID);
        Close();
      } else if (searchEvent == 'view-info') {
        FetchItemInformation(nodeID, true)
      } else if (searchEvent == 'ext-link') {
        ExternalTab(nodeID);
      }
    }));

    searchNodeElements.forEach(el => el.addEventListener('click', e => SearchItemSelected(el)))

    document.removeEventListener('keydown', ArrowCycle);
    document.addEventListener('keydown', ArrowCycle);
  };

  ArrowCycle = (e=window.event) => {
    CycleNodes = (index) => {
      searchNodeSelected && searchNodeSelected.classList.remove('ItemSelected')
      searchNodeSelected = searchNodeElements[arrowCycleIndex];
      searchNodeSelected.classList.add('ItemSelected');
    }

    if (e.keyCode === 38) {
      CycleNodes(arrowCycleIndex = --arrowCycleIndex <= -1 ? searchNodeElements.length-1 : arrowCycleIndex--);
    } else if (e.keyCode === 40) {
      CycleNodes(arrowCycleIndex = arrowCycleIndex++ >= searchNodeElements.length-1 ? 0 : arrowCycleIndex++);
    } else if (e.keyCode === 39) { // ! Triggers the recalling of the search with enter. this uses right arrow.
      // TODO Could add a 'ItemSelected' feature to show a right arrow to let users know.
      // TODO Could also just show the popups, and use left/right arrow keys to switch through them.
      SearchItemSelected(searchNodeSelected);
    } else {return};
  }


  // @ == Request
  Params = () => {
    N_Find('.searchBy input', true).forEach(input => {
      input.addEventListener('change', (e) => {
        if (e.target.checked) {
          let option = e.target.value;
          if (option == 'size') { // Set Min Max Input
          }
        }
      })
    })
  }

  FetchSearch = async(params) => {
    let req = await API_Post({url: `/search`, body: params});
    
    SearchNodes = {};
    req.Found.forEach((item) => {
      SearchNodes[item.id] = new Node(item);
    })

    Render();
  }

  SearchItemSelected = async(el) => {
    let nodeID = el.getAttribute('node-id')
    SearchNodes[nodeID].data.type.file
      ? Shortcut(SearchNodes[nodeID].data.parent, nodeID)
      : NodeCall({"Folder": nodeID});
    Close();
  }


  // @ == Visuals
  Render = (content=``) => {
    Open('FORCE');
  
    Object.values(SearchNodes).slice(0, 5).forEach(node => {
      content += `
        <tr type='${node.data.type.general}' node-id='${node.data.id}'>
          <td><img loading='lazy' height='38' width='38' src='${N_FileIcon(node.data, 38, 38, 'main')}'></img></td>
          <td>${N_CapFirstLetter(node.data.name)}</td>
          <td ${node.data.type.file && "sNode-event='ext-link' title='Open Externally'><i class='fas fa-external-link-alt'></i>"}</td>
          <td sNode-event='view-info' title='View Information'><i class="fas fa-info"></i></td>
          <td sNode-event='visit-loc' title='Visit Location'><i class="fas fa-location-arrow"></i></td>
        </tr>
      `;
    });
  
    if (Object.keys(SearchNodes).length > 5) {
      content += `<button class='searchInfoBtn searchLoadMore notif-btn'>Load More</button>`;
    }
  
    ele_searchResults.innerHTML = // If the content is empty (no items returned, shows no matches button)
      content || `<button class='searchInfoBtn searchNoMatch notif-btn'>No Matches Found</button>`;
  
    searchNodeElements = ele_searchResults.querySelectorAll('[search-nodes] tr');
    arrowCycleIndex = -1;
    ResultListeners();
  }


  Open = (FORCE) => {
    ele_searchContainer.classList.add('searchActive');
    ele_searchDropdown.classList.add('display');
    FORCE || ele_searchResults.innerHTML.length ? ele_searchResults.parentNode.classList.add('display') : ele_searchResults.parentNode.classList.remove('display');

    document.addEventListener('mousedown', Close);
    document.addEventListener('keydown', ArrowCycle);
  }
  Close = (e) => {
    if (!e || !ele_searchContainer.contains(e.target)) {
      ele_searchContainer.classList.remove('searchActive');
      ele_searchDropdown.classList.remove('display');
      if (!ele_search.value) ele_searchResults.innerHTML = '';
      document.removeEventListener('mousedown', Close);
      document.removeEventListener('keydown', ArrowCycle);
    }
  }

  Search.Close = Close;

  
  Listeners();
  Params();
}

Search();

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

// $($("tr[type='folder']", Table).get().reverse()).each(function(i, folder) {
//   $(folder).insertAfter( Table.children[0]);
// })

Filter = (elem, container) => {
  elem.addEventListener('keyup', e => {
    Object.values(Nodes).forEach(node => {
      if (!Object.values(node.data).some(s => s.toString().toLowerCase().includes(e.target.value))) {
        container.querySelector(`[node-id='${node.data.id}']`).classList.add('ItemHidden')
      } else {
        container.querySelector(`[node-id='${node.data.id}']`).classList.remove('ItemHidden')
      }
    })
  })
}


// TODO   Move folders to the top of the directory.
// TODO   Add the functionality to sort and order table rows.








// Stretch search to whole top-bar.
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