window.socket = io.connect('https://nanode.one');

socket.on("connection:sockid", function(sockID) {
  document.cookie = "sockID="+sockID+";domain=nanode.one;secure"
})
socket.on("WrongUsernameOrPassword", function() {
  $("#loginUsername")[0].style.border = "1px solid #f04747"; $("#loginInputTitleUser")[0].innerHTML = "USERNAME <i style='color: #f04747;'> - wrong username or password</i>";
  $("#loginPwd")[0].style.border = "1px solid #f04747"; $("#loginInputTitlePwd")[0].innerHTML = "PASSWORD <i style='color: #f04747;'> - wrong username or password</i>";
})
socket.on("AccountAlreadyExists", function() {
  $("#loginUsername")[0].style.border = "1px solid #f04747"; $("#loginInputTitleUser")[0].innerHTML = "USERNAME <i style='color: #f04747;'> - account already exists</i>";
})
socket.on("UserRegistered", function() { loginSignupFormSwitch(); });

$(".loginButtonInput").on("click", function(e) {
  e.preventDefault();
  $("#loginUsername")[0].style.border = ""; $("#loginInputTitleUser")[0].innerHTML = "USERNAME";
  $("#loginPwd")[0].style.border = ""; $("#loginInputTitlePwd")[0].innerHTML = "PASSWORD";
  if ( !($("#loginUsername")[0].value) || !($("#loginPwd")[0].value) ) {
    if ( !($("#loginUsername")[0].value) ) { $("#loginUsername")[0].style.border = "1px solid #f04747"; $("#loginInputTitleUser")[0].innerHTML = "USERNAME <i style='color: #f04747;'> - field required</i>"; }
    if ( !($("#loginPwd")[0].value) ) { $("#loginPwd")[0].style.border = "1px solid #f04747"; $("#loginInputTitlePwd")[0].innerHTML = "PASSWORD <i style='color: #f04747;'> - field required</i>"; }
  } 
  else {
    $("#loginForm").submit();
  }
})

$("#loginAccountRegBtn").on("click", function() {loginSignupFormSwitch();})


function loginSignupFormSwitch() {
  if ( $(".loginMainTitle")[0].innerText === "Signup" ) {
    $(".loginMainTitle")[0].innerText = "Welcome";
    $(".loginSecondaryTitle")[0].innerText = "Login to view your drive";
    $(".forgotPasswordBtn")[0].style.display = "block";
    $("#accountStatus")[0].innerText = "Dont have an account?";
    $("#loginAccountRegBtn")[0].innerText = "Register Here";
    $("#loginBtn")[0].value = "Login";
    $("#loginForm")[0].action = "/login";
    $("#PWReqs")[0].style.display = "none";
  } else {
    $(".loginMainTitle")[0].innerText = "Signup";
    $(".loginSecondaryTitle")[0].innerText = "Signup to create your drive";
    $(".forgotPasswordBtn")[0].style.display = "none";
    $("#accountStatus")[0].innerText = "Already have an account?";
    $("#loginAccountRegBtn")[0].innerText = "Login Here";
    $("#loginBtn")[0].value = "Register";
    $("#loginForm")[0].action = "";
    $("#PWReqs")[0].style.display = "block";
  }
}

(function() {
  $("#loginPwd").on("input", function(e) {
    sufficient = e.target.value.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
    if (sufficient) { $("#PWReqs")[0].style.color = "#00d610"; $("#loginForm")[0].action = "/signup";}
    else { $("#loginForm")[0].action = ""; $("#PWReqs")[0].style.color = "#d60000"; }
  })
})()
