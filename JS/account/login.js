new class NanodeLogin {
  constructor() {
    [this.currentLoginPage, this.formAction] = ['login', 'login'];

    this.sufficient = (/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/);
    this.responseMap = {
      "Incorrect_Cred": "incorrect email or password </i>",
      "Invalid_Email" : "enter a valid email address</i>",
      "Already_Exists" : "account already exists</i>"
    }
    
    this.email = document.querySelector('input[type=text]');
    this.pwd = document.querySelector('input[type=password]');
    this.emailTitle = document.querySelector('.emailTitle');
    this.pwdTitle = document.querySelector('.pwdTitle');
    
    if (document.location.hash == '#signup') this.formSwitch();
    this.listen();
  }

  formSwitch() {
    if (this.currentLoginPage === 'login') {
      this.currentLoginPage = "signup";

      document.title = 'Signup to Nanode';

      document.querySelector('.MainTitle').innerText = 'Signup';
      document.querySelector('.SecondaryTitle').innerText = 'Signup for Nanode Storage';

      this.formAction = '';
      [this.emailTitle.innerHTML, this.pwdTitle.innerHTML] = ['Email', 'Password'];
      [this.pwdTitle.style, this.email.style, this.pwd.style] = ['', '', ''];
      document.querySelector('input[type=submit]').value = 'Signup';
      // document.querySelector('input[type=submit]').setAttribute('onsubmit', 'return false')

      document.querySelector('#accountStatus').innerText = 'Already have an account?';
      document.querySelector('#formSwitch').innerText = 'Login';

      // <span><p>8 Long</p><p>Uppercase</p><p>Lowercase</p><p>Number</p><p>Special</p></span>
      
      window.history.replaceState(null, 'Signup to Nanode', 'https://account.nanode.one/login#signup');
    } else {
      this.currentLoginPage = "login";
      document.title = 'Login to Nanode';

      document.querySelector('.MainTitle').innerText = 'Welcome';
      document.querySelector('.SecondaryTitle').innerText = 'Enter into your Nanode Account';

      this.formAction = '/login';
      [this.emailTitle.innerHTML, this.pwdTitle.innerHTML] = ['Email', 'Password'];
      [this.pwdTitle.style, this.email.style, this.pwd.style] = ['', '', ''];
      document.querySelector('input[type=submit]').value = 'Login';
      
      document.querySelector('#accountStatus').innerText = "Don't have an account?";
      document.querySelector('#formSwitch').innerText = 'Signup';
      
      window.history.replaceState(null, 'Login to Nanode', 'https://account.nanode.one/login');
    }
  }

  listen() {
    document.querySelector('#formSwitch').addEventListener('click', () => this.formSwitch());

    document.querySelector('input[type=password]').addEventListener('input', (e) => {
      if (this.currentLoginPage !== 'signup') { return; }

      if (e.target.value.match(this.sufficient)) this.pwdTitle.innerHTML = 'Password';
      this.pwdTitle.style.color = e.target.value.match(this.sufficient) ? 'var(--color_green)' : 'var(--color_red)';
      this.formAction = this.sufficient ? '/signup' : '';
    })

    document.querySelector('input[type=submit]').addEventListener("click", (e) => {
      e.preventDefault();

      this.email.style.border = !this.email.value ? '1px solid var(--color_red)' : '';
      this.pwd.style.border = !this.pwd.value ? '1px solid #f04747' : '';

      if (this.currentLoginPage == 'signup') {
        if (this.pwd.value.match(this.sufficient)) { this.pwdTitle.innerHTML = 'Password' }
        else { return this.pwdTitle.innerHTML = 'Password<i> - Please improve your password</i>' }
        // loginElem.pwdTitle.innerHTML = 'Password<span><p>8 Long</p><p>Uppercase</p><p>Lowercase</p><p>Number</p><p>Special</p></span>';

        if (this.email.value.includes('@')) { this.emailTitle.innerHTML = 'Email' }
        else { return this.emailTitle.innerHTML = 'Email<i> - Please enter a valid email address</i>' }
      }

      this.post();
    })
  }

  post = async() => {
    if (this.formAction && this.email.value && this.pwd.value) {
      try {
        const res = await fetch( this.formAction, {
          method: 'POST',
          body: new URLSearchParams(new FormData(document.querySelector('form'))) })

        if (!res.ok) throw new Error(res.statusText);
        const responseData = await res.json();
            
        switch(responseData.Acc_Server) {
          case('_Login'): return location = '//nanode.one';
          case('_Registered'): return formSwitch();
          case('Incorrect_Cred'): {
            this.pwd.style.border = "1px solid #f04747";
            this.pwdTitle.innerHTML = "Password <i> - wrong email or password</i>";
          }
          default: {
            this.email.style.border = "1px solid #f04747";
            this.emailTitle.innerHTML = "Email <i> - "+this.responseMap[responseData.Acc_Server];
          };
        }
      } catch(error) {
        console.log(error);
      }
    }
  }
}