$(function() {
  // Initializes and configures a drop zone for file uploads. It also toggles an "About"
  // section upon clicking specific elements.

  $("#dropzone").dropzone({
    url : "upload.php",
    printLogs : true,
    uploadRateRefreshTime : 500,
    numConcurrentUploads : 1
  });
  $('#questions, #about_close').click(function() {$('#about').toggle();})
});

$.fn.dropzone.newFilesDropped = function() {
  $('#dropzone').empty().append($('<img src="images/spinner.gif" />').css({margin:'50px'}));
  $('#downloadables').empty();
};
$.fn.dropzone.uploadFinished = function(fileIndex, file, time) {
  // This is one slightly nasty hack stuck in to get round
  // the fact that the upload event fires after the file
  // has been moved to the server but might fire before the
  // PHP internals have moved the file from the temporary
  // upload folder to the intended destination.
	if(file.fileName.indexOf('.png') == -1) {
		$('#downloadables').append('<img src="images/not-png.png">');
	} else {
  	delayThenShowImages(file.fileName, 10);
	}
};


/**
 * @description Checks if a file exists. If it doesn't and there are remaining attempts
 * (i), it waits for 20 milliseconds, then recursively calls itself to check again.
 * If the file still doesn't exist or all attempts have been used up, it displays the
 * image in two places.
 *
 * @param {string} fileName - Used to specify an image file name.
 *
 * @param {number} i - Used for recursion control.
 */
function delayThenShowImages(fileName, i) {
  if( !UrlExists('tmp/' + fileName) && i-->0 ) {
    setTimeout(function() {delayThenShowImages(fileName, i);}, 20);
  } else {
    $('#dropzone').empty().append('<img src="tmp/' + fileName + '">');
    $('#downloadables').append('<img src="image.php?image=tmp/' + fileName + '">');
  }
}

/**
 * @description Determines whether a specified URL exists by sending a HEAD request
 * to it using XMLHttpRequest and checking the response status code. If the status
 * is not 404, the function returns true, indicating that the URL likely exists.
 * Otherwise, it returns false.
 *
 * @param {string} url - The URL to be checked for existence.
 *
 * @returns {boolean} True if the HTTP request to the specified URL was successful
 * and the status code is not 404 (indicating a non-existent resource), and false otherwise.
 */
function UrlExists(url) {
  var http = new XMLHttpRequest();
  http.open('HEAD', url, false);
  http.send();
  return http.status!=404;
}

var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-20281865-3']);
_gaq.push(['_trackPageview']);
(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();



