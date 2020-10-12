const container = document.getElementsByClassName('mainLoginContainer')[0];
var currentLoginPage = 'login'

window.socket = io.connect('https://nanode.one');

socket.on("connection:sockid", function(sockID) {
  document.cookie = "sockID="+sockID+";domain=nanode.one;secure"
})
socket.on("WrongUsernameOrPassword", function() {
  $("#email")[0].style.border = "1px solid #f04747"; $("#TitleEmail")[0].innerHTML = "Username <i> - wrong username or password</i>";
  $("#pwd")[0].style.border = "1px solid #f04747"; $("#TitlePwd")[0].innerHTML = "Password <i> - wrong username or password</i>";
})
socket.on("AccountAlreadyExists", function() {
  $("#loginUsername")[0].style.border = "1px solid #f04747"; $("#loginInputTitleUser")[0].innerHTML = "USERNAME <i style='color: #f04747;'> - account already exists</i>";
})
socket.on("UserRegistered", function() { loginSignupFormSwitch(); });



$("#loginBtn").on("click", function(e) {
  e.preventDefault();
  $("#email")[0].style.border = ""; $("#TitleEmail")[0].innerHTML = "Email";
  $("#pwd")[0].style.border = ""; $("#TitlePwd")[0].innerHTML = "Password";

  if ( !($("#email")[0].value) ) { 
    $("#email")[0].style.border = "1px solid #f04747"; $("#TitleEmail")[0].innerHTML = "Email <i> - field required</i>"; return; }

  if ( !($("#pwd")[0].value) ) { 
    $("#pwd")[0].style.border = "1px solid #f04747"; $("#TitlePwd")[0].innerHTML = "Password <i'> - field required</i>"; return; }

  $("#loginForm").submit();
  return false;
})


function loginSignupFormSwitch() {
  if (currentLoginPage == "login") { currentLoginPage = "signup"
    container.innerHTML = `
    <h2 class="MainTitle">Signup</h2>
    <div class="SecondaryTitle">Signup for your drive</div>

    <form id="loginForm" method="POST">
      <div id="TitleEmail" class="InputTitle">Email</div>
      <input id="email" class='TextInput' type="text" autocomplete="off" name="email" placeholder='Enter email address' maxlength="128" spellcheck="false" required>
  
      <div id="TitlePwd" class="InputTitle">Password<p>Min: 8 Long | Number | Uppercase | Lowercase | Special Character</p></div>
      <input id="pwd" class='TextInput' type="password" autocomplete="new-password"  name="password" placeholder="Enter your password" maxlength="128" spellcheck="false" required>
  
      <input id="loginBtn" class="ButtonInput" type="submit" value="Signup" onsubmit="return false">
    </form>

    <span id="accountStatus">Already have an account?</span>
    <button onclick="loginSignupFormSwitch()">Login</button>
    `
    inputChecker();
  } else { currentLoginPage = "login"
    container.innerHTML = `
    <h2 class="MainTitle">Welcome</h2>
    <div class="SecondaryTitle">Login to your drive</div>

    <form id="loginForm" action="/login" method="POST">
      <div id="TitleEmail" class="InputTitle">Email</div>
      <input id="email" class='TextInput' type="text" autocomplete="off" name="email" placeholder='Enter email address' maxlength="128" spellcheck="false" required>

      <div id="TitlePwd" class="InputTitle">Password</div>
      <input id="pwd" class='TextInput' type="password" autocomplete="new-password"  name="password" placeholder="Enter your password" maxlength="128" spellcheck="false" required>

      <input id="loginBtn" class="ButtonInput" type="submit" value="Login" onsubmit="return false">
    </form>

    <span id="accountStatus">Dont have an account?</span>
    <button onclick="loginSignupFormSwitch()">Signup</button>
    `
  }
}

function inputChecker() {
  $("#pwd").off();
  $("#pwd").on("input", function(e) {
    let sufficient = e.target.value.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
    if (sufficient) {
      $("p")[0].style.color = "#00d610";
      $("#loginForm")[0].action = "/signup";
    } else { 
      $("#loginForm")[0].action = "";
      $("p")[0].style.color = "#d60000";
    }
  })
}