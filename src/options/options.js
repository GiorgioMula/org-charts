/**
 * @file options.js
 * 
 * @page Options
 * 
 * Used as top frame into main application page, it allow user interaction to select source .csv data,
 * image ratio and to ask to print diagram on video or printer. For details follow file documentations at:
 * * @ref options.js
 */

/**
 * Reference to chart frame page, must communicate user file selection using
 * postMessage
 */
var chartWindow = window.parent.frames["fr_graph"];

/**
 * postMessage listener, chart frame bidirectional communication channel
 * 
 * @param event
 * @returns
 */
function listener(event)
{
	if (event.source != chartWindow)
	{
		alert("Option frame receied message from unknown source !");
		return;
	}
	event.origin; // TODO

	addManagerSelection(event.data);
}

if (window.addEventListener)
{
	addEventListener("message", listener, false)
}
else
{
	attachEvent("onmessage", listener)
}

function OptionsCommand(command, manager_name, size_ratio, data_path)
{
	this.command = command;
	this.manager_name = manager_name;
	this.size_ratio = size_ratio;
	this.data_path = data_path;
}

function ParseTextCommand(command, text_line)
{
	this.command = command;
	this.text_line = text_line;
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
	var reader = new FileReader();
	reader.onload = function(e)
	{
		var contents = e.target.result;
		var textLines = contents.split("\n");
		var cmdObject = new ParseTextCommand("START", "");
		chartWindow.postMessage(JSON.stringify(cmdObject), "*");
		textLines.forEach(function(currentValue)
		{
			cmdObject.command = "DATA";
			cmdObject.text_line = currentValue;
			chartWindow.postMessage(JSON.stringify(cmdObject), "*");
		});
		cmdObject.command = "END";
		chartWindow.postMessage(JSON.stringify(cmdObject), "*");
	};
	reader.readAsText(file);
}

function writeDiagram()
{
	var options = new OptionsCommand("WRITE", $("#rootManager option:selected").val(), $("#imageRatio option:selected").val(), dataPath);
	chartWindow.postMessage(JSON.stringify(options), "*");
}

function printDiagram()
{
	var options = new OptionsCommand("PRINT");
	chartWindow.postMessage(JSON.stringify(options), "*");
}

// RECEPTION HANDLERS

function addManagerSelection(manager_name)
{
	var selection = document.getElementById("rootManager");
	var newOption = document.createElement("option");
	newOption.setAttribute("value", manager_name);
	newOption.innerHTML = manager_name;
	selection.appendChild(newOption);
}
