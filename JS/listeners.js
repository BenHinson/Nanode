fileInformationOpen = true;

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

$("#directoryControlNewFile").on("click", function() { displayCentralActionMain("New File", "Create") });
$("#directoryControlNewFolder").on("click", function() { displayCentralActionMain("New Folder", "Create") });
$(".fileInformationSideBar").on("click", function() { displaySideBar(); })

///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

function displaySideBar(state) {
  if (!fileInformationOpen || state == false) {
    $(".DLCRight")[0].style.right = "";
    $(".fileInformation")[0].style.right = "";
    $(".fileInformationSideBar").css({ "transform": "rotate(90deg)", "right": "216px"})
    $(".fileInformationSideBar")[0].title = "Hide Details and Upload Bar";
    $(".fileContainer")[0].style.width = "calc(100% - 250px)";
  } else {
    $(".DLCRight")[0].style.right = "50px";
    $(".fileInformation")[0].style.right = "-240px";
    $(".fileInformationSideBar").css({ "transform": "rotate(-90deg)", "right": "5px"})
    $(".fileInformationSideBar")[0].title = "Display Details and Upload Bar";
    $(".fileContainer")[0].style.width = "calc(100% - 15px)";
  }
  fileInformationOpen = !fileInformationOpen;
}


$(".toggleDetailsBtn").on("click", function() {
  let currDetails = displayDetails();
  currDetails = !currDetails;
  localStorage.setItem('displayDetails', currDetails);
  currDetails == true ? $(".toggleDetailsBtn").css({"text-align": "left", "color":UserSettings["HighL"]}) : $(".toggleDetailsBtn").css({"text-align": "right", "color":"#5b5b5f"});
})


function dragElement(element) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  element.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    if (e.target != element) { return; }
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}


function renameSpan(e) {
  var target = e ? e.target : RCElement.children[0];
  var currentSpanName = target.innerText;
  target.style.borderBottom = '1px solid';
  
  $(target).keypress(function(e){
    if (e.keyCode == 13) { e.preventDefault(); }
  })

  setTimeout(function() {
    $(document).on("click", function(element) {
      if (element.target != target) {
        target.style.cssText = '';
        if (target.innerText != currentSpanName && target.innerText.length > 1) {
          let EditData = {"Name": target.innerText}
          socket.emit('ItemEdit', {"Action": "Edit", "Item": "Span", "ID": currentSpanName, "Path": NanoPath, EditData})
        } else {
          target.innerText = currentSpanName;
        }
      }
      $(document).off("click");
    });
  },20)
}


function collapseSpan() {
  if (RCElement.hasAttribute('collapsed') == true) {
    RCElement.style.height = "";
    RCElement.removeAttribute('collapsed');
    let spanElements = $(RCElement).children().not('a')
    for (let i=0; i<spanElements.length; i++) {
      spanElements[i].style.display = "";
    }
  } else {
    RCElement.setAttribute('collapsed', true);
    let spanElements = $(RCElement).children().not('a')
    for (let i=0; i<spanElements.length; i++) {
      spanElements[i].style.display = "none";
    }
    RCElement.style.height = "20px";
  }
}


function renameItem(e) {
  if (e && e.target.getAttribute) { 
    var targetID = ItemNanoPath; var nameInput = e.target;
    e.target.style.background = 'rgba(0,0,0,0.1)';
  } else if (RCElement) { 
    var targetID = RCElement.getAttribute('Nano-path');
    var nameInput = UserSettings.ViewT == 0 ? RCElement.children[0] : RCElement.children[1];
    UserSettings.ViewT == 0 ? nameInput.classList.add("FolderNameEdit") : nameInput.style.cssText = "font-size: 16px; border-bottom: 1px solid #666;";
    nameInput.setAttribute('contenteditable', "true");
    nameInput.parentNode.classList.add("noHover", "noOpen");
  }
  currentItemName = nameInput.innerText;

  $(nameInput).keypress(function(e){ if (e.keyCode == 13) { e.preventDefault(); } })

  setTimeout(function() {
    $(document).on("click", function(element) {
      if (element.target != nameInput) {
        $(document).off("click");
        nameInput.style.cssText = '';
        if (typeof RCElement !== 'undefined' && RCElement) { if (nameInput.tagName != 'H3') {nameInput.removeAttribute('contenteditable');} nameInput.classList.remove("FolderNameEdit"); nameInput.parentNode.classList.remove("noHover", "noOpen");}
        if (nameInput.innerText != currentItemName && nameInput.innerText.length > 1) {
          let EditData = {"Name": {"Cur": nameInput.innerText}}
          socket.emit('ItemEdit', {"Action": "Edit", "Item": "FileFolder", "ID": targetID, "Path": NanoPath, EditData})
        } else {
          nameInput.innerText = currentItemName;
        }
      }
    });
  }, 20)
}



///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////

uploadStatus = false;
var countdown;

document.getElementById("uploadStartStopButton").addEventListener("click", function(e) {
  if (e.target.innerText == "Start Upload") {
    if (uploadStatus && totalSize < 104857600) {
      document.getElementById("uploadStartStopButton").innerText = "Uploading...";
      $("#uploadClearItems")[0].style.display = "none";
      $("#fileBeingUploaded")[0].style.display = "block";
      for (var i=0; i<ToBeUploaded.length; i++) {
        $("#fileBeingUploaded")[0].innerText = ToBeUploaded[i][2].name;

        ItemInfo = {"Parent":NanoPath, "Path":ToBeUploaded[i][0], "ItemPath":ToBeUploaded[i][1], "ParentText": uploadDirectory, "Name":ToBeUploaded[i][2].name, "isFi":ToBeUploaded[i][2].isFile == false ? false : true, "Type": ToBeUploaded[i][2].type, "Size": ToBeUploaded[i][2].size, "Time": {"ModiT": ToBeUploaded[i][2].lastModified}, "Number":ToBeUploaded[i][3]}
        ItemData = ToBeUploaded[i][2];

        socket.emit('fileUpload', {ItemInfo, ItemData, totalItems});
        clientStatus("CS9", "Ok", 400);
      }
    } else {
      if (totalSize > 104857600) {
        document.getElementById("uploadStartStopButton").innerText = "Over 100 MB";
      }
    }
  }
});

function uploadCountdown() {
  countdown = setTimeout(() => {
    document.getElementById("uploadStartStopButton").style.cursor = "pointer";
    document.getElementById("uploadStartStopButton").innerText = "Start Upload";
    $("#uploadClearItems")[0].style.cursor = "pointer";
    uploadStatus = true;
  }, 500)
}

document.getElementById("uploadClearItems").addEventListener("click", function(){ cancelUploadDownloadItems(); });

function cancelUploadDownloadItems() {
  clientStatus("CS9", "False", 600);
  ToBeUploaded = [];
  uploadStatus = false;
  $(".uploadNumber")[0].innerText = "Max - 100 MB";
  $("#uploadStartStopButton")[0].innerText = "Upload";
  $("#uploadStartStopButton")[0].title = "Drag and Drop or Select Items to Upload";
  $("#uploadClearItems")[0].style.cursor = "not-allowed";
  if ( $("#UpDownOverlayItems")[0] ) {
    $("#UpDownOverlayItems")[0].innerText = "";
  }
  
  currentUpDownOverlay = false;
  downloadSelection = false;
  
  $(".UpDownOverlayContainer")[0].remove();
  $(".fileInformationContent")[0].style.height = "";
}


$('div[upload="true"]').on("click", function(){displayUploadDownloadOverlay("Upload")});

var fileUpload = $("#fileUploadBtn, #folderUploadBtn");
[].forEach.call(fileUpload, function(e) {
  e.onchange = function(e) {
    ToBeUploaded = []; itemNumber = 0; totalSize = 0;
    uploadCountdown();
    $("#UpDownOverlayItems")[0].innerText = "";
    Array.from(this.files).forEach(function(file) {
      $("#UpDownOverlayItems")[0].innerText += file.name+"\n";
      totalSize += file.size;
      uploadFileDir(file, "");
    })
    totalItems = this.files.length;
    $(".uploadNumber")[0].innerText = totalItems + " Items - " + (totalSize / 1048576).toFixed(2) + " MB";
    // $("#uploadItemCount")[0].innerText = totalItems + " Items";
    // $("#uploadSizeCount")[0].innerText = (totalSize / 1048576).toFixed(2) + " MB";
  }
})

// DROP AREA  // DROP AREA  // DROP AREA  // DROP AREA  // DROP AREA  
let dropArea = document.getElementById("databaseBackgroundMain");

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, preventDefaults, false)   
  document.body.addEventListener(eventName, preventDefaults, false)
});
function preventDefaults (e) {e.preventDefault(); e.stopPropagation();}

['dragenter', 'dragover'].forEach(eventName => {
  dropArea.addEventListener(eventName, highlight, false)
})
function highlight(e) {dropArea.classList.add('highlight')}

;['dragleave', 'drop'].forEach(eventName => {
  dropArea.addEventListener(eventName, unhighlight, false)
})
function unhighlight(e) {dropArea.classList.remove('highlight')}



dropArea.addEventListener("drop", function(e) {
  if (!fileInformationOpen || $(".fileInformation")[0].style.width < 1) {
    displaySideBar(false);
  }
  displayUploadDownloadOverlay("Upload");
  $("#UpDownOverlayItems")[0].innerText = "";
  document.getElementById("uploadStartStopButton").innerText = "Loading Items";
  ToBeUploaded = []; itemNumber = 0; totalSize = 0;
  totalItems = e.dataTransfer.items.length;
  $("#uploadItemCount")[0].innerText = totalItems + " Items";
  uploadCountdown();
  dropped = e.dataTransfer.items;

  for (var i=0; i<dropped.length; i++) {
    entry = e.dataTransfer.items[i].webkitGetAsEntry();
    traverseFileTree(entry)
    clientStatus("CS9", "Wait", 200);
  }
});

function traverseFileTree(path) {
	if (path.isFile) {
  	path.file(function(file) {
      uploadFileDir(file, path)
    	totalSize += file.size;
      $("#UpDownOverlayItems")[0].innerText += file.name+" - "+file.size+"\n";
    	// $("#uploadSizeCount")[0].innerText = (totalSize / 1048576).toFixed(2) + " MB";
      $(".uploadNumber")[0].innerText = totalItems + " Items - " + (totalSize / 1048576).toFixed(2) + " MB";
    });
  }
  else if (path.isDirectory) {
    uploadFileDir(path);
    $("#UpDownOverlayItems")[0].innerText += path.name+"\n";
    clearTimeout(countdown); uploadCountdown();
    var dirReader = path.createReader();
    dirReader.readEntries(function(entries) {
      for (var i=0; i<entries.length; i++) {
        totalItems++;
        // $(".uploadNumber")[0].innerText = totalItems + " Items";
        traverseFileTree(entries[i], path);
      }
    });
  }
}

function uploadFileDir(file, dir) {
  itemNumber++;
  documentInformation = [
    ItemDirectory = directoryPath,
    ItemPath = file.fullPath || file.webkitRelativePath || dir.fullPath || file.name,
    ItemData = file,
    ItemNumber = itemNumber,
  ]
  ToBeUploaded.push(documentInformation);
}