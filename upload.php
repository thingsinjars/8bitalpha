<?php
//The counterpart to this is a cron to delete any image in tmp older than 5 minutes
class Uploader {
	private $fileName;
	private $contentLength;
	private $path;
	private $log;
	
	public function __construct($uploads) {
		$this->path=$uploads;
		// $log=fopen($this->path . 'log.txt','w');
		if (array_key_exists('HTTP_X_FILE_NAME', $_SERVER) && array_key_exists('CONTENT_LENGTH', $_SERVER)) {
			$this->fileName = $_SERVER['HTTP_X_FILE_NAME'];
			// fwrite($log,"Receiving '" .  $this->fileName . "'\n");
			$this->contentLength = $_SERVER['CONTENT_LENGTH'];
		} else {
			throw new Exception("Error retrieving headers");
		}
		// fclose($log);
	}
    
    public function receive() {
        if (!$this->contentLength > 0) {
            throw new Exception('No file uploaded!');
        }
		
        file_put_contents(
            $this->path . $this->fileName,
            file_get_contents("php://input")
        );
        
        return true;
    }
}

$uploads="tmp/";
try {
	$ft = new Uploader($uploads);
	$ft->receive();
} catch (Exception $e) {
	$fd=fopen($uploads . 'err.txt','w');
    fwrite($fd,'Caught exception: ' .  $e->getMessage() . "\n");
	fclose($fd);
}
?>