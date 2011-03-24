This is the source of the website [8bitalpha.com](http://www.8bitalpha.com)

This retro-themed web service is aimed at developers who want the benefits of 24-bit PNGs but the size of 8-bit PNGs.

It uses the jQuery Drag 'n' Drop plugin available here:

 * [https://github.com/pangratz/dnd-file-upload](https://github.com/pangratz/dnd-file-upload)

which itself uses the jQuery.client plugin from here:

 * [http://www.stoimen.com/blog/2009/07/16/jquery-browser-and-os-detection-plugin/](http://www.stoimen.com/blog/2009/07/16/jquery-browser-and-os-detection-plugin/)

PNGs are serious business. Some have alpha transparency some have single-bit transparency. Some have 24-bit colour, some have 8-bit colour. Some have something else entirely.

This is a combination of sources to allow you to drag and drop a 24-bit + alpha PNG onto a page and receive an 8-bit + alpha PNG back.

It works in:

 * Firefox 3.6
 * Safari 4
 * Chrome 5
 * Chromium 4
