// *
// ?
// !
/**
 * @param  {} e
 * This is a function that is called by {@link ViewItem}
*/
///////////////////////////////////////////////////////////////////////////////////////////////////

let SearchNodes = {};


Search = () => {
  const searchConfig = {
    searchNodeElements: 0,
    searchNodeSelected: 0,
    arrowCycleIndex: 0,
    // parameters: {input: '', dir: '', desc: true, preName: true, for: ''},
  }
  const searchElem = {
    search: document.querySelector('input.search'),
    Controls: document.getElementsByClassName('searchControls')[0],

    Container: document.getElementsByClassName('searchContainer')[0],
    Dropdown: document.getElementsByClassName('searchDropdown')[0],
    ParamsContainer: document.getElementsByClassName('searchParamsContainer')[0],

    Results: document.querySelector('.searchResults tbody'),
    Suggested: document.getElementsByClassName('searchSuggested')[0],
  }

  SetListeners_ = () => { Listeners(); Params(); }
  SetEvents_ = () => {  }

  // ====================================

  // Listeners
  Listeners = () => {
    searchElem.search.addEventListener('click', (e) => {
      if (!searchElem.Container.classList.contains('searchActive')) Open();
    })

    searchElem.search.addEventListener('keydown', async(e) => { // Search
      if (e.keyCode === 13) { e.preventDefault(); this.FetchSearch(e.target.value) }
      else if (e.keyCode === 8 && e.target.value.length === 1) { this.Suggested() }
    })
    N_.Find('.searchSubmit', false, searchElem.Controls).addEventListener('click', () => this.FetchSearch(searchElem.search.value))

    N_.Find('.searchParams', false, searchElem.Controls).addEventListener('click', (e) => {
      e.target.classList.toggle('active');
      searchElem.ParamsContainer.classList.toggle('display');
    })
  }
  ResultListeners = () => {
    N_.Find('tr > [sNode-event]', true, searchElem.Results).forEach(el => el.addEventListener('click', (e) => {
      e.stopPropagation();
      let nodeID = el.parentNode.getAttribute('node-id');
      let searchEvent = el.getAttribute('sNode-event');

      if (searchEvent == 'visit-loc') {
        Navigate.Shortcut(SearchNodes[nodeID].data.parent, nodeID);
        this.Close();
      } else if (searchEvent == 'view-info') {
        FetchItemInformation(nodeID, true)
      } else if (searchEvent == 'ext-link') {
        N_.ExternalTab(nodeID);
      }
    }));

    searchConfig.searchNodeElements.forEach(el => el.addEventListener('click', e => this.SearchItemSelected(el)))

    document.removeEventListener('keydown', ArrowCycle);
    document.addEventListener('keydown', ArrowCycle);
  };
  Params = () => {
    N_.Find('.searchBy input', true).forEach(input => {
      input.addEventListener('change', (e) => {
        if (e.target.checked) {
          let option = e.target.value;
          if (option == 'size') { // Set Min Max Input
          }
        }
      })
    })
  }

  
  // Events
  ArrowCycle = (e=window.event) => {
    CycleNodes = (index) => {
      searchConfig.searchNodeSelected && searchConfig.searchNodeSelected.classList.remove('ItemSelected')
      searchConfig.searchNodeSelected = searchConfig.searchNodeElements[searchConfig.arrowCycleIndex];
      searchConfig.searchNodeSelected.classList.add('ItemSelected');
    }

    if (e.keyCode === 38) {
      CycleNodes(searchConfig.arrowCycleIndex = --searchConfig.arrowCycleIndex <= -1 ? searchConfig.searchNodeElements.length-1 : searchConfig.arrowCycleIndex--);
    } else if (e.keyCode === 40) {
      CycleNodes(searchConfig.arrowCycleIndex = searchConfig.arrowCycleIndex++ >= searchConfig.searchNodeElements.length-1 ? 0 : searchConfig.arrowCycleIndex++);
    } else if (e.keyCode === 39) { // ! Triggers the recalling of the search with enter. this uses right arrow.
      // TODO Could add a 'ItemSelected' feature to show a right arrow to let users know.
      // TODO Could also just show the popups, and use left/right arrow keys to switch through them.
      SearchItemSelected(searchConfig.searchNodeSelected);
    } else {return};
  }
  SearchItemSelected = (el) => {
    let nodeID = el.getAttribute('node-id')
    SearchNodes[nodeID].data.type.file
      ? Navigate.Shortcut(SearchNodes[nodeID].data.parent, nodeID)
      : NodeCall({"Folder": nodeID});
      this.Close();
  }
  Search.RemoveSuggestedResult = (e) => {
    let searches = JSON.parse(localStorage.getItem('recent-searches')) || ['Documents'];
    let suggested = e.parentNode.getAttribute('sugRes');
    if (searches.includes(suggested)) searches.splice(searches.indexOf(suggested), 1);

    localStorage.setItem('recent-searches', JSON.stringify(searches));
    e.parentNode.remove();
  }
  // Render Events
  Open = (RESULTS) => {
    searchElem.Container.classList.add('searchActive');
    searchElem.Dropdown.classList.add('display');
    RESULTS || searchElem.Results.innerHTML.length ? searchElem.Results.parentNode.classList.add('display') : searchElem.Results.parentNode.classList.remove('display');
    this.Suggested(RESULTS);

    document.addEventListener('mousedown', Close);
    document.addEventListener('keydown', ArrowCycle);
  }
  Close = (e) => {
    if (!e || !searchElem.Container.contains(e.target)) {
      searchElem.Container.classList.remove('searchActive');
      searchElem.Dropdown.classList.remove('display');
      if (!searchElem.search.value) searchElem.Results.innerHTML = '';
      document.removeEventListener('mousedown', Close);
      document.removeEventListener('keydown', ArrowCycle);
    }
  }


  // Render
  Render = (content=``) => {
    this.Open('RESULTS');
  
    Object.values(SearchNodes).slice(0, 5).forEach(node => {
      content += `
        <tr type='${node.data.type.general}' node-id='${node.data.id}'>
          <td><img loading='lazy' height='38' width='38' src='${N_.FileIcon(node.data, 38, 38, 'main')}'></img></td>
          <td>${N_.CapFirstLetter(node.data.name)}</td>
          <td ${node.data.type.file && "sNode-event='ext-link' title='Open Externally'><i class='fas fa-external-link-alt'></i>"}</td>
          <td sNode-event='view-info' title='View Information'><i class="fas fa-info"></i></td>
          <td sNode-event='visit-loc' title='Visit Location'><i class="fas fa-location-arrow"></i></td>
        </tr>
      `;
    });
  
    if (Object.keys(SearchNodes).length > 5) {
      content += `<button class='searchInfoBtn searchLoadMore notif-btn'>Load More</button>`;
    }
  
    searchElem.Results.innerHTML = // If the content is empty (no items returned, shows no matches button)
      content || `<button class='searchInfoBtn searchNoMatch notif-btn'>No Matches Found</button>`;
  
    searchConfig.searchNodeElements = searchElem.Results.querySelectorAll('[search-nodes] tr');
    searchConfig.arrowCycleIndex = -1;
    this.ResultListeners();
  }
  Suggested = (RESULTS=false) => {
    if (RESULTS) {
      searchElem.Suggested.classList.remove('display');
    } else if (!searchElem.Results.parentNode.classList.contains('display')) {
      searchElem.Suggested.classList.add('display');
      searchElem.Suggested.children[1].innerHTML = this.SearchCache('READ').reduce((a, b) => a + `
        <li class='flex-between-cent' sugRes='${b}'>${b}<i onclick='Search.RemoveSuggestedResult(this)' class="fas fa-times"></i></li>`, ``);

      N_.Find('li', true, searchElem.Suggested).forEach(e => e.addEventListener('click', (e) => {
        let savedSearch = e.target.innerText;
        searchElem.search.value = savedSearch;
        this.FetchSearch(savedSearch, false);
      }))
    }
  }


  // Recent Search Cache
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

  
  // API
  FetchSearch = async(search, parameters=true) => {
    let params = {"input": search}
    
    if (parameters) {
      searchElem.ParamsContainer.querySelectorAll('input:checked').forEach((option) => {
        console.log(option.value)
      })
    }

    // dir: XXXX | homepage
    // include: description | names
    // for: folders | files

    // return;
      
    if (params.input) {
      let req = await API_Post({url: `/search`, body: params});
      this.SearchCache('WRITE', params.input);
      
      SearchNodes = {};
      req.Found.forEach((item) => {
        SearchNodes[item.id] = new Node(item);
      })
  
      this.Render();
    }
  }


  // ====================================

  this.SetListeners_(), this.SetEvents_();

  Search.Close = Close;
}


Filter = (layout, elem, container) => {
  if (!layout) { return; }
  elem.addEventListener('keyup', e => {
    let searchVal = e.target.value.toString().toLowerCase();
    Object.values(Nodes).forEach(node => {
      if (!Object.values(node.data).some(s => s.toString().toLowerCase().includes(searchVal))) {
        container.querySelector(`[node-id='${node.data.id}']`).classList.add('ItemHidden')
      } else {
        container.querySelector(`[node-id='${node.data.id}']`).classList.remove('ItemHidden')
      }
    })
  })
}


Order = () => {
  Order.Listeners = (layout, container) => {
    if (!layout) { return; }
    N_.Find('[order]', true, container.children[0]).forEach(el => el.addEventListener('click', (e) => {
      let orderType = el.getAttribute('order');
  
      if (!OrderCache[NodeID]) //?   0 == initial. 1 == highest first. 2 == lowest first.
        OrderCache[NodeID] = {'type': orderType, 'pos': 1}
      else if (OrderCache[NodeID].type !== orderType)
        OrderCache[NodeID] = {'type': orderType, 'pos': 1}
      else
        OrderCache[NodeID] = {'type': orderType, 'pos': (OrderCache[NodeID].pos + 1) % 3} // % 3 sets 2 as limit, if 2 + 1 == 3, sets to 0.
  
      Order.SetOrderVisuals();
  
      container.children[1].innerHTML = renderContent.listNode({"nodeIDs": Nodes})
      
      ItemClickListener(layout);
    }))
  }

  Order.OrderNodes = (nodes={}) => {
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

  Order.SetOrderVisuals = () => {
    if (!OrderCache[NodeID]) { return }
    const {type, pos} = OrderCache[NodeID];

    let curIcon = N_.Find('[order] > i.fas');
    if (curIcon) curIcon.classList = '';

    if (pos === 0) { return; }

    N_.Find(`[order='${type}'] > i`).classList.add('fas', 
      pos === 1
        ? 'fa-chevron-up'
        : 'fa-chevron-down'
    )
  }
}



Order();
Search();




/**
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