// see: http://www.html5rocks.com/en/tutorials/file/filesystem/#toc-support
// and: http://www.html5rocks.com/en/tutorials/file/xhr2/
window.onload = function () {
    window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;

    var fileInput = document.querySelector("#settings-import");
    var file;

    fileInput.onchange = function(e){
        file = e.target.files[0];
        var reader = new FileReader();      
        reader.onload = function (event) {
            console.log(event.target.result);  //contains the file data

        };      
        reader.readAsText(file);
    };
};