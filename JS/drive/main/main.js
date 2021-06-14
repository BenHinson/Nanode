let FolderCall = true; // If Route Was Called by Clicking on a Folder
DownloadItems = [];

// ====================================

// @ == Initialise Main Page
NodeCall({"Folder":NodeName});

// ====================================

async function NodeCall(CallData, res) {
  const {Folder=NodeName || NodeID, Reload=true, Skip=false} = CallData;

  FolderCall = Reload;

  if (Skip === false) { res = await API_Fetch({url:`/folder/${Folder.toLowerCase()}?s=main`}) }

  if (res.Auth) { new SecurityInputContainer(res); } //  RightBar_Security_Inputs(res);
  else if (res.Parent) {
    NodeName = res.Parent.id == "homepage" ? "homepage" : res.Parent.name;
    NodeID = res.Parent.id;
    
    Spans = {}, Nodes = {}, NodeSelected = [];

    // Create Nodes   >   SET ORDER HERE TO GET IE FOLDERS AT THE TOP. DONT CHANGE IT IN RENDERING. WASTES TIME
    for (const [span, contents] of Object.entries(res.Contents)) {
      Spans[span] = {"id": span, "name": contents.name, "nodes": Object.keys(contents.contents)};
      for (const [id, data] of Object.entries(contents.contents)) {
        Nodes[id] = new Node(data, id, span);
      }
    }

    Route(NodeID, NodeName);
    renderContent();
    setupFileMove();
  }
}

NodeAPI = async(Location, Form, Skip=true) => { // For Creating or Editing Nodes
  // Skip Etiquette: IF Path GIVEN in Form. Skip must be TRUE or BLANK.
  // Only False if Path NOT given, but call must happen. (IN which case... just give path..?)
  let res = await API_Post({url: `/${Location}`, body: Form});
  N_ClientStatus(2, "True", 400); N_ClientStatus(8, "Off");
  if (res.Error) { return N_Error(res.Error); }
  NodeCall({Skip, 'Reload': false}, res);
  return {};
}