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

		chartWindow.postMessage("START", "*");
		textLines.forEach(function(currentValue)
		{
			chartWindow.postMessage(currentValue, "*");
		});
		chartWindow.postMessage("END", "*");
	};
	reader.readAsText(file);
}

function writeDiagram()
{
	chartWindow.postMessage("WRITE_" + $("#rootManager option:selected").text() + "_" + $("#imageRatio option:selected").text() + "_" + dataPath, "*");
}

function printDiagram()
{
	chartWindow.postMessage("PRINT", "*");
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
