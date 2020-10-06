Current = "User";

Expanded = false;
CodexPath = "Home";
CodexDirPath_Text = ["Home"];
CodexDirPath_Nano = ["Home"];
AudioListeners = false;
audioOrder = [];
audioNumber = 0;


$(".PagePanel > div > span").on("click", function(e) {
  let P2O = e.currentTarget.getAttribute("drvpage");

  if (P2O != Current) {
    if (Current != "User") { // Runs When Going from "User" to Panel  OR  between Panels
      $("."+Current+"Container")[0].style.left = "-300px";
    }
    $(".SelectedPage")[0].classList.remove('SelectedPage');
    e.currentTarget.classList.add('SelectedPage');
    Current = P2O;
    window["load"+Current+"Page"](); // Calls the Function to Handle the Data of each page
    if (Current != "User") {
      $("."+Current+"Container")[0].style.left = "50px";
    }
  } else if (P2O != "User") { // Return to File System
    $("."+Current+"Container")[0].style.left = "-300px";
    Current = "User";
    $(".SelectedPage")[0].classList.remove('SelectedPage');
    $("[drvPage=User]")[0].classList.add('SelectedPage');
  }
})


// =============================================================================================
// =============================================================================================

function loadUserPage() {
  console.log(Current)
}

// =============================================================================================
// =============================================================================================

function loadContactsPage() {
  console.log(Current)
}

// =============================================================================================
// =============================================================================================

function loadBlocksPage() {
  console.log(Current)
}
// =============================================================================================
// =============================================================================================

CodexList = function() { if (!localStorage.getItem(`CodexList`)) { localStorage.setItem(`CodexList`, "Text") }  return (localStorage.getItem(`CodexList`) ) }

function loadCodexPage() {
  var CodexWanted = CodexList();
  CodexDirPath_Text = ["Home"]; CodexDirPath_Nano = ["Home"];
  $(".CC_Directory")[0].innerText = CodexDirPath_Text[0];
  let emitAction = "Call";
  socket.emit('Codex', {emitAction, CodexWanted, CodexPath});

  if (CodexWanted.match(/Text|Video|Audio/)) {
    $("#Codex"+CodexWanted)[0].setAttribute("class", "selectedCodex")
    $("#codexUploadBtn")[0].setAttribute("accept", CodexWanted+"/*")

    $("#UploadCodexItem").on("click", function() { // Uploading Files and Folders
      $("#codexUploadBtn").click();
      $("#CUSize, #CUCount, #codexUploadProgress").css("opacity", "1");

      var codexUpload = $("#codexUploadBtn");
      [].forEach.call(codexUpload, function(e) {
        e.onchange = function(e) {
          CodexUpload = []; itemNumber = 0; totalSize = 0;

          let files = Array.from(this.files);
          for (const file of files) {
            totalSize += file.size;
            itemNumber++;
            UploadDetailsAndEmitter(CodexWanted, file, itemNumber); // Emits from thus function until I understand async more
          }

          totalItems = this.files.length;
          $("#CUCount")[0].innerText = "Items ⌥ "+totalItems;
          $("#CUSize")[0].innerText = convertSize(totalSize)+" ⌥ Size";
        }
      })
    })

  } else {
    localStorage.setItem('CodexList', "Text");
    $("#CodexText")[0].setAttribute("class", "selectedCodex")
  }

  $("#NewCodexItem").off()
  $("#NewCodexItem").on("click", function () { // Create Folder or Text File in Codex

    if (CodexWanted == "Text") {
      console.log("Making File")
    } else {
      $(".codexWrapper").prepend("<div class='codexItem codexItemAudio codexItemFolder'><i></i><input type='text' placeholder='Name...' contenteditable></input></div>");
      $("h4[contenteditable]").focus();
    }

    $("input[contenteditable]").change(function(e) {
      this.removeAttribute('contenteditable');

      let emitAction = "Make"; let Data = {"Name": this.value}
      socket.emit('Codex', {emitAction, CodexWanted, CodexPath, Data});
    })
  })

  $(".CodexSwitchContainer > div").off()
  $(".CodexSwitchContainer > div").on("click", function(e) {
    if (e.target.innerText.match(/Text|Video|Audio/)) {
      localStorage.setItem('CodexList', e.target.innerText);
      CodexPath = "Home";
      $(".codexWrapper").empty();
      $(".selectedCodex")[0].classList.remove("selectedCodex");
      $("#Codex"+e.target.innerText)[0].setAttribute("class", "selectedCodex")
      CodexWanted = e.target.innerText;
      loadCodexPage();
    }
  })

  $(".codexContentExpand").on("click", function() {
    if (!Expanded) { 
      $(".CodexContainer")[0].style.left = "-300px";
      $(".CodexContentContainer")[0].style.width = "calc(100% - 50px)";
      $(".codexContentExpand")[0].classList = "codexContentExpand fas fa-angle-double-right";
    } else {
      $(".CodexContainer")[0].style.left = "50px";
      $(".CodexContentContainer")[0].style.width = "calc(100% - 350px)";
      $(".codexContentExpand")[0].classList = "codexContentExpand fas fa-angle-double-left";
    }
    Expanded = !Expanded;
  })
}

function readCodex(codexContents) {
  $(".codexWrapper").empty();
  let content = codexContents;
  audioOrder = [];
  audioNumber = 0;

  CodexWanted = CodexList();
  $(".codexAudioPlayer")[0].style.display = "none";  $(".codexWrapper")[0].style.height = "calc(100% - 121px)";
  if (CodexWanted == "Audio") {
    if (!AudioListeners) { AudioListeners = true; CodexAudioListeners(); }
    $(".codexAudioPlayer")[0].style.display = ""; $(".codexWrapper")[0].style.height = "calc(100% - 241px)";
  }

  for (item in content) {

    if (content[item].Type == "Folder") {
      $(".codexWrapper").prepend("<div class='codexItem codexItemFolder' nano-path="+content[item].UUID+" rc='Codex_Item' rcOSP='H4 I'><i></i><h4 title='"+content[item].Name+"'>"+content[item].Name+"</h4></div>");
    } else {
      let Type = content[item].Type.length > 0 ? content[item].Type.split("/").pop().charAt(0).toUpperCase() + content[item].Type.split("/").pop().slice(1) : "Unknown";
      let codexItem = document.createElement('div');
      codexItem.setAttribute("Nano-Path", content[item].UUID);
      codexItem.setAttribute("rc", "Codex_Item");
      codexItem.setAttribute("rcOSP", "H4 DIV")
      codexItem.classList = "codexItem";
  
      if (CodexWanted == "Text") {
        codexItem.classList.add('codexItemText')
        let Content = content[item].F100C !== undefined ? content[item].F100C : "-";
        codexItem.innerHTML = " <h4 title='"+content[item].Name+"'>"+content[item].Name+"</h4>  <div class='codexData'>  <h5>"+Type+"</h5>  <h5>"+convertSize(content[item].Size)+"</h5>  <h5>"+dateFormater(content[item].Time)+"</h5> </div>  <span>"+Content+"</span>"
      } else if (CodexWanted == "Video") {
        codexItem.classList.add("codexItemVideo");
        codexItem.innerHTML = "<h4 title='"+content[item].Name+"'>"+content[item].Name+"</h4> <div class='codexData codexVideoData'><h5>"+Type+"</h5> <h5>"+convertSize(content[item].Size)+"</h5>  <h5>"+content[item].Time+"</h5></div>"
      } else if (CodexWanted == "Audio") {
        codexItem.classList.add("codexItemAudio");
        codexItem.innerHTML = "<h4 title='"+content[item].Name+"'>"+content[item].Name+"</h4> <div class='codexData codexAudioData'><h5>"+timeFormater(content[item].Duration)+"</h5><h5>"+Type+"</h5> <h5>"+convertSize(content[item].Size)+"</h5>  <h5>"+content[item].Time+"</h5></div>";
        audioOrder.push(content[item].UUID)
      }
      $(".codexWrapper")[0].appendChild(codexItem)
    }
  }
  setupFileMove("Codex");

  $(".codexItem").on("click", function(e) {codexItemAction("Click", e)})
}

function codexUploadProgress(itemNumber) {
  let uploadPercentage = (100 * (itemNumber / totalItems));
  $("#codexUploadProgress")[0].value = uploadPercentage;
  if (uploadPercentage === 100) {
    let emitAction = "Call"; socket.emit('Codex', {emitAction, CodexWanted, CodexPath});
    setTimeout(function() {
      $("#codexUploadProgress")[0].value = 0;
      $("#CUCount")[0].innerText = "Items ⌥";
      $("#CUSize")[0].innerText = "⌥ Size";
      $("#CUSize, #CUCount, #codexUploadProgress").css("opacity", "0");
    }, 5000)
  }
}
function UploadDetailsAndEmitter(CodexWanted, file, itemNumber) {
  let emitAction = "Upload";

  if (CodexWanted == "Text") {
    var reader = new FileReader();
    let blob = file.slice(0, 100 + 1);
    reader.readAsBinaryString(blob);
    reader.onloadend = function(e) {
      if (e.target.readyState == FileReader.DONE) {        
        var Data = {"Name":file.name, "Size":file.size, "Type":file.type, "F100C": e.target.result, "Data":file}
        socket.emit('Codex', {emitAction, CodexWanted, CodexPath, Data, itemNumber})
      }
    }
  } else if (CodexWanted == "Audio") {
    if (typeof audioUpload === 'undefined') { var audioUpload = new Audio; }
    let audioURL = URL.createObjectURL(file)
    audioUpload.src = audioURL;
    audioUpload.addEventListener('loadedmetadata', function() {
      var Data = {"Name":file.name, "Size":file.size, "Type":file.type, "Duration": audioUpload.duration, "Data":file};
      console.log(emitAction)
      socket.emit('Codex', {emitAction, CodexWanted, CodexPath, Data, itemNumber})
    })
  } else {
    var Data = {"Name":file.name, "Size":file.size, "Type":file.type, "Data":file}
    socket.emit('Codex', {emitAction, CodexWanted, CodexPath, Data, itemNumber})
  }
}


function codexItemAction(Call, e) {

  e == "RCElement" ? e = RCElement : e = e.currentTarget;

  if (Call == "Click") {

    if ($(e).hasClass("codexItemFolder")) {
      CodexPath = e.getAttribute('nano-path');
      let selectedDirectory = e.children[1].getAttribute('title')
      $(".CC_Directory")[0].innerText = selectedDirectory;
      CodexDirPath_Text.push(selectedDirectory); CodexDirPath_Nano.push(CodexPath);
      let emitAction = "Call";
      socket.emit('Codex', {emitAction, CodexWanted, CodexPath});
      return;
    }
  
    if ( $(".selectedCodexItem")[0] ) { $(".selectedCodexItem")[0].classList.remove("selectedCodexItem") }
    e.classList.add("selectedCodexItem");
    
    $(".codexTextContainer pre").empty(); $(".codexVideoContainer video")[0].src = "";
    $(".codexVideoContainer,.codexTextContainer").css('visibility', 'hidden');
  
    if ($(".CodexContentContainer")[0].style.right != "0px" && CodexList() != "Audio") { $(".CodexContentContainer")[0].style.right = "0px";}
    $(".PagePanel > div > span").on("click", function() { $(".CodexContentContainer")[0].style.right = "100vw"; })
    
    if (CodexList() == "Video") {
      $(".codexVideoContainer").css('visibility', 'visible');
      $(".codexVideoContainer > video")[0].src = "/storage/"+e.getAttribute("Nano-path")+"?cdx=2";
    } else if (CodexList() == "Text") {
      $(".codexTextContainer").css('visibility', 'visible');
      $(".codexTextContainer > pre").load("/storage/"+e.getAttribute("Nano-path")+"?cdx=1");
    } else if (CodexList() == "Audio") {
      let OID = e.getAttribute('nano-path')
      audioNumber = audioOrder.indexOf(OID);
      playAudio();
    }
  }
  else if (Call == "Rename") {

    let inputName = $(RCElement).find("h4")[0];
    inputName.setAttribute("contenteditable", true)
    inputName.focus();

    $("h4[contenteditable=true]").on('change', function(e) {
      // change doesnt work with elements that aren't 'textarea', 'input'. reeeeeeeee
    })
  }
  else if (Call == "Delete") {
    let emitAction = "Delete"; let CodexPath = e.getAttribute('nano-path');
    socket.emit('Codex', {emitAction, CodexWanted, CodexPath});
  }

}

function playAudio() {
  let audioPlaying = audioOrder[audioNumber];
  $(".selectedCodexItem")[0].classList.remove("selectedCodexItem");
  $("div[nano-path = "+audioOrder[audioNumber]+"]")[0].classList.add("selectedCodexItem");
  audioDuration = timeFormaterReverse($(".selectedCodexItem")[0].children[1].childNodes[0].innerText);
  $("#CAP_Text")[0].innerText = $(".selectedCodexItem")[0].children[0].title;
  $(".CAP_Dur_Time")[0].innerText = timeFormater(audioDuration);
  audio.src = "//drive.nanode.one/storage/"+audioPlaying+"?cdx=3"; 
  audio.play();
}

function CodexAudioListeners() {

  window.audio = new Audio;

  $("#playPause").on("click", function() {
    if (audio.paused && audio.src.length > 1 ) {audio.play(); }
    else if ( audio.src.length < 1 ) { playAudio(); }
    else { audio.pause()}
  })
  $("#playNext").on("click", function() { 
    if (audioOrder[audioNumber + 1]) { audioNumber++; playAudio() } 
    else { audioNumber = 0; playAudio(); } })
  $("#playPrevious").on("click", function() { 
    if (audioNumber >= 1) {audioNumber--; playAudio()} })
  $("#playRepeat").on("click", function() { 
    if (audio.loop) {audio.loop = false; playRepeat.style.opacity = 0.4}
    else {audio.loop = true; playRepeat.style.opacity = 1; if (audio.paused) {audio.play();}}
   })
  $("#playRandomize").on("click", function() {
    for (let i = audioOrder.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * i)
      let temp = audioOrder[i];
      audioOrder[i] = audioOrder[j];
      audioOrder[j] = temp;
      $("div[nano-path="+audioOrder[j]+"]").insertBefore($(".codexWrapper")[0].children[0])
    }
  })
  document.getElementById("playerSlider").oninput = function() {
    audio.currentTime = ($(this)[0].value / 100) * audioDuration
  }

  audio.addEventListener('play', function() { $("#playPause")[0].setAttribute("class", "CAP_Large fas fa-pause-circle") })
  audio.addEventListener('pause', function() { $("#playPause")[0].setAttribute("class", "CAP_Large fas fa-play-circle") })
  audio.addEventListener('ended', function() {
    if (audio.loop) { audio.play() }
    else if (audioOrder[audioNumber + 1]) { audioNumber++; playAudio() }
    else { audioNumber = 0; playAudio(); }
  })
  audio.addEventListener('timeupdate', function() {
    $("#playerSlider")[0].value = (audio.currentTime / audioDuration) * 100;
    $(".CAP_Cur_Time")[0].innerText = timeFormater(audio.currentTime);
  })

  // var volumeSlider = element('volumeSlider') /////////////////////

  // if (localStorage.getItem('volume')) {
  //   audio.volume = JSON.parse(localStorage.getItem('volume'));
  //   volumeSlider.value = audio.volume * 150;
  // }

  $(".CC_Return").on("click", function() {
    if (CodexDirPath_Nano.length > 1) {
      CodexDirPath_Nano.pop(); CodexDirPath_Text.pop();
      CodexPath = CodexDirPath_Nano[CodexDirPath_Nano.length - 1];
      let emitAction = "Call"; socket.emit('Codex', {emitAction, CodexWanted, CodexPath});
      $(".CC_Directory")[0].innerText = CodexDirPath_Text[CodexDirPath_Text.length - 1];
    }
  })

  $(".CC_Expand").on("click", function() {
    let emitAction = "Call_Children"; socket.emit('Codex', {emitAction, CodexWanted, CodexPath})
  })

  $("CC_Directory").on("click", function() {
    let emitAction = "Call"; socket.emit('Codex', {emitAction, CodexWanted, CodexPath})
  })

}


// =============================================================================================
// =============================================================================================

BinParent = 0;

function loadBinPage() {
  let bin_Parent_Cycle = ["Main", "Codex"]
  $(".BinParent")[0].innerText = bin_Parent_Cycle[BinParent];
  let emitAction = "Call"; let Of = bin_Parent_Cycle[BinParent];
  socket.emit('Bin', {emitAction, Of});
  clientStatus("CS7", "Ok", 400);

  $(".BinParent").off();
  $(".BinParent").on("click", function() {
    bin_Parent_Cycle[BinParent + 1] ? BinParent++ : BinParent = 0;
    $(".BinParent")[0].innerText = bin_Parent_Cycle[BinParent];

    let emitAction = "Call"; let Of = bin_Parent_Cycle[BinParent];
    socket.emit('Bin', {emitAction, Of});
  })
}
function readBin(binContent) {
  let bin_Parent_Cycle = ["Main", "Codex"]
  $(".binWrapper").empty();
  
  let binSize = 0;
  binContent.forEach(function(Item, index) {
    binSize += Item[4];
    $(".binWrapper").prepend("<div nano-path="+Item[0]+"> <h6 class='binActBtns' act='Rescue'>Rescue</h6> <h3>"+(typeof Item[1] == "object" ? Item[1].Cur : Item[1])+"</h3> <h4>Deleted: "+dateFormater(Item[3])+"</h4> <h4>"+Item[2].mimeT+"</h4> <h4>"+convertSize(Item[4])+"</h4> <h5 class='binActBtns' act='Delete'>Delete</h5> </div>")
  })
  $(".BinDetails")[0].innerHTML = "Total ⌥ "+binContent.length+" Items @ "+convertSize(binSize);

  $(".binActBtns").on("click", function(e) {
    let emitAction = e.currentTarget.getAttribute('act');
    let binItem = e.currentTarget.parentNode.getAttribute('nano-path')
    let Of = bin_Parent_Cycle[BinParent];
    socket.emit('Bin', {emitAction, binItem, Of})
  })
}

// =============================================================================================
// =============================================================================================


function loadSettingsPage() {}





// =============================================================================================
// =============================================================================================
// =============================================================================================
// =============================================================================================