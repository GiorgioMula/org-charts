/**
 * 
 */

function listener(event)
{
	event.origin; // TODO

	writeDetails(event.data);
}

if (window.addEventListener)
{
	addEventListener("message", listener, false)
}
else
{
	attachEvent("onmessage", listener)
}

function writeDetails(personDetails)
{	
	var person_div = $("#person");
	
	createHTMLPerson(personDetails, person_div);
}

function createHTMLPerson(person, parent)
{
	var newNode = document.createElement("div");
	var data = person.split("_");
	newNode.setAttribute("class", "personDetails");
	newNode.setAttribute("id", person.name);

	var newContent = '<img src="../test/' + window.opener.dataPath + '/pictures/' + person.img
			+ '" alt="' + person.name + '" />';
	newContent += '<p>Name:     <strong>' + data[0] + '</strong><br/>';
	newContent += 'Role:     ' + person.role + '<br/>';
	newContent += 'Manager:  ' + person.managerName + '<br/></p>';

	newNode.innerHTML = newContent;
	
	parent.append(newNode);
}
