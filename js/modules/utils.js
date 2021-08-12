
import Cookies from '../../node_modules/js-cookie/dist/js.cookie.mjs';


function saveCookie({ sessionNum, instructionNum, phaseNum, questNum, exp} = {}) {
    setCookie('sessionNum', sessionNum, 1);
    setCookie('instructionNum', instructionNum, 1);
    setCookie('phaseNum', phaseNum,  1);
    setCookie('questNum', questNum, 1);
    let expString = JSON.stringify(exp);
    localStorage['exp'] = expString;
}

function readCookies(){
    let sessionNum = parser(getCookie('sessionNum'));
    let instructionNum = parser(getCookie('instructionNum'));
    let phaseNum = parser(getCookie('phaseNum'));
    let questNum = parser(getCookie('questNum'));
    let exp = JSON.parse(localStorage['exp']);
    // loadImg(exp, exp.imgPath, exp.nCond, exp.nSession);
    return [sessionNum, instructionNum, phaseNum, questNum, exp]
}

function parser(v) {
    if (v != 'end') {
        return parseInt(v);
    }
    return v;
}

function cookieStored(){
    return getCookie('sessionNum') != "";
}

function clearListCookies()
{   
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++)
    {   
        var spcook =  cookies[i].split("=");
        deleteCookie(spcook[0]);
    }
    function deleteCookie(cookiename)
    {
        var d = new Date();
        d.setDate(d.getDate() - 1);
        var expires = ";expires="+d;
        var name=cookiename;
        //alert(name);
        var value="";
        document.cookie = name + "=" + value + expires + "; path=/acc/html";                    
    }
    window.location = ""; // TO REFRESH THE PAGE
}
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(';');
  for(let i = 0; i <ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function getKeyCode(event) {
    return event.which;
}


function getColor(FB) {
    let color = borderColor;
    if (FB == 0) {
        color = "black";
    } else if (FB == 1) {
        color = "#07ed19";
    } else if (FB == -1) {
        color = "#f20202";
    } else if (FB == 0.1) {
        color = "#1bb527";
    } else if (FB == -0.1) {
        color = "#ba1616";
    }
    return color;
}


function createCode() {
    return Math.floor(Math.random() * 10000000000);
}


function createDiv(ParentID, ChildID) {

    let d = $(document.createElement('div'))
        .attr("id", ChildID);
    let container = document.getElementById(ParentID);
    d.appendTo(container);
}


function shuffle(array) {
    let counter = array.length;

    /* While there are elements in the array */
    while (counter > 0) {
        /* Pick a random index */
        let index = Math.floor(Math.random() * counter);

        /* Decrease counter by 1 */
        counter--;

        /* And swap the last element with it */
        let temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }

    return array;
}  /* function shuffle(array) */


// simple range function
function range(start, stop, step) {
    let a = [start], b = start;
    while (b < stop) {
        a.push(b += step || 1);
    }
    return a;
}


/**
 * Asserts a condition
 * @param condition
 * @param message
 */
function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}


const sum = arr => arr.reduce((a, b) => a + b, 0);


function randint(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}


function isString(x) {
    return Object.prototype.toString.call(x) === "[object String]"
}


function getBrowser() {

    let nVer = navigator.appVersion;
    let nAgt = navigator.userAgent;
    let browserName = navigator.appName;
    let fullVersion = '' + parseFloat(navigator.appVersion);
    let majorVersion = parseInt(navigator.appVersion, 10);
    let nameOffset, verOffset, ix;

    /*In Opera, the true version is after "Opera" or after "Version"*/
    if ((verOffset = nAgt.indexOf("Opera")) != -1) {
        browserName = "Opera";
        fullVersion = nAgt.substring(verOffset + 6);
        if ((verOffset = nAgt.indexOf("Version")) != -1)
            fullVersion = nAgt.substring(verOffset + 8);
    }

    /*In MSIE, the true version is after "MSIE" in userAgent*/
    else if ((verOffset = nAgt.indexOf("MSIE")) != -1) {
        browserName = "Microsoft Internet Explorer";
        fullVersion = nAgt.substring(verOffset + 5);
    }

    /*In Chrome, the true version is after "Chrome"*/
    else if ((verOffset = nAgt.indexOf("Chrome")) != -1) {
        browserName = "Chrome";
        fullVersion = nAgt.substring(verOffset + 7);
    }

    /*In Safari, the true version is after "Safari" or after "Version"*/
    else if ((verOffset = nAgt.indexOf("Safari")) != -1) {
        browserName = "Safari";
        fullVersion = nAgt.substring(verOffset + 7);
        if ((verOffset = nAgt.indexOf("Version")) != -1)
            fullVersion = nAgt.substring(verOffset + 8);
    }

    /*In Firefox, the true version is after "Firefox"*/
    else if ((verOffset = nAgt.indexOf("Firefox")) != -1) {
        browserName = "Firefox";
        fullVersion = nAgt.substring(verOffset + 8);
    }

    /*In most other browsers, "name/version" is at the end of userAgent*/
    else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
        browserName = nAgt.substring(nameOffset, verOffset);
        fullVersion = nAgt.substring(verOffset + 1);
        if (browserName.toLowerCase() == browserName.toUpperCase()) {
            browserName = navigator.appName;
        }
    }

    if ((ix = fullVersion.indexOf(";")) != -1)
        fullVersion = fullVersion.substring(0, ix);
    if ((ix = fullVersion.indexOf(" ")) != -1)
        fullVersion = fullVersion.substring(0, ix);

    majorVersion = parseInt('' + fullVersion, 10);

    if (isNaN(majorVersion)) {
        fullVersion = '' + parseFloat(navigator.appVersion);
        majorVersion = parseInt(navigator.appVersion, 10);
    }

    return browserName + ' ' + fullVersion + ' ' + majorVersion + ' ' + navigator.appName + ' ' + navigator.userAgent;
} /* function getBrowser() */

function getOS() {
    let OSName = "Unknown OS";
    if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
    if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
    if (navigator.appVersion.indexOf("X11") != -1) OSName = "UNIX";
    if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";
    return OSName;
}

function loadImg(exp, imgPath, nCond, nSession) {
        // Get stims, feedbacks, resources
        let nImg = nCond * 2 * nSession;
        let nTrainingImg = nCond * 2 * nSession;
        let imgExt = "gif";
        let borderColor = "transparent";

        exp.images = [];
        exp.learningOptions = [];
        for (let i = 2; i < nImg + 2; i++) {
            exp.learningOptions.push(i);
            exp.images[i] = new Image();
            exp.images[i].src = imgPath + "stim_old/" + i + "." + imgExt;
            exp.images[i].className = "img-responsive center-block";
            exp.images[i].style.border = "5px solid " + borderColor;
            exp.images[i].style.position = "relative";
            exp.images[i].style.top = "0px";
        }

        let feedbackNames = ["empty", "0", "1", "-1", "-2", "2"];
        exp.feedbackImg = [];
        for (let i = 0; i < feedbackNames.length; i++) {
            let fb = feedbackNames[i];
            exp.feedbackImg[fb] = new Image();
            exp.feedbackImg[fb].src = imgPath + "fb/" + fb + "." + imgExt;
            exp.feedbackImg[fb].className = "img-responsive center-block";
            exp.feedbackImg[fb].style.border = "5px solid " + borderColor;
            exp.feedbackImg[fb].style.position = "relative";
            exp.feedbackImg[fb].style.top = "0px";
        }

        // Training stims
        imgExt = "jpg";
        exp.trainingImg = [];
        exp.trainingOptions = [];
        let letters = [
            null,
            "A",
            "B",
            "C",
            "D",
            "E",
            "F",
            "G",
            "H",
            "I",
            "J",
            "K",
            "L",
            "M",
            "N",
            "O",
            "P",
            "Q",
            "R",
            "S",
            "T",
            "U",
            "V",
            "W",
            "X",
            "Y",
            "Z",
        ];
        for (let i = 2; i <= nTrainingImg + 1; i++) {
            let idx = letters[i];
            exp.trainingOptions.push(idx);
            exp.trainingImg[idx] = new Image();
            exp.trainingImg[idx].src = imgPath + "stim/" + idx + "." + imgExt;
            exp.trainingImg[idx].className = "img-responsive center-block";
            exp.trainingImg[idx].style.border = "5px solid " + borderColor;
            exp.trainingImg[idx].style.position = "relative";
            exp.trainingImg[idx].style.top = "0px";
        }

        for (let i = 0; i < exp.ev.length; i++) {
            let idx = exp.ev[i].toString();
            exp.images[idx] = new Image();
            exp.images[idx].src = imgPath + "lotteries/" + idx + ".png";
            exp.images[idx].className = "img-responsive center-block";
            exp.images[idx].style.border = "5px solid " + borderColor;
            exp.images[idx].style.position = "relative";
            exp.images[idx].style.top = "0px";
            exp.trainingImg[idx] = new Image();
            exp.trainingImg[idx].src = imgPath + "lotteries/" + idx + ".png";
            exp.trainingImg[idx].className = "img-responsive center-block";
            exp.trainingImg[idx].style.border = "5px solid " + borderColor;
            exp.trainingImg[idx].style.position = "relative";
            exp.trainingImg[idx].style.top = "0px";
        }
        exp.images["?"] = new Image();
        exp.images["?"].src = imgPath + "stim/question.jpg";
        exp.images["?"].className = "img-responsive center-block";
        exp.images["?"].style.border = "5px solid " + borderColor;
        exp.images["?"].style.position = "relative";
        exp.images["?"].style.top = "0px";
        exp.trainingImg["?"] = new Image();
        exp.trainingImg["?"].src = imgPath + "stim/question.jpg";
        exp.trainingImg["?"].className = "img-responsive center-block";
        exp.trainingImg["?"].style.border = "5px solid " + borderColor;
        exp.trainingImg["?"].style.position = "relative";
        exp.trainingImg["?"].style.top = "0px";
    }



export {
    sum, assert, range, shuffle,
    getBrowser, getColor, getKeyCode,
    getOS, isFloat, createDiv, isString, randint, createCode, saveCookie, getCookie, cookieStored, readCookies, clearListCookies
};

