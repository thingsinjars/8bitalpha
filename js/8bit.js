/**
 * @description Sets up a dropzone for file uploads to `upload.php`, configures print
 * logs and refresh time, and ties a click event to toggle the visibility of an element.
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
 * @description Empties any contents within the `#dropzone` element and appends an
 * image with a margin of 50 pixels to the same element. It also empties the
 * `#downloadables` element.
 */
$.fn.dropzone.newFilesDropped = function() {
  $('#dropzone').empty().append($('<img src="images/spinner.gif" />').css({margin:'50px'}));
  $('#downloadables').empty();
};
/**
 * @description Processes file uploads by either displaying an image or delaying its
 * display by 10 seconds if the file has a `.png` extension, based on the contents
 * of the `file` object passed as an argument.
 * 
 * @param { integer } fileIndex - 0-based index of the file being processed within
 * the array of files passed to the function.
 * 
 * @param { file reference or instance. } file - file that is being uploaded and is
 * used to determine whether or not the file has a `.png` extension.
 * 
 * 	* `fileIndex`: an integer representing the index of the current file being processed
 * in the list of files passed as an argument to the function.
 * 	* `file`: an object that represents a file, containing various attributes such
 * as `fileName`, `fileSize`, and `fileType`.
 * 
 * @param { integer } time - 10 milliseconds delay before displaying the image after
 * it has been uploaded to the server.
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
 * @description Creates a new `script` element and sets its `src` attribute to the
 * Google Analytics tracking code. It then inserts the script into the page's `<head>`
 * section using the `insertBefore()` method of the first `<script>` element found
 * in the page.
 */
(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();



