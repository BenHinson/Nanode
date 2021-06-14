// Custom Tools
// Function Format => N_FirstSecond = () => {}

const N_TypeManager = (mime) => {
  switch (mime) {
    case ("FOLDER"): return {mime, general: 'folder', short: 'Folder', icon: 'folder.svg'};
    
    // == Image
    case ("image/jpeg"): return {mime, general: 'image', short: 'JPEG', icon: 'image.svg'};
    case ("image/gif"): return {mime, general: 'image', short: 'GIF', icon: 'image.svg'};
    case ("image/svg+xml"): return {mime, general: 'image', short: 'SVG', icon: 'image.svg'};
    case ("image/bmp"): return {mime, general: 'image', short: 'Bitmap', icon: 'image.svg'};
    case ("image/png"): return {mime, general: 'image', short: 'PNG', icon: 'image.svg'};
    case ("image/webp"): return {mime, general: 'image', short: 'Web Picture', icon: 'image.svg'};
    // == Audio
    case ("audio/basic"): return {mime, general: 'audio', short: 'Audio', icon: 'music.svg'};
    case ("audio/mpeg"): return {mime, general: 'audio', short: 'MP3', icon: 'music.svg'};
    case ("audio/ogg"): return {mime, general: 'audio', short: 'OGG Audio', icon: 'music.svg'};
    case ("audio/x-wav"): return {mime, general: 'audio', short: 'Wave', icon: 'music.svg'};
    case ("audio/x-mpeg"): return {mime, general: 'audio', short: 'MPEG', icon: 'music.svg'};
    case ("audio/webm"): return {mime, general: 'audio', short: 'Web Audio', icon: 'music.svg'}; // Traffic Cone Icon
    // == Video
    case ("video/mpeg"): return {mime, general: 'video', short: 'MPEG', icon: 'video.svg'};
    case ("video/mp4"): return {mime, general: 'video', short: 'MP4', icon: 'video.svg'};
    case ("video/ogg"): return {mime, general: 'video', short: 'OGG Video', icon: 'video.svg'};
    case ("video/quicktime"): return {mime, general: 'video', short: 'Quicktime', icon: 'video.svg'};
    case ("video/webm"): return {mime, general: 'video', short: 'Web Video', icon: 'video.svg'};
    // == Text
    case ("text/plain"): return {mime, general: 'text', short: 'Plain Text', icon: 'text.svg'};
    case ("text/csv"): return {mime, general: 'text', short: 'CSV', icon: 'text.svg'};
    case ("text/webviewhtml"): return {mime, general: 'text', short: 'Hypertext', icon: 'text.svg'};
    case ("application/xml"): return {mime, general: 'text', short: 'XML', icon: 'text.svg'}; // Missing sketch
    // == Code
    case ("text/css"): return {mime, general: 'code', short: 'CSS', icon: 'css.svg'};
    case ("text/html"): return {mime, general: 'code', short: 'HTML', icon: 'code.svg'};
    case ("text/javascript"): case ("application/x-javascript"):
      return {mime, eneral: 'code', short: 'Javascript', icon: 'javascript.svg'};
    case ("text/x-python"): case ("application/x-python-code"):
      return {mime, general: 'code', short: 'Python', icon: 'python.svg'};
    case ("text/x-typescript"): case ("application/x-typescript"):
      return {mime, general: 'code', short: 'TypeScript', icon: 'typescript.svg'};
    case ("text/x-c"): return {mime, general: 'code', short: 'C', icon: 'c.svg'};
    case ("application/jsont"): return {mime, general: 'code', short: 'JSON', icon: 'code.svg'};
    case ("application/x-httpd-php"): return {mime, general: 'code', short: 'PHP', icon: 'php.svg'};
    // == Microsoft
    case ("application/excel"): case ("application/x-excel"): case ("application/msexcel"):
      return {mime, general: 'microsoft', short: 'Excel', icon: 'microsoft-excel.svg'};
    case ("application/powerpoint"): case ("application/x-powerpoint"): case ("application/mspowerpoint"): 
      return {mime, general: 'microsoft', short: 'Powerpoint', icon: 'microsoft-powerpoint.svg'};
    case ("application/word"): case ("application/x-word"): case ("application/msword"): 
      return {mime, general: 'microsoft', short: 'Word', icon: 'microsoft-word.svg'}; // Missing: onenote, publisher
    // == Adobe
    case ("application/psd"): case ("application/x-photoshop"): case ("application/photoshop"):
      return {mime, general: 'adobe', short: 'Photoshop', icon: 'adobe-photoshop.svg'};
    case ("application/postscript"): return {mime, general: 'adobe', short: 'Illustrator', icon: 'adobe-illustrator.svg'};
    case ("application/pdf"): return {mime, general: 'adobe', short: 'PDF', icon: 'pdf.svg'}; // Missing: XD, bridge?, indesign, lightroom, premiere-pro
    // == 3D
    case ("application/x-troff-ms"): return {mime, general: 'cad', short: '3DS Max', icon: 'blank.svg'}; // 3d file types icons needed
    case ("application/aca"): return {mime, general: 'cad', short: 'Auto CAD', icon: 'blank.svg'};
    // == Compressed
    case ("application/java-archive"): return {mime, general: 'compressed', short: 'Archive', icon: 'zip.svg'};
    case ("application/zip"): return {mime, general: 'compressed', short: 'Zip', icon: 'zip.svg'};
    case ("application/x-gzip"): return {mime, general: 'compressed', short: 'gZip', icon: 'zip.svg'};
    case ("application/vnd.rar"): return {mime, general: 'compressed', short: 'RAR', icon: 'zip.svg'};
    case ("application/x-7z-compressed"): return {mime, general: 'compressed', short: '7-Zip', icon: 'zip.svg'};
    // == MISC Executable
    case ("application/octet-stream"): return {mime, general: 'cad', short: 'Executable', icon: 'blank.svg'}; // Executable file icon needed
    // == Font
    case ("font/otf"): return {mime, general: 'font', short: 'OpenType', icon: 'font.svg'};
    case ("font/woff"): return {mime, general: 'font', short: 'Woff', icon: 'font.svg'};
    case ("font/woff2"): return {mime, general: 'font', short: 'Woff2', icon: 'font.svg'};

    default: return {mime, general: 'unknown', short: 'Unknown', icon: 'blank.svg'};
  }

}
const N_FileIcon = (nodeData, h, w, section) => {
  return nodeData.type.general == 'image' ? `/storage/${nodeData.id}?h=${h}&w=${w}&s=${section}` : `/assets/drive/programs/${nodeData.type.icon}`;
}

// Time
const N_DateAndTimeFormater = (date) => { // Used Once in Settings
  return new Date(date) == "Invalid Date" ? date : new Date(date).toLocaleString();
}
const N_DateFormater = (date) => { // Used Four times (2 in pages)
  date = date.stamp || date;
  if (date == null || !date.length) { return "-"; }
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2)  day = '0' + day;

  return UserSettings.user.date == 0 ? [day, month, year].join('/') : [month, day, year].join('/');
}
const N_TimeFormater = (time) => { // Used Four times in pages
  let Minutes = Math.floor(time / 60) < 10 ?  "0" + Math.floor(time / 60) : Math.floor(time / 60);
  let Seconds = Math.floor(time - (Minutes * 60)) < 10 ? "0" + Math.floor(time - (Minutes * 60)) : Math.floor(time - (Minutes * 60));
  return Minutes+":"+Seconds;
}
const N_TimeFormaterReverse = (time) => { // Used Once in pages
  return (parseInt(time.split(':')[0] * 60) + parseInt(time.split(':')[1]))
}

// Text
const N_CapFirstLetter = (string) => { // Used Seven Times
  return typeof string !== 'string' ? '' : string.charAt(0).toUpperCase() + string.slice(1)
}
const N_TextMultiple = (num, string) => { // Used Four times
  return num === 1 ? num+" "+string : num+" "+string+'s';
}

// Convert
const N_RGBtoHex = (rgb) => { // Used Four times
  if (!rgb) {return '';}
  if (Array.isArray(rgb)) { rgb = rgb[0] }
  let RGBColor = rgb.replace(/^.*rgba?\(([^)]+)\).*$/,'$1').split(',');
  return RGBColor.length >= 2 ? ("#" + ("0" + parseInt(RGBColor[0],10).toString(16)).slice(-2) + ("0" + parseInt(RGBColor[1],10).toString(16)).slice(-2) + ("0" + parseInt(RGBColor[2],10).toString(16)).slice(-2)) : (RGBColor);
}
const N_ConvertSize = (InputSize) => { // Used Twelve Times
  if (!InputSize) { return '-' }
  let fileSizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  for (let i=0; i<fileSizes.length; i++) {
    if (InputSize <= 1024) { return InputSize+" "+fileSizes[i] }
    else { InputSize = parseFloat(InputSize / 1024).toFixed(2) }
  }
  return InputSize;
}

// Elements
const N_PareAttr = (element, attrName) => {
  return element.parentElement.getAttribute(attrName);
}
const N_InfoPopup = (parent, info, displayTime) => {
  // NOTE: we MUST use createElement here as using just innerHTML breaks the child elements of parent as they are repassed and loose their event listener references.
  let popup = document.createElement('div');
  popup.classList = 'info-popup'
  popup.innerHTML = `${info}<i class="fas fa-times"></i></div>`
  parent.appendChild(popup);

  setTimeout(() => {
    popup.classList.add('display');
    popup.querySelector('i').addEventListener('click', () => {
      popup.classList.remove('display');
    });
  }, displayTime)
}
const N_Error = (err) => {
  console.log(`An Error Occured: ${err}`)
}
const N_Find = (identifier, multi=false, parentEle) => {
  return multi
    ? (parentEle || document).querySelectorAll(identifier)
    : (parentEle || document).querySelector(identifier);
}

// Status / Waiting
const N_Loading = (sizePosClass='medium', title='Loading') => {
  return `<svg class='Loading_SVG ${sizePosClass}' title='${title}' viewBox='0 0 100 100' xmlns='https://www.w3.org/2000/svg'><circle cx='50' cy='50' r='45'></circle></svg>`;
}

const lightColor = {"Off": "None", "True": "White", "False": "Red", "Ok": "#00ff00", "Wait": "Yellow", "User": "Cyan"};
const statusBar = document.querySelector('.clientStatus');

const N_ClientStatus = (pos, status, time) => {
  if (pos > 9 || pos < 0) { return; }
  
  let light = statusBar.children[pos];
  light.style.cssText = `background:${lightColor[status]}; color:${lightColor[status]};`;
  if (time) {
    setTimeout(function() { light.style.cssText = ""; }, time)
  }
}



const N_ItemsPath = (Parent, Name, path="") => { // Used Four times
  if (NodeName == "homepage") {
    return Parent+" > "+Name;
  } else {
    for (let i=0; i<Directory_Route.length; i++) {
      path += Directory_Route[i].Text+" > "
    }
    path += Name;
    return path;
  }
}