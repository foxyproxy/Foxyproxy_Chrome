(function() {

    var icon = document.createElement('img');
    icon.setAttribute('src', 'images/logo.png');
    
    foxyProxy.icon = icon;

    var animationFrames = 36;
    var animationSpeed = 10;
    var canvas = document.createElement('canvas');
    canvas.setAttribute('width', 19);
    canvas.setAttribute('height', 19);
    
    var canvasContext = canvas.getContext('2d');
    var rotation = 0;
    var animating = false;

    foxyProxy.animateFlip = function (bInAction) {
        if (rotation === 0 || bInAction) {
            rotation += 1 / animationFrames;
            foxyProxy.drawIconAtRotation();
            if (rotation <= 1) {
                setTimeout(function () {
                    foxyProxy.animateFlip(1);
                }, animationSpeed);
            } else {
                rotation = 0;
                foxyProxy.drawIconAtRotation();
                animating = false;
            }
        }
    };
    
    foxyProxy.drawIconAtRotation = function () {
        function ease(x) {
            return (1 - Math.sin(Math.PI / 2 + x * Math.PI)) / 2;
        }
        canvasContext.save();
        canvasContext.clearRect(0, 0, canvas.width, canvas.height);
        canvasContext.translate(
            Math.ceil(canvas.width / 2), Math.ceil(canvas.height / 2));
        canvasContext.rotate(2 * Math.PI * ease(rotation));
        canvasContext.drawImage(foxyProxy.currentIcon, -Math.ceil(canvas.width / 2), -Math.ceil(canvas.height / 2));
        canvasContext.restore();
        chrome.browserAction.setIcon({
            imageData: canvasContext.getImageData(0, 0, canvas.width, canvas.height)
        });
    };
    
    foxyProxy.animateBlink = function (count, bInAction) {
        if (!animating || bInAction) {
            animating = true;
            if (count % 2 === 0) {
                chrome.browserAction.setIcon({
                    path: 'images/logo.png'
                });
            } else {
            chrome.browserAction.setIcon({
                imageData: foxyProxy.currentImageData
            });
            }
            if (count) {
                setTimeout(function () {
                    foxyProxy.animateBlink(count - 1, 1);
                }, 500);
            } else {
                animating = false;
            }
        }
    };
    
})();