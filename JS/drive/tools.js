// Custom Tools
// Function Format => N_FirstSecond = () => {}

// Type
const N_TypeChecker = (type, trim) => { // Replace _ with spaces. use _ for file calls
  let mimeType = type.mime || type;
  let converted = '';

  switch (mimeType) {
    case ("FOLDER"): converted = "Folder"; break;
    
    // == Image
    case ("image/jpeg"): converted = "JPEG"; break;
    case ("image/gif"): converted = "GIF"; break;
    case ("image/tiff"): converted = "Tif"; break;
    case ("image/x-icon	"): converted = "Icon"; break;
    case ("image/svg+xml"): converted = "SVG"; break;
    case ("image/ief"): converted = "Image"; break;
    case ("image/bmp"): converted = "Bitmap"; break;
    case ("image/pict"): converted = "Macintosh"; break;
    case ("image/png"): converted = "PNG"; break;
    case ("image/x-rgb"): converted = "RGB"; break;
    case ("image/x-xbitmap"): converted = "X_Bitmap"; break;
    case ("image/webp"): converted = "WEBP Image"; break;
    // == Audio
    case ("audio/basic"): converted = "Audio"; break;
    case ("audio/mpeg"): converted = "MP3"; break;
    case ("audio/ogg"): converted = "OGG Audio"; break;
    case ("audio/x-wav"): converted = "Wave"; break;
    case ("audio/x-mpeg"): converted = "MPEG"; break;
    case ("audio/x-voice"): converted = "Voice"; break;
    case ("audio/webm"): converted = "WEBM Audio"; break;
    // == Video
    case ("video/mpeg"): converted = "Mpeg"; break;
    case ("video/mp4"): converted = "MP4"; break;
    case ("video/ogg"): converted = "OGG Video"; break;
    case ("video/quicktime"): converted = "Quicktime"; break;
    case ("video/x-sgi-movie"): converted = "Quicktime"; break;
    case ("video/msvideo"): converted = "Windows_Video"; break;
    case ("video/vdo"): converted = "folder"; break;
    case ("video/vivo"): converted = "Vivo"; break;
    case ("video/webm"): converted = "WEBM Video"; break;
    // == Text
    case ("text/plain"): converted = "Plain_Text"; break;
    case ("application/rtf"): converted = "Rich_Text_Format"; break;
    case ("text/richtext"): converted = "Rich_Text"; break;
    case ("text/csv"): converted = "Comma_Serparated"; break;
    case ("text/webviewhtml"): converted = "Hypertext"; break;
    // == Code
    case ("text/css"): converted = "CSS"; break;
    case ("text/html"): converted = "HTML"; break;
    case ("application/hta"): converted = "HTML"; break;
    case ("application/xhtml+xml"): converted = "xHTML"; break;
    case ("application/jsont"): converted = "JSON"; break;
    case ("application/x-javascript"): converted = "Javascript"; break;
    case ("application/java-archive"): converted = "Java_Archive"; break;
    case ("application/x-httpd-php"): converted = "PHP"; break;
    // == Microsoft
    case ("application/vnd.ms-excel"): converted = "Excel"; break;
    case ("application/vnd.ms-powerpoint"): converted = "Powerpoint"; break;
    case ("application/msword"): converted = "Word"; break;
    case ("application/msaccess"): converted = "Access"; break;
    case ("application/msexcel"): converted = "Excel"; break;
    case ("application/mspowerpoint"): converted = "Powerpoint"; break;
    case ("application/msproject"): converted = "Project"; break;
    case ("application/mswrite"): converted = "Write"; break;
    // == Adobe
    case ("application/psd"): converted = "Photoshop"; break;
    case ("application/x-photoshop"): converted = "Photoshop"; break;
    case ("application/photoshop"): converted = "Photoshop"; break;
    case ("application/postscript"): converted = "Illustrator"; break;
    case ("application/pdf"): converted = "PDF"; break;
    // == 3D
    case ("application/x-troff-ms"): converted = "3DS_Max"; break;
    case ("application/aca"): converted = "AutoCAD"; break;
    // == Compressed
    case ("application/x-gzip"): converted = "GZip"; break;
    case ("application/zip"): converted = "Zip"; break;
    case ("multipart/x-gzip"): converted = "gZip"; break;
    case ("application/vnd.rar"): converted = "RAR"; break;
    case ("application/x-7z-compressed"): converted = "7-Zip"; break;
    // == MISCCCC
    case ("application/octet-stream"): converted = "Executable"; break;
    case ("application/xml"): converted = "XML"; break;
    case ("font/otf"): converted = "Font"; break;
    case ("font/woff"): converted = "Woff"; break;
    case ("font/woff2"): converted = "Woff"; break;

    default: converted = "Unknown";
  }

  return trim ? converted.replaceAll('_', ' ') : converted;
}
const N_ItemImage = (params) => { // Used Twice outside Tools
  const {type, oID, section, h, w} = params;

  if (type == "FOLDER")               return "/assets/file_icons/folder.svg";
  else if (type.includes('image'))    return `/storage/${oID}?h=${h}&w=${w}&s=${section}`;

  let file_type = N_ItemChecker(type)
  if (file_type == "unknown")     return "/assets/file_icons/file.svg";
  else                            return "/assets/file_icons/"+file_type+".svg";
}
const N_ItemChecker = (item_Type) => { // Used Once outside Tools
  item_Type = item_Type.mime || item_Type;
  if (item_Type == "FOLDER") { return "folder" }
  if (item_Type.includes("image")) { return "image" }
  if (item_Type.includes("video")) { return "video" }
  if (item_Type.includes("audio")) { return "audio" }
  if (item_Type.includes("text")) { return "text" }
  return "unknown";
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

  return dateFormat == 0 ? [day, month, year].join('/') : [month, day, year].join('/');
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
  let RGBColor = rgb.replace(/^.*rgba?\(([^)]+)\).*$/,'$1').split(',');
  return  RGBColor.length >= 2 ? ("#" + ("0" + parseInt(RGBColor[0],10).toString(16)).slice(-2) + ("0" + parseInt(RGBColor[1],10).toString(16)).slice(-2) + ("0" + parseInt(RGBColor[2],10).toString(16)).slice(-2)) : (RGBColor);
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

// Status / Waiting
const N_Loading = (sizePosClass='medium', title='Loading') => {
  return `<svg class='Loading_SVG ${sizePosClass}' title='${title}' viewBox='0 0 100 100' xmlns='https://www.w3.org/2000/svg'><circle cx='50' cy='50' r='45'></circle></svg>`;
}
const lightColours = {"Off": "None", "True": "White", "False": "Red", "Ok": "#00ff00", "Wait": "Yellow", "User": "Cyan"};
const N_ClientStatus = (Light, Status, Time) => {
  if (document.getElementById(Light) != undefined) {
    document.getElementById(Light).style.cssText = "background: "+lightColours[Status]+"; color:"+lightColours[Status]+";";
    if (Time) {
      setTimeout(function() {
        document.getElementById(Light).style.cssText = "background: none; color: none;";
      }, Time)
    }
  }
}



const N_ItemsPath = (Parent, Name, path="") => { // Used Four times
  if (NanoName == "homepage") {
    return Parent+" > "+Name;
  } else {
    for (let i=0; i<Directory_Route.length; i++) {
      path += Directory_Route[i].Text+" > "
    }
    path += Name;
    return path;
  }
}