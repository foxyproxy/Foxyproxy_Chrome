// see: http://www.html5rocks.com/en/tutorials/file/filesystem/#toc-support
// and: http://www.html5rocks.com/en/tutorials/file/xhr2/
window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

var successFileSystem = function (fs) {
    console.log("FileSystem available", fs.name);
    fs.root.getFile("log.txt", {}, function (fileEntry) {
        fileEntry.file(function(file) {
            var reader = new FileReader();
            reader.onloadend = function (e) {
                var txtArea = document.createElement('textarea');
                txtArea.value = this.result;
                document.body.getElementsById("pageGlobal").appendChild(txtArea);
            };
            reader.readAsText(file);
        }, errorHandler);
    }, errorHandler);
};
var errorFileSystem = function () {
    console.log("An error occurred");
};

window.requestFileSystem(window.TEMPORARY, 5*1024*1024, successFileSystem, errorFileSystem);