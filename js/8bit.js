$(function() {
  // Initializes a file upload functionality via the Dropzone library and sets up a
  // toggle event for an about section.
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
 * @description Checks for the existence of a file in the 'tmp' directory. If the
 * file does not exist and the counter `i` is greater than 0, it waits 20 milliseconds
 * and recursively calls itself. If the file exists or `i` reaches 0, it displays the
 * image in two locations on the page.
 *
 * @param {string} fileName - Used to represent the name of an image file.
 *
 * @param {number} i - Used to prevent infinite recursion in case the file does not
 * exist.
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
 * @description Checks if a given URL exists by attempting to send a HEAD request to
 * the URL. It returns true if the request is successful (status code other than 404),
 * indicating the URL exists, and false otherwise.
 *
 * @param {string} url - Describing the `url` parameter, it is used to specify the
 * URL to be checked for existence.
 *
 * @returns {boolean} True if the URL exists and false otherwise.
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



