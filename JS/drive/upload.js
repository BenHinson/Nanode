const uploadConfig = {
  // Chunk_Size: (1 * 1024 * 1024), // 1 MB
  Chunk_Size: (3 * 1024 * 1024), // 3 MB
  // Chunk_Size: (5 * 1024 * 1024), // 5 MB
  // Chunk_Size: (20 * 1024 * 1024), // 20 MB

  Item_Count: 0,
  Size: 0,
  Queue: [],
  Visual_Items: {},
  Status: 'Choose', // Paused, Start, Complete, Choose, Limit
  Held: [],
  Time_Difference: '',
  Queue_Showing: false,
}
const uploadElem = {
  // Referenced in viewer.js and upload.js
  Upload_Values: document.querySelectorAll('.UC_Bottom p'),
  Progress_Div: document.getElementsByClassName('Upload_Progress')[0],
  UC_Queue: document.getElementsByClassName('UC_Queue')[0],
  // Referenced only in upload.js
  Upload_Buttons: document.querySelectorAll('.UploadBtns > input'),
  Drop_Area: document.querySelector('.Pages'),
  DragDropOverlay: document.querySelector('.DragDropOverlay'),
  UC_Info: document.querySelector('.UC_Info'),
  Upload_Control: document.getElementsByClassName('Upload_Control')[0],
  Queue_Toggle: document.getElementById('queue_toggle'),

  UC_Queue_Table: document.querySelector('.UC_Queue table tbody'),
}

// ========================================

Upload_Listeners = () => {
  
  uploadElem.Upload_Buttons.forEach((ele) => ele.addEventListener('change', (e) => Upload_Actions.Looper(e.target.files) ) );

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
    uploadElem.Drop_Area.addEventListener(event, preventDefaults, false)   
    uploadElem.DragDropOverlay.addEventListener(event, preventDefaults, false);
    document.body.addEventListener(event, preventDefaults, false);
    function preventDefaults(e) {e.preventDefault(); e.stopPropagation();}
  });
  ['dragenter', "dragover"].forEach(event => {
    uploadElem.Drop_Area.addEventListener(event, highlight, false)
    function highlight(e) { if (e.dataTransfer.types[0] == "Files") {uploadElem.DragDropOverlay.classList.add('display_Overlay')} }
  });
  ['dragleave', 'drop'].forEach(event => {
    uploadElem.Drop_Area.addEventListener(event, unhighlight, false)
    function unhighlight(e) { uploadElem.DragDropOverlay.classList.remove('display_Overlay'); }
  });

  uploadElem.Drop_Area.addEventListener("drop", function(e) {
    if (!e.dataTransfer.files.length) { return; }
    PopUp_Upload();
    Upload_Actions.Looper(e.dataTransfer.items, true)
  })

  Upload_Listeners.Control = (e) => {
    switch (e.getAttribute('action')) {
      case 'Choose': { document.querySelectorAll('.UC_Bottom button').forEach(e => e.classList.add('highlight')); break;}
      case 'Start': { Upload.Iterate(); break; }
      case 'Pause': { Upload_Visuals.Status('Paused', 'Continue'); break;}
      case 'Paused': { Upload_Visuals.Status('Pause', 'Pause');
        if (uploadConfig.Held.length) {let Held = uploadConfig.Held.shift();  Upload.Manager(Held.Chunks, Held.Info, Held.Meta)} 
        else {Upload.Iterate()}; break;}
    }
  }
}

Upload_Actions = () => {

  Upload_Actions.Looper = async(files, drop) => {
    if (drop) {
      await this.Get_All_Files(files).then(function(files) {
        for (let i=0; i<files.length; i++) {
          files[i].file(file => {
            uploadConfig.Size += file.size;
            uploadConfig.Item_Count++;
            Upload_Actions.Queue_Add(file, files[i]);
            
            if (i === files.length - 1) { Loop_Complete(); }
          })
        }
      });
    } else {
      Array.from(files).forEach(function(file) {
        uploadConfig.Size += file.size;
        uploadConfig.Item_Count++;
        Upload_Actions.Queue_Add(file);
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
      else if (entry.isDirectory) { queue.push(...await this.Get_Dir_Entries(entry.createReader())); }
    }
    return Uploaded_Files;
  }
  Get_Dir_Entries = async(directory) => {
    let entries = [];
    let readEntries = await this.readEntriesPromise(directory);
    while (readEntries.length > 0) {
      entries.push(...readEntries);
      readEntries = await this.readEntriesPromise(directory);
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


  Upload_Actions.Queue_Add = (file, path) => {
    if (uploadConfig.Queue.length < 1001) {
      uploadConfig.Queue.push( {"Meta": this.Item_Meta(file, path), "Data": file, "Status": 'Waiting'} )
    } else {
      uploadElem.Upload_Values[0].style.color = 'crimson';
    }
  }

  Upload_Actions.Queue_Remove = (e) => {
    const up_id = e.getAttribute('upload_id');
    const item = uploadConfig.Visual_Items[up_id];

    if (!item || item.Status != 'Waiting') { e.remove(); return; }

    delete uploadConfig.Visual_Items[up_id];
    uploadConfig.Queue.splice(uploadConfig.Queue.findIndex(e => e.Meta.id == up_id), 1);
    uploadConfig.Size -= item.Meta.size;
    this.Plan_Check();
    uploadConfig.Item_Count -= 1;
    uploadElem.Upload_Values[0].innerText = N_.TextMultiple(uploadConfig.Item_Count, "Item");
    uploadElem.Upload_Values[1].innerText = N_.ConvertSize(uploadConfig.Size);
    e.remove(); // Remove the element.

    if (uploadConfig.Queue.length == 0 && uploadConfig.Held.length == 0) {Upload_Visuals.Status("Choose", "Choose Items");}
  }

  Item_Meta = (file, dir='') => {
    return {
      "section": App.Section,
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

  Loop_Complete = () => {
    if (uploadConfig.Queue.length >= 1) {
    
      for (let i=0; i<uploadConfig.Queue.length; i++) { // Make Duplicate for Visual Purposes. (No file Data) As uploadConfig.Queue gets Shifted
        uploadConfig.Visual_Items[uploadConfig.Queue[i].Meta.id] = {"Order": i, "Meta": uploadConfig.Queue[i].Meta, "Status": uploadConfig.Queue[i].Status}
      }

      uploadElem.Upload_Values[0].innerText = N_.TextMultiple(uploadConfig.Item_Count, "Item");
      uploadElem.Upload_Values[1].innerText = N_.ConvertSize(uploadConfig.Size);
      Upload_Visuals.Queue('update');

      this.Plan_Check();
    }
  }

  Plan_Check = () => {
    let accountPlan = Settings.User.plan;
    let accountStorageLeft = accountPlan.max - accountPlan.used;
    if (uploadConfig.Size > accountStorageLeft) {
      Upload_Visuals.Notify('notification', 'limit', `Cannot exceed current plan! (${N_.ConvertSize(uploadConfig.Size - accountStorageLeft)} over)`);
      Upload_Visuals.Status("Limit", "Exceeding Plan");
    } else {
      Upload_Visuals.Notify('hide');
      Upload_Visuals.Status("Start", "Start Upload");
    }
  }

  Upload_Actions.Reset_Upload = () => {
    uploadConfig.Item_Count = 0;
    uploadConfig.Size = 0;
    uploadConfig.Queue = [];
    uploadConfig.Visual_Items = {};
    uploadConfig.Status = 'Choose';
    uploadConfig.Held = [];

    uploadElem.Upload_Values[0].innerText = "0 Items";
    uploadElem.Upload_Values[1].innerText = "0 B";
  }
}

Upload = () => {

  Iterate = () => { // Search for next File to Upload.
    if (uploadConfig.Queue.length == 0) { // Queue is empty.
      Upload_Visuals.Status("Choose", "Choose Items");
      Upload_Visuals.Notify('success', 'finished', 'Items Successfully Uploaded.');
      fetch('https://drive.nanode.one/upload', { ...defConfig, body: JSON.stringify({"message":"Queue_Empty"})} )
      NodeCall({"Folder":NodeID, "Reload": false});
      Upload_Actions.Reset_Upload();
      return;
    }
    let File = uploadConfig.Queue.shift();
    if (File) {
      this.Chunker(File);
      uploadConfig.Visual_Items[File.Meta.id].Status = "Uploading";
      Upload_Visuals.Start(File.Data.size);
    }
  }

  Chunker = (File) => { // Chunks up the File, sets data and works out each chunk size
    let Chunks = [];

    for (let start = 0; start < File.Data.size; start += uploadConfig.Chunk_Size + 1) {
      const Chunk = File.Data.slice(start, start + uploadConfig.Chunk_Size + 1)
      Chunks.push({"Data":Chunk, "Num": Chunks.length });
    }
    let Info = {"total_chunks": Chunks.length, "total_size": File.Data.size};

    Upload_Visuals.Status("Pause", "Pause")
    this.Manager(Chunks, Info, File.Meta);
  }

  Manager = (Chunks, Info, Meta) => { // Pushes Chunk to Post if all OK
    if (uploadConfig.Status == "Paused") {
      console.log('Pause Detected');
      uploadConfig.Held.push({"Chunks": Chunks, "Info": Info, "Meta": Meta});
      uploadConfig.Visual_Items[Meta.id].Status = "Paused";
      return;
    }

    if (uploadConfig.Status == 'Limit') { return; }

    if (Chunks.length) {
      let Upload = Chunks.shift();
      this.Post(Chunks, Upload, Info, Meta) // Upload the chunk to the server
      uploadConfig.Visual_Items[Meta.id].Status = "Uploading";
    } else {
      this.Iterate(); // All chunks of the file are uploaded. Move onto next item.
    }
  }

  // Post = async (Chunks, Upload, Info, Meta) => { // ! THIS IS TEST CODE PLEASE REMOVE ===== This code is 5 Times faster at uploading files.
  //   const formData = new FormData();
  //   formData.append('files', Upload.Data)

  //   const Reply = await( await fetch('https://drive.nanode.one/test_upload', {
  //     method: 'POST',
  //     body: formData,
  //   }) ).json();
  // }


  Post = (Chunks, Upload, Info, Meta) => { // Sends the Chunk and Handles Reply
    N_.ClientStatus(1, "True");

    let Form = {
      'meta': Meta,
      'chunk_info': {"index": Upload.Num, "total_chunks": Info.total_chunks, "total_size": Info.total_size}
    }

    this.Read_Chunk(Upload.Data, async(e) => {
      Form.file = Array.from(new Uint8Array(e.target.result)); // Fastest and Easiest to Convert on the Server

      uploadConfig.Time_Difference = Date.now();

      const Reply = await( await fetch('https://drive.nanode.one/upload', {
        ...defConfig,
        body: new Blob( [ JSON.stringify(Form) ], { type: 'text/plain' } ),
      }) ).json();

      N_.ClientStatus(1, "Off");

      this.Item_Status(Reply, {Meta, "upload_num": Upload.Num, "total_chunks": Info.total_chunks, "total_size": Info.total_size}, {Chunks, Info});
    })
  }

  Read_Chunk = (File, onLoadCallback) => { // Reads the Files Data as an ArrayBuffer
    let reader = new FileReader();
    reader.onload = onLoadCallback;
    reader.readAsArrayBuffer(File);
  }

  Item_Status = (Reply, Data, Next) => {
    switch (Reply.status) {
      case 'Success': { // Send the next chunk or file.
        this.Manager(Next.Chunks, Next.Info, Data.Meta); break; 
      }
      case 'Limit': { console.log('Exceeding Account Size Limit');
        uploadConfig.Status = 'Limit';
        Upload_Visuals.Notify('error', 'limit', 'You have ran out of storage on this plan.')
        break;
      }
      case 'Failed': { console.log('Failed to write chunk');
        uploadConfig.Visual_Items[Data.Meta.id].Status = "Failed";
        Upload_Visuals.Notify('error', 'failed', 'An Item has Failed to Upload. Please Try Again.');
        break;
      }
      case 'Incomplete': { console.log('Missing Data');
        uploadConfig.Visual_Items[Data.Meta.id].Status = "Incomplete";
        Upload_Visuals.Notify('error', 'incomplete', 'The data provided is incomplete or incorrect.');
        break;
      }
      case 'Complete': {
        uploadConfig.Visual_Items[Data.Meta.id].Status = "Complete";
        Settings.SetStorage(Reply.plan);
        this.Iterate();
        break;
      }
    }
    Upload_Visuals.Progress(Data.total_chunks, Data.upload_num, Data.total_size, Data.Meta.id);
  }

  Upload.Iterate = Iterate;
  Upload.Manager = Manager;
}

Upload_Visuals = () => {

  Status = (action, text) => {
    uploadConfig.Status = action;
    uploadElem.Upload_Control.setAttribute('action', action);
    uploadElem.Upload_Control.innerText = text;

    if (uploadConfig.Status == "Complete" || uploadConfig.Status == 'Choose') { setTimeout(() => uploadElem.Progress_Div.classList.remove('visible'), 3000) }
  }

  Notify = (type, notif, message) => {
    if (type == 'hide') { return uploadElem.UC_Info.classList = `UC_Info`; }
    uploadElem.UC_Info.classList = `UC_Info ${type} display`;
    uploadElem.UC_Info.children[0].innerText = message;
  }

  Start = (Size) => {
    uploadElem.Progress_Div.classList.add('visible');
    uploadElem.Progress_Div.querySelector('progress').value = 0;
    this.Queue();

    let upload_time = parseInt(Size / (512*1024)) // In Seconds (Assuming 0.5MB / sec = ~4Mb/s upload)
    uploadElem.Progress_Div.querySelector('p').innerText = upload_time < 60 ? (upload_time+1)+"s" : N_.TextMultiple( (parseInt(upload_time / 60)+1), "min" );
  },

  Progress = (total_chunks, chunk_num, total_size, id) => {
    // uploadConfig.Size > Total size of all files to be uploaded.
    // Define global 'Uploaded_Size'
    // (Uploaded_Size / (Uploaded + completed_Size)) * 100

    let completed_Size = total_chunks == 1 ? total_size : ((chunk_num+1) * uploadConfig.Chunk_Size);
    let item_percentage = ((completed_Size / total_size) * 100)
    uploadElem.Progress_Div.querySelector('progress').value = item_percentage;

    let time_till_upload = total_chunks == 1 ? 0 : parseInt((total_size - completed_Size) / uploadConfig.Chunk_Size) * ((Date.now() - uploadConfig.Time_Difference) / 1000)
    uploadElem.Progress_Div.querySelector('p').innerText = time_till_upload < 60 ? (time_till_upload+1).toFixed()+"s" : N_.TextMultiple( (parseInt(time_till_upload / 60)+1).toFixed(), "min") 

    if (uploadConfig.Queue_Showing) {
      let uploaded_item = uploadElem.UC_Queue_Table.querySelectorAll("tr[upload_id='"+id+"']")[0];
      uploaded_item.removeAttribute('onclick');
      uploaded_item.children[2].innerHTML = uploadConfig.Visual_Items[id] ? this.Status_Icon(uploadConfig.Visual_Items[id].Status) : this.Status_Icon("Complete");
    }
  }

  Queue = (action) => {
    if (action == 'toggle') {
      uploadElem.UC_Queue.classList.toggle('display');
      if (!uploadConfig.Queue_Showing) {
        uploadElem.UC_Queue_Table.innerHTML = '';
        uploadElem.Queue_Toggle.classList = 'fas fa-chevron-down';
        uploadConfig.Queue_Showing = true;
      } else {
        uploadElem.Queue_Toggle.classList = 'fas fa-chevron-up';
        uploadConfig.Queue_Showing = false;
        return;
      }
    } else if (action == 'update') {
      uploadElem.UC_Queue.classList.add('display');
      uploadElem.Queue_Toggle.classList = 'fas fa-chevron-down';
      uploadConfig.Queue_Showing = true;
    }

    uploadElem.UC_Queue_Table.innerHTML = '';

    for (const [id, info] of Object.entries(uploadConfig.Visual_Items)) {
      uploadElem.UC_Queue_Table.innerHTML += `
        <tr upload_id='${id}' class='${this.Status_Class(info['Status'])}' onclick='${info['Status'] == 'Waiting' ? 'Upload_Actions.Queue_Remove(this)' : ''}'> <td>${info['Meta'].name}</td> <td>${N_.ConvertSize(info['Meta'].size)}</td> <td>${this.Status_Icon(info['Status'])}</td> </tr>
      `
    } 
  }

  Status_Icon = (status) => {
    return {
      Paused: "<i class='far fa-pause-circle yellow' title='Paused'></i>",
      Complete: "<i class='far fa-check-circle green' title='Complete'></i>",
      Incomplete: "<i class='far fa-times-circle dark_red' title='Form Error'></i>",
      Failed: "<i class='far fa-times-circle red' title='Failed'></i>",
      Uploading: N_.Loading('small upload', 'Uploading'),
      Waiting: "<i class='far fa-clock' title='Waiting'></i>",
    }[status] ?? "<i class='far fa-question-circle' title='Eh? No Status from Server... big yikes.'></i>"
  }

  Status_Class = (status) => {
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

/**
 * 
 * Uploading a 11.75MB file.
 * (1mb)    // 29.103  Upload  1.590 Read     (seconds)     (11 Chunks)
 * (5mb)    // 22.640  Upload  0.405 Read     (seconds)     (3 Chunks)
 * (20mb)   // 22.790  Upload  0.160 Read     (seconds)     (1 Chunk)
 * 
 *  USING 'express-fileupload' with form encType="multipart/form-data". Upload takes 6.00s Same with npm package 'formidable'
 * 
*/