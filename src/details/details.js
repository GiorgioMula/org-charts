/**
 * @file details.js
 * 
 * @page Details
 * Details section used to display into a separate page more details about a single employee.
 * Into .csv file can have any number of additional columns, each with an employee property that
 * can be displayed into this page. Source code for this section:
 * * @ref details.js
 */

var img_path;

function listener(event)
{	
	event.source;	// TODO: verify source from parent
	event.origin; // TODO
	
	if (this.dataPathReceived)
	{
		var employeeObj = JSON.parse(event.data);
		writeDetails(employeeObj);	
	}
	else
	{
		img_path = event.data;
		this.dataPathReceived = true;	
	}
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
	var newNode = $("<div>");
	newNode.attr("class", "personDetails");
	newNode.attr("id", person.name);

	var newContent = $("<img>");
	newContent.attr("src", img_path + person.img);
	newContent.attr("alt", person.name);
	
	var paragraph = $("<p>");
	paragraph.html(
	"Name:     <strong>" + person.name + "</strong><br/>" +
	"Role:     " + person.role + "<br/>" +
	"Manager:  " + person.managerName + "<br/>");

	newNode.append(newContent);
	newNode.append(paragraph);
	parent.append(newNode);
}
