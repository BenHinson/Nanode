function changeTheme() {
  let darkThemeEnabled = document.body.classList.toggle('dark-theme');
  localStorage.setItem('dark-theme-enabled', darkThemeEnabled);
}
if (JSON.parse(localStorage.getItem('dark-theme-enabled'))) {
  document.body.classList.add('dark-theme');
} else if (!localStorage.getItem('dark-theme-enabled') == false) {
  // Set Starting Theme to Dark-Mode
  localStorage.setItem('dark-theme-enabled', false);
  changeTheme()
}