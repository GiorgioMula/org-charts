/**
 * 
 */

$(document).ready(function() {
writeDetails();
 });

function writeDetails()
{	
	var person_div = $("#person");
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
	
	parent.append(newNode);
}


function writeDebug(text, clear)
{
	if (clear)
	{
		$("#debug").html();
	}
	$("#debug").append(text + "<br/>");
}
