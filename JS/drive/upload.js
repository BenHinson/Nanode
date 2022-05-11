const uploadConfig = {
  // chunkSize: (1 * 1024 * 1024), // 1 MB
  chunkSize: (3 * 1024 * 1024), // 3 MB
  // chunkSize: (5 * 1024 * 1024), // 5 MB
  // chunkSize: (20 * 1024 * 1024), // 20 MB

  itemCount: 0,
  size: 0,
  queue: [],
  visualItems: {},
  status: 'Choose', // Paused, Start, Complete, Choose, Limit, Invalid
  held: [],
  timeDifference: '',
  queueShowing: false,
}
const uploadElem = {
  Upload_Values: document.querySelectorAll('.UC_Bottom p'),
  Progress_Div: document.getElementsByClassName('Upload_Progress')[0],
  UC_Queue: document.getElementsByClassName('UC_Queue')[0],
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
        if (uploadConfig.held.length) {let held = uploadConfig.held.shift();  Upload.Manager(held.chunks, held.info, held.meta)} 
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
            uploadConfig.size += file.size;
            uploadConfig.itemCount++;
            Upload_Actions.Queue_Add(file, files[i]);
            
            if (i === files.length - 1) { Loop_Complete(); }
          })
        }
      });
    } else {
      Array.from(files).forEach(function(file) {
        uploadConfig.size += file.size;
        uploadConfig.itemCount++;
        Upload_Actions.Queue_Add(file);
      })
      Loop_Complete();
    }
  }


  Get_All_Files = async(InitialDrop) => {
    let uploadedFiles = [];
    let queue = [];
  
    for (let i=0; i<InitialDrop.length; i++) {
      queue.push(InitialDrop[i].webkitGetAsEntry());
    }
  
    while (queue.length > 0) {
      let entry = queue.shift();
      if (entry.isFile) { uploadedFiles.push(entry); } 
      else if (entry.isDirectory) { queue.push(...await this.Get_Dir_Entries(entry.createReader())); }
    }
    return uploadedFiles;
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
    if (uploadConfig.queue.length < 1001) {
      uploadConfig.queue.push( {"meta": this.Item_Meta(file, path), "data": file, "status": 'Waiting'} )
    } else {
      uploadElem.Upload_Values[0].style.color = 'crimson';
    }
  }

  Upload_Actions.Queue_Remove = (e) => {
    const uploadId = e.getAttribute('upload_id');
    const item = uploadConfig.visualItems[uploadId];

    if (!item || item.Status != 'Waiting') { e.remove(); return; }

    delete uploadConfig.visualItems[uploadId];
    uploadConfig.queue.splice(uploadConfig.queue.findIndex(e => e.meta.nodeId == uploadId), 1);
    uploadConfig.size -= item.meta.size;
    this.Plan_Check();
    uploadConfig.itemCount -= 1;
    uploadElem.Upload_Values[0].innerText = N_.TextMultiple(uploadConfig.itemCount, "Item");
    uploadElem.Upload_Values[1].innerText = N_.ConvertSize(uploadConfig.size);
    e.remove(); // Remove the element.

    if (uploadConfig.queue.length == 0 && uploadConfig.held.length == 0) {Upload_Visuals.Status("Choose", "Choose Items");}
  }

  Item_Meta = (file, dir='') => {
    return {
      "section": App.Section,
      "relativePath": file.fullPath || file.webkitRelativePath || dir.fullPath || file.name,
      "parent": Main.NodeID == "homepage" ? "_GENERAL_" : Main.NodeID,
      "name": file.name,
      "type": file.type,
      "size": file.size,
      "isFi": file.isFile == false ? false : true,
      "modified": file.lastModified,

      "nodeId": ((Math.random() * 1000000).toFixed()+'-'+file.size+'-'+(file.webkitRelativePath||file.relativePath||file.fileName||file.name).replace(/[^0-9a-zA-Z_-]/img, ''))
    }
  }

  Loop_Complete = () => {
    if (uploadConfig.queue.length >= 1) {
    
      for (let i=0; i<uploadConfig.queue.length; i++) { // Make Duplicate for Visual Purposes. (No file Data) As uploadConfig.queue gets Shifted
        uploadConfig.visualItems[uploadConfig.queue[i].meta.nodeId] = {"order": i, "meta": uploadConfig.queue[i].meta, "status": uploadConfig.queue[i].status}
      }

      uploadElem.Upload_Values[0].innerText = N_.TextMultiple(uploadConfig.itemCount, "Item");
      uploadElem.Upload_Values[1].innerText = N_.ConvertSize(uploadConfig.size);
      Upload_Visuals.Queue('update');

      this.Plan_Check();
    }
  }

  Plan_Check = () => {
    let accountPlan = Settings.User.plan;
    let accountStorageLeft = accountPlan.max - accountPlan.used;
    if (uploadConfig.size > accountStorageLeft) {
      Upload_Visuals.Notify('notification', 'limit', `Cannot exceed current plan! (${N_.ConvertSize(uploadConfig.size - accountStorageLeft)} over)`);
      Upload_Visuals.Status("Limit", "Exceeding Plan");
    } else {
      Upload_Visuals.Notify('hide');
      Upload_Visuals.Status("Start", "Start Upload");
    }
  }

  Upload_Actions.Reset_Upload = () => {
    uploadConfig.itemCount = 0;
    uploadConfig.size = 0;
    uploadConfig.queue = [];
    uploadConfig.visualItems = {};
    uploadConfig.status = 'Choose';
    uploadConfig.held = [];

    uploadElem.Upload_Values[0].innerText = "0 Items";
    uploadElem.Upload_Values[1].innerText = "0 B";
  }
}

Upload = () => {

  Iterate = () => { // Search for next File to Upload.
    if (uploadConfig.queue.length == 0) { // queue is empty.
      Upload_Visuals.Status("Choose", "Choose Items");
      Upload_Visuals.Notify('success', 'finished', 'Items Successfully Uploaded.');
      fetch('https://drive.nanode.one/upload', { ...defConfig, body: JSON.stringify({"message":"Queue_Empty"})} )
      Main.NodeCall({"folder":Main.NodeID, "reload": false});
      Upload_Actions.Reset_Upload();
      return;
    }
    let file = uploadConfig.queue.shift();
    if (file) {
      this.Chunker(file);
      uploadConfig.visualItems[file.meta.nodeId].status = "Uploading";
      Upload_Visuals.Start(file.data.size);
    }
  }

  Chunker = (file) => { // Chunks up the File, sets data and works out each chunk size
    let chunks = [];

    for (let start = 0; start < file.data.size; start += uploadConfig.chunkSize + 1) {
      const chunk = file.data.slice(start, start + uploadConfig.chunkSize + 1)
      chunks.push({"data":chunk, "num": chunks.length });
    }
    let info = {"totalChunks": chunks.length, "totalSize": file.data.size};

    Upload_Visuals.Status("Pause", "Pause")
    this.Manager(chunks, info, file.meta);
  }

  Manager = (chunks, info, meta) => { // Pushes Chunk to Post if all OK
    if (uploadConfig.status == "Paused") {
      console.log('Pause Detected');
      uploadConfig.held.push({chunks, info, meta});
      uploadConfig.visualItems[meta.nodeId].status = "Paused";
      return;
    }

    if (uploadConfig.status.match(/Limit|Invalid/)) { return; }

    if (chunks.length) {
      let upload = chunks.shift();
      info['index'] = upload.num;
      this.Post(chunks, upload, info, meta) // Upload the chunk to the server
      uploadConfig.visualItems[meta.nodeId].status = "Uploading";
    } else {
      this.Iterate(); // All chunks of the file are uploaded. Move onto next item.
    }
  }


  
  Post = (chunks, upload, chunkInfo, meta) => { // Sends the Chunk and Handles Reply
    N_.ClientStatus(1, "True");

    let form = {
      meta,
      chunkInfo,
    }
  
    this.Read_Chunk(upload.data, async(e) => {
      form['file'] = Array.from(new Uint8Array(e.target.result)); // Fastest and Easiest to Convert on the Server
  
      uploadConfig.timeDifference = Date.now();
  
      const reply = await( await fetch('https://drive.nanode.one/upload', {
        ...defConfig,
        body: new Blob( [ JSON.stringify(form) ], { type: 'text/plain' } ),
      }) ).json();
  
      N_.ClientStatus(1, "Off");
  
      this.Item_Status(reply, {meta, "uploadNum": upload.num, ...chunkInfo}, {chunks, chunkInfo});
    })
  }


  // Post = async (chunks, Upload, Info, meta) => { // ! THIS IS TEST CODE PLEASE REMOVE ===== This code is 5 Times faster at uploading files.
  //   N_.ClientStatus(1, "True");

  //   const formData = new FormData();
  //   formData.append('files', Upload.Data)

  //   const Reply = await( await fetch('https://upload.nanode.one/test_upload', {
  //     method: 'POST',
  //     headers: { 'form': JSON.stringify({
  //       'meta': meta,
  //       'chunkInfo': {"index": Upload.Num, "totalChunks": Info.totalChunks, "totalSize": Info.totalSize}
  //     })},
  //     body: formData,
  //   }) ).json();

  //   N_.ClientStatus(1, "Off");

  //   this.Item_Status(Reply, {meta, "uploadNum": Upload.Num, "totalChunks": Info.totalChunks, "totalSize": Info.totalSize}, {chunks, Info});
  // }


  Read_Chunk = (file, onLoadCallback) => { // Reads the Files Data as an ArrayBuffer
    let reader = new FileReader();
    reader.onload = onLoadCallback;
    reader.readAsArrayBuffer(file);
  }

  Item_Status = (reply, data, next) => {
    console.log(reply);
    switch (reply.status) {
      case 'Success': { // Send the next chunk or file.
        this.Manager(next.chunks, next.info, data.meta); break; 
      }
      case 'Invalid': {
        uploadConfig.status = 'Invalid';
        Upload_Visuals.Notify('error', 'invalid', reply.message);
        break;
      }
      case 'Limit': { console.log('Exceeding Account size Limit');
        uploadConfig.status = 'Limit';
        Upload_Visuals.Notify('error', 'limit', 'You have ran out of storage on this plan.')
        break;
      }
      case 'Failed': { console.log('Failed to write chunk');
        uploadConfig.visualItems[Data.meta.nodeId].status = "Failed";
        Upload_Visuals.Notify('error', 'failed', 'An Item has Failed to Upload. Please Try Again.');
        break;
      }
      case 'Incomplete': { console.log('Missing Data');
        uploadConfig.visualItems[Data.meta.nodeId].status = "Incomplete";
        Upload_Visuals.Notify('error', 'incomplete', 'The data provided is incomplete or incorrect.');
        break;
      }
      case 'Complete': {
        uploadConfig.visualItems[data.meta.nodeId].status = "Complete";
        Settings.SetStorage(reply.plan);
        this.Iterate();
        break;
      }
    }
    Upload_Visuals.Progress(data.totalChunks, data.uploadNum, data.totalSize, data.meta.nodeId);
  }

  Upload.Iterate = Iterate;
  Upload.Manager = Manager;
}

Upload_Visuals = () => {

  Status = (action, text) => {
    uploadConfig.status = action;
    uploadElem.Upload_Control.setAttribute('action', action);
    uploadElem.Upload_Control.innerText = text;

    if (uploadConfig.status == "Complete" || uploadConfig.status == 'Choose') { setTimeout(() => uploadElem.Progress_Div.classList.remove('visible'), 3000) }
  }

  Notify = (type, notif, message) => {
    if (type == 'hide') { return uploadElem.UC_Info.classList = `UC_Info`; }
    uploadElem.UC_Info.classList = `UC_Info ${type} display`;
    uploadElem.UC_Info.children[0].innerText = message;
  }

  Start = (size) => {
    uploadElem.Progress_Div.classList.add('visible');
    uploadElem.Progress_Div.querySelector('progress').value = 0;
    this.Queue();

    let uploadTime = parseInt(size / (512*1024)) // In Seconds (Assuming 0.5MB / sec = ~4Mb/s upload)
    uploadElem.Progress_Div.querySelector('p').innerText = uploadTime < 60 ? (uploadTime+1)+"s" : N_.TextMultiple( (parseInt(uploadTime / 60)+1), "min" );
  },

  Progress = (totalChunks, chunk_num, totalSize, id) => {
    // uploadConfig.size > Total size of all files to be uploaded.
    // Define global 'Uploaded_Size'
    // (Uploaded_Size / (Uploaded + completedSize)) * 100

    let completedSize = totalChunks == 1 ? totalSize : ((chunk_num+1) * uploadConfig.chunkSize);
    let itemPercentage = ((completedSize / totalSize) * 100)
    uploadElem.Progress_Div.querySelector('progress').value = itemPercentage;

    let timeTillUpload = totalChunks == 1 ? 0 : parseInt((totalSize - completedSize) / uploadConfig.chunkSize) * ((Date.now() - uploadConfig.timeDifference) / 1000)
    uploadElem.Progress_Div.querySelector('p').innerText = timeTillUpload < 60 ? (timeTillUpload+1).toFixed()+"s" : N_.TextMultiple( (parseInt(timeTillUpload / 60)+1).toFixed(), "min") 

    if (uploadConfig.queueShowing) {
      let uploadedItem = uploadElem.UC_Queue_Table.querySelectorAll("tr[upload_id='"+id+"']")[0];
      uploadedItem.removeAttribute('onclick');
      uploadedItem.children[2].innerHTML = uploadConfig.visualItems[id] ? this.Status_Icon(uploadConfig.visualItems[id].status) : this.Status_Icon("Complete");
    }
  }

  Queue = (action) => {
    if (action == 'toggle') {
      uploadElem.UC_Queue.classList.toggle('display');
      if (!uploadConfig.queueShowing) {
        uploadElem.UC_Queue_Table.innerHTML = '';
        uploadElem.Queue_Toggle.classList = 'fas fa-chevron-down';
        uploadConfig.queueShowing = true;
      } else {
        uploadElem.Queue_Toggle.classList = 'fas fa-chevron-up';
        uploadConfig.queueShowing = false;
        return;
      }
    } else if (action == 'update') {
      uploadElem.UC_Queue.classList.add('display');
      uploadElem.Queue_Toggle.classList = 'fas fa-chevron-down';
      uploadConfig.queueShowing = true;
    }

    uploadElem.UC_Queue_Table.innerHTML = '';

    for (const [id, info] of Object.entries(uploadConfig.visualItems)) {
      uploadElem.UC_Queue_Table.innerHTML += `
        <tr upload_id='${id}' class='${this.Status_Class(info['Status'])}' onclick='${info['Status'] == 'Waiting' ? 'Upload_Actions.Queue_Remove(this)' : ''}'> <td>${info['meta'].name}</td> <td>${N_.ConvertSize(info['meta'].size)}</td> <td>${this.Status_Icon(info['Status'])}</td> </tr>
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

function PopUp_Upload() {
  const UploadContainer = document.getElementsByClassName('Upload_Container')[0];

  N_.ClientStatus(7, "Wait", 600);
  Upload_Visuals.Status("Choose", "Choose Items");
  uploadElem.Upload_Values[0].innerText = '0 Items';
  uploadElem.Upload_Values[1].innerText = '0 B';
  UploadContainer.style.visibility = "visible";

  PopUp_Upload.Close = function() {
    UploadContainer.style.visibility = 'hidden';
    UploadContainer.querySelectorAll('span i')[0].classList = 'fas fa-chevron-up'
    uploadElem.UC_Queue.classList.remove('UC_Showing');
    uploadElem.Progress_Div.classList.remove('visible');
    Upload_Actions.Reset_Upload();
  };
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
*/










// Post = (chunks, Upload, Info, meta) => { // Sends the Chunk and Handles Reply
//   N_.ClientStatus(1, "True");

//   this.Read_Chunk(Upload.Data, async(e) => {
//     const formData = new FormData();
//     formData.append('file', new Uint8Array(e.target.result))

//     uploadConfig.timeDifference = Date.now();

//     const Reply = await( await fetch('https://drive.nanode.one/upload', {
//       method: 'POST', headers: { 'form': JSON.stringify({
//         'meta': meta,
//         'chunkInfo': {"index": Upload.Num, "totalChunks": Info.totalChunks, "totalSize": Info.totalSize}
//       }) },
//       body: formData,
//     }) ).json();

//     N_.ClientStatus(1, "Off");

//     this.Item_Status(Reply, {meta, "uploadNum": Upload.Num, "totalChunks": Info.totalChunks, "totalSize": Info.totalSize}, {chunks, Info});
//   })
// }