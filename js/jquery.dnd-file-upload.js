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
				// Prevents default action.

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
	 * @description Stops the propagation and prevents the default action of an event,
	 * likely a drag operation, allowing for custom handling of the event within the
	 * function itself.
	 * 
	 * @param {Event} event - Used to handle drag events.
	 * 
	 * @returns {boolean} False.
	 */
	function dragenter(event) {
		event.stopPropagation();
		event.preventDefault();
		return false;
	}

	/**
	 * @description Prevents default browser behavior when an element is being dragged
	 * over, such as scrolling or opening a link. It stops propagation and prevents default
	 * actions to ensure control over the drag-and-drop operation. The `return false`
	 * statement also confirms this action.
	 * 
	 * @param {Event} event - Triggered by a drag-over event.
	 * 
	 * @returns {boolean} `false`.
	 */
	function dragover(event) {
		event.stopPropagation();
		event.preventDefault();
		return false;
	}

	/**
	 * @description Handles file drop events on a drag-and-drop interface, retrieving the
	 * dropped files from the event data transfer object, preventing default behavior,
	 * and uploading the files using the `uploadFiles` function.
	 * 
	 * @param {Event} event - Triggered by a drag-and-drop operation.
	 * 
	 * @returns {boolean} `false`.
	 */
	function drop(event) {
		var dt = event.dataTransfer;
		var files = dt.files;

		event.preventDefault();
		uploadFiles(files);

		return false;
	}

	/**
	 * @description Logs a message if the `printLogs` option is set to true. It checks
	 * for the existence of the `console` object before attempting to log the message,
	 * allowing the function to be used in environments where console logging may not be
	 * available.
	 * 
	 * @param {string} logMsg - Used for logging messages.
	 */
	function log(logMsg) {
		if (opts.printLogs) {
			// console && console.log(logMsg);
		}
	}

	/**
	 * @description Uploads multiple files by creating an XMLHttpRequest object for each
	 * file, setting up event listeners for progress and load events, and sending the
	 * file to a server with specified method and URL parameters.
	 * 
	 * @param {File[]} files - An array of files to be uploaded.
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
	 * @description Records the current time when a file finishes downloading, calculates
	 * the time difference since the download started, and notifies the `uploadFinished`
	 * method of the `dropzone` object about the completion of the file upload, along
	 * with the file index and time taken.
	 * 
	 * @param {Event} event - Triggered when a file has finished loading.
	 */
	function load(event) {
		var now = new Date().getTime();
		var timeDiff = now - this.downloadStartTime;
		$.fn.dropzone.uploadFinished(this.fileIndex, this.fileObj, timeDiff);
		log("finished loading of file " + this.fileIndex);
	}

	/**
	 * @description Updates the file upload progress and speed by calculating the percentage,
	 * logging it, and triggering events for fileUploadProgressUpdated and fileUploadSpeedUpdated
	 * when the upload rate changes or reaches a certain threshold.
	 * 
	 * @param {ProgressEvent} event - Used to track file upload progress.
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
	 * @description Handles an event triggered by a file input element. It prevents default
	 * action, retrieves all selected files from the input element, and then calls another
	 * function `uploadFiles` to upload these files.
	 * 
	 * @param {Event} event - Triggered when an element changes, such as file upload completion.
	 */
	function change(event) {
		event.preventDefault();

		// get all files ...
		var files = this.files;

		// ... and upload them
		uploadFiles(files);
	}

})(jQuery);

