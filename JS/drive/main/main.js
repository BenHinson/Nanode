let FolderCall = true; // If Route Was Called by Clicking on a Folder
DownloadItems = [];

// ====================================

// @ == Initialise Main Page
NodeCall({"Folder":App.NodeName});

// ====================================

async function NodeCall(CallData, res) {
  // const {Folder=NodeName || NodeID, Reload=true, Skip=false} = CallData;
  const {Folder=NodeID || App.NodeName, Reload=true, Skip=false} = CallData;

  FolderCall = Reload;

  // if (Skip === false) { res = await App.API_Fetch({url:`/folder/${Folder.toLowerCase()}?s=main`}) }
  if (Skip === false) { res = await App.API_Fetch({url:`/folder/${Folder}?s=main`}) }

  if (res.Auth) { new SecurityInputContainer(res); }
  else if (res.Parent) {
    App.NodeName = res.Parent.id == "homepage" ? "homepage" : res.Parent.name;
    NodeID = res.Parent.id;
    document.title = (App.NodeName !== 'homepage' ? App.NodeName : 'My Drive');
    
    App.Spans = {}, App.Nodes = {}, App.NodeSelected.clear();

    if (res.Contents.name) { NodeID=Folder; App.NodeName=res.Contents.name; // In the scenario of viewing a homepage span as a folder. We need to rejig the content.
      res.Contents = {[res.Contents.name]: res.Contents}; }

    for (let [span, contents] of Object.entries(res.Contents)) {
      App.Spans[span] = {"id": span, "name": contents.name, "nodes": Object.keys(contents.contents)};
      for (const [id, data] of Object.entries(contents.contents)) {
        App.Nodes[id] = new Node(data, id, span);
      }
    }

    Navigate.Route(NodeID, App.NodeName);
    renderContent();
    setupFileMove();
  }
}

NodeAPI = async(Location, Form, Skip=true) => { // For Creating or Editing Nodes
  // Skip Etiquette: IF Path GIVEN in Form. Skip must be TRUE or BLANK.
  // Only False if Path NOT given, but call must happen. (IN which case... just give path..?)

  Form.id ? Form.id = Array.from(Form.id) : '';

  let res = await App.API_Post({url: `/${Location}`, body: Form, skipErr:true});
  N_.ClientStatus(2, "True", 400); N_.ClientStatus(8, "Off");
  if (res.error) {
    N_.InfoPopup({'parent':N_.Find('.main_Page .PageData'), 'type': 'error', 'text':res.error, 'displayDelay':100, 'displayTime':4000});
    return N_.Error(res.error);
  }
  NodeCall({Skip, 'Reload': false}, res);
  return {};
}