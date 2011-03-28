<?php
$filename = $_GET['image'];

list($width, $height) = getimagesize($filename);

$src_image = imagecreatefrompng($filename);

// Create a new true color image
$dst_image = imagecreatetruecolor($width, $height);

if(imageistruecolor($src_image)) {
	
	$hot_pink = imagecolorallocate($dst_image, 255, 105, 180);
	imagecolortransparent($dst_image, $hot_pink);
	imagefill($dst_image, 0, 0, $hot_pink);


	imagecopy($dst_image, $src_image, 0, 0, 0, 0, $width, $height);

	// Convert to palette-based with no dithering and 255 colors with alpha
	imagetruecolortopalette($dst_image, false, 255);

	@imagecolormatch($src_image, $dst_image);
} else {
	$dst_image = $src_image;
}



// Output the image
header('Content-type: image/png');
imagepng($dst_image);
imagedestroy($dst_image);