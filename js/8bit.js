/**
 * @description Sets up a Dropzone instance on an element with ID "dropzone". It
 * configures the Dropzone to send files to "upload.php" and logs upload attempts at
 * a rate of 500 milliseconds. The function also sets up a click event handler for
 * elements with IDs "questions" and "about_close" that toggle the visibility of an
 * element with ID "about".
 */
$(function() {
  $("#dropzone").dropzone({
    url : "upload.php",
    printLogs : true,
    uploadRateRefreshTime : 500,
    numConcurrentUploads : 1
  });
  $('#questions, #about_close').click(function() {$('#about').toggle();})
});

/**
 * @description Empties and re-initializes a HTML element with an image, and also
 * empties and clears an adjacent element.
 */
$.fn.dropzone.newFilesDropped = function() {
  $('#dropzone').empty().append($('<img src="images/spinner.gif" />').css({margin:'50px'}));
  $('#downloadables').empty();
};
/**
 * @description Processes a file upload event and adds an image to a container based
 * on the file's name extension. If the file has a `.png` extension, it displays the
 * image immediately; otherwise, it delays showing the image for 10 seconds.
 * 
 * @param { integer } fileIndex - 0-based index of the file being processed within
 * an array of files.
 * 
 * @param { file reference. } file - uploaded file.
 * 
 * 	* `fileIndex`: an integer indicating the zero-based index of the current file
 * being processed in the array of files passed to the function
 * 	* `file`: an object representing a file that is being uploaded or has been recently
 * uploaded, containing various properties such as `fileName`, `fileSize`, `type`,
 * and others
 * 	* `time`: a numeric value representing the current time at which the function is
 * executing.
 * 
 * @param { integer } time - 10-second delay before showing the images after they
 * have been uploaded and moved to the intended destination.
 */
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
 * @description Delays displaying images for 20 milliseconds and then shows them
 * inside a dropzone element or appends to a list with an image tag.
 * 
 * @param { string } fileName - file name to be displayed after a delay of 20 milliseconds.
 * 
 * @param { integer } i - 0-based index of the image file to be processed and displayed,
 * which is used to determine whether the image has been loaded and can be shown.
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
 * @description Checks if a provided URL exists by sending an HTTP HEAD request and
 * returning whether the status code is not 404.
 * 
 * @param { string } url - URL to be checked for existence.
 * 
 * @returns { boolean } a boolean value indicating whether the specified URL exists
 * or not.
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
/**
 * @description Creates a new `script` element and sets its source to Google Analytics'
 * tracking JavaScript. The `script` is then inserted into the document using the
 * `<script>` element's `parentNode`.
 */
(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();



