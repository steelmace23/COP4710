const apiPath ='https://eventportal.para.cx/api';


(async () => {

    // Constants
    const user = {
        username: 'keenan',
        password: 'testing',
        user_id: 31
    };
	document.getElementById("event-title").value = "";
	document.getElementById("description").value = "";
	document.getElementById("url").value = "";
	document.getElementById("start").value = "";
	document.getElementById("end").value = "";
	document.getElementById("address").value = "";
	document.getElementById("address2").value = "";
	document.getElementById("city").value = "";
	document.getElementById("state").value = "";
	document.getElementById("postalcode").value = "";

    const onClickCreate = async () => {
		const endpoint = 'createEvent.php'
		const requestPath = `${apiPath}/${endpoint}`;
		
		
	var title = document.getElementById("event-title").value;
	var description = document.getElementById("description").value;
	var url = document.getElementById("url").value;
	var start_time = document.getElementById("start").value;
	var end_time = document.getElementById("end").value;
	var address = document.getElementById("address").value;
	var address2 = document.getElementById("address2").value;
	var city = document.getElementById("city").value;
	var state = document.getElementById("state").value;
	var postal = document.getElementById("postalcode").value;
	
	
	
	
	const createAuthorizationHeader = (username, password) => {
      // I use template literal here
      const credential = btoa(`${username}:${password}`);
      const authValue = `Basic ${credential}`;
      return new Headers({ 'Authorization': authValue });
    }

	var jsonPayload = '{"admin_id" : "' + user.user_id + '", "title" : "' + title + '", "description" : "' + description + '", "url" : "' + url + '", "start_time" : "' + start_time + '", "end_time" : "' + end_time + '", "address" : "' + address + '", "address2" : "' + address2 + '", "city" : "' + city + '", "state" : "' + state + '", "postal_code" : "' + postal + '"}';
	
	const response = await fetch(requestPath, {
        method: 'POST', // Change this on POST requests
		headers: createAuthorizationHeader(user.username, user.password),
		body: jsonPayload
    });
    // We need to await here as well because .json() returns a Promise
    const data = await response.json();

    // Response code is outside HTTP 200-299, therefore its an error
    if (!response.ok) {
        return console.log(`Error: ${data.error}`);
    }
	console.log(data.event);
	console.log(data);
	
		
	
    }


})();