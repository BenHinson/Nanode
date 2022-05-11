
Search = () => {
  const searchConfig = {
    SearchNodes: {},
    searchNodeElements: 0,
    searchNodeSelected: 0,
    arrowCycleIndex: 0,
    prevSearch: '',
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
  SetEvents_ = () => { SetParams(); }

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
        Navigate.Shortcut(searchConfig.SearchNodes[nodeID].data.parent, nodeID);
        this.Close();
      } else if (searchEvent == 'view-info') {
        ItemInformation.Load(nodeID, true)
      } else if (searchEvent == 'ext-link') {
        N_.ExternalTab(nodeID);
      }
    }));

    if (searchConfig.loadMore === true) {
      N_.Find('button.searchLoadMore').addEventListener('click', () => {
        Main.NodeCall({'skip':true}, { // , 'reload': false
            Parent: {
              id: 'SEARCH',
              name: `Search: ${searchConfig.prevSearch}`
            },
            Contents: {
              'SEARCH': {
                contents: searchConfig.searchResults.reduce((obj, cur) => {return { ...obj, [cur.id]: cur };}, {}),
                name: `Search: ${searchConfig.prevSearch}`
              }
            }
          }
        );

        this.Close();
        // Create a new directory + header. > 'Search: input'. Cannot move back into it -> If SearchNodes is empty. otherwise we can reload.
      })
    }

    searchConfig.searchNodeElements.forEach(el => el.addEventListener('click', e => this.SearchItemSelected(el)))

    document.removeEventListener('keydown', ArrowCycle);
    document.addEventListener('keydown', ArrowCycle);
  };
  Params = () => {
    N_.Find('.searchSelectors input', true).forEach(input => {
      input.addEventListener('change', (e) => {
        let targetValue = e.target.getAttribute('value')

        if (targetValue.match(/withinAll|withinParent/)) {
          let opposite = targetValue=='withinAll' ? 'withinParent' : 'withinAll';
          Settings.Local.search_options[opposite] = !e.target.checked;
        } else if (targetValue.match(/forFolders|forFiles/) && e.target.checked == false) {
          let opposite = targetValue=='forFolders' ? 'forFiles' : 'forFolders';
          if (Settings.Local.search_options[opposite] === false) {
            N_.Find(`.searchSelectors input[value=${opposite}]`).checked = true;
            Settings.Local.search_options[opposite] = true;
          }
        }

        Settings.Local.search_options[e.target.getAttribute('value')] = e.target.checked;
        localStorage.setItem('local-settings', JSON.stringify(Settings.Local));

        // if (e.target.checked) {
        //   let option = e.target.value;
          // if (option == 'size') { // Set Min Max Input
          // }
        // }
      })
    })
  }


  // Load
  SetParams = () => {
    // console.log(Settings.Local.search_options);
    for (const [key, val] of Object.entries(Settings.Local.search_options)) {
      if (val == true) N_.Find(`input[value=${key}]`).checked = true;
    }
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
    searchConfig.SearchNodes[nodeID].data.type.file
      ? Navigate.Shortcut(searchConfig.SearchNodes[nodeID].data.parent, nodeID)
      : Main.NodeCall({"folder": nodeID});
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
  
    Object.values(searchConfig.SearchNodes).slice(0, 5).forEach(node => {
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
  
    if (Object.keys(searchConfig.SearchNodes).length > 5) {
      searchConfig.loadMore = true;
      content += `<button class='searchInfoBtn searchLoadMore notif-btn'>Load More</button>`;
    } else { searchConfig.loadMore = false; }
  
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
    // ? Idea: Save params for the searches.
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
    let params = {...Settings.Local.search_options, ...{"input": search}}

    if (params.withinParent && Main.NodeID !== 'homepage') { params.withinParent = Main.NodeID }

    // dir: XXXX | homepage
    // include: description | names
    // for: folders | files

    // return;
      
    if (params.input) {
      let res = await App.API_Post({url: `/search`, body: params});
      this.SearchCache('WRITE', params.input);

      searchConfig.prevSearch = search;
      searchConfig.searchResults = res.Found;
      
      searchConfig.SearchNodes = {};
      res.Found.forEach((item) => {
        searchConfig.SearchNodes[item.id] = new Node(item);
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
    Object.values(App.Nodes).forEach(node => {
      // const x = (({ size, name }) => ({ size, name }))(App.Nodes["13b70350-b387-11eb-8dc3-a3f64cd6604e"].data);
      if (!Filter.filterNodeValues(node.data).some(s => s.includes(searchVal))) {
      // if (!Object.values(node.data).some(s => s.toString().toLowerCase().includes(searchVal))) {
        container.querySelector(`[node-id='${node.data.id}']`).classList.add('ItemHidden')
      } else {
        container.querySelector(`[node-id='${node.data.id}']`).classList.remove('ItemHidden')
      }
    })
  })

  Filter.filterNodeValues = (nodeData) => {
    return [
      nodeData.color,
      (nodeData.mime).toLowerCase(),
      (nodeData.name).toLowerCase(),
      N_.ConvertSize(nodeData.size).toLowerCase(),
      nodeData.time?.modified?.stamp || '',
      nodeData.time?.created?.stamp || '',
      nodeData.type.file ? 'file' : 'folder',
    ]
  }
}


Order = () => {
  const OrderCache = {}; // Caches the order of directories. Is also used for re-ordering.

  Order.Listeners = (layout, container) => {
    if (!layout) { return; }
    N_.Find('[order]', true, container.children[0]).forEach(el => el.addEventListener('click', (e) => {
      let orderType = el.getAttribute('order');
  
      if (!OrderCache[Main.NodeID]) //?   0 == initial. 1 == highest first. 2 == lowest first.
        OrderCache[Main.NodeID] = {'type': orderType, 'pos': 1}
      else if (OrderCache[Main.NodeID].type !== orderType)
        OrderCache[Main.NodeID] = {'type': orderType, 'pos': 1}
      else
        OrderCache[Main.NodeID] = {'type': orderType, 'pos': (OrderCache[Main.NodeID].pos + 1) % 3} // % 3 sets 2 as limit, if 2 + 1 == 3, sets to 0.
  
      Order.SetOrderVisuals();
  
      container.children[1].innerHTML = Directory.listNode({"nodeIDs": Object.keys(App.Nodes)})
      
      ItemClickListener(layout);
    }))
  }

  Order.OrderNodes = (nodes={}) => {
    if (!OrderCache[Main.NodeID]) { return; }
    const {type, pos} = OrderCache[Main.NodeID];

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
    if (!OrderCache[Main.NodeID]) { return }
    const {type, pos} = OrderCache[Main.NodeID];

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