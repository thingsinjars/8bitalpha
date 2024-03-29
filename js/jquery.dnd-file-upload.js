(function($) {

	var opts = {};

	$.fn.dropzone = function(options) {

		// Extend our default options with those provided.
		opts = $.extend( {}, $.fn.dropzone.defaults, options);

		var id = this.attr("id");
		var dropzone = document.getElementById(id);

		log("adding dnd-file-upload functionalities to element with id: " + id);

		// hack for safari on windows: due to not supported drop/dragenter/dragover events we have to create a invisible <input type="file" /> tag instead
		if ($.client.browser == "Safari" && $.client.os == "Windows") {
			var fileInput = $("<input>");
			fileInput.attr( {
				type : "file"
			});
			fileInput.bind("change", change);
			fileInput.css( {
				'opacity' : '0',
				'width' : '100%',
				'height' : '100%'
			});
			fileInput.attr("multiple", "multiple");
			fileInput.click(function() {
				return false;
			});
			this.append(fileInput);
		} else {
			dropzone.addEventListener("drop", drop, true);
			var jQueryDropzone = $("#" + id);
			jQueryDropzone.bind("dragenter", dragenter);
			jQueryDropzone.bind("dragover", dragover);
		}

		return this;
	};

	$.fn.dropzone.defaults = {
		url : "",
		method : "POST",
		numConcurrentUploads : 3,
		printLogs : false,
		// update upload speed every second
		uploadRateRefreshTime : 1000
	};

	// invoked when new files are dropped
	$.fn.dropzone.newFilesDropped = function() {
	};

	// invoked when the upload for given file has been started
	$.fn.dropzone.uploadStarted = function(fileIndex, file) {
	};

	// invoked when the upload for given file has been finished
	$.fn.dropzone.uploadFinished = function(fileIndex, file, time) {
	};

	// invoked when the progress for given file has changed
	$.fn.dropzone.fileUploadProgressUpdated = function(fileIndex, file,
			newProgress) {
	};

	// invoked when the upload speed of given file has changed
	$.fn.dropzone.fileUploadSpeedUpdated = function(fileIndex, file,
			KBperSecond) {
	};

/**
* @description This function prevented the default behavior of the event object and
* stops propagation of the event.
* 
* @param { object } event - In the given function `dragenter`, the `event` input
* parameter is used to intercept and manipulate the browser's native drag events.
* 
* @returns {  } The output returned by this function is `false`.
* 
* Concisely: the function stops the propagation of the event and prevents the default
* behavior of the event from occurring (in this case - something that happens when
* you drag an item over another one), returns false to indicate that it has handled
* the event.
*/
	function dragenter(event) {
		event.stopPropagation();
		event.preventDefault();
		return false;
	}

/**
* @description This function prevents the default behavior of an HTML5 dragover event
* and stops the event from propagating to other elements. It also returns false to
* indicate that the event was not handled.
* 
* @param { object } event - The `event` input parameter is passed to the function
* and provides information about the event that triggered the function call (in this
* case the "dragover" event).
* 
* @returns { any } The function `dragover` prevents the default behavior of an HTML
* drag event when it is called.
*/
	function dragover(event) {
		event.stopPropagation();
		event.preventDefault();
		return false;
	}

/**
* @description This function drops the file(s) selected by the user into the designated
* upload area and preventDefault() to avoid browser default behavior for handling
* file drop event
* 
* @param {  } event - In this function `drop`, the `event` parameter represents the
* dropped file or files and provides information about the event that triggered the
* function to run.
* 
* @returns {  } The output returned by the `drop` function is `false`.
*/
	function drop(event) {
		var dt = event.dataTransfer;
		var files = dt.files;

		event.preventDefault();
		uploadFiles(files);

		return false;
	}

/**
* @description This function called "log" takes a single argument "logMsg".
* 
* @param { string } logMsg - The `logMsg` input parameter is the message to be logged.
* 
* @returns { any } The function `log()` takes a single argument `logMsg`, and if the
* `opts.printLogs` property is truthy (i.e., not undefined), it will log the message
* to the console.
*/
	function log(logMsg) {
		if (opts.printLogs) {
			// console && console.log(logMsg);
		}
	}

/**
* @description This function uploads files to a server using the XMLHttpRequest
* object. It creates a new xhr object for each file and adds listeners for progress
* and load events.
* 
* @param { object } files - The `files` input parameter is an array of File objects
* representing the files that are being uploaded.
* 
* @returns { any } This function uploadFiles takes an array of files as input and
* uploads each file to the server using XMLHttpRequest.
*/
	function uploadFiles(files) {
		$.fn.dropzone.newFilesDropped();
		for ( var i = 0; i < files.length; i++) {
			var file = files[i];

			// create a new xhr object
			var xhr = new XMLHttpRequest();
			var upload = xhr.upload;
			upload.fileIndex = i;
			upload.fileObj = file;
			upload.downloadStartTime = new Date().getTime();
			upload.currentStart = upload.downloadStartTime;
			upload.currentProgress = 0;
			upload.startData = 0;

			// add listeners
			upload.addEventListener("progress", progress, false);
			upload.addEventListener("load", load, false);

			xhr.open(opts.method, opts.url);
			xhr.setRequestHeader("Cache-Control", "no-cache");
			xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
			xhr.setRequestHeader("X-File-Name", file.fileName);
			xhr.setRequestHeader("X-File-Size", file.fileSize);
			xhr.setRequestHeader("Content-Type", "multipart/form-data");
			xhr.send(file);

			$.fn.dropzone.uploadStarted(i, file);
		}
	}

/**
* @description This function is called when a file has finished uploading using the
* `Dropzone` plugin. It retrieves the current time and calculates the time difference
* between the start and end of the upload.
* 
* @param { object } event - The `event` parameter is not used within the `load()` function.
* 
* @returns { any } The function `load` returns nothing (i.e., it has no return
* statement) and simply performs some actions when an event occurs.
*/
	function load(event) {
		var now = new Date().getTime();
		var timeDiff = now - this.downloadStartTime;
		$.fn.dropzone.uploadFinished(this.fileIndex, this.fileObj, timeDiff);
		log("finished loading of file " + this.fileIndex);
	}

/**
* @description This function updates the progress of a file upload and displays the
* speed of the upload. It calculates the progress by dividing the number of bytes
* loaded by the total number of bytes to be uploaded.
* 
* @param {  } event - The `event` input parameter is an object containing information
* about the progress of the file upload.
* 
* @returns {  } This function updates the progress of a file upload and calculates
* the speed of the upload. It takes an event object as an argument.
*/
	function progress(event) {
		if (event.lengthComputable) {
			var percentage = Math.round((event.loaded * 100) / event.total);
			if (this.currentProgress != percentage) {

				// log(this.fileIndex + " --> " + percentage + "%");

				this.currentProgress = percentage;
				$.fn.dropzone.fileUploadProgressUpdated(this.fileIndex, this.fileObj, this.currentProgress);

				var elapsed = new Date().getTime();
				var diffTime = elapsed - this.currentStart;
				if (diffTime >= opts.uploadRateRefreshTime) {
					var diffData = event.loaded - this.startData;
					var speed = diffData / diffTime; // in KB/sec

					$.fn.dropzone.fileUploadSpeedUpdated(this.fileIndex, this.fileObj, speed);

					this.startData = event.loaded;
					this.currentStart = elapsed;
				}
			}
		}
	}

	// invoked when the input field has changed and new files have been dropped
	// or selected
/**
* @description The function "change" is a browser event handler that is called when
* the user selects one or more files from a file input field.
* 
* @param {  } event - The `event` input parameter is used to prevent the default
* form submission behavior and allow the script to handle the event itself.
* 
* @returns {  } The output returned by the `change` function is undefined because
* the function does not return any value. The function preventdefaults the event and
* then uploads files without returning anything.
*/
	function change(event) {
		event.preventDefault();

		// get all files ...
		var files = this.files;

		// ... and upload them
		uploadFiles(files);
	}

})(jQuery);

