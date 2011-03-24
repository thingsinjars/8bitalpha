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
  $('#dropzone').empty().append($('<img src="images/spinner.gif" width="16" height="16" />').css({margin:'50px'}));
  $('#downloadables').empty();
};
$.fn.dropzone.uploadFinished = function(fileIndex, file, time) {
	// This is one slightly nasty hack stuck in to get round 
	// the fact that the upload event fires after the file 
	// has been moved to the server but might fire before the 
	// PHP internals have moved the file from the temporary 
	// upload folder to the intended destination.
	while(!UrlExists('tmp/' + file.fileName)) {} 
  $('#dropzone').empty().append('<img src="tmp/' + file.fileName + '">');
  $('#downloadables').append('<img src="image.php?image=tmp/' + file.fileName + '">');
};
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