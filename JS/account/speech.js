const recognition = new webkitSpeechRecognition();

recognition.continuous = false;
recognition.interimResults = false;
recognition.maxAlternatives = 1;
recognition.lang = 'en-GB';

///////////////////////////////////

const activate = document.querySelector('.activateSpeech');
const output = document.querySelector('.resultOutput');
const issue = document.querySelector('.recognitionIssue');

///////////////////////////////////

// find me, show me, search for.

activate.onclick = function() {
  recognition.start();
}

recognition.onstart = () => {
  activate.style.background = '#4285f466';
}

recognition.onspeechend = () => {
  recognition.stop();
}

recognition.onend = () => {
  activate.style.background = '';
};


recognition.onresult = (event) => {
  let result = event.results[0][0].transcript
  output.value = result;
  if (result == "what's the point") {
    output.value = "There isn't one yet"
  }
  console.log(`Confidence: ${event.results[0][0].confidence}`);
}


recognition.onnomatch = (event) => {
  issue.innerText = 'Found No Match';
}

recognition.onerror = (event) => {
  issue.innerText = `An Error Occured: ${event.error}`
}