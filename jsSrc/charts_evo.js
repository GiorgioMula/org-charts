/**
 * Person class constructor
 */
function Person(aName, imgPath, aRole)
{
	this.name = aName;
	this.img = imgPath;
	this.role = aRole;
	this.manager = null;
	this.managerName = "";
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

/**
 * Person map class used to store references to person objects with parent/child
 * relationship. This way it is possible to use recursive functions to pass
 * through the whole map.
 */
function PersonMap()
{
	/**
	 * Add reference for new person into an object property. The update its
	 * manager child list and the pointer to manager itself.
	 */
	this.addPerson = function(refPerson, personManagerName)
	{
		writeDebug("Add person " + refPerson.name + " manager " + personManagerName);
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

var levelNodesArray = new Array();

/**
 * Person object used to store all persons founded in file. Use person name as
 * property in order to quickly search using name as a key
 */
var personBuffer = new Object();

/**
 * Selected file without type extension, can be use to browse on specific
 * picture data
 */
var dataPath;

// var indexLastName;
var indexFirstName;
var indexManager;
var indexRole;
var indexLocation;

/**
 * Parse line by line input file content. On first line expect to find the
 * column meanning, so store all data and use to to create related field into
 * person objects dinamically. Mandatory column titles shall be "COGNOME",
 * "NOME", "qualifica", "riporto superiore"
 * 
 * @param textLine
 * @param index
 *          input line index
 */
function parseCsvLine(textLine, index)
{
	const
	LastName = "COGNOME";
	const
	FirstName = "NOME";
	const
	Role = "funzione";
	const
	Manager = "riporto superiore";
	const
	Location = "sede";
	const
	Type = "tipo contratto";

	// Remove comments or empty lines
	if (textLine.length == 0 || textLine[0] == '#' || textLine[0] == '\n'
			|| textLine[0] == '\r')
	{
		return;
	}
	/*
	 * if (strArray.length != 3) { alert("File bad format on line " + index);
	 * return; }
	 */
	writeDebug("Processing line " + index);
	if (index == 0)
	{
		// First line used to identify colum names
		var columnArray = textLine.split(";");
		parseCsvLine.indexLastName = columnArray.indexOf(LastName);
		parseCsvLine.indexContractType = columnArray.indexOf(Type);
		indexFirstName = columnArray.indexOf(FirstName);
		indexManager = columnArray.indexOf(Manager);
		indexRole = columnArray.indexOf(Role);
		indexLocation = columnArray.indexOf(Location);
		if (indexRole == -1 || parseCsvLine.indexLastName == -1
				|| indexManager == -1 || indexFirstName == -1)
		{
			alert("File bad format on line " + index + "\nindexLastName= "
					+ parseCsvLine.indexLastName);
		}
	}
	else
	{
		// Foreach line add into person array buffer.
		var strArray = textLine.split(";");
		var nameComplete = toCamelCase(strArray[parseCsvLine.indexLastName].trim()
				+ " " + strArray[indexFirstName].trim());
		var PhotoName = nameComplete + ".jpg";
		writeDebug("PhotoName is " + PhotoName);
		var employee = new Person(nameComplete, PhotoName, strArray[indexRole]
				.trim());
		var managerName = toCamelCase(strArray[indexManager].trim());

		// filter location (fixed if exist on "monticelli")
		if (indexLocation != -1)
		{
			if (strArray[indexLocation].trim() != "monticelli")
			{
				return;
			}
		}

		// filter contract type, do not use data if not IND
		if (parseCsvLine.indexContractType != -1)
		{
			if (strArray[parseCsvLine.indexContractType].trim() != "IND")
			{
				return;
			}
		}

		if (managerName.length != 0)
		{
			employee.managerName = managerName;
			personBuffer[nameComplete] = employee;
		}
	}
}

function toCamelCase(inputString)
{
	var strings = inputString.split(" ");
	var output = "";
	for (var idx = 0; idx < strings.length; idx++)
	{
		var str = strings[idx];
		if (str != null && str.length)
		{
			output += str[0].toUpperCase() + (str.substring(1)).toLowerCase() + " ";
		}
	}
	return output.trim();
}

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
	var newContent = '<img src="../test/' + dataPath + '/pictures/' + person.img
			+ '" alt="' + person.name + '" />';
	newContent += '<p><strong>' + person.name + '</strong><br/>';
	newContent += '<small>' + person.role + '</small></p>';
	newNode.innerHTML = newContent;
	group.appendChild(newNode);
}

function createHTMLGroupInLevel(manager, level)
{
	var newNode = document.createElement("div");
	newNode.setAttribute("class", "group");
	newNode.style.display = "inline-block";

	newNode.setAttribute("owner", manager == null ? "CEO" : manager.name);
	if (manager != null)
	{
		var newContent = '<a href="#' + manager.name + '">manager: ' + manager.name + '</a>';
		newNode.innerHTML = newContent;
	}
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

/**
 * Given a person buffer object from CSV parsing, must move all elements into
 * personMap object that has parent/child relationship. In that case diagram is
 * a simple recursive iteration starting from root parent element in personMap.
 * 
 * @param personObj
 * @returns {PersonMap}
 */
function compilePersonMap(personObj)
{
	var personMap = new PersonMap();
	writeDebug("Object.keys(personObj).length = " + Object.keys(personObj).length);
	while (Object.keys(personObj).length)
	{
		var rootPersonExists = false;
		for (property in personObj)
		{
			var person = personObj[property];

			if (person.managerName == "Ceo")
			{
				rootPersonExists = true;
				personMap.CEO = person;
				personMap.addPerson(person, "");
				delete personObj[property];
				break;
			}
			else
			{
				var manager = personMap.getPerson(person.managerName);
				if (manager != null)
				{
					rootPersonExists = true;
					personMap.addPerson(person, person.managerName);
					delete personObj[property];
					break;
				}
			}
		}
		if (!rootPersonExists)
		{
			var persons = "";
			for (property in personObj)
			{
				persons += property;
			}
			alert("root person not found in diagram, still "
					+ Object.keys(personObj).length + " persons to assign: " + persons);
			return null;
		}
	}
	return personMap;
}

function writeDiagram()
{
	// Prepare employee's tree
	var personMap = compilePersonMap(personBuffer);

	// call recursive function to pass through entire map
	writeBranch(personMap.CEO, 0);

	// now set page width to fit largest level
	var chart = document.getElementById("org-chart");
	var newWidth = 0;
	for (var idx = 0; idx < levelNodesArray.length; idx++)
	{
		var lvl = levelNodesArray[idx];
		var personElements = lvl.getElementsByClassName("person");
		if (personElements != null)
		{
			const
			widthNumber = 180;
			/*
			 * var widthString = personElements[0].getAttribute("style");
			 * writeDebug("widthString: " + widthString); var widthNumber =
			 * widthString.substring(widthString.indexOf("width:"),
			 * widthString.indexOf("px")); writeDebug("widthNumber: " + widthNumber);
			 */
			var lvlWidth = widthNumber * personElements.length;
			if (lvlWidth > newWidth)
			{
				newWidth = lvlWidth;
			}
		}
	}
	chart.style.width = newWidth + "px";
/*
	// set canvas
	var manager_rect = document.getElementById("Daverio Roberto")
			.getBoundingClientRect();
	writeDebug("manager_rect: (" + manager_rect.top + "," + manager_rect.left + ")");
	var groups = document.getElementsByClassName("group");
	for (var idx = 0; idx < groups.length; ++idx)
	{
		if (groups[idx].getAttribute("owner") == "Daverio Roberto")
		{
			var group_rect = groups[idx].getBoundingClientRect();
			writeDebug("group_rect: (" + group_rect.top + "," + group_rect.left + ")");
			var c=document.getElementById("relations");
			var ctx=c.getContext("2d");
			ctx.beginPath();
			ctx.moveTo(manager_rect.bottom, manager_rect.left);
			ctx.lineTo(group_rect.top,group_rect.left);
			ctx.strokeStyle="#FF0000";
			ctx.stroke();
			c.style.width="100%";
			c.style.heigth="100%";
		}
	}
*/
}

function writeBranch(employee, levelIdx, useSmallFormat)
{
	const
	PackPersonLimit = 6; // !< Over this limit, the group is shown vertically
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
	var smallFormat = (numDependents > PackPersonLimit);
	for (var idxChild = 0; idxChild < numDependents; idxChild++)
	{
		var dependent = employee.childArray[idxChild];
		var nextLevel = levelIdx + 1;
		// Verify secretary special case
		if (dependent.role == "Secretary")
		{
			smallFormat = (numDependents > (PackPersonLimit + 1));
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
	dataPath = file.name.split(".")[0];
	writeDebug("dataPath: " + dataPath);
	var reader = new FileReader();
	reader.onload = function(e)
	{
		var contents = e.target.result;
		var textLines = contents.split("\n");

		textLines.forEach(parseCsvLine);
		writeDiagram();
	};
	reader.readAsText(file);
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
