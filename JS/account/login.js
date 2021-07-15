

nanodeLogin = () => {
  let currentLoginPage = 'login';
  const sufficient = (/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/);
  const reponseMap = {
    "Incorrect_Cred": "wrong email or password </i>",
    "Invalid_Email" : "enter a valid email</i>",
    "Already_Exists" : "account already exists</i>"
  }

  const loginElem = {
    form: document.querySelector('form'),
    email: document.querySelector('input[type=text]'),
    pwd: document.querySelector('input[type=password]'),
    emailTitle: document.querySelector('.emailTitle'),
    pwdTitle: document.querySelector('.pwdTitle'),
    submitBtn: document.querySelector('input[type=submit]'),
    formSwitchBtn: document.querySelector('#formSwitch'),
  }

  // ======================
  

  Listen = () => {
    loginElem.submitBtn.addEventListener("click", async(e) => {
      e.preventDefault();

      loginElem.email.style.border = !loginElem.email.value ? '1px solid var(--color_red)' : '';
      loginElem.pwd.style.border = !loginElem.pwd.value ? '1px solid #f04747' : '';

      if (currentLoginPage == 'signup') {
        loginElem.pwdTitle.innerHTML = loginElem.pwd.value.match(sufficient)
          ? 'Password'
          : 'Password<i> - Please improve your password</i>'
      }

      // loginElem.pwdTitle.innerHTML = 'Password<span><p>8 Long</p><p>Uppercase</p><p>Lowercase</p><p>Number</p><p>Special</p></span>';
    
      if (loginElem.form.getAttribute('action') && loginElem.email.value && loginElem.pwd.value) {
        try {
          const responseData = await(
            await fetch( loginElem.form.getAttribute('action'), { method: 'POST', body: new URLSearchParams(new FormData(loginElem.form)) })
          ).json();
  
          if (responseData.Acc_Server == "_Login") {
            location = '//nanode.one';
          } else if (responseData.Acc_Server == "_Registered") {
            formSwitch();
          } else if (responseData.Acc_Server) {
            loginElem.email.style.border = "1px solid #f04747";
            loginElem.emailTitle.innerHTML = "Email <i> - "+reponseMap[responseData.Acc_Server];
  
            if (responseData.Acc_Server == "Incorrect_Cred") {
              loginElem.pwd.style.border = "1px solid #f04747";
              loginElem.pwdTitle.innerHTML = "Password <i> - wrong email or password</i>";
            }
          }
  
        } catch(error) {console.log(error)}
      }
    })
  }


  Checker = () => {
    loginElem.pwd.addEventListener('input', (e) => {
      loginElem.pwdTitle.style.color = e.target.value.match(sufficient) ? 'var(--color_green)' : 'var(--color_red)';

      if (e.target.value.match(sufficient)) loginElem.pwdTitle.innerHTML = 'Password';

      loginElem.form.action = sufficient ? '/signup' : '';
    })

  }


  formSwitch = () => {
    if (currentLoginPage == "login") { currentLoginPage = "signup";

      document.querySelector('.MainTitle').innerText = 'Signup';
      document.querySelector('.SecondaryTitle').innerText = 'Signup for Nanode Storage';

      loginElem.form.removeAttribute('action');
      [loginElem.emailTitle.innerHTML, loginElem.pwdTitle.innerHTML] = ['Email', 'Password'];
      [loginElem.pwdTitle.style, loginElem.email.style, loginElem.pwd.style] = ['', '', ''];
      loginElem.submitBtn.value = 'Signup';
      loginElem.submitBtn.setAttribute('onsubmit', 'return false')

      document.querySelector('#accountStatus').innerText = 'Already have an account?';
      loginElem.formSwitchBtn.innerText = 'Login';

      // <span><p>8 Long</p><p>Uppercase</p><p>Lowercase</p><p>Number</p><p>Special</p></span>

      this.Checker();
    } else { currentLoginPage = "login";
      document.querySelector('.MainTitle').innerText = 'Welcome';
      document.querySelector('.SecondaryTitle').innerText = 'Enter into your Nanode Account';

      loginElem.form.setAttribute('action', '/login');
      [loginElem.emailTitle.innerHTML, loginElem.pwdTitle.innerHTML] = ['Email', 'Password'];
      [loginElem.pwdTitle.style, loginElem.email.style, loginElem.pwd.style] = ['', '', ''];
      loginElem.submitBtn.value = 'Login';
      
      document.querySelector('#accountStatus').innerText = "Don't have an account?";
      loginElem.formSwitchBtn.innerText = 'Signup';
    } 
    this.Listen();
  }


  // ======================

  this.Listen();

  nanodeLogin.formSwitch = formSwitch;
}

nanodeLogin();







// background-image: url(//drive.nanode.one/assets/nanode/system.svg);
// background-repeat: no-repeat;
// background-clip: border-box;
// background-position: center;
// background-size: 800px;

// background-color: #151517c4;