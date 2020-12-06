const apiPath ='https://eventportal.para.cx/api';


   const username = 'keenan';
   const password = 'testing';

const loadP = async () => {
	
  const endpoint = 'listEvents.php'
  const requestPath = `${apiPath}/${endpoint}`;
  
  //Authorization
  const createAuthorizationHeader = (username, password) => {
      // I use template literal here
      const credential = btoa(`${username}:${password}`);
      const authValue = `Basic ${credential}`;
      return new Headers({ 'Authorization': authValue });
    }

  const response = await fetch(requestPath, {
        method: 'GET', // Change this on POST requests
		headers: createAuthorizationHeader(username, password)
    });
    // We need to await here as well because .json() returns a Promise
    const data = await response.json();

    // Response code is outside HTTP 200-299, therefore its an error
    if (!response.ok) {
        return console.log(`Error: ${data.error}`);
    }
	console.log(data.event);
	console.log(data);
	
		var table = new Tabulator("#supAdmin-table", {
	height:"311px",
	data: data.events,
	layout:"fitColumns",
    columns:[                 //define the table columns
        {title:"Event", field:"title"},
        {title:"Description", field:"description", hozAlign:"left"},
        {title:"URL", field:"url"},
        {title:"Start Time", field:"start_time"},
        {title:"End Time", field:"end_time"},
        {title:"Location", field:"city"},
        
    ],
});
	
}
loadP();

const search = async () => {
  const endpoint = 'listEventsByParticipant.php'
  document.getElementById("demo").innerHTML = "";
  
  //Authorization
  const createAuthorizationHeader = (username, password) => {
      // I use template literal here
      const credential = btoa(`${username}:${password}`);
      const authValue = `Basic ${credential}`;
      return new Headers({ 'Authorization': authValue });
    }

  var newUsername = document.getElementById("searchBar").value;
  
  
 
	const requestPath = `${apiPath}/${endpoint}?username=${newUsername}`;
	
 
  const response = await fetch(requestPath, {
        method: 'GET', // Change this on POST requests
		headers: createAuthorizationHeader(username, password)
    });
    // We need to await here as well because .json() returns a Promise
    const data = await response.json();

    // Response code is outside HTTP 200-299, therefore its an error
    if (!response.ok) {
		document.getElementById("demo").innerHTML = "Please enter an Admin_ID (number)";
        return console.log(`Error: ${data.error}`);
		 
    }
	console.log(data.event);
	console.log(data);
	
		var table = new Tabulator("#supAdmin-table", {
	height:"311px",
	data: data.events,
	layout:"fitColumns",
    columns:[                 //define the table columns
        {title:"Event", field:"title"},
        {title:"Description", field:"description", hozAlign:"left"},
        {title:"URL", field:"url"},
        {title:"Start Time", field:"start_time"},
        {title:"End Time", field:"end_time"},
        {title:"Location", field:"city"},
        
    ],
});
	
}
