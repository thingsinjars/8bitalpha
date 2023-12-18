$(function() {
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
* @description This function takes two arguments: `fileName` and `i`. If the image
* file with the given name exists temporarily (`UrlExists()` returns `true`), it
* displays the image immediately.
* 
* @param { string } fileName - The `fileName` input parameter specifies the name of
* the image file that should be displayed.
* 
* @param { integer } i - The `i` parameter is a counter that is decremented on each
* recursive call to the `delayThenShowImages` function.
* 
* @returns { any } The output returned by this function is:
* 
* No output (void return).
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
* @description This function checks whether a URL exists by sending an HTTP HEAD
* request to the URL and returning true if the status code is not 404 (i.e., the URL
* is found).
* 
* @param { string } url - The `url` input parameter specifies the URL that we want
* to check if it exists or not.
* 
* @returns { boolean } The output returned by this function is `true`.
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



