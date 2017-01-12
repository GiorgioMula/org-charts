/**
 * 
 */

function Person(aName, imgPath, aRole)
{
	this.name = aName;
	this.img = imgPath;
	this.role = aRole;
	this.manager = null;
	this.childArray = new Array();

	this.addChild = function(refPerson)
	{
		this.childArray.push(refPerson);
	};

	this.addManager = function(refManager)
	{
		this.manager = refManager;
	};
}

function PersonMap()
{
	this.addPerson = function(refPerson, personManagerName)
	{
		writeDebug("Add person " + refPerson.name);
		this[refPerson.name] = refPerson;
		if (personManagerName == "")
		{
			this.CEO = refPerson;
			writeDebug(refPerson.name + " is the CEO !");
		}
		else
		{
			var managerObject = this[personManagerName];
			refPerson.addManager(managerObject);
			managerObject.addChild(refPerson);
			writeDebug("Added " + managerObject.name + " as " + refPerson.name
					+ " manager");
		}
	};

	this.getPerson = function(personName)
	{
		return this[personName];
	};
}

var personMap = new PersonMap();
var levelNodesArray = new Array();

/**
 * Attach a new DOM element to parent. The DOM element is a "div" represent the
 * employee with class="person" and id=person's name
 * 
 * @param person
 *          the person data
 * @param group
 *          the DOM parent node
 */
function createHTMLPersonInGroup(person, group, useSmallFormat)
{
	var newNode = document.createElement("div");
	newNode.setAttribute("class", "person");
	if (useSmallFormat)
	{
		newNode.setAttribute("format", "small");
	}
	newNode.setAttribute("id", person.name);
	newNode.setAttribute("role", person.role);
	var newContent = '<img src="../test/' + person.img + '" alt="' + person.name
			+ '" />';
	newContent += '<p><strong>' + person.name + '</strong><br/>';
	newContent += person.role + '</p>';
	newNode.innerHTML = newContent;
	group.appendChild(newNode);
}

function createHTMLGroupInLevel(manager, level)
{
	var newNode = document.createElement("div");
	newNode.setAttribute("class", "group");
	newNode.style.display = "inline-block";

	newNode.setAttribute("owner", manager == null ? "CEO" : manager.name);
	// var newContent = '<svg></svg>'; // TODO: connecting lines, after all person
	// added
	// newNode.innerHTML = newContent;
	level.appendChild(newNode);
	return newNode;
}

/**
 * Add a new <div> level to levelNodesArray global array
 * 
 * @returns reference to <div> element representing an inline-block styled level
 */
function createNewLevel()
{
	var newLevel = document.createElement("div");
	newLevel.setAttribute("class", "level");
	document.getElementById("org-chart").appendChild(newLevel);
	writeDebug("Create level " + levelNodesArray.length);
	levelNodesArray.push(newLevel);
	return newLevel;
}

function writeDiagram()
{
	var person = personMap.CEO;
	writeBranch(person, 0);
}

function writeBranch(employee, levelIdx, useSmallFormat)
{
	var level = levelNodesArray[levelIdx];
	if (level == null)
	{
		level = createNewLevel();
	}
	var group = null;
	var groups = level.getElementsByTagName("div");
	for (var groupIndex = 0; groupIndex < groups.length; groupIndex++)
	{
		if (groups[groupIndex].getAttribute("owner") == employee.manager.name)
		{
			group = groups[groupIndex];
			break;
		}
	}
	if (group == null)
	{
		group = createHTMLGroupInLevel(employee.manager, level);
	}

	createHTMLPersonInGroup(employee, group, useSmallFormat);
	var numDependents = employee.childArray.length;
	var smallFormat = (numDependents > 2);
	for (var idxChild = 0; idxChild < numDependents; idxChild++)
	{
		var dependent = employee.childArray[idxChild];
		var nextLevel = levelIdx + 1;
		// Verify secretary special case
		if (dependent.role == "Secretary")
		{
			smallFormat = (numDependents > 3);
			nextLevel = levelIdx;
		}
		writeBranch(dependent, nextLevel, smallFormat);
	}
}

function readSingleFile(e)
{
	var file = e.target.files[0];
	if (!file)
	{
		return;
	}
	var reader = new FileReader();
	reader.onload = function(e)
	{
		var contents = e.target.result;
		var textLines = contents.split("\n");

		writeDebug("", true);
		textLines.forEach(parseCsvLine);
		writeDiagram();
	};
	reader.readAsText(file);
}

function parseCsvLine(textLine, index)
{
	if (textLine.length == 0 || textLine[0] == '#' || textLine[0] == '\n'
			|| textLine[0] == '\r')
	{
		return;
	}
	var strArray = textLine.split(",", 3);
	if (strArray.length != 3)
	{
		alert("File bad format on line " + index);
		return;
	}

	var employee = new Person(strArray[0].trim(), strArray[0].trim() + ".jpg",
			strArray[1].trim());// , strArray[2].trim());
	personMap.addPerson(employee, strArray[2].trim());
	writeDebug("personMap now is " + personMap);
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
