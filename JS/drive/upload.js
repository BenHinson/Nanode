Upload_Item_Count = 0;
Upload_Size = 0;
Upload_Queue = [];
Visual_Items = {};
Upload_Status = 'Choose'; // Paused, Start, Complete, Choose, Limit
Held_Upload = [];
Time_Difference = '';
Queue_Showing = false;

const Chunk_Size = (1 * 1024 * 1024) // (1mb)

const Upload_Buttons = document.querySelectorAll('.UploadBtns > input');
const Drop_Area = document.querySelector('.Pages');
const DragDropOverlay = document.querySelector('.DragDropOverlay');

const UC_Info = document.querySelector('.UC_Info');

const Upload_Control = document.getElementsByClassName('Upload_Control')[0];
const Upload_Values = document.querySelectorAll('.UC_Bottom p');
const Progress_Div = document.getElementsByClassName('Upload_Progress')[0];
const Queue_Toggle = document.getElementById('queue_toggle');

// ========================================

// class Upload_ {
//   constructor(elements) {
//     [this.Item_Count, this.Total_Size, this.Queue, this.Visual_Items, this.Status, this.Held] = [0, 0, [], {}, 'Choose', []]
//     // define elements from the elements
//     this._Initialise();
//   }

//   _Initialise() {
//     console.log(34);
//     // this.RenderPicker_();
//   }
//   Queue_() { }
// }
// new Upload_({});




Upload_Listeners = async () => {
  
  Upload_Buttons.forEach((ele) => ele.addEventListener('change', (e) => Upload_Actions.Looper(e.target.files) ) );

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
    Drop_Area.addEventListener(event, preventDefaults, false)   
    DragDropOverlay.addEventListener(event, preventDefaults, false);
    document.body.addEventListener(event, preventDefaults, false);
    function preventDefaults(e) {e.preventDefault(); e.stopPropagation();}
  });
  ['dragenter', "dragover"].forEach(event => {
    Drop_Area.addEventListener(event, highlight, false)
    function highlight(e) { if (e.dataTransfer.types[0] == "Files") {DragDropOverlay.classList.add('display_Overlay')} }
  });
  ['dragleave', 'drop'].forEach(event => {
    Drop_Area.addEventListener(event, unhighlight, false)
    function unhighlight(e) { DragDropOverlay.classList.remove('display_Overlay'); }
  });

  Drop_Area.addEventListener("drop", function(e) {
    if (!e.dataTransfer.files.length) { return; }
    PopUp_Upload();
    Upload_Actions.Looper(e.dataTransfer.items, true)
  })

  Control = function(e) {
    switch (e.getAttribute('action')) {
      case 'Choose' : { document.querySelectorAll('.UC_Bottom button').forEach(e => e.classList.add('highlight')); break;}
      case 'Start': { Upload.Iterate(); break; }
      case 'Pause': { Upload_Visuals.Status('Paused', 'Continue'); break;}
      case 'Paused': { Upload_Visuals.Status('Pause', 'Pause');
        if (Held_Upload.length) { let Held = Held_Upload.shift();  Upload.Manager(Held.Chunks, Held.Info, Held.Meta)} 
        else {Upload.Iterate()}; break;}
    }
  }

  Upload_Listeners.Control = Control;
}

Upload_Actions = function() {

  Looper = async(files, drop) => {
    if (drop) {
      await Get_All_Files(files).then(function(files) {
        for (let i=0; i<files.length; i++) {
          files[i].file(file => {
            Upload_Size += file.size;
            Upload_Item_Count++;
            Queue_Add(file, files[i]);
            
            if (i === files.length - 1) { Loop_Complete(); }
          })
        }
      });
    } else {
      Array.from(files).forEach(function(file) {
        Upload_Size += file.size;
        Upload_Item_Count++;
        Queue_Add(file);
      })
      Loop_Complete();
    }
  }


  Get_All_Files = async(InitialDrop) => {
    let Uploaded_Files = [];
    let queue = [];
  
    for (let i=0; i<InitialDrop.length; i++) {
      queue.push(InitialDrop[i].webkitGetAsEntry());
    }
  
    while (queue.length > 0) {
      let entry = queue.shift();
      if (entry.isFile) { Uploaded_Files.push(entry); } 
      else if (entry.isDirectory) { queue.push(...await Get_Dir_Entries(entry.createReader())); }
    }
    return Uploaded_Files;
  }
  Get_Dir_Entries = async(directory) => {
    let entries = [];
    let readEntries = await readEntriesPromise(directory);
    while (readEntries.length > 0) {
      entries.push(...readEntries);
      readEntries = await readEntriesPromise(directory);
    }
    return entries;
  }
  readEntriesPromise = async(directoryReader) => {
    try { // Returns (on Chrome) max 100 items. Loops to get all
      return await new Promise((resolve, reject) => {
        directoryReader.readEntries(resolve, reject);
      });
    } catch (err) { console.log(err); }
  }


  Queue_Add = function(file, path) {
    if (Upload_Queue.length < 1001) {
      Upload_Queue.push( {"Meta": Item_Meta(file, path), "Data": file, "Status": 'Waiting'} )
    } else {
      Upload_Values[0].style.color = 'crimson';
    }
  }

  Queue_Remove = function(e) {
    const up_id = e.getAttribute('upload_id');
    const item = Visual_Items[up_id];

    if (!item || item.Status != 'Waiting') { e.remove(); return; }

    delete Visual_Items[up_id];
    Upload_Queue.splice(Upload_Queue.findIndex(e => e.Meta.id == up_id), 1);
    Upload_Size -= item.Meta.size;
    Plan_Check();
    Upload_Item_Count -= 1;
    Upload_Values[0].innerText = N_TextMultiple(Upload_Item_Count, "Item");
    Upload_Values[1].innerText = N_ConvertSize(Upload_Size);
    e.remove(); // Remove the element.

    if (Upload_Queue.length == 0 && Held_Upload.length == 0) {Upload_Visuals.Status("Choose", "Choose Items");}
  }

  Item_Meta = function(file, dir='') {
    return {
      "section": Section,
      "relative_path": file.fullPath || file.webkitRelativePath || dir.fullPath || file.name,
      "parent": NodeID == "homepage" ? "_GENERAL_" : NodeID,
      "name": file.name,
      "type": file.type,
      "size": file.size,
      "isFi": file.isFile == false ? false : true,
      "modified": file.lastModified,

      "id": ((Math.random() * 1000000).toFixed()+'-'+file.size+'-'+(file.webkitRelativePath||file.relativePath||file.fileName||file.name).replace(/[^0-9a-zA-Z_-]/img, ''))
    }
  }

  Loop_Complete = function() {
    if (Upload_Queue.length >= 1) {
    
      for (let i=0; i<Upload_Queue.length; i++) { // Make Duplicate for Visual Purposes. (No file Data) As Upload_Queue gets Shifted
        Visual_Items[Upload_Queue[i].Meta.id] = {"Order": i, "Meta": Upload_Queue[i].Meta, "Status": Upload_Queue[i].Status}
      }

      Upload_Values[0].innerText = N_TextMultiple(Upload_Item_Count, "Item");
      Upload_Values[1].innerText = N_ConvertSize(Upload_Size);
      Upload_Visuals.Queue('update');

      Plan_Check();
    }
  }

  Plan_Check = function() {
    let accountPlan = UserSettings.user.plan;
    let accountStorageLeft = accountPlan.max - accountPlan.used;
    if (Upload_Size > accountStorageLeft) {
      Upload_Visuals.Notify('notification', 'limit', `Cannot exceed current plan! (${N_ConvertSize(Upload_Size - accountStorageLeft)} over)`);
      Upload_Visuals.Status("Limit", "Exceeding Plan");
    } else {
      Upload_Visuals.Notify('hide');
      Upload_Visuals.Status("Start", "Start Upload");
    }
  }

  Reset_Upload = function() {
    Upload_Item_Count = 0;
    Upload_Size = 0;
    Upload_Queue = [];
    Visual_Items = {};
    Upload_Status = 'Choose';
    Held_Upload = [];

    Upload_Values[0].innerText = "0 Items";
    Upload_Values[1].innerText = "0 B";
  }

  Upload_Actions.Looper = Looper;
  Upload_Actions.Queue_Add = Queue_Add;
  Upload_Actions.Queue_Remove = Queue_Remove;
  Upload_Actions.Reset_Upload = Reset_Upload;
}

Upload = async () => {

  Iterate = function() { // Search for next File to Upload.
    if (Upload_Queue.length == 0) { // Queue is empty.
      Upload_Visuals.Status("Choose", "Choose Items");
      Notify('success', 'finished', 'Items Successfully Uploaded to Nanode.');
      fetch('https://drive.nanode.one/upload', { method:'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({"message":"Queue_Empty"})} )
      NodeCall({"Folder":NodeID, "Reload": false});
      Upload_Actions.Reset_Upload();
      return;
    }
    let File = Upload_Queue.shift();
    if (File) {
      Chunker(File);
      Visual_Items[File.Meta.id].Status = "Uploading";
      Upload_Visuals.Start(File);
    }
  }

  Chunker = async(File) => { // Chunks up the File, sets data and works out each chunk size
    let Chunks = [];

    for (let start = 0; start < File.Data.size; start += Chunk_Size + 1) {
      const Chunk = File.Data.slice(start, start + Chunk_Size + 1)
      Chunks.push({"Data":Chunk, "Num": Chunks.length });
    }
    let Info = {"total_chunks": Chunks.length, "total_size": File.Data.size};

    Upload_Visuals.Status("Pause", "Pause")
    await Manager(Chunks, Info, File.Meta);
  }

  Manager = async(Chunks, Info, Meta) => { // Pushes Chunk to Post if all OK
    if (Upload_Status == "Paused") {
      console.log('Pause Detected');
      Held_Upload.push({"Chunks": Chunks, "Info": Info, "Meta": Meta});
      Visual_Items[Meta.id].Status = "Paused";
      return;
    }

    if (Chunks.length) {
      let Upload = Chunks.shift();
      Post(Chunks, Upload, Info, Meta)
    } else {
      console.log("No More Chunks"); Iterate();
    }
  }

  Post = async(Chunks, Upload, Info, Meta) => { // Sends the Chunk and Handles Reply
    if (Upload_Status == 'Paused' || Upload_Status == 'Limit') { return; }

    const Form = {
      'meta': Meta,
      'chunk_info': {"index": Upload.Num, "total_chunks": Info.total_chunks, "total_size": Info.total_size}
    }

    Visual_Items[Meta.id].Status = "Uploading";

    Read_Chunk(Upload.Data, async(e) => {
      Form.file = Array.from(new Uint8Array(e.target.result)); // Fastest and Easiest to Convert on the Server

      N_ClientStatus(1, "True");
      Time_Difference = Date.now();

      let res = await fetch('https://drive.nanode.one/upload', {
        method:'POST',
        headers: {'Content-Type': 'application/json'},
        body: new Blob( [ JSON.stringify(Form) ], { type: 'text/plain' } ),
      })

      let Reply = await res.json();
      N_ClientStatus(1, "Off");

      Item_Status(Reply, {Meta, "upload_num": Upload.Num, "total_chunks": Info.total_chunks, "total_size": Info.total_size}, {Chunks, Info});
    })
  }

  Read_Chunk = async(File, onLoadCallback) => { // Reads the Files Data as an ArrayBuffer
    let reader = new FileReader();
    reader.onload = onLoadCallback;
    reader.readAsArrayBuffer(File);
  }

  Item_Status = function(Reply, Data, Next) {
    switch (Reply.status) {
      case 'Success': { // Send the next chunk or file.
        Manager(Next.Chunks, Next.Info, Data.Meta); break; 
      }
      case 'Limit': { console.log('Exceeding Account Size Limit');
        Upload_Status = 'Limit';
        Upload_Visuals.Notify('error', 'limit', 'You have ran out of storage on this plan.')
        break;
      }
      case 'Failed': { console.log('Failed to write chunk');
        Visual_Items[Data.Meta.id].Status = "Failed";
        Notify('error', 'failed', 'An Item has Failed to Upload. Please Try Again.');
        break;
      }
      case 'Incomplete': { console.log('Missing Data');
        Visual_Items[Data.Meta.id].Status = "Incomplete";
        Notify('error', 'incomplete', 'The data provided is incomplete or incorrect.');
        break;
      }
      case 'Complete': {
        Visual_Items[Data.Meta.id].Status = "Complete";
        SetStorage(Reply.plan);
        Iterate();
        break;
      }
    }
    Upload_Visuals.Progress(Data.total_chunks, Data.upload_num, Data.total_size, Data.Meta.id);
  }

  Upload.Iterate = Iterate;
  Upload.Manager = Manager;
}

Upload_Visuals = async() => {

  Status = function(action, text) {
    Upload_Status = action;
    Upload_Control.setAttribute('action', action);
    Upload_Control.innerText = text;

    if (Upload_Status == "Complete") { setTimeout(function() { Progress_Div.classList.remove('UC_Showing') }, 5000) }
  }

  Notify = function(type, notif, message) {
    if (type == 'hide') { return UC_Info.classList = `UC_Info`; }
    UC_Info.classList = `UC_Info ${type} display`;
    UC_Info.children[0].innerText = message;
  }

  Start = function(File) {
    Progress_Div.classList.add('UC_Showing');
    Progress_Div.querySelector('progress').value = 0;
    Queue();

    let upload_time = parseInt(File.Data.size / (512*1024)) // In Seconds (Assuming 0.5MB / sec = ~4Mb/s upload)
    Progress_Div.querySelector('p').innerText = upload_time < 60 ? (upload_time+1)+"s" : N_TextMultiple( (parseInt(upload_time / 60)+1), "min" );
  },

  Progress = function(total_chunks, chunk_num, total_size, id) {
    // Upload_Size > Total size of all files to be uploaded.
    // Define global 'Uploaded_Size'
    // (Uploaded_Size / (Uploaded + completed_Size)) * 100

    let completed_Size = total_chunks == 1 ? total_size : ((chunk_num+1) * Chunk_Size);
    let item_percentage = ((completed_Size / total_size) * 100)
    Progress_Div.querySelector('progress').value = item_percentage;

    let time_till_upload = total_chunks == 1 ? 0 : parseInt((total_size - completed_Size) / Chunk_Size) * ((Date.now() - Time_Difference) / 1000)
    Progress_Div.querySelector('p').innerText = time_till_upload < 60 ? (time_till_upload+1).toFixed()+"s" : N_TextMultiple( (parseInt(time_till_upload / 60)+1).toFixed(), "min") 

    if (Queue_Showing) {
      let uploaded_item = UC_Queue_Table.querySelectorAll("tr[upload_id='"+id+"']")[0];
      uploaded_item.removeAttribute('onclick');
      uploaded_item.children[2].innerHTML = Visual_Items[id] ? Status_Icon(Visual_Items[id].Status) : Status_Icon("Complete");
    }
  }

  Queue = function(action) {
    if (action == 'toggle') {
      UC_Queue.classList.toggle('display');
      if (!Queue_Showing) {
        UC_Queue_Table.innerHTML = '';
        Queue_Toggle.classList = 'fas fa-chevron-down';
        Queue_Showing = true;
      } else {
        Queue_Toggle.classList = 'fas fa-chevron-up';
        Queue_Showing = false;
        return;
      }
    } else if (action == 'update') {
      UC_Queue.classList.add('display');
      Queue_Toggle.classList = 'fas fa-chevron-down';
      Queue_Showing = true;
    }

    UC_Queue_Table.innerHTML = '';

    for (const [id, info] of Object.entries(Visual_Items)) {
      UC_Queue_Table.innerHTML += `
        <tr upload_id='${id}' class='${Status_Class(info['Status'])}' onclick='${info['Status'] == 'Waiting' ? 'Upload_Actions.Queue_Remove(this)' : ''}'> <td>${info['Meta'].name}</td> <td>${N_ConvertSize(info['Meta'].size)}</td> <td>${Status_Icon(info['Status'])}</td> </tr>
      `
    } 
  }

  function Status_Icon(status) {
    return {
      Paused: "<i class='far fa-pause-circle yellow' title='Paused'></i>",
      Complete: "<i class='far fa-check-circle green' title='Complete'></i>",
      Incomplete: "<i class='far fa-times-circle dark_red' title='Form Error'></i>",
      Failed: "<i class='far fa-times-circle red' title='Failed'></i>",
      Uploading: N_Loading('small upload', 'Uploading'),
      Waiting: "<i class='far fa-clock' title='Waiting'></i>",
    }[status] ?? "<i class='far fa-question-circle' title='Eh? No Status from Server... big yikes.'></i>"
  }

  function Status_Class(status) {
    return {
      Uploading: "active_upload",
      Waiting: "waiting_upload",
      Paused: "paused_upload"
    }[status] ?? ""
  }

  Upload_Visuals.Status = Status;
  Upload_Visuals.Start = Start;
  Upload_Visuals.Progress = Progress;
  Upload_Visuals.Queue = Queue;
  Upload_Visuals.Notify = Notify;
}


Upload_Listeners();
Upload_Actions();
Upload();
Upload_Visuals();

// Dropbox - 26s
// Google - 40s
// Nanode - 54s