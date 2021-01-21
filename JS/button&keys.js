// Button and Key Listeners
HasAnEvent = ['Shift', 'ArrowUp', 'ArrowDown', 'ArrowRight']

const keyMap = {};
onkeydown = function(e) {
  // if (HasAnEvent[e.key]) {
    // e.preventDefault();
    // e.stopImmediatePropagation();
    // if ( keyMap[e.key] == false ) {
      keyMap[e.key] = true;
      // KeyDownEvents(e.key);
    // }
  // }
  // else { return; }

}
onkeyup = function(e) {
  e.preventDefault();
  e.stopImmediatePropagation();
  keyMap[e.key] = false;
}

// ===========================

KeyDownEvents = function(key) {
  console.log(key);
  switch(key) {
    case ('Shift'): 
      console.log("Shift"); break;
    case ('ArrowUp'):
      console.log('Up Files'); break;
    case ('ArrowDown'):
      console.log('Down Files'); break;
    case ('ArrowRight'):
      console.log('Enter File'); break;
  }
}