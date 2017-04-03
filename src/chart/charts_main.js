/**
 * @file charts_main.js
 * 
 * @brief Include all methods and classes to write down an formatted org chart,
 *        using user file selection. Entry point is
 * @ref listener routine, where take place decoding of .csv data and user
 *      selections posted by messages from
 * @ref options page.
 * 
 * @mainpage Main page 
 * Welcome to Org-charts main documentation page, please
 * follow "File" menu and related content for SW design structure
 * description. This javascript application is composed on 3 main
 * components, each with its own folder to accomodate html and
 * javascript sources: 
 * * @ref Charts
 * * @ref Details
 * * @ref Options
 * @startuml
 * 
 * [Options frame] -- [Charts frame] 
 * package "Options frame" {
 *   [File]
 *   [Image size]
 *   [Manager selection]
 * }
 * 
 * package "Charts frame" {
 *   [graph] -> [details]
 *   [debug]
 *   [footer] -- [debug]
 *    [graph] -- [footer]
 * }
 *  
 * legend
 * Main frames on page with related components
 * endlegend
 * 
 * @enduml
 * 
 * 
 * @page Charts 
 * This section render graph using data passed from
 * @ref options section page. Source code composing this section are:
 * * @ref charts_main.js
 * * @ref charts_image.js
 * * @ref charts_employee.js
 */

const CMD_START_FILE = "START";
const CMD_DATA_FILE = "DATA";
const CMD_END_FILE = "END";
const CMD_WRITE_DIAGRAM = "WRITE";
const CMD_PRINT_DIAGRAM = "PRINT";

/**
 * DOM object element will be with some well defined classes for later
 * management
 */
const GraphClassNames =
{
  level : "LEVEL",
  group : "GROUP",
  employee : "EMPLOYEE"
};

var imageRatio;
var dataPath;
var option_window;

/**
 * Receiver for messages posted to this page. Basically receives .csv data text
 * lines and "print" / "show diagram" user commands.
 * 
 * @param event
 *          the message data, always a JSON object with a "command" field to
 *          decode.
 */
function listener(event)
{
	option_window = event.source;
	event.origin; // TODO
	var receivedObject = JSON.parse(event.data);
	switch (receivedObject.command)
	{
		case CMD_END_FILE:
			// Reception compete, now prepare employee's tree
			employeeMap = compileEmployeeMap(EmployeeBuffer);
			break;

		case CMD_START_FILE:
			this.line_number = 0;
			break;

		case CMD_DATA_FILE:
			parseCsvLine(receivedObject.text_line, this.line_number++);
			break;

		case CMD_WRITE_DIAGRAM:
			imageRatio = receivedObject.size_ratio;
			dataPath = receivedObject.data_path;
			writeDiagram(receivedObject.manager_name);
			break;

		case CMD_PRINT_DIAGRAM:
			window.print();
			break;

		default:
			alert("Unknown command received: " + receivedObject.command);
			break;
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

/**
 * Employee object used to store all Employees founded in file. Use Employee
 * name as property in order to quickly search using name as a key
 */
var EmployeeBuffer = new Object();

/**
 * Employees ordered map, holds pointers to
 * 
 * @ref EmployeeBuffer array objects into hierarchical form for recursive
 *      traversal. It implements the "composite" pattern.
 */
var employeeMap;

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
	const LastName = "COGNOME";
	const FirstName = "NOME";
	const Role = "funzione";
	const Manager = "riporto superiore";
	const Location = "sede";
	const Type = "tipo contratto";

	// Remove comments or empty lines
	if (textLine.length == 0 || textLine[0] == '#' || textLine[0] == '\n' || textLine[0] == '\r')
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
		if (indexRole == -1 || indexLastName == -1 || indexManager == -1 || indexFirstName == -1)
		{
			alert("File bad format on line " + index + "\nindexLastName= " + indexLastName);
		}
	}
	else
	{
		// Foreach line add into Employee array buffer.
		var strArray = textLine.split(";");
		var nameComplete = toCamelCase(strArray[indexLastName].trim() + " " + strArray[indexFirstName].trim());
		var PhotoName = nameComplete + ".jpg";
		writeDebug("PhotoName is " + PhotoName);
		var employee = new Employee(nameComplete, PhotoName, strArray[indexRole].trim());
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
			option_window.postMessage(nameComplete, "*");
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
function createHTMLEmployeeInGroup(Employee, group, useSmallFormat, installListener)
{
	// create Employee node, parent <di> for image and details elements
	var newEmployee = document.createElement("div");
	if (installListener)
	{
		newEmployee.addEventListener("click", showDetails);
	}
	newEmployee.setAttribute("class", GraphClassNames.employee);
	if (useSmallFormat)
	{
		newEmployee.format = "small";
	}
	newEmployee.id = Employee.name;
	newEmployee.role = Employee.role;

	// Create image element
	var imgObj = createImage(imageRatio, Employee.img);

	// Create "p" element fon name and role
	var details = document.createElement("p");
	details.innerHTML = '<strong>' + Employee.name + '</strong><br/><small>' + Employee.role + '</small>';

	// Append image and name
	newEmployee.appendChild(imgObj);
	newEmployee.appendChild(details);

	// Append Employee <div> element to group parent node
	group.appendChild(newEmployee);
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
	var newGroup = document.createElement("div");
	newGroup.setAttribute("class", GraphClassNames.group);
	newGroup.style.display = "inline-block";
	newGroup.style.position = "relative";

	var owner = manager == null ? "CEO" : manager.name;
	newGroup.setAttribute("owner", owner);
	var newContent = '<input type="button" onclick="toggleEmployeeSize(event)" style="position: absolute; top: 5px; right: 20px"></input>';
	if (manager != null)
	{
		newContent += '<a href="#' + manager.name + '">manager: ' + manager.name + '</a>';
	}
	newGroup.innerHTML = newContent;
	// Append new group before canvas (that one must be the last element on div)
	var canvas = level.lastChild;
	level.insertBefore(newGroup, canvas);
	return newGroup;
}

function toggleEmployeeSize(event)
{
	var group = $(event.target).parent();
	group.children("div").each(toggleDivFormat);
	writeCanvas();
}

/**
 * Add a new "div" level to levelNodesArray global array
 * 
 * @param [in]
 *          level_idx level depth
 * @returns reference to "div" DOM object representing an inline-block styled
 *          level
 */
function createNewLevel(level_idx)
{
	var newLevel = document.createElement("div");
	newLevel.setAttribute("class", GraphClassNames.level);
	newLevel.setAttribute("id", "level_" + level_idx);
	var canvas = document.createElement("canvas");
	canvas.setAttribute("id", "canvas_" + level_idx);
	canvas.setAttribute("width", "400px"); // TODO
	canvas.setAttribute("height", "100px");
	canvas.style.display = "block";
	newLevel.appendChild(canvas);

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
	writeDebug("Object.keys(EmployeeObj).length = " + Object.keys(EmployeeObj).length);
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
			alert("root Employee not found in diagram, still " + Object.keys(EmployeeObj).length + " Employees to assign: "
			    + Employees);
			return null;
		}
	}
	return employeeMap;
}

function writeDiagram(managerNameSelection)
{
	var chart = $("#org-chart");

	// now read user selection for root diagram point
	var rootManager = employeeMap.getEmployee(managerNameSelection);

	// call recursive function to pass through entire map
	writeBranch(rootManager, 0);

	// now set page width to fit largest level, foreach "level" class count number
	// of "Employee"
	// class objects: largest level force page width in pixels (TODO: remove magic
	// numbers)
	var largestLevelNumEmployees = 0;
	chart.find("." + GraphClassNames.level).each(function()
	{
		var numEmployees = $(this).find("." + GraphClassNames.employee).length;
		if (numEmployees > largestLevelNumEmployees)
		{
			largestLevelNumEmployees = numEmployees;
		}
	});
	newWidth = 50 + (largestLevelNumEmployees * (chart.find("." + GraphClassNames.employee).first().outerWidth(true)));

	// set chart min-width
	chart.css("min-width", newWidth + "px");

	// foreach level, set canvas below
	$("canvas").each(function()
	{
		$(this).attr("width", newWidth + "px");
	});
	// remove last canvas on last level (no child groups to connect for sure)
	$("." + GraphClassNames.level).last().children().last().remove();
	writeCanvas();
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
	const Employee_PACK_LIMIT = 6; // !< Over this limit, the group is shown
	// vertically
	// var level = levelNodesArray[levelIdx];
	var level = document.getElementById("level_" + levelIdx);
	if (level == null)
	{
		level = createNewLevel(levelIdx);
	}

	// Get group where to add this employee, it may already exist
	var group = null;
	if (employee.manager != null)
	{
		group = $(level).find('[owner="' + employee.manager.name + '"]').get(0);
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
 * Open a new page with employee details, installed with "onclick" event on
 * Employee HTML
 * 
 * @param event
 */
function showDetails(event)
{
	var EmployeeName = event.target.parentNode.getAttribute("id");

	if (EmployeeName != null)
	{
		var EmployeeDetails = employeeMap.getEmployee(EmployeeName);
		var img_path = "../../test/" + dataPath + "/pictures/";

		// open new window that will read opener.PersonDetails object
		var new_win = window.open("../details/employeeDetails.html", "_blank");
		setTimeout(function()
		{
			new_win.postMessage(img_path, "*");
			new_win.postMessage(JSON.stringify(EmployeeDetails, [ 'name', 'img', 'managerName', 'role' ]), "*");
		}, 500);
	}
}

/**
 * Write connection lines between manager and reporting group.
 * Foreach level, the last item is the canvas which contains line connections.
 * Each group has a "owner" attribute with manager name, while each employee has
 * its person name has "id", thus is very straightforward to get related DOM elements
 * and connect coordinates
 */
function writeCanvas()
{
	var canvas;
	$("." + GraphClassNames.level).each(function()
	{
		// foreach level
		writeDebug("Level " + $(this).attr("id"));
		$(this).children("." + GraphClassNames.group).each(function()
		{
			// foreach group
			writeDebug("Processing Group");
			var manager = $(this).attr("owner");
			if (manager != undefined && canvas != undefined)
			{
				writeDebug("Processing Group with manager " + manager);
				// Get DOM element

				var ctx = canvas.get(0).getContext("2d");
				ctx.clearRect(0, 0, canvas.width(), canvas.height());
				ctx.lineWidth = 5;
				ctx.lineCap = "round";
				ctx.strokeStyle = "red";
				ctx.beginPath();
				ctx.moveTo($(this).position().left + $(this).width() / 2, canvas.height());
				ctx.lineTo($("#" + manager).parent().position().left + $("#" + manager).width() / 2, 0);
				ctx.stroke();
			}
		});
		canvas = $(this).children().last();
	});
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
	var debug_obj = $("#debug");
	if (clear)
	{
		debug_obj.html(text + "<br/>");
	}
	else
	{
		debug_obj.append(text + "<br/>");
	}
}

