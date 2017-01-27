/**
 * @file	charts_evo.js
 * 
 * @brief Include all methods and classes to write down an formatted org chart, using user file selection.
 * Entry point is @ref readSingleFile routine
 */


/**
 * Person class constructor
 * @param aName
 * @param imgPath
 * @param aRole
 * @returns object reference
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

/**
 * 
 */
var levelNodesArray = new Array();

/**
 * Person object used to store all persons founded in file. Use person name as
 * property in order to quickly search using name as a key
 */
var personBuffer = new Object();
var personMap;

/**
 * Selected file without type extension, can be use to browse on specific
 * picture data
 */
var dataPath;

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
	const	LastName = "COGNOME";
	const FirstName = "NOME";
	const Role = "funzione";
	const Manager = "riporto superiore";
	const Location = "sede";
	const Type = "tipo contratto";

	// Remove comments or empty lines
	if (textLine.length == 0 || textLine[0] == '#' || textLine[0] == '\n'
			|| textLine[0] == '\r')
	{
		return;
	}

	writeDebug("Processing line " + index);
	if (index == 0)
	{
		// First line used to identify colum names
		var columnArray = textLine.split(";");
		this.indexLastName = columnArray.indexOf(LastName);
		this.indexContractType = columnArray.indexOf(Type);
		this.indexFirstName = columnArray.indexOf(FirstName);
		this.indexManager = columnArray.indexOf(Manager);
		this.indexRole = columnArray.indexOf(Role);
		this.indexLocation = columnArray.indexOf(Location);
		if (indexRole == -1 || indexLastName == -1
				|| indexManager == -1 || indexFirstName == -1)
		{
			alert("File bad format on line " + index + "\nindexLastName= " + indexLastName);
		}
	}
	else
	{
		// Foreach line add into person array buffer.
		var strArray = textLine.split(";");
		var nameComplete = toCamelCase(strArray[indexLastName].trim()
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
		if (indexContractType != -1)
		{
			if (strArray[indexContractType].trim() != "IND")
			{
				return;
			}
		}

		if (managerName.length != 0)
		{
			employee.managerName = managerName;
			personBuffer[nameComplete] = employee;
			// Add person selection
			var selection = document.getElementById("rootManager");
			var newOption = document.createElement("option");
			newOption.setAttribute("value", nameComplete);
			newOption.innerHTML = nameComplete;
			selection.appendChild(newOption);
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
function createHTMLPersonInGroup(person, group, useSmallFormat, installListener)
{
	// create person node, parent <di> for image and details elements
	var newNode = document.createElement("div");
	if (installListener)
	{
		newNode.addEventListener("click", showDetails);	
	}
	newNode.setAttribute("class", "person");
	if (useSmallFormat)
	{
		newNode.setAttribute("format", "small");
	}
	newNode.setAttribute("id", person.name);
	newNode.setAttribute("role", person.role);

	// Create image element 
	const IMG_WIDTH = 196;
	var imgObject = document.createElement("img");
	imgObject.src = "../test/" + dataPath + '/pictures/' + person.img;
	imgObject.style.width = IMG_WIDTH + "px";
	var selIndex = document.getElementById("imageRatio").selectedIndex;
	switch (selIndex)
	{
		case 0: // 4:3
			imgObject.style.borderRadius  = "10%";
			imgObject.style.height = ((IMG_WIDTH * 3) / 4) + "px";
			break;
		case 1: // 1:1
			imgObject.style.borderRadius  = "50%";
			imgObject.style.height = IMG_WIDTH + "px";
			break;
		case 2: // 16:9
			default:
			imgObject.style.borderRadius  = "5%";
			imgObject.style.height =  ((IMG_WIDTH * 9) / 16) + "px";
			break;
	}
	// 
	var details = document.createElement("p");
	details.innerHTML = '<strong>' + person.name + '</strong><br/><small>' + person.role + '</small>';

	// Append image and name
	newNode.appendChild(imgObject);
	newNode.appendChild(details);
	
	// Append person <div> element to group parent node
	group.appendChild(newNode);
}

/**
 * A group is simply an element to contain employees that share same manager.
 * We reserve here a <div> element to which append child "employees" 
 * @param manager reference to manager object
 * @param level the level object this group belongs to
 * @returns the DOM new element appended to level
 */
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
	levelNodesArray = [];
	document.getElementById("org-chart").innerHTML = "";

	// now read user selection for root diagram point
	var managerNameSelection = document.getElementById("rootManager");
	var index = managerNameSelection.selectedIndex;
	writeDebug("Selected index: " + index + " " + 	managerNameSelection.options[index].innerHTML);
	var rootManager = personMap.getPerson(managerNameSelection.options[index].innerHTML);
	
	// call recursive function to pass through entire map
	writeBranch(rootManager, 0);

	// now set page width to fit largest level
	var chart = document.getElementById("org-chart");
	var newWidth = 0;
	for (var idx = 0; idx < levelNodesArray.length; idx++)
	{
		var lvl = levelNodesArray[idx];
		var personElements = lvl.getElementsByClassName("person");
		if (personElements != null)
		{
			var	widthNumber = personElements[0].offsetWidth + 20; /* add person <div> margins*/
			/*
			 * var widthString = personElements[0].getAttribute("style");
			 * writeDebug("widthString: " + widthString); var widthNumber =
			 * widthString.substring(widthString.indexOf("width:"),
			 * widthString.indexOf("px")); writeDebug("widthNumber: " + widthNumber);
			 */
			var lvlWidth = widthNumber * personElements.length + 30; /* add group <div> margins */
			if (lvlWidth > newWidth)
			{
				newWidth = lvlWidth;
			}
		}
	}
	chart.style.width = newWidth + "px";
}

/**
 * Recursive function, write HTML structural code for employee object passed by parameter reference 
 * @param employee person object to write HTML code under related level and group
 * @param levelIdx the level where to append employee information. If a group already exist on same level, then just add
 *                 the person, otherwise also create the group.
 * @param useSmallFormat boolean selection, true write person attribute (format="small") so can use a different CSS style
 */
function writeBranch(employee, levelIdx, useSmallFormat)
{
	const	PERSON_PACK_LIMIT = 6; // !< Over this limit, the group is shown vertically
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

	createHTMLPersonInGroup(employee, group, useSmallFormat, true);
	var numDependents = employee.childArray.length;
	var smallFormat = (numDependents > PERSON_PACK_LIMIT);
	for (var idxChild = 0; idxChild < numDependents; idxChild++)
	{
		var dependent = employee.childArray[idxChild];
		var nextLevel = levelIdx + 1;
		// Verify secretary special case
		if (dependent.role == "Secretary")
		{
			smallFormat = (numDependents > (PERSON_PACK_LIMIT + 1));
			nextLevel = levelIdx;
		}
		writeBranch(dependent, nextLevel, smallFormat);
	}
}

/**
 * chart_evo entry point
 * @param e event object from input file HTML5 selection
 */
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
		// Prepare employee's tree
		personMap = compilePersonMap(personBuffer);
	};
	reader.readAsText(file);
}


var personDetails;
/**
 * Open a new page with employee details, installed with "onclick" event on person HTML
 * @param event
 */
function showDetails(event)
{
	var personName = event.target.parentNode.getAttribute("id");	
	writeDebug("Click on " + event.target.parentNode);
	writeDebug("Click on " + personName);
	
	if (personName != null)
	{
		personDetails = personMap.getPerson(personName);
		// open new window that will read opener.personDetails object
		window.open("../htmlSrc/employeeDetails.html", "_blank");
	}
}

/**
 * Print debug information into #debug selector.
 * @param text information string to write
 * @param clear true if #debug element must be cleared
 */
function writeDebug(text, clear)
{
	var dbgElement = document.getElementById("debug");
	if (clear)
	{
		dbgElement.innerHTML = "";
	}
	dbgElement.innerHTML += text + '<br/>';
}
