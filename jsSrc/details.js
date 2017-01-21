/**
 * 
 */
function test()
{
	alert("test");
}

function writeDetails()
{	
	var person_div = document.getElementById("person");
	createHTMLPerson(window.opener.personDetails, person_div);
}

function createHTMLPerson(person, parent)
{
	var newNode = document.createElement("div");

	newNode.setAttribute("class", "personDetails");
	newNode.setAttribute("id", person.name);

	var newContent = '<img src="../test/' + window.opener.dataPath + '/pictures/' + person.img
			+ '" alt="' + person.name + '" />';
	newContent += '<p>Name:     <strong>' + person.name + '</strong><br/>';
	newContent += 'Role:     ' + person.role + '<br/>';
	newContent += 'Manager:  ' + person.managerName + '<br/></p>';

	newNode.innerHTML = newContent;
	
	parent.appendChild(newNode);
}


function writeDebug(text, clear)
{
	var dbgElement = document.getElementById("debug");
	if (clear)
	{
		dbgElement.innerHTML = "";
	}
	dbgElement.innerHTML += text + '<br/>';
}
