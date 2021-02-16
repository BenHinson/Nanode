

if (socket !== undefined) {
  socket.on("Directory", (Folder_Response) => { // 3 Server Side Events Emit to this
    // ItemLockEntries - (Successfull Locked Input), ItemCreate, ItemEdit
    Directory_Call(false, true, true, Folder_Response);
  })
  
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


Directory_Call = async(Folder=NanoName, RefreshPath=true, SkipCall, Folder_Response) => {
  FolderCall = RefreshPath;

  if (!SkipCall) {
    clientStatus("CS4", "Wait");
    let Folder_Request = await fetch(`https://drive.nanode.one/folder/${Folder}?s=${Section}`);
    Folder_Response = await Folder_Request.json();
    clientStatus("CS4", "Off"); clientStatus("CS7", "Wait", 800);
  }

  // console.log(Folder_Response);
  
  if (Folder_Response.Auth) { RightBar_Security_Inputs(Folder_Response);}
  else if (Folder_Response.Parent) {
    NanoName = Folder_Response.Parent.id == "homepage" ? "homepage" : Folder_Response.Parent.name;
    NanoID = Folder_Response.Parent.id;
    NanoSelected = [];
    Directory_Content = Folder_Response.Contents;

    Route(NanoID, NanoName);
    UserSettings.ViewT == 0 ? viewContentAsBlock(NanoID) : viewContentAsList(NanoID);
    uploadDirectory = NanoName == "homepage" ? "_GENERAL_" : NanoName;
    setupFileMove();
  }
}

Directory_Call(NanoName);

// ========================


// NEXT to test:

  // Drag and Drop upload design.
  // Development Page. And Homepage Improvements. Use the new designs I drew up.


  // File Move for Block.

  // The Multiple Update:
      // Selection Box - Shows Selection Data at the bottom. Narrow Bar like VSCode blue bar.
      // Multi-Move

  // The Right-Click Update:
      // Security. Including removal.
      // Copy To
      // Move To
      // Create Shortcut
      // Share

  // Settings Review, JS, Functions and Page Revision.

  // Icons for Different File types.

  // Search Implementation - Remember to check the previous names settings too for items.