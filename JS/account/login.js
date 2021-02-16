function elem(id) { return document.getElementById(id) }
const container = document.getElementsByClassName('mainLoginContainer')[0];

let currentLoginPage = 'login';

const reponseMap = {
  "Incorrect_Cred": "wrong email or password </i>",
  "Invalid_Email" : "enter a valid email</i>",
  "Already_Exists" : "account already exists</i>"
}

listenToBtn();
function listenToBtn() {
  elem('loginBtn').addEventListener("click", async(e) => {
    e.preventDefault();

    const email = elem('email'); const emailTitle = elem('TitleEmail')
    const pwd = elem('pwd'); const pwdTitle = elem('TitlePwd');
    const form = elem('loginForm');

    if ( !email.value ) { 
      email.style.border = "1px solid #f04747";
      emailTitle.innerHTML = "Email <i> - field required</i>";
    } else {
      email.style.border = "";
      emailTitle.innerHTML = "Email"; 
    }
  
    if ( !pwd.value ) { 
      pwd.style.border = "1px solid #f04747";
      pwdTitle.innerHTML = "Password <i> - field required</i><p style='display:none;'></p>";
    } else {
      pwd.style.border = "";
      pwdTitle.innerHTML = ( currentLoginPage == 'login') ? "Password" : "Password<p>Min: 8 Long | Number | Uppercase | Lowercase | Special Character</p>"; 
    }
  
    if (form.getAttribute('action')) {
      try { 
        const response = await fetch( form.getAttribute('action'), { method: 'POST', body: new URLSearchParams(new FormData(form)) })
        const responseData = await response.json();

        if (responseData.Acc_Server == "_Login") {
          location = '//nanode.one';
        } else if (responseData.Acc_Server == "_Registered") {
          loginSignupFormSwitch();
        } else if (responseData.Acc_Server) {
          elem("email").style.border = "1px solid #f04747";
          elem("TitleEmail").innerHTML = "Email <i> - "+reponseMap[responseData.Acc_Server];

          if (responseData.Acc_Server == "Incorrect_Cred") {
            elem("pwd").style.border = "1px solid #f04747"; elem('TitlePwd').innerHTML = "Password <i> - wrong email or password</i>";
          }
        }

      } catch(error) {console.log(error)}
    }
  })
}


function loginSignupFormSwitch() {
  if (currentLoginPage == "login") { currentLoginPage = "signup"
    container.innerHTML = `
    <h1 class="MainTitle">Signup</h1>
    <h2 class="SecondaryTitle">Signup for Nanode Storage</h2>

    <form id="loginForm" method="POST">
      <div id="TitleEmail" class="InputTitle">Email</div>
      <input id="email" class='TextInput' type="text" autocomplete="off" name="email" placeholder='Enter email address' maxlength="128" spellcheck="false" required title='Please enter your Email'>
  
      <div id="TitlePwd" class="InputTitle">Password<p>Min: 8 Long | Number | Uppercase | Lowercase | Special Character</p></div>
      <input id="pwd" class='TextInput' type="password" autocomplete="new-password"  name="password" placeholder="Enter your password" maxlength="128" spellcheck="false" required title='Please enter your Password'>
  
      <input id="loginBtn" class="ButtonInput" type="submit" value="Signup" onsubmit="return false">
    </form>

    <span id="accountStatus">Already have an account?</span>
    <button onclick="loginSignupFormSwitch()">Login</button>
    `
    inputChecker();
  } else { currentLoginPage = "login"
    container.innerHTML = `
    <h1 class="MainTitle">Welcome</h1>
    <h2 class="SecondaryTitle">Login to Nanode</h2>

    <form id="loginForm" method="POST" action="/login">
      <div id="TitleEmail" class="InputTitle">Email</div>
      <input id="email" class='TextInput' type="text" autocomplete="off" name="email" placeholder='Enter email address' maxlength="128" spellcheck="false" required title='Please enter your Email'>

      <div id="TitlePwd" class="InputTitle">Password</div>
      <input id="pwd" class='TextInput' type="password" autocomplete="new-password"  name="password" placeholder="Enter your password" maxlength="128" spellcheck="false" required title='Please enter a Password'>

      <input id="loginBtn" class="ButtonInput" type="submit" value="Login" onsubmit="return false">
    </form>

    <span id="accountStatus">Dont have an account?</span>
    <button onclick="loginSignupFormSwitch()">Signup</button>
    `
  }
  listenToBtn();
}

function inputChecker() {
  elem('pwd').addEventListener('input', function(e) {
    let sufficient = e.target.value.match(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/)
    if (sufficient) {
      document.getElementsByTagName('p')[0].style.color = "#00d610"
      elem('loginForm').action = "/signup";
    } else { 
      elem('loginForm').action = "";
      document.getElementsByTagName('p')[0].style.color = "#d60000";
    }
  })
}

// background-image: url(//drive.nanode.one/assets/nanode/system.svg);
// background-repeat: no-repeat;
// background-clip: border-box;
// background-position: center;
// background-size: 800px;

// background-color: #151517c4;