self.icon = $('#image')[0];
self.currentIcon = $("#customImage")[0];
var animationFrames = 36,
animationSpeed = 10,
canvas = document.getElementById('canvas'),
canvasContext = canvas.getContext('2d'),
rotation = 0,
animating = false;
this.animateFlip = function (bInAction) {
if (rotation === 0 || bInAction) {
    rotation += 1 / animationFrames;
    self.drawIconAtRotation();
    if (rotation <= 1) {
    setTimeout(function () {
        self.animateFlip(1);
    }, animationSpeed);
    } else {
    rotation = 0;
    self.drawIconAtRotation();
    animating = false;
    }
}
};
this.drawIconAtRotation = function () {
function ease(x) {
    return (1 - Math.sin(Math.PI / 2 + x * Math.PI)) / 2;
}
canvasContext.save();
canvasContext.clearRect(0, 0, canvas.width, canvas.height);
canvasContext.translate(
    Math.ceil(canvas.width / 2), Math.ceil(canvas.height / 2));
canvasContext.rotate(2 * Math.PI * ease(rotation));
canvasContext.drawImage(self.currentIcon, -Math.ceil(canvas.width / 2), -Math.ceil(canvas.height / 2));
canvasContext.restore();
chrome.browserAction.setIcon({
    imageData: canvasContext.getImageData(0, 0, canvas.width, canvas.height)
});
};
this.animateBlink = function (count, bInAction) {
if (!animating || bInAction) {
    animating = true;
    if (count % 2 === 0) {
    chrome.browserAction.setIcon({
        path: 'images/logo.png'
    });
    } else {
    chrome.browserAction.setIcon({
        imageData: self.currentImageData
    });
    }
    if (count) {
    setTimeout(function () {
        self.animateBlink(count - 1, 1);
    }, 500);
    } else {
    animating = false;
    }
}
};