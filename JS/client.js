NanoName = "Homepage";
Directory_Tree = [];  // Array of Trees, Uses Last Tree, New Tree on More than 1 Step. ie: Home / dirBtn. Saves Forward/Backward
Directory_Route = []; // The Current Route, is whats used for the dir btns. Doesnt Store Forward
Tree_Number = 0; // Current Tree Index
Tree_Steps = 0; // Current Index in Tree
FolderCall = true; // If Route Was Called by Clicking on a Folder

Directory_Content = '';
NanoSelected = "";
UserSettings = {};


// Connect to socket.io
window.socket = io.connect('https://Nanode.one', {reconnection:false});

//////////////////////////////////////////
//////////////////////////////////////////

document.addEventListener("DOMContentLoaded", async(event) => { 
  
  await Settings_Call();
  Directory_Call(NanoName);

  // Check for Connection
  if (socket !== undefined) {

    socket.on('connect', function() { setTimeout(function() { clientStatus("CS0", "Ok"); Socket_Reconnect(true); }, 1000) })
    socket.on('disconnect', function() {clientStatus("CS0", "False"); Socket_Reconnect(false); })
    socket.on('connect_error', function() {clientStatus("CS0", "False"); Socket_Reconnect(false); })
    socket.on('connect_failed', function() {clientStatus("CS0", "Wait"); })


    socket.on("Directory", (Folder_Response) => { // 3 Server Side Events Emit to this
      // ItemLockEntries - (Successfull Locked Input), ItemCreate, ItemEdit
      Directory_Call(false, true, true, Folder_Response);
    })


    socket.on("CodexContent", function(codexContents) { readCodex(codexContents); })
    socket.on('CodexProgress', function(itemNumber) { codexUploadProgress(itemNumber) })
    socket.on('BinContent', function(binContent) { readBin(binContent); })

    
    socket.on('Link_Return', function(Type, Returned) {
      clientStatus("CS3", "True", 500);
      let element = ''
      if (Type == "LINK") { element = $(".ItemInfo_Link_Input")[0] };
      if (Type == "DOWNLOAD") { element = $(".ItemInfo_Download_Input")[0] };

      element.value = Returned;
      $(element).on("click", function(e) {
        e.target.select();
        document.execCommand('copy');
      })
    });
  
  }
});

function Socket_Reconnect(status) {
  let Recon = document.getElementById('Recon_Btn');
  Recon.style.display = status === true ? "none" : "block";
  if (status === false) {
    Recon.innerText = Recon.innerText == "Reconnecting" ? "Failed" : "Reconnect";
    Recon.addEventListener("click", function() {if (socket) { Recon.innerText = "Reconnecting"; socket.connect(); } }) }
}

Settings_Call = async() => {
  if (JSON.parse(localStorage.getItem('user-settings'))) {
    return readSettings( JSON.parse(localStorage.getItem('user-settings')) );
  } else {
    let Settings_Request = await fetch('https://drive.nanode.one/settings');
    let Settings_Response = await Settings_Request.json();
    if (Settings_Response.Error) { noSettings(); return false; }
    else {
      localStorage.setItem('user-settings', JSON.stringify(Settings_Response.Settings))
      return readSettings(Settings_Response.Settings);
    }
  }
}

Directory_Call = async(Folder, RefreshPath=true, SkipCall, Folder_Response) => {
  FolderCall = RefreshPath;

  if (!SkipCall) {
    clientStatus("CS4", "Wait");
    let Folder_Request = await fetch('https://drive.nanode.one/folder/'+Folder);
    Folder_Response = await Folder_Request.json();
    clientStatus("CS4", "Off"); clientStatus("CS7", "Wait", 800);
  }

  if (Folder_Response.Locked) { RightBar_Security_Inputs(Folder_Response.Locked) }
  else if (Folder_Response.Parent) {
    NanoName = Folder_Response.Parent.NanoID == "Homepage" ? "Homepage" : Folder_Response.Parent.Name;
    NanoID = Folder_Response.Parent.NanoID;

    Directory_Content = Folder_Response.Contents;

    Route(NanoID, NanoName);

    UserSettings.ViewT == 0 ? viewContentAsBlock(NanoID) : viewContentAsList(NanoID);

    uploadDirectory = NanoName == "Homepage" ? "Uploads" : NanoName;

    setupFileMove();
  }
}