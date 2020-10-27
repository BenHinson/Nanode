// Share - View | Edit | Copy
// Link - Limited | Password | Until.
linkOptions = {};

$(".ItemInfo_Link_Btn").on("click", function(e) {
  OptionsContainer = document.createElement('div');
  OptionsContainer.innerHTML += `
    <sub>Select Options to set any Restrictions</sub>
    <span>
      <button option='Limited' title='Limit the number of times this link can be visited.'>Limited</button>
      <button option='Password'  title='Set a password to access this content.'>Password</button>
      <button option='Until' title='Stop access to this link after a set date.' >Until</button>
    </span>`
  $(OptionsContainer).insertAfter(e.target.parentNode);
  e.target.classList = "fas fa-chevron-up Input_Ops_Btn ItemInfo_Link_Btn";
  e.target.style.color = "var(--highlight-color)";
  $(OptionsContainer).find("button").on("click", function(e) {
    console.log(305);
    if ($(OptionsContainer).find('input')) { $(OptionsContainer).find('input').remove(); }
    let selectedOption = e.target.getAttribute('option');
    if (selectedOption == "Limited") {OptionsContainer.innerHTML += `<input type='number' value='10'>` }
    else if (selectedOption == "Password") { OptionsContainer.innerHTML += `<input type='password' placeholder='Enter the password'>` }
    else if (selectedOption == "Until") { let tommorow = dateNow().split("-"); tommorow[2] = parseInt(tommorow[2])+1; tommorow.join('-'); OptionsContainer.innerHTML += `<input type='date' min='${tommorow}'>` }
    else {return;}
    $(OptionsContainer).find('input').on("click", function() {})
  })
})