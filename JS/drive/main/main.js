let FolderCall = true; // If Route Was Called by Clicking on a Folder
DownloadItems = [];

// ====================================

// @ == Initialise Main Page
NodeCall({"Folder":NodeName});

// ====================================

async function NodeCall(CallData, res) {
  // const {Folder=NodeName || NodeID, Reload=true, Skip=false} = CallData;
  const {Folder=NodeID || NodeName, Reload=true, Skip=false} = CallData;

  FolderCall = Reload;

  // if (Skip === false) { res = await API_Fetch({url:`/folder/${Folder.toLowerCase()}?s=main`}) }
  if (Skip === false) { res = await API_Fetch({url:`/folder/${Folder}?s=main`}) }

  if (res.Auth) { new SecurityInputContainer(res); }
  else if (res.Parent) {
    NodeName = res.Parent.id == "homepage" ? "homepage" : res.Parent.name;
    NodeID = res.Parent.id;
    document.title = (NodeName !== 'homepage' ? NodeName : 'My Drive');
    
    Spans = {}, Nodes = {}, NodeSelected.clear();

    if (res.Contents.name) { NodeID=Folder; NodeName=res.Contents.name; // In the scenario of viewing a homepage span as a folder. We need to rejig the content.
      res.Contents = {[res.Contents.name]: res.Contents}; }

    for (let [span, contents] of Object.entries(res.Contents)) {
      Spans[span] = {"id": span, "name": contents.name, "nodes": Object.keys(contents.contents)};
      for (const [id, data] of Object.entries(contents.contents)) {
        Nodes[id] = new Node(data, id, span);
      }
    }

    Navigate.Route(NodeID, NodeName);
    renderContent();
    setupFileMove();
  }
}

NodeAPI = async(Location, Form, Skip=true) => { // For Creating or Editing Nodes
  // Skip Etiquette: IF Path GIVEN in Form. Skip must be TRUE or BLANK.
  // Only False if Path NOT given, but call must happen. (IN which case... just give path..?)

  Form.id ? Form.id = Array.from(Form.id) : '';

  let res = await API_Post({url: `/${Location}`, body: Form});
  N_.ClientStatus(2, "True", 400); N_.ClientStatus(8, "Off");
  if (res.Error) { return N_.Error(res.Error); }
  NodeCall({Skip, 'Reload': false}, res);
  return {};
}