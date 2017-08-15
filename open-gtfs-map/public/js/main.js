/**
 * TODO: Move code here for simplifying routes 
 */

/**
 * TODO: Move code here for changing stops
*/

/**
 * TODO: Add controls for #adjust_box here
 */

/**
 * Interactivity code
 */

$(document).ready(function() {
	$('#legend a').on('mouseenter click', function() {
		var routeClass = $(this).attr('class');
		showHighlight(routeClass);
	}).on('mouseout mouseleave', function() {
		var routeClass = $(this).attr('class');
		hideHighlight(routeClass);
	});
	$('#highlights g').on('mouseenter click', function() {
		var routeClass = $(this).attr('class');
		showHighlight(routeClass);
	}).on('mouseout mouseleave', function() {
		hideHighlight('focused');
	});
});

function showHighlight(routeClass) {
	routeClass = '.' + routeClass;
	$('#highlights').find(routeClass).addClass("focused");
	$('#outlines').find(routeClass).addClass("focused");
}

function hideHighlight(routeClass) {
	routeClass = '.' + routeClass;
	$('#highlights').find(routeClass).removeClass("focused");
	$('#outlines').find(routeClass).removeClass("focused");
}