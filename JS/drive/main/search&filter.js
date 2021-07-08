// *
// ?
// !
/**
 * @param  {} e
 * This is a function that is called by {@link ViewItem}
*/
///////////////////////////////////////////////////////////////////////////////////////////////////

let SearchNodes = {};


// searchControls
//    searchParams
//    searchSubmit


Search = async() => {
  const ele_search = document.querySelector('input.search');
  const ele_Controls = document.getElementsByClassName('searchControls')[0];

  const ele_Container = document.getElementsByClassName('searchContainer')[0];
  const ele_Dropdown = document.getElementsByClassName('searchDropdown')[0];
  const ele_ParamsContainer = document.getElementsByClassName('searchParamsContainer')[0];

  const ele_Results = document.querySelector('.searchResults tbody');
  const ele_Suggested = document.getElementsByClassName('searchSuggested')[0];

  let searchNodeElements, searchNodeSelected, arrowCycleIndex = 0;
  parameters = {input: '', dir: '', desc: true, preName: true, for: ''};

  // @ == Listeners
  Listeners = () => {
    ele_search.addEventListener('click', (e) => {
      if (!ele_Container.classList.contains('searchActive')) Open();
    })

    ele_search.addEventListener('keydown', async(e) => { // Search
      if (e.keyCode === 13) { e.preventDefault(); FetchSearch(e.target.value) }
      else if (e.keyCode === 8 && e.target.value.length === 1) { Suggested() }
    })
    N_Find('.searchSubmit', false, ele_Controls).addEventListener('click', () => FetchSearch(ele_search.value))

    N_Find('.searchParams', false, ele_Controls).addEventListener('click', (e) => {
      e.target.classList.toggle('active');
      ele_ParamsContainer.classList.toggle('display');
    })
  }

  ResultListeners = () => {

    N_Find('tr > [sNode-event]', true, ele_Results).forEach(el => el.addEventListener('click', (e) => {
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

  FetchSearch = async(search, parameters=true) => {
    let params = {"input": search}
    
    if (parameters) {
      ele_ParamsContainer.querySelectorAll('input:checked').forEach((option) => {
        console.log(option.value)
      })
    }

    // dir: XXXX | homepage
    // include: description | names
    // for: folders | files
    // 

    // return;// @@@@@@@@@@@@@@@@@@@
      
    if (params.input) {
      let req = await API_Post({url: `/search`, body: params});
      SearchCache('WRITE', params.input);
      
      SearchNodes = {};
      req.Found.forEach((item) => {
        SearchNodes[item.id] = new Node(item);
      })
  
      Render();
    }

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
    Open('RESULTS');
  
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
  
    ele_Results.innerHTML = // If the content is empty (no items returned, shows no matches button)
      content || `<button class='searchInfoBtn searchNoMatch notif-btn'>No Matches Found</button>`;
  
    searchNodeElements = ele_Results.querySelectorAll('[search-nodes] tr');
    arrowCycleIndex = -1;
    ResultListeners();
  }
  Suggested = (RESULTS=false) => {
    if (RESULTS) {
      ele_Suggested.classList.remove('display');
    } else if (!ele_Results.parentNode.classList.contains('display')) {
      ele_Suggested.classList.add('display');
      ele_Suggested.children[1].innerHTML = SearchCache('READ').reduce((a, b) => a + `<li>${b}</li>`, ``);

      N_Find('li', true, ele_Suggested).forEach(e => e.addEventListener('click', (e) => {
        let savedSearch = e.target.innerText;
        ele_search.value = savedSearch;
        FetchSearch(savedSearch, false);
      }))
    }
  }

  // @ == Recent Search Cache
  SearchCache = (action, search) => { // READ|WRITE, 'example.png'
    let searches = JSON.parse(localStorage.getItem('recent-searches')) || ['Documents'];
    if (action == 'WRITE' && !searches.includes(search)) { // write to the recent searches
      if (searches.length > 4) searches.shift();
      searches.push(search)
      localStorage.setItem('recent-searches', JSON.stringify(searches));
    } else if (action == 'READ') { // Read recent searches
      return JSON.parse(localStorage.getItem('recent-searches')) || ['Documents'];
    }
  }


  Open = (RESULTS) => {
    ele_Container.classList.add('searchActive');
    ele_Dropdown.classList.add('display');
    RESULTS || ele_Results.innerHTML.length ? ele_Results.parentNode.classList.add('display') : ele_Results.parentNode.classList.remove('display');
    Suggested(RESULTS);

    document.addEventListener('mousedown', Close);
    document.addEventListener('keydown', ArrowCycle);
  }
  Close = (e) => {
    if (!e || !ele_Container.contains(e.target)) {
      ele_Container.classList.remove('searchActive');
      ele_Dropdown.classList.remove('display');
      if (!ele_search.value) ele_Results.innerHTML = '';
      document.removeEventListener('mousedown', Close);
      document.removeEventListener('keydown', ArrowCycle);
    }
  }

  Search.Close = Close;

  Listeners();
  Params();
}


Filter = (layout, elem, container) => {
  if (!layout) { return; }
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


Order = () => {

  // @ == Listeners
  Listeners = (layout, container) => {
    if (!layout) { return; }
    N_Find('[order]', true, container.children[0]).forEach(el => el.addEventListener('click', (e) => {
      let orderType = el.getAttribute('order');
  
      if (!OrderCache[NodeID]) //?   0 == initial. 1 == highest first. 2 == lowest first.
        OrderCache[NodeID] = {'type': orderType, 'pos': 1}
      else if (OrderCache[NodeID].type !== orderType)
        OrderCache[NodeID] = {'type': orderType, 'pos': 1}
      else
        OrderCache[NodeID] = {'type': orderType, 'pos': (OrderCache[NodeID].pos + 1) % 3} // % 3 sets 2 as limit, if 2 + 1 == 3, sets to 0.
  
      this.SetOrderVisuals();
  
      container.children[1].innerHTML = renderContent.listNode({"nodeIDs": Nodes})
      
      ItemClickListener(layout);
    }))
  }


  this.OrderNodes = (nodes={}) => {
    if (!OrderCache[NodeID]) { return; }
    const {type, pos} = OrderCache[NodeID];

    if (pos === 0) { return Object.keys(nodes) }
    nodes = Object.values(nodes);

    if (type === 'size') {
      nodes.sort((a, b) => pos === 1
        ? b.data["size"] - a.data["size"]
        : a.data["size"] - b.data["size"])
    } else if (type === 'modified') {
      nodes.sort((a, b) => pos === 1
        ? new Date(b.data.time?.modified?.stamp || b.data.time?.created?.stamp) - new Date(a.data.time?.modified?.stamp || a.data.time?.created?.stamp)
        : new Date(a.data.time?.modified?.stamp || a.data.time?.created?.stamp) - new Date(b.data.time?.modified?.stamp || b.data.time?.created?.stamp));
    }

    return nodes.map(n => n.data.id);
  }

  this.SetOrderVisuals = () => {
    if (!OrderCache[NodeID]) { return }
    const {type, pos} = OrderCache[NodeID];

    let curIcon = N_Find('[order] > i.fas');
    if (curIcon) curIcon.classList = '';

    if (pos === 0) { return; }

    N_Find(`[order='${type}'] > i`).classList.add('fas', 
      pos === 1
        ? 'fa-chevron-up'
        : 'fa-chevron-down'
    )
  }

  Order.Listeners = Listeners;
  Order.OrderNodes = OrderNodes;
  Order.SetOrderVisuals = SetOrderVisuals;
}



Order();
Search();




/**
 * Design:
 *      Add Search Icon to submit search
 *      Add X Icon to close search
 * 
 * Results:
 *      Button to show All Results in a custom directory.
 *      Save dropdown search results on client so when user 'off-clicks' and clicks back on, the results are loaded.
 *      Save the current directory?
 *      Load the new items just like a normal directory.
 * 
 * Change nav path to being the search query?
 * Back button moves you to the original directory you were in.
 * It is not added to that path. cannot return back into search results.
 * 
 * Show Max 50 per Page.
 *      Save id of last item of 50 finds (server)
 *      On 'request another 50' start search from last item.
*/