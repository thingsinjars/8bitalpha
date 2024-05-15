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
	 * @description Prevents an event from propagating and halts the default action of
	 * the event, such as dropping an object, by returning `false`.
	 * 
	 * @param { object } event - drag event that triggered the function, allowing the
	 * `stopPropagation()` and `preventDefault()` methods to be called to prevent further
	 * processing of the event.
	 * 
	 * @returns { false` value } `false`.
	 * 
	 * 		- `event`: The `event` object that triggered the `dragenter` event is passed as
	 * an argument to the function.
	 * 		- `stopPropagation()`: This method is called on the `event` object to prevent
	 * the event from propagating to its parent elements.
	 * 		- `preventDefault()`: This method is called on the `event` object to prevent the
	 * default action of the event (in this case, dropping the dragged element) from occurring.
	 * 		- `return false`: This expression is returned as the value of the `dragenter`
	 * function, which indicates that the event has been handled and no further processing
	 * should be performed.
	 */
	function dragenter(event) {
		event.stopPropagation();
		event.preventDefault();
		return false;
	}

	/**
	 * @description Prevents a dragged element from being dropped elsewhere by stopping
	 * event propagation and preventing the default action of dropping the element.
	 * 
	 * @param { object } event - event object that triggered the dragover event, and it
	 * is stopped from propagating further and the default action of the event is prevented.
	 * 
	 * @returns { false` value } `false`.
	 * 
	 * 		- `event`: an object representing the drag over event.
	 * 		- `stopPropagation()`: a method called to prevent the event from propagating up
	 * the DOM tree.
	 * 		- `preventDefault()`: a method called to prevent the default action of the event,
	 * in this case, dropping the element.
	 * 		- `return false`: a value returned to indicate that the event was not allowed
	 * to continue.
	 */
	function dragover(event) {
		event.stopPropagation();
		event.preventDefault();
		return false;
	}

	/**
	 * @description Prevents the default action of uploading files when a drag and drop
	 * operation is performed, and then calls the `uploadFiles()` function with the dragged
	 * files as an argument.
	 * 
	 * @param { object } event - dataTransfer object associated with the event, providing
	 * access to the files selected by the user through the drag-and-drop operation.
	 * 
	 * @returns { false` value } a boolean value indicating whether the action was prevented
	 * or not.
	 * 
	 * 		- `var dt = event.dataTransfer;` - The data transfer object (DTO) associated
	 * with the event.
	 * 		- `var files = dt.files;` - An array of files selected by the user.
	 */
	function drop(event) {
		var dt = event.dataTransfer;
		var files = dt.files;

		event.preventDefault();
		uploadFiles(files);

		return false;
	}

	/**
	 * @description Takes a message to be logged as an argument and logs it to the console
	 * if the `printLogs` option is enabled.
	 * 
	 * @param { string } logMsg - message to be logged, which is passed through the
	 * `console.log()` method if the `opts.printLogs` option is enabled.
	 */
	function log(logMsg) {
		if (opts.printLogs) {
			// console && console.log(logMsg);
		}
	}

	/**
	 * @description Handles uploading files to a server using XMLHttpRequest. It creates
	 * a new XHR object, sets request headers, and sends the file. It also listens for
	 * progress and load events, updating the current progress and starting time.
	 * 
	 * @param { array } files - 0-dimensional array of files that are being uploaded
	 * through the `dropzone` widget, and is used to iterate over the files and handle
	 * each file's upload individually within the function.
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
	 * @description Updates a DownloadDropzone instance's `downloadStartTime` and triggers
	 * the `uploadFinished` callback with the provided file index and time difference
	 * since the start of the load operation.
	 * 
	 * @param { `Event`. } event - `dropzone.files.added` event that is triggered when a
	 * new file is added to the dropzone element.
	 * 
	 * 		- `event`: An object that represents an event that triggered the function to be
	 * executed. It has several properties, including:
	 * 		+ `type`: A string indicating the type of event that triggered the function
	 * (e.g., "load").
	 * 		+ `target`: The element or object that the event occurred on or in (e.g., a
	 * Dropzone instance).
	 * 		+ `currentTarget`: The element or object that the event is currently occurring
	 * on or in (e.g., the Dropzone instance).
	 * 		+ `eventPhase`: An integer indicating the phase of the event (e.g., 0 for the
	 * initial event, 1 for the bubbled event, etc.).
	 * 		+ `isTrigger`: A boolean indicating whether the event was directly triggered by
	 * a user interaction (e.g., clicking an element) or indirectly through another event
	 * (e.g., a link being clicked).
	 */
	function load(event) {
		var now = new Date().getTime();
		var timeDiff = now - this.downloadStartTime;
		$.fn.dropzone.uploadFinished(this.fileIndex, this.fileObj, timeDiff);
		log("finished loading of file " + this.fileIndex);
	}

	/**
	 * @description Tracks the progress of a file upload and updates the upload rate with
	 * the speed of the transfer.
	 * 
	 * @param { object } event - upload progress event provided by the browser's FileReader
	 * API, which contains information about the loaded and total sizes of the file being
	 * uploaded, as well as other relevant details.
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
	 * @description Prevents an event from occurring, accesses the `files` property of
	 * its parent object, and calls the `uploadFiles` function with the contained files.
	 * 
	 * @param { object } event - event object that triggered the function, and it is used
	 * to prevent the default behavior of the event, such as submitting the form, by
	 * calling the `preventDefault()` method.
	 */
	function change(event) {
		event.preventDefault();

		// get all files ...
		var files = this.files;

		// ... and upload them
		uploadFiles(files);
	}

})(jQuery);

