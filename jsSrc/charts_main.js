/**
 * @file	charts_main.js
 * 
 * @brief Include all methods and classes to write down an formatted org chart, using user file selection.
 * Entry point is @ref readSingleFile routine, functions referred into charts_image.js
 * 
 * @mainpage Main page
 * Welcome to Org-charts main documentation page, please follow "File" menu and related content
 * for SW design structure description
 */

/**
 * Employee object used to store all Employees founded in file. Use Employee
 * name as property in order to quickly search using name as a key
 */
var EmployeeBuffer = new Object();
var employeeMap;

/**
 * Selected file without type extension, can be use to browse on specific
 * picture data
 */
var dataPath;

/**
 * Parse line by line input file content. On first line expect to find the
 * column meanning, so store all data and use to to create related field into
 * Employee objects dinamically. Mandatory column titles shall be "COGNOME",
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
		if (indexRole == -1 || indexLastName == -1 || indexManager == -1
				|| indexFirstName == -1)
		{
			alert("File bad format on line " + index + "\nindexLastName= "
					+ indexLastName);
		}
	}
	else
	{
		// Foreach line add into Employee array buffer.
		var strArray = textLine.split(";");
		var nameComplete = toCamelCase(strArray[indexLastName].trim() + " "
				+ strArray[indexFirstName].trim());
		var PhotoName = nameComplete + ".jpg";
		writeDebug("PhotoName is " + PhotoName);
		var employee = new Employee(nameComplete, PhotoName, strArray[indexRole]
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
			EmployeeBuffer[nameComplete] = employee;
			// Add Employee selection
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
 * employee with class="Employee" and id=Employee's name
 * 
 * @param Employee
 *          the Employee object instance
 * @param group
 *          the DOM parent node
 */
function createHTMLEmployeeInGroup(Employee, group, useSmallFormat,
		installListener)
{
	// create Employee node, parent <di> for image and details elements
	var newNode = document.createElement("div");
	if (installListener)
	{
		newNode.addEventListener("click", showDetails);
	}
	newNode.setAttribute("class", "Employee");
	if (useSmallFormat)
	{
		newNode.format = "small";
	}
	newNode.id = Employee.name;
	newNode.role = Employee.role;

	// Create image element
	var imgObj = createImage($("#imageRatio").val(), Employee.img);
	
	// Create "p" element fon name and role 
	var details = document.createElement("p");
	details.innerHTML = '<strong>' + Employee.name + '</strong><br/><small>'
			+ Employee.role + '</small>';

	// Append image and name
	newNode.appendChild(imgObj);
	newNode.appendChild(details);

	// Append Employee <div> element to group parent node
	group.appendChild(newNode);
}

/**
 * A group is simply an element to contain employees that share same manager. We
 * reserve here a "div" element to which append child "employees"
 * 
 * @param manager
 *          reference to manager object
 * @param level
 *          the level object this group belongs to
 * @returns the DOM new element appended to level
 */
function createHTMLGroupInLevel(manager, level)
{
	var newNode = document.createElement("div");
	newNode.setAttribute("class", "group");
	newNode.style.display = "inline-block";
	newNode.style.position = "relative";

	var owner = manager == null ? "CEO" : manager.name;
	newNode.setAttribute("owner", owner);
	var newContent = '<input type="button" onclick="toggleEmployeeSize(event)" style="position: absolute; top: 5px; right: 20px"></input>';
	if (manager != null)
	{
		newContent += '<a href="#' + manager.name + '">manager: ' + manager.name
				+ '</a>';
	}
	newNode.innerHTML = newContent;
	level.appendChild(newNode);
	return newNode;
}

function toggleEmployeeSize(event)
{
	var group = $(event.target).parent();
	group.children("div").each(toggleDivFormat);
}

/**
 * Add a new "div" level to levelNodesArray global array
 * 
 * @returns reference to "div" element representing an inline-block styled level
 */
function createNewLevel(level_idx)
{
	var newLevel = document.createElement("div");
	newLevel.setAttribute("class", "level");
	newLevel.setAttribute("id", "level_" + level_idx);
	document.getElementById("org-chart").appendChild(newLevel);
	return newLevel;
}

/**
 * Given a Employee buffer object from CSV parsing, must move all elements into
 * EmployeeMap object that has parent/child relationship. In that case diagram
 * is a simple recursive iteration starting from root parent element in
 * EmployeeMap.
 * 
 * @param EmployeeObj
 * @returns {EmployeeMap}
 */
function compileEmployeeMap(EmployeeObj)
{
	var employeeMap = new EmployeeMap();
	writeDebug("Object.keys(EmployeeObj).length = "
			+ Object.keys(EmployeeObj).length);
	while (Object.keys(EmployeeObj).length)
	{
		var rootEmployeeExists = false;
		for (property in EmployeeObj)
		{
			var Employee = EmployeeObj[property];

			if (Employee.managerName == "Ceo")
			{
				rootEmployeeExists = true;
				employeeMap.CEO = Employee;
				employeeMap.addEmployee(Employee, "");
				delete EmployeeObj[property];
				break;
			}
			else
			{
				var manager = employeeMap.getEmployee(Employee.managerName);
				if (manager != null)
				{
					rootEmployeeExists = true;
					employeeMap.addEmployee(Employee, Employee.managerName);
					delete EmployeeObj[property];
					break;
				}
			}
		}
		if (!rootEmployeeExists)
		{
			var Employees = "";
			for (property in EmployeeObj)
			{
				Employees += property;
			}
			alert("root Employee not found in diagram, still "
					+ Object.keys(EmployeeObj).length + " Employees to assign: "
					+ Employees);
			return null;
		}
	}
	return employeeMap;
}

function writeDiagram()
{
	document.getElementById("org-chart").innerHTML = "";

	// now read user selection for root diagram point
	var managerNameSelection = document.getElementById("rootManager");
	var index = managerNameSelection.selectedIndex;
	writeDebug("Selected index: " + index + " "
			+ managerNameSelection.options[index].innerHTML);
	var rootManager = employeeMap
			.getEmployee(managerNameSelection.options[index].innerHTML);

	// call recursive function to pass through entire map
	writeBranch(rootManager, 0);

	// now set page width to fit largest level, foreach "level" class count number of "Employee"
	// class objects: largest level force page width in pixels (TODO: remove magic numbers)
	var largestLevelNumEmployees = 0;
	$(".level").each(function(){
		var numEmployees = $(this).find(".Employee").length;
		if (numEmployees > largestLevelNumEmployees)
		{
			largestLevelNumEmployees = numEmployees;
		}
	});
	newWidth = 50 + (largestLevelNumEmployees * ($(".Employee").first().outerWidth(true)));		
	
	$("#org-chart").css("min-width", newWidth + "px");
}

function printDiagram()
{
	var ref = window.open("empty.html", "_blank", "fullscreen=yes");
	// ref.onload = function()
	{
		var destination = ref.document.body;
		var source = document.getElementById("org-chart");
		destination.innerHTML = "<p>test</p>";
		// destination.appendChild(source.cloneNode(true));
		// ref.setTimeout(function(){ref.print();}, 1000);
		// ref.print();
	}
	;
}

/**
 * Recursive function, write HTML structural code for employee object passed by
 * parameter reference
 * 
 * @param employee
 *          Employee object to write HTML code under related level and group
 * @param levelIdx
 *          the level where to append employee information. If a group already
 *          exist on same level, then just add the Employee, otherwise also
 *          create the group.
 * @param useSmallFormat
 *          boolean selection, true write Employee attribute (format="small") so
 *          can use a different CSS style
 */
function writeBranch(employee, levelIdx, useSmallFormat)
{
	const
	Employee_PACK_LIMIT = 6; // !< Over this limit, the group is shown vertically
	//var level = levelNodesArray[levelIdx];
	var level = document.getElementById("level_" + levelIdx);
	if (level == null)
	{
		level = createNewLevel(levelIdx);
	}
	
	// Get group where to add this employee, it may already exist
	var group = null;
	if (employee.manager != null)
	{
		group = $(level).find("[owner=" + employee.manager.name + "]").get(0);
	}	
	if (group == null)
	{
		group = createHTMLGroupInLevel(employee.manager, level);
	}

	createHTMLEmployeeInGroup(employee, group, useSmallFormat, true);
	var numDependents = employee.childArray.length;
	var smallFormat = (numDependents > Employee_PACK_LIMIT);
	for (var idxChild = 0; idxChild < numDependents; idxChild++)
	{
		var dependent = employee.childArray[idxChild];
		var nextLevel = levelIdx + 1;
		// Verify secretary special case
		if (dependent.role == "Secretary")
		{
			smallFormat = (numDependents > (Employee_PACK_LIMIT + 1));
			nextLevel = levelIdx;
		}
		writeBranch(dependent, nextLevel, smallFormat);
	}
}

/**
 * chart_evo entry point
 * 
 * @param e
 *          event object from input file HTML5 selection
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
		employeeMap = compileEmployeeMap(EmployeeBuffer);
	};
	reader.readAsText(file);
}

var EmployeeDetails;
/**
 * Open a new page with employee details, installed with "onclick" event on
 * Employee HTML
 * 
 * @param event
 */
function showDetails(event)
{
	var EmployeeName = event.target.parentNode.getAttribute("id");
	writeDebug("Click on " + event.target.parentNode);
	writeDebug("Click on " + EmployeeName);

	if (EmployeeName != null)
	{
		EmployeeDetails = employeeMap.getEmployee(EmployeeName);
		// open new window that will read opener.PersonDetails object
		window.open("../htmlSrc/employeeDetails.html", "_blank");
	}
}

/**
 * Print debug information into "debug" id element.
 * 
 * @param text
 *          information string to write
 * @param clear
 *          true if "debug" html element content must be cleared
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
