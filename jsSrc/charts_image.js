/**
 * @file charts_image.js
 * @brief Image manipulations functions used by main file
 * @ref charts_main.js
 */

/**
 * Create a DOM object image with correct ratio
 * @param ratio user selection string
 * @param srcPath path to image
 * @returns DOM image object
 */
function createImage(ratio, srcPath)
{
	const IMG_WIDTH = 196;

	var imgObject = document.createElement("img");
	imgObject.src = "../test/" + dataPath + '/pictures/' + srcPath;
	imgObject.style.width = IMG_WIDTH + "px";
	var selIndex = document.getElementById("imageRatio").selectedIndex;
	switch (ratio)
	{
		case "4:3": 
			imgObject.style.borderRadius = "10%";
			imgObject.style.height = ((IMG_WIDTH * 3) / 4) + "px";
			break;
		case "1:1": 
			imgObject.style.borderRadius = "50%";
			imgObject.style.height = IMG_WIDTH + "px";
			break;
		case "16:9":
		default:
			imgObject.style.borderRadius = "5%";
			imgObject.style.height = ((IMG_WIDTH * 9) / 16) + "px";
			break;
	}
	return imgObject;
}

/**
 * Routine to operate on "div" employees HTML element, change "div" element "format"
 * custom attribute to display childrens on small format. Image size switch between
 * two different sizes too. TODO: use this js file as total image manipulation 
 */
function toggleDivFormat()
{
	var qEmployeeElement = $(this);
	if (qEmployeeElement.attr("format") != "small")
	{
		qEmployeeElement.attr("format", "small");
		qEmployeeElement.children("img").each(function()
		{
			$(this).css("height", 80);
			$(this).css("width", 80);
		});
	}
	else
	{
		qEmployeeElement.attr("format", "normal");
		qEmployeeElement.children("img").each(function()
		{
			$(this).css("height", 196);
			$(this).css("width", 196);
		});
	}
}