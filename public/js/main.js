
const apiPath ='https://eventportal.para.cx/api';

var index = 'http://dbproj/'

// client-side user variables
var user_id;

 
 //Emily: NEED TO ADD AUTHENTICATION
 
// working
function doLogin()
{
	  
  user_id = 0;
  document.getElementById("loginResult").innerHTML = "";

  var username = document.getElementById("loginName").value;
  var password = document.getElementById("loginPassword").value;

  if (username.length < 1)
  {
    document.getElementById("loginResult").innerHTML = "Please Enter a username";
    return;
  }

  if (password.length < 1)
  {
    document.getElementById("loginResult").innerHTML = "Please Enter a password";
    return;
  }

  var jsonPayload = '{"username" : "' + username + '", "password" : "' + password + '"}';
  const login = async () => {
  const createAuthorizationHeader = (username, password) => {
      // I use template literal here
      const credential = btoa(`${username}:${password}`);
      const authValue = `Basic ${credential}`;
      return new Headers({ 'Authorization': authValue });
    }
  
  console.log("jsonPayload sent to " + apiPath + ": ");
  console.log(jsonPayload);
  const endpoint = 'login.php'
  
  const requestPath = `${apiPath}/${endpoint}`;
  
  const response = await fetch(requestPath, {
        method: 'POST', // Change this on POST requests
        //headers: createAuthorizationHeader(username, password),
		body: jsonPayload
		
    });

    // We need to await here as well because .json() returns a Promise
    const data = await response.json();

    // Response code is outside HTTP 200-299, therefore its an error
    if (!response.ok) {
        return console.log(`Error: ${data.error}`);
    }
	console.log(data.event);
}
login();
}



// working
function addAccount()  //Emily: Edited to match project API
{
  var newUsername = document.getElementById("newUsername").value;
  var newPassword = document.getElementById("newPassword").value;


  if (newUsername.length < 1)
  {
    document.getElementById("newUsername").innerHTML = "Please enter a username";
    return;
  }
  if (newPassword.length < 1)
  {
    document.getElementById("newPassword").innerHTML = "Please enter a password";
    return;
  }

  var jsonPayload = '{"username" : "' + newUsername + '", "password" : "' + newPassword + '"}';
  
  const createUser = async () => {
  
  
  console.log("jsonPayload sent to " + apiPath + ": ");
  console.log(jsonPayload);
  const endpoint = 'createUser.php'
  
  const requestPath = `${apiPath}/${endpoint}`;
  
  const response = await fetch(requestPath, {
        method: 'POST', // Change this on POST requests
		body: jsonPayload
    });

    // We need to await here as well because .json() returns a Promise
    const data = await response.json();

    // Response code is outside HTTP 200-299, therefore its an error
    if (!response.ok) {
        return console.log(`Error: ${data.error}`);
    }
	console.log(data.event);
}
createUser();
}





