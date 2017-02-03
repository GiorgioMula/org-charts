/**
 * @file charts_image.js
 * @brief Image manipulations functions used by main file
 * @ref charts-main.js
 */

/**
 * Routine to operate on <div> employees HTML element, change div element "format"
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