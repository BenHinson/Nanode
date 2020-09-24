var tabCount = 1;
window.tabs = ["Homepage?Homepage"]
var displayedTabNumber = 0;
window.fileLocation;
var LoadedStartupLocation;


function loadOpenTabs() {
  $("#tabContainer > #panelTabOpen").remove();
  tabs.forEach(function(tab, index) {
    tabParent = document.getElementById('tabContainer')
    panelTab = document.createElement('div');
    panelTab.setAttribute("id", "panelTabOpen");
    panelTab.setAttribute("class", "panelTabOpen");
    panelTab.setAttribute("tabNum", index);
    tabLocation = tab.substr(tab.indexOf("?") + 1);
    panelTab.setAttribute("fileLocation", tabLocation);
    tabTitle = tab.substr(0, tab.indexOf("?"));
    panelTab.innerHTML = tabTitle;
    tabParent.appendChild(panelTab);
    if (tabs.length > 1) {
      panelTabClose = document.createElement('div');
      panelTabClose.setAttribute("class", "panelTabClose");
      panelTabClose.setAttribute("title", "Close Tab");
      panelTabClose.setAttribute("tabNum", index);
      panelTab.appendChild(panelTabClose);
      panelTabCloseIcon = document.createElement('i');
      panelTabCloseIcon.setAttribute("class", "fas fa-times");
      panelTabClose.appendChild(panelTabCloseIcon);
    }
  })
  $('div[tabNum="'+displayedTabNumber+'"]')[0].style.background = "rgba(182, 182, 182, 0.4)";

  tabListeners();
  if (!LoadedStartupLocation) {
    LoadedStartupLocation = true;
    displayedTab = $('div[tabNum="'+displayedTabNumber+'"]')[0]
    fileLocation = $(displayedTab).attr("fileLocation");
  }
}


function tabListeners() {
  $(".newPanelTab, .panelTabOpen").unbind();
  $(".newPanelTab").on("click", function(e) {
    tabs.push("Homepage?Homepage");
    loadOpenTabs();
  })
  $(".panelTabClose").on("click", function(e) {
    e.stopImmediatePropagation();
    tabNumber = eval($(e.target.parentElement).attr("tabNum"));
    tabToClose = $('div[tabNum="'+tabNumber+'"]')[0];
    tabs.splice(tabNumber, 1);
    tabToClose.remove();
    if (tabNumber == displayedTabNumber) {displayNavTab(tabNumber)} else {
      if ((displayedTabNumber - 1) >= 0) {displayedTabNumber--}
    }
    loadOpenTabs();
  })
  $(".panelTabOpen").on("click", function(e) {
    tabNumber = eval($(e.currentTarget).attr("tabNum"));
    if (displayedTabNumber != tabNumber) {
      tabToOpen = $('div[tabNum="'+tabNumber+'"]')[0];
      tabToOpen.style.background = "#b6b6b6";
      $('div[tabNum="'+displayedTabNumber+'"]')[0].style.background = "";
      displayedTabNumber = tabNumber;
      fileLocation = $(e.currentTarget).attr("fileLocation");
      loadTabDirectoryLocation(fileLocation);
    }
  })
}

function displayNavTab(tabNumber) {
  if ($('div[tabNum="'+ [displayedTabNumber + 1] +'"]')[0]) {
    TabToOpen = ($('div[tabNum="'+ [displayedTabNumber + 1] +'"]')[0]);
    displayedTabNumber = eval($(TabToOpen).attr("tabnum")) - 1;
  } else {
    TabToOpen = ($('div[tabNum="'+ [displayedTabNumber - 1] +'"]')[0]);
    displayedTabNumber = eval($(TabToOpen).attr("tabnum"));
  }
  fileLocation = $(TabToOpen).attr("fileLocation");
  loadTabDirectoryLocation(fileLocation);
}


function loadTabDirectoryLocation(fileLocation) {
  if ($("#fileContainer")) {
    TabLocationInfo = tabs[displayedTabNumber];
    directoryPath = TabLocationInfo.substr(TabLocationInfo.indexOf("?") + 1);
    $("#fileContainer").empty();
    socket.emit('directoryLocation', {directoryPath});
  }
}

$(document).ready(loadTabDirectoryLocation);