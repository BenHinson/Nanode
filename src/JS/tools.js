import { UserContext } from "../state/context/UserContext.react";
import { PageContext } from "../state/context/PageContext.react";

// N_ Custom Tools
const nConfig = {
  lightColor: {"Off": "None", "True": "White", "False": "Red", "Ok": "#00ff00", "Wait": "Yellow", "User": "Cyan"},
  icons: {'info': '<i class="fas fa-info-circle"></i>', 'success': '<i class="fas fa-check-circle"></i>', 'error': '<i class="fas fa-times-circle"></i>', 'warning': '<i class="fas fa-exclamation-circle"></i>'},
  statusBar: document.querySelector('.clientStatus'),
}

// export const FirstSecond = () => {}

// Time
export const DateFormatter = (date) => {
  // Used Four times (2 in pages)
  date = date.stamp || date;
  if (date == null || !date.length) { return "-"; }
  let d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2)  day = '0' + day;

  return UserContext.settings?.User?.date == 0 ? [day, month, year].join('/') : [month, day, year].join('/');
}
export const TimeFormatter = (time) => {
  // Used Four times in pages
  let minutes = Math.floor(time / 60) < 10 ?  "0" + Math.floor(time / 60) : Math.floor(time / 60);
  let seconds = Math.floor(time - (minutes * 60)) < 10 ? "0" + Math.floor(time - (minutes * 60)) : Math.floor(time - (minutes * 60));
  return minutes+":"+seconds;
}
export const TimeFormatterReverse = (time) => {
  return (parseInt(time.split(':')[0] * 60) + parseInt(time.split(':')[1]))
}


// Text
export const CapFirstLetter = (string) => {
  return typeof string !== 'string' ? '' : string.charAt(0).toUpperCase() + string.toLowerCase().slice(1);
}
export const TextMultiple = (num, string) => { // (500, 'item')
  return num === 1 ? num+" "+string : num+" "+string+'s';
}


// Convert
export const RGBtoHex = (rgb) => {
  // Used Four times
  if (!rgb) {return '';}
  if (Array.isArray(rgb)) { rgb = rgb[0] }
  let RGBColor = rgb.replace(/^.*rgba?\(([^)]+)\).*$/,'$1').split(',');
  return RGBColor.length >= 2 ? ("#" + ("0" + parseInt(RGBColor[0],10).toString(16)).slice(-2) + ("0" + parseInt(RGBColor[1],10).toString(16)).slice(-2) + ("0" + parseInt(RGBColor[2],10).toString(16)).slice(-2)) : (RGBColor);
}
export const ConvertSize = (InputSize=0) => {
  for (const size of ['Bytes', 'KB', 'MB', 'GB', 'TB']) {
    if (!InputSize || InputSize <= 1024) {return InputSize ? (InputSize+" "+size) : '-'; }
    else { InputSize = parseFloat(InputSize / 1024).toFixed() }
  }
}

// Elements
export const PareAttr = (element, attrName) => {
  return element.parentElement.getAttribute(attrName);
}
export const MakeReplaceElem = (parent, target, base) => {
  if (!parent.querySelector(target)) { parent.innerHTML += base }
  return parent.querySelector(target);
}
export const Error = (err) => {
  console.log(`An Error Occured: ${err}`)
}
export const Find = (identifier, multi=false, parentEle) => {
  return multi
    ? (parentEle || document).querySelectorAll(identifier)
    : (parentEle || document).querySelector(identifier) || undefined; // JS is dumb. returning 'null' here counts as an object and runs code when we don't want it to.
}
export const ExternalTab = (nodeId) => {
  let nt_btn = document.createElement('a');
  nt_btn.href = `/storage/${nodeId}`;
  nt_btn.target = '_blank';
  nt_btn.click();
}
export const FadeInOut = (elem, ms=300, display='block') => {  // Called from PositionMenu_ in RightClickContainer.
  elem.style.display = display;
  elem.style.transition = `opacity ${ms}ms`;
  elem.style.opacity = '1';

  setTimeout(() => {document.addEventListener('click', HideElement)}, 20)

  function HideElement() {
    elem.style.opacity = '0';
    elem.innerHTML = '';
    elem.style.display = 'none';
    document.removeEventListener('click', HideElement);
  }
}
export const DragElement = (elem) => {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  elem.onmousedown = (e) => {
    if (e.target !== elem) { return; }
    e.preventDefault();
    [pos3, pos4] = [e.clientX, e.clientY];

    document.onmouseup = () => {
      document.onmouseup = null;
      document.onmousemove = null;
    };

    document.onmousemove = (e) => {
      e.preventDefault();
      pos1 = (pos3 - e.clientX);
      pos2 = (pos4 - e.clientY);
      [pos3, pos4] = [e.clientX, e.clientY];
      elem.style.top = `${elem.offsetTop - pos2}px`;
      elem.style.left = `${elem.offsetLeft - pos1}px`;
    };
  }
}


// Status / Waiting
export const Loading = (sizePosClass='medium', title='Loading') => {
  return `<loading><svg class='Loading_SVG ${sizePosClass}' title='${title}' viewBox='0 0 100 100' xmlns='https://www.w3.org/2000/svg'><circle cx='50' cy='50' r='45'></circle></svg></loading>`;
}
export const ClientStatus = (pos, status, time) => {
  if (pos > 9 || pos < 0) { return; }
  
  let light = nConfig.statusBar.children[pos];
  light.style.cssText = `background:${nConfig.lightColor[status]}; color:${nConfig.lightColor[status]};`;
  if (time) { setTimeout(() => { light.style.cssText = ""; }, time) }
}


// File Data
export const TypeManager = (mime) => {
  let base = {mime, file:true}

  switch (mime) {
    case ("FOLDER"): return {...base, ...{file:false, general: 'folder', short: 'Folder', icon: 'folder.svg'}};
    
    // == Image
    case ("image/jpeg"): return {...base, ...{general: 'image', short: 'JPEG', icon: 'image.svg'}};
    case ("image/gif"): return {...base, ...{general: 'image', short: 'GIF', icon: 'image.svg'}};
    case ("image/svg+xml"): return {...base, ...{general: 'image', short: 'SVG', icon: 'image.svg'}};
    case ("image/bmp"): return {...base, ...{general: 'image', short: 'Bitmap', icon: 'image.svg'}};
    case ("image/png"): return {...base, ...{general: 'image', short: 'PNG', icon: 'image.svg'}};
    case ("image/webp"): return {...base, ...{general: 'image', short: 'Web Picture', icon: 'image.svg'}};
    case (mime.includes('image/')): return {...base, ...{general: 'image', short: 'Img', icon: 'image.svg'}};
    // == Audio
    case ("audio/basic"): return {...base, ...{general: 'audio', short: 'Audio', icon: 'music.svg'}};
    case ("audio/mpeg"): return {...base, ...{general: 'audio', short: 'MP3', icon: 'music.svg'}};
    case ("audio/ogg"): return {...base, ...{general: 'audio', short: 'OGG Audio', icon: 'music.svg'}};
    case ("audio/x-wav"): return {...base, ...{general: 'audio', short: 'Wave', icon: 'music.svg'}};
    case ("audio/x-mpeg"): return {...base, ...{general: 'audio', short: 'MPEG', icon: 'music.svg'}};
    case ("audio/webm"): return {...base, ...{general: 'audio', short: 'Web Audio', icon: 'music.svg'}}; // Traffic Cone Icon
    case (mime.includes('audio/')): return {...base, ...{general: 'audio', short: 'Audio', icon: 'music.svg'}};
    // == Video
    case ("video/mpeg"): return {...base, ...{general: 'video', short: 'MPEG', icon: 'video.svg'}};
    case ("video/mp4"): return {...base, ...{general: 'video', short: 'MP4', icon: 'video.svg'}};
    case ("video/ogg"): return {...base, ...{general: 'video', short: 'OGG Video', icon: 'video.svg'}};
    case ("video/quicktime"): return {...base, ...{general: 'video', short: 'Quicktime', icon: 'video.svg'}};
    case ("video/webm"): return {...base, ...{general: 'video', short: 'Web Video', icon: 'video.svg'}};
    case (mime.includes('video/')): return {...base, ...{general: 'video', short: 'Video', icon: 'video.svg'}};
    // == Text
    case ("text/plain"): return {...base, ...{general: 'text', short: 'Plain Text', icon: 'text.svg'}};
    case ("text/csv"): return {...base, ...{general: 'text', short: 'CSV', icon: 'text.svg'}};
    case ("text/webviewhtml"): return {...base, ...{general: 'text', short: 'Hypertext', icon: 'text.svg'}};
    case ("application/xml"): return {...base, ...{general: 'text', short: 'XML', icon: 'text.svg'}}; // Missing sketch
    case (mime.includes('text/')): return {...base, ...{general: 'text', short: 'Text', icon: 'text.svg'}};
    // == Code
    case ("text/css"): return {...base, ...{general: 'code', short: 'CSS', icon: 'css.svg'}};
    case ("text/html"): return {...base, ...{general: 'code', short: 'HTML', icon: 'code.svg'}};
    case ("text/javascript"): case ("application/x-javascript"):
      return {...base, ...{general: 'code', short: 'Javascript', icon: 'javascript.svg'}};
    case ("text/x-python"): case ("application/x-python-code"):
      return {...base, ...{general: 'code', short: 'Python', icon: 'python.svg'}};
    case ("text/x-typescript"): case ("application/x-typescript"):
      return {...base, ...{general: 'code', short: 'TypeScript', icon: 'typescript.svg'}};
    case ("text/x-c"): return {...base, ...{general: 'code', short: 'C', icon: 'c.svg'}};
    case ("application/jsont"): return {...base, ...{general: 'code', short: 'JSON', icon: 'code.svg'}};
    case ("application/x-httpd-php"): return {...base, ...{general: 'code', short: 'PHP', icon: 'php.svg'}};
    // == Microsoft
    case ("application/excel"): case ("application/x-excel"): case ("application/msexcel"):
      return {...base, ...{general: 'microsoft', short: 'Excel', icon: 'microsoft-excel.svg'}};
    case ("application/powerpoint"): case ("application/x-powerpoint"): case ("application/mspowerpoint"): 
      return {...base, ...{general: 'microsoft', short: 'Powerpoint', icon: 'microsoft-powerpoint.svg'}};
    case ("application/word"): case ("application/x-word"): case ("application/msword"): 
      return {...base, ...{general: 'microsoft', short: 'Word', icon: 'microsoft-word.svg'}}; // Missing: onenote, publisher
    // == Adobe
    case ("application/psd"): case ("application/x-photoshop"): case ("application/photoshop"):
      return {...base, ...{general: 'adobe', short: 'Photoshop', icon: 'adobe-photoshop.svg'}};
    case ("application/postscript"): return {...base, ...{general: 'adobe', short: 'Illustrator', icon: 'adobe-illustrator.svg'}};
    case ("application/pdf"): return {...base, ...{general: 'adobe', short: 'PDF', icon: 'pdf.svg'}}; // Missing: XD, bridge?, indesign, lightroom, premiere-pro
    // == 3D
    case ("application/x-troff-ms"): return {...base, ...{general: 'cad', short: '3DS Max', icon: 'blank.svg'}}; // 3d file types icons needed
    case ("application/aca"): return {...base, ...{general: 'cad', short: 'Auto CAD', icon: 'blank.svg'}};
    // == Compressed
    case ("application/java-archive"): return {...base, ...{general: 'compressed', short: 'Archive', icon: 'zip.svg'}};
    case ("application/zip"): return {...base, ...{general: 'compressed', short: 'Zip', icon: 'zip.svg'}};
    case ("application/x-gzip"): return {...base, ...{general: 'compressed', short: 'gZip', icon: 'zip.svg'}};
    case ("application/vnd.rar"): return {...base, ...{general: 'compressed', short: 'RAR', icon: 'zip.svg'}};
    case ("application/x-7z-compressed"): return {...base, ...{general: 'compressed', short: '7-Zip', icon: 'zip.svg'}};
    // == MISC Executable
    case ("application/octet-stream"): return {...base, ...{general: 'cad', short: 'Executable', icon: 'blank.svg'}}; // Executable file icon needed
    // == Font
    case ("font/otf"): return {...base, ...{general: 'font', short: 'OpenType', icon: 'font.svg'}};
    case ("font/woff"): return {...base, ...{general: 'font', short: 'Woff', icon: 'font.svg'}};
    case ("font/woff2"): return {...base, ...{general: 'font', short: 'Woff2', icon: 'font.svg'}};
    case (mime.includes('font/')): return {...base, ...{general: 'font', short: 'Font', icon: 'font.svg'}};

    default: return {...base, ...{general: 'unknown', short: 'Unknown', icon: 'blank.svg'}};
  }

}
export const FileIcon = (nodeData, h, w, section) => {
  return nodeData.type.general == 'image' ? `/storage/${nodeData.id}?h=${h}&w=${w}&s=${section}&host=true` : `/assets/drive/programs/${nodeData.type.icon}`;
}

// Navigation
export const ItemsPath = (parent, name) => {
  // return Main.NodeName == 'homepage' ? `${Parent} > ${Name}` : navConfig.Directory_Route.reduce((a,b) => a + `${b.Text} > `, `` ) + Name;
  return name;
}