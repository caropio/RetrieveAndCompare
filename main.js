$(document).ready(function () {

    // Initial Experiment Parameters
    // -------------------------------------------------------------------------------------------------- //
    var offline = 1;
    var expName = 'RetrieveAndCompare';
    //var language = "en"; // only en is available at the moment
    var compLink = 1;
    var nSessions = 2;
    var questionnaire = 0;

    // Main Exp
    var nCond = 8;
    nCond--; //because of range function
    var nCondPerSession = 4;
    var nTrialsPerCondition = 1;
    var nTrialsPerSession = nTrialsPerCondition * ((nCond + 1) / nSessions);

    var feedbackDuration = 2000;
    var sumReward = 0;
    //var totalReward = 0;

    // Training
    var nCondTraining = 4;
    var nTrialTrainingPerCond = 1;
    var nTrainingTrials = nTrialTrainingPerCond * nCondTraining;//1;
    var maxTrainingSessions = 1;
    var nTrainingImg = nCondTraining * 2;
    nCondTraining--; // because of range function

    // Elicitation

    // var nTrialsPerConditionLot = 2;
    // var nTrialsLotteries = (nCond + 1) * nTrialsPerConditionLot;

    var initTime = (new Date()).getTime();

    var expID = createCode();

    var clickDisabled = false;
    var trainSess = -1;
    var maxDBCalls = 1;
    var browsInfo = getOS() + ' - ' + getBrowser();

    var subID = expID;

    var link = 'https://app.prolific.ac/submissions/complete?cc=W72FT5TV';

    // Manage compensations
    // -------------------------------------------------------------------------------------------------- //
    // one point equals 7.5 pence
    var conversionRate = 7.5;
    var pointsToPence = points => points * conversionRate;
    var penceToPounds = pence => pence / 100;
    var pointsToPounds = points => penceToPounds(pointsToPence(points));

    // Define conditions
    // -------------------------------------------------------------------------------------------------- //
    var probs = [];
    var rewards = [];
    var cont = [];

    // Define ind cont
    // -------------------------------------------------------------------------------------------------- //
    cont[0] = [0.1, 0.9];
    cont[1] = [0.9, 0.1];
    cont[2] = [0.2, 0.8];
    cont[3] = [0.8, 0.2];
    cont[4] = [0.3, 0.7];
    cont[5] = [0.7, 0.3];
    cont[6] = [0.4, 0.6];
    cont[7] = [0.6, 0.4];
    cont[8] = [0.5, 0.5];

    rewards[0] = [[-1, 1], [-1, 1]];
    probs[0] = [[0.1, 0.9], [0.9, 0.1]];

    rewards[1] = [[-1, 1], [-1, 1]];
    probs[1] = [[0.2, 0.8], [0.8, 0.2]];

    rewards[2] = [[-1, 1], [-1, 1]];
    probs[2] = [[0.3, 0.7], [0.7, 0.3]];

    rewards[3] = [[-1, 1], [-1, 1]];
    probs[3] = [[0.4, 0.6], [0.6, 0.4]];

    rewards[4] = [[-1, 1], [-1, 1]];
    probs[4] = [[0.5, 0.5], [0.5, 0.5]];

    // Define conditions
    // -------------------------------------------------------------------------------------------------- //
    var expCondition = [];
    var conditions = [];

    var cond = [range(0, 3), range(4, 7)];

    for (let i = 0; i < nSessions; i++)
        expCondition[i] = shuffle(
            Array(nTrialsPerSession / nCondPerSession).fill(cond[i]).flat()
        );
    var map = [range(0, 4), range(0, 4)].flat();

    for (let i = 0; i <= nCond; i++)
        conditions.push({
            reward: rewards[map[i]],
            prob: probs[map[i]]
        });

    var trainingCondition = shuffle(
        Array(nTrialTrainingPerCond).fill([0, 1, 2, 3]).flat()
    );

    // Get stims, feedbacks, resources
    // -------------------------------------------------------------------------------------------------------- //
    var imgPath = 'images/cards_gif/';
    var nImg = 16;
    var imgExt = 'gif';
    var borderColor = "transparent";

    var images = [];
    var availableOptions = [];
    for (let i = 1; i <= nImg; i++) {
        availableOptions.push(i);
        images[i] = new Image();
        images[i].src = imgPath + 'stim_old/' + i + '.' + imgExt;
        images[i].className = "img-responsive center-block";
        images[i].style.border = "5px solid " + borderColor;
        images[i].style.position = "relative";
        images[i].style.top = "0px";
    }

    var feedbackNames = ["empty", "0", "1", "-1", '-2', '2'];
    var feedbackImg = [];
    for (var i = 0; i < feedbackNames.length; i++) {
        fb = feedbackNames[i];
        feedbackImg[fb] = new Image();
        feedbackImg[fb].src = imgPath + 'fb/' + fb + '.' + imgExt;
        feedbackImg[fb].className = "img-responsive center-block";
        feedbackImg[fb].style.border = "5px solid " + borderColor;
        feedbackImg[fb].style.position = "relative";
        feedbackImg[fb].style.top = "0px";
    }

    // Training stims
    var imgExt = 'jpg';
    var trainingImg = [];
    var trainingOptions = [];
    var letters = [null, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
        'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    for (let i = 1; i <= nTrainingImg; i++) {
        trainingOptions.push(i);
        trainingImg[i] = new Image();
        trainingImg[i].src = imgPath + 'stim/' + letters[i] + '.' + imgExt;
        trainingImg[i].className = "img-responsive center-block";
        trainingImg[i].style.border = "5px solid " + borderColor;
        trainingImg[i].style.position = "relative";
        trainingImg[i].style.top = "0px";
    }

    // Elicitations
    // ------------------------------------------------------------------------------------------------------- //
    var elicitationType = 0;
    var expectedValue = [-0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8];
    var expectedValueMap = {
        '-0.8': [cont[0], 0],
        '-0.6': [cont[2], 2],
        '-0.4': [cont[4], 4],
        '-0.2': [cont[6], 6],
        '0': [cont[8], 8],
        '0.2': [cont[7], 7],
        '0.4': [cont[5], 5],
        '0.6': [cont[3], 3],
        '0.8': [cont[1], 1]
    };

    var nTrialPerElicitationChoice = 4;
    var nTrialPerElicitationSlider = 8;

    var choiceBasedOption = [];
    for (let i = 0; i < expectedValue.length; i++) {
        choiceBasedOption[expectedValue[i] + '_' + elicitationType] = new Image();
        choiceBasedOption[expectedValue[i] + '_' + elicitationType].src = imgPath + 'stim/' + expectedValue[i] + '_' + elicitationType + '.png';
        choiceBasedOption[expectedValue[i] + '_' + elicitationType].className = "img-responsive center-block";
        choiceBasedOption[expectedValue[i] + '_' + elicitationType].style.border = "5px solid " + borderColor;
        choiceBasedOption[expectedValue[i] + '_' + elicitationType].style.position = "relative";
        choiceBasedOption[expectedValue[i] + '_' + elicitationType].style.top = "0px";
    }

    // Define contexts
    // ------------------------------------------------------------------------------------------------------- //
    // training
    trainingOptions = shuffle(trainingOptions);
    var trainingContexts = [];
    var arr = [];
    var elicitationsStimEVTraining = [];
    (new Set(trainingCondition)).forEach(x => arr.push(x));
    let j = 0;
    for (let i = 0; i < nTrainingImg; i += 2) {
        trainingContexts[arr[j]] = [
            trainingOptions[i], trainingOptions[i + 1]
        ];
        j++;
        for (let k = 0; k < probs.length; k++) {
            elicitationsStimEVTraining.push([trainingOptions[i], expectedValue[k]]);
            elicitationsStimEVTraining.push([trainingOptions[i + 1], expectedValue[k]]);
        }
    }
    trainingContexts = shuffle(trainingContexts);

    elicitationsStimEVTraining = shuffle(elicitationsStimEVTraining);
    console.log(elicitationsStimEVTraining);

    // EXP
    availableOptions = shuffle(availableOptions);
    var contexts = [];

    for (let i = 0; i < nImg; i += 2) {
        contexts.push([
            availableOptions[i], availableOptions[i + 1]
        ]);
    }
    contexts = shuffle(contexts);

    var symbolValueMap = [];

    for (let i = 0; i < contexts.length; i++) {
        v1 = conditions[i]['prob'][0];
        v2 = conditions[i]['prob'][1];
        symbolValueMap[contexts[i][0]] = [v1, cont.findIndex(x => x.toString() === v1.toString())];
        symbolValueMap[contexts[i][1]] = [v2, cont.findIndex(x => x.toString() === v2.toString())];
    }

    // Elicitation
    var elicitationsStim = [];
    elicitationsStim[0] = [];
    elicitationsStim[1] = [];
    var elicitationsStimEV = [[], []];
    for (let i = 0; i < nSessions; i++) {
        var cidx = Array.from(new Set(expCondition[i].flat()));
        for (let j = 0; j < cidx.length; j++) {
            var stim1 = contexts[cidx[j]].flat()[0];
            var stim2 = contexts[cidx[j]].flat()[1];
            elicitationsStim[i].push(stim1);
            elicitationsStim[i].push(stim2);

            for (let k = 0; k < expectedValue.length; k++) {
                elicitationsStimEV[i].push(
                    [stim1, expectedValue[k]]
                );
                elicitationsStimEV[i].push(
                    [stim2, expectedValue[k]]
                );
            }
        }
        elicitationsStimEV[i] = shuffle(elicitationsStimEV[i]);
    }
    var elicitationsStimTraining = shuffle(range(1, 8));

    // Run the experiment
    // ------------------------------------------------------------------------------------------------ //
    // playSessions(0, 0);
    getUserID();
    // playTraining(0, 1);

    // playElicitation(0, 0);

    function sendExpDataDB(call) {

        $.ajax({
            type: 'POST',
            async: true,
            url: 'php/InsertExpDetails.php',
            //contentType: "application/json; charset=utf-8",
            //dataType: 'json',

            data: {expID: expID, id: subID, exp: expName, browser: browsInfo},

            success: function (r) {
                if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                    sendExpDataDB(call + 1);
                }
            },
            error: function (xhr, textStatus, err) {
            },
        });
    }

    function playTraining(trialNum, phaseNum) {

        if ($('#TextBoxDiv').length === 0) {
            createDiv('Stage', 'TextBoxDiv');
            /*document.getElementById("TextBoxDiv").style.backgroundColor = "white";*/
            ;
        }

        var conditionIdx = trainingCondition[trialNum];
        var option1ImgIdx = trainingContexts[conditionIdx][0];
        var option2ImgIdx = trainingContexts[conditionIdx][1];

        var option1 = trainingImg[option1ImgIdx];
        option1.id = "option1";
        option1 = option1.outerHTML;

        var option2 = trainingImg[option2ImgIdx];
        option2.id = "option2";
        option2 = option2.outerHTML;

        var feedback1 = feedbackImg["empty"];
        feedback1.id = "feedback1";
        feedback1 = feedback1.outerHTML;

        var feedback2 = feedbackImg["empty"];
        feedback2.id = "feedback2";
        feedback2 = feedback2.outerHTML;

        var Title = '<div id = "Title"><H2 align = "center"> <br><br><br><br></H2></div>';

        // Create canevas for the slot machine effect, of the size of the images
        var canvas1 = '<canvas id="canvas1" height="620"' +
            ' width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        var canvas2 = '<canvas id="canvas2" height="620"' +
            ' width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative"> ' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + option1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div>' +
            '<div class="col-xs-3 col-md-3">' + option2 + '</div><div class="col-xs-1 col-md-1"></div></div>';
        var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative"> ' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + feedback1 + '' +
            '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
            + feedback2 + '</div><div class="col-xs-1 col-md-1"></div></div>';
        var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
            '    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + canvas1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
            + canvas2 + '</div><div class="col-xs-1 col-md-1"></div></div>';

        var invertedPosition = +(Math.random() < 0.5);
        var symbols = [option1ImgIdx, option2ImgIdx];

        if (invertedPosition) {

            var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative">' +
                ' <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + option2 + '</div>' +
                '<div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + option1 +
                '</div><div class="col-xs-1 col-md-1"></div></div>';
            var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative">' +
                ' <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + feedback2 + '</div><div id = "Middle" class="col-xs-4 col-md-4">' +
                '</div><div class="col-xs-3 col-md-3">' + feedback1 + '</div><div class="col-xs-1 col-md-1"></div></div>';
            var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
                '    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + canvas2 + '</div>' +
                '<div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + canvas1 + '</div>' +
                '<div class="col-xs-1 col-md-1"></div></div>';

            var symbols = [option2ImgIdx, option1ImgIdx];
        }

        $('#TextBoxDiv').html(Title + Feedback + Images + myCanvas);

        var choiceTime = (new Date()).getTime();

        var myEventHandler = function (e) {

            var key = getKeyCode(e);

            if ((key === 101 && !invertedPosition) || (key === 112 && invertedPosition)) {
                if (clickDisabled)
                    return;
                clickDisabled = true;

                fb = getReward(1);
                color = getColor(fb);
                document.getElementById("option1").style.borderColor = "black";
                targetElement.removeEventListener('keypress', myEventHandler);

            } else if ((key === 112 && !invertedPosition) || (key === 101 && invertedPosition)) {

                if (clickDisabled)
                    return;
                clickDisabled = true;

                fb = getReward(2);
                color = getColor(fb);
                document.getElementById("option2").style.borderColor = "black";
                targetElement.removeEventListener('keypress', myEventHandler);

            }

        };

        var targetElement = document.body;

        $('#canvas1').click(function () {
            if (clickDisabled)
                return;
            clickDisabled = true;
            var fb = getReward(1);
            document.getElementById("canvas1").style.borderColor = "black";
        });

        $('#canvas2').click(function () {
            if (clickDisabled)
                return;
            clickDisabled = true;
            var fb = getReward(2);
            document.getElementById("canvas2").style.borderColor = "black";
        });

        function getReward(choice) {

            var reactionTime = (new Date()).getTime();

            var leftRight = -1;

            if ((invertedPosition && (choice === 1)) || (!invertedPosition && (choice === 2))) {
                leftRight = 1;
            }

            var P1 = conditions[conditionIdx]['prob'][0][1];
            var P2 = conditions[conditionIdx]['prob'][1][1];
            var Mag1 = conditions[conditionIdx]['reward'][0];
            var Mag2 = conditions[conditionIdx]['reward'][1];

            p1 = conditions[conditionIdx]['prob'][0];
            p2 = conditions[conditionIdx]['prob'][1];
            r1 = conditions[conditionIdx]['reward'][0];
            r2 = conditions[conditionIdx]['reward'][1];

            if (sum(p1) === 2) {
                var ev1 = p1[0] * r1[0];
            } else {
                var ev1 = p1.reduce(
                    function (r, a, i) {
                        return r + a * r1[i]
                    }, 0);
            }

            if (sum(p2) === 2) {
                var ev2 = p2[0] * r2[0];
            } else {
                var ev2 = p2.reduce(
                    function (r, a, i) {
                        return r + a * r2[i]
                    }, 0);
            }

            if (choice === 1) { /*option1*/
                var thisReward = Mag1[+(Math.random() < P1)];
                var otherReward = Mag2[+(Math.random() < P2)];
                var correctChoice = +(ev1 > ev2);
            } else { /*option2*/
                var otherReward = Mag1[+(Math.random() < P1)];
                var thisReward = Mag2[+(Math.random() < P2)];
                var correctChoice = +(ev2 > ev1);
            }

            sumReward += thisReward;

            var fb1 = document.getElementById("feedback1");
            var fb2 = document.getElementById("feedback2");

            var pic1 = document.getElementById("option1");
            var pic2 = document.getElementById("option2");

            var cv1 = document.getElementById("canvas1");
            var cv2 = document.getElementById("canvas2");

            if (choice === 1) {
                fb1.src = feedbackImg['' + thisReward].src;
                setTimeout(function () {
                    slideCard(pic1, cv1);
                }, 500)

            } else {
                fb2.src = feedbackImg['' + thisReward].src;
                setTimeout(function () {
                    slideCard(pic2, cv2);
                }, 500)

            }

            if (offline === 0) sendTrainDataDB(0);

            next();

            function slideCard(pic, cv) {  /* faire défiler la carte pour decouvrir le feedback */

                var img = new Image();
                img.src = pic.src;
                img.width = pic.width;
                img.height = pic.height;

                var speed = 3; /*plus elle est basse, plus c'est rapide*/
                var y = 0; /*décalage vertical*/

                /*Programme principal*/

                var dy = 10;
                var x = 0;
                var ctx;

                img.onload = function () {

                    canvas = cv;
                    ctx = cv.getContext('2d');

                    canvas.width = img.width;
                    canvas.height = img.height;

                    var scroll = setInterval(draw, speed);

                    setTimeout(function () {
                        pic.style.visibility = "hidden";
                        clearInterval(scroll);
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }, 1000);
                };

                function draw() {

                    ctx.clearRect(0, 0, canvas.width, canvas.height); /* clear the canvas*/

                    if (y > img.height) {
                        y = -img.height + y;
                    }

                    if (y > 0) {
                        ctx.drawImage(img, x, -img.height + y, img.width, img.height);
                    }

                    ctx.drawImage(img, x, y, img.width, img.height);

                    /*quantité à déplacer*/
                    y += dy;
                }
            };

            function sendTrainDataDB(call) {

                var wtest = 0; /* training */

                $.ajax({
                    type: 'POST',
                    data: {
                        exp: expName,
                        expID: expID,
                        id: subID,
                        elicitation_type: elicitationType,
                        test: wtest,
                        trial: trialNum,
                        condition: conditionIdx,
                        cont_idx_1: -1,
                        cont_idx_2: -1,
                        symL: symbols[0],
                        symR: symbols[1],
                        choice: choice,
                        correct_choice: correctChoice,
                        outcome: thisReward,
                        cf_outcome: otherReward,
                        choice_left_right: leftRight,
                        reaction_time: reactionTime - choiceTime,
                        reward: sumReward,
                        session: trainSess,
                        p1: P1,
                        p2: P2,
                        option1: option1ImgIdx,
                        option2: option2ImgIdx,
                        ev1: ev1,
                        ev2: ev2,
                        inverted: invertedPosition,
                        choice_time: choiceTime - initTime
                    },
                    async: true,
                    url: 'php/InsertLearningDataDB.php',

                    success: function (r) {

                        if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                            sendTrainDataDB(call + 1);
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {

                        // what type of error is it
                        alert(errorThrown.responseText);

                        if (call + 1 < maxDBCalls) {
                            sendTrainDataDB(call + 1);
                        }
                    }
                });
            };  /* function sendTrainDataDB(call) */

            return thisReward;
        };  /* function getReward(Choice) */

        function next() {

            trialNum++;
            if (trialNum < nTrainingTrials) {
                setTimeout(function () {
                    $('#stimrow').fadeOut(500);
                    $('#fbrow').fadeOut(500);
                    $('#cvrow').fadeOut(500);
                    setTimeout(function () {
                        clickDisabled = false;
                        playTraining(trialNum, phaseNum);
                    }, 500);
                }, feedbackDuration);
            } else {
                setTimeout(function () {
                    $('#TextBoxDiv').fadeOut(500);
                    setTimeout(function () {
                        $('#Stage').empty();
                        $('#Bottom').empty();
                        clickDisabled = false;
                        startElicitation(-1, true, 0, 2);
                    }, 500);
                }, feedbackDuration);
            }
        }
    };

    function endSession(sessionNum, phaseNum) {

        // InsertLog(0,'train');

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center">PHASE ' + phaseNum + '</H2>';

        var instBut;
        var trainBut;
        var startBut;

        var ready;
        var steady;
        var go;

        var Info = '';

        var points = sumReward;
        var pence = pointsToPence(points);
        var pounds = pointsToPounds(points);

        if (phaseNum === 4) {
            var wonlost = [' you won ', ' you lost '][+(points < 0)];

            Info += '<H3 align = "center">In this training,' + wonlost + points + ' points = ' + pence + ' pence = ' + pounds + ' pounds!</h3><br><br>';
        }

        Info += '<H3 align="center">Now, you are about to start the phase ' + phaseNum + ' of the test.'
            + ' The phase ' + phaseNum + ' is the same as the first phase but with different symbols and different values.<br>'
            + 'In each round you have to choose between one of two symbols displayed on either side of the screen.<br><br>'
            + 'You can select one of the two symbols with a left-click.'
            + 'After a choice, you can win/lose the following outcomes:<br><br>'
            + '-1 point = ? pence<br>1 points = ? pence<br><br>'
            + 'This is the actual game, every point will be included in the final payoff.<br><br>'
            + '<br>Click on start when you are ready.</h3><br><br>';

        instBut = '"Return to instructions"';
        trainBut = '"play the practice again"';
        startBut = '"Start the game"';
        ready = 'Ready...';
        steady = 'Steady...';
        go = 'Go!';

        $('#TextBoxDiv').html(Title + Info);

        var Buttons = '<div align="center">';
        if (trainSess > -(maxTrainingSessions + 1)) {
            Buttons += '<input align="center" type="button"  class="btn btn-default" id="Train" value=' + trainBut + ' >\n\ ';
        }
        Buttons += '<input align="center" type="button"  class="btn btn-default" id="Start" value=' + startBut + ' >';
        Buttons += '</div>';

        $('#Bottom').html(Buttons);

        $('#Inst').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            instructions(1);

        });

        $('#Train').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            playTraining(0);

        });

        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            setTimeout(function () {
                $('#Stage').html('<H1 align = "center">' + ready + '</H1>');
                setTimeout(function () {
                    $('#Stage').html('<H1 align = "center">' + steady + '</H1>');
                    setTimeout(function () {
                        $('#Stage').html('<H1 align = "center">' + go + '</H1>');
                        setTimeout(function () {
                            $('#Stage').empty();
                            playSessions(sessionNum, 0, phaseNum);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 10);
        });
    }

    function playElicitation(sessionNum, trialNum, elicitationType, phaseNum) {

        if ($('#TextBoxDiv').length === 0) {
            createDiv('Stage', 'TextBoxDiv');
        }


        if ([0, 1].includes(elicitationType)) {

            if ([-1, -2].includes(sessionNum)) {
                var stimIdx = elicitationsStimEVTraining[trialNum][0];
                var choiceAgainst = elicitationsStimEVTraining[trialNum][1];
                var img = trainingImg;
            } else {
                var stimIdx = elicitationsStimEV[sessionNum][trialNum][0];
                var choiceAgainst = elicitationsStimEV[sessionNum][trialNum][1];
                var img = images;
            }

            var option1 = img[stimIdx];
            option1.id = "option1";
            option1 = option1.outerHTML;

            var option2 = choiceBasedOption[choiceAgainst + '_' + elicitationType];
            option2.id = "option2";
            option2 = option2.outerHTML;

            var feedback1 = feedbackImg["empty"];
            feedback1.id = "feedback1";
            feedback1 = feedback1.outerHTML;

            var feedback2 = feedbackImg["empty"];
            feedback2.id = "feedback2";
            feedback2 = feedback2.outerHTML;

        } else {
            if ([-1, -2].includes(sessionNum)) {
                var stimIdx = elicitationsStimTraining[trialNum];
                var option1 = trainingImg[stimIdx];
            } else {
                var stimIdx = elicitationsStim[sessionNum][trialNum];
                var option1 = images[stimIdx];
            }

            option1.id = "option1";
            option1 = option1.outerHTML;

        }
        var Title = '<div id = "Title"><H2 align = "center"> <br><br><br><br></H2></div>';

        // var Count = '<div id = "Count"><H3 align = "center">Your current amount: ' + parseInt(sumReward) + ' points<br><br><br><br></H3><div>';

        // Create canevas for the slot machine effect, of the size of the images

        var canvas1 = '<canvas id="canvas1" height="620"' +
            ' width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        var canvas2 = '<canvas id="canvas2" height="620"' +
            ' width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';
        /* Create canevas for the slot machine effect, of the size of the images */

        var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
            '    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + canvas1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
            + canvas2 + '</div><div class="col-xs-1 col-md-1"></div></div>';
        //

        if ([0, 1].includes(elicitationType)) {
            var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative"> ' +
                '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
                + option1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div>' +
                '<div class="col-xs-3 col-md-3">' + option2 + '</div><div class="col-xs-1 col-md-1"></div></div>';

            var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative"> ' +
                '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + feedback1 + '' +
                '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
                + feedback2 + '</div><div class="col-xs-1 col-md-1"></div></div>';

            var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
                '    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
                + canvas1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
                + canvas2 + '</div><div class="col-xs-1 col-md-1"></div></div>';

            var invertedPosition = +(Math.random() < 0.5);
            //var symbols = [option1ImgIdx, option2ImgIdx];

            if (invertedPosition) {

                var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative">' +
                    ' <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + option2 + '</div>' +
                    '<div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + option1 +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative">' +
                    ' <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + feedback2 + '</div><div id = "Middle" class="col-xs-4 col-md-4">' +
                    '</div><div class="col-xs-3 col-md-3">' + feedback1 + '</div><div class="col-xs-1 col-md-1"></div></div>';
                var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
                    '    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + canvas2 + '</div>' +
                    '<div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + canvas1 + '</div>' +
                    '<div class="col-xs-1 col-md-1"></div></div>';

            }
            $('#TextBoxDiv').html(Title + Feedback + Images + myCanvas);

            var choiceTime = (new Date()).getTime();

            $('#canvas1').click(function () {
                if (clickDisabled)
                    return;
                clickDisabled = true;
                var choice = 1;
                getReward(choice);
                document.getElementById("canvas1").style.borderColor = "black";
            });

            $('#canvas2').click(function () {
                if (clickDisabled)
                    return;
                clickDisabled = true;
                var choice = 2;
                getReward(choice);
                document.getElementById("canvas2").style.borderColor = "black";
            });

        } else {
            var Images = '<div id = "stimrow" style="transform: translate(0%, -100%);position:relative"> ' +
                '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
                + '</div><div id = "Middle" class="col-xs-4 col-md-4">' + option1 + '</div></div>';

            var Slider = '<main>\n' +
                '  <form oninput="output.value = range.valueAsNumber / 10">\n' +
                '    <h2>\n' +
                '    </h2>\n' +
                '    <div class="range">\n' +
                '      <input id="slider" name="range" type="range" value="0" min="0" max="10" step="2">\n' +
                '      <div class="range-output">\n' +
                '        <output class="output" name="output" for="range">\n' +
                '          0\n' +
                '        </output>\n' +
                '      </div>\n' +
                '    </div>\n' +
                '  </form>\n' +
                '</main>\n' +
                '<br><br><div align="center"><button id="ok" class="btn btn-default btn-lg">Ok</button></div>';
            $('#TextBoxDiv').html(Title + Images + myCanvas + Slider);

            rangeInputRun();

            var slider = document.getElementById('slider');
            var ok = document.getElementById("ok");

            ok.onclick = function () {
                var choice = slider.value;
                getReward(choice, true)
            };
        }

        function getReward(choice, slider = false) {

            var reactionTime = (new Date()).getTime();
            console.log(stimIdx);
            var p1 = symbolValueMap[stimIdx][0];
            var contIdx1 = symbolValueMap[stimIdx][1];
            var r1 = [-1, 1];//symbolValueMap[stimIdx]['reward'][0];
            var ev1 = sum([p1[0] * r1[0], p1[1] * r1[1]]);

            if (slider) {
                var thisReward = 1 - Math.abs(choice - ev1);
                var otherReward = -1;
                var correctChoice = -1;
                var ev2 = -1;
                var contIdx2 = -1;
                var p2 = -1;
                var leftRight = -1;
            } else {
                var ev2 = choiceAgainst;
                var contIdx2 = expectedValueMap[ev2.toString()][1];
                var p2 = expectedValueMap[ev2.toString()][0];
                var leftRight = -1;

                if ((invertedPosition && (choice === 1)) || (!invertedPosition && (choice === 2))) {
                    leftRight = 1;
                }

                if (choice === 1) { /*option1*/
                    var thisReward = r1[+(Math.random() < p1[1])];
                    var otherReward = r1[+(Math.random() < p2[1])];
                    var correctChoice = +(ev1 > ev2);
                } else { /*option2*/
                    var thisReward = r1[+(Math.random() < p2[1])];
                    var otherReward = r1[+(Math.random() < p1[1])];
                    var correctChoice = +(ev2 > ev1);
                }
                var pic1 = document.getElementById("option1");
                var pic2 = document.getElementById("option2");

                var cv1 = document.getElementById("canvas1");
                var cv2 = document.getElementById("canvas2");

                if (choice === 1) {
                    setTimeout(function () {
                        slideCard(pic1, cv1);
                    }, 500)

                } else {
                    setTimeout(function () {
                        slideCard(pic2, cv2);
                    }, 500)

                }
            }

            sumReward += thisReward;

            if (offline === 0) sendLearnDataDB(0);

            next();


            function slideCard(pic, cv) {  /* faire défiler la carte pour decouvrir le feedback */

                var img = new Image();
                img.src = pic.src;
                img.width = pic.width;
                img.height = pic.height;

                var speed = 3; /*plus elle est basse, plus c'est rapide*/
                var y = 0; /*décalage vertical*/

                /*Programme principal*/

                var dy = 10;
                var x = 0;
                var ctx;

                img.onload = function () {

                    canvas = cv;
                    ctx = cv.getContext('2d');

                    canvas.width = img.width;
                    canvas.height = img.height;

                    var scroll = setInterval(draw, speed);

                    // setTimeout(function () {
                    //     pic.style.visibility = "hidden";
                    //     clearInterval(scroll);
                    //     ctx.clearRect(0, 0, canvas.width, canvas.height);
                    // }, 1000);
                };

                function draw() {

                    ctx.clearRect(0, 0, canvas.width, canvas.height); /* clear the canvas*/

                    if (y > img.height) {
                        y = -img.height + y;
                    }

                    if (y > 0) {
                        ctx.drawImage(img, x, -img.height + y, img.width, img.height);
                    }

                    ctx.drawImage(img, x, y, img.width, img.height);

                    /*quantité à déplacer*/
                    y += dy;
                }
            }

            function sendLearnDataDB(call) {
                wtest = 1;

                $.ajax({
                    type: 'POST',
                    data: {
                        exp: expName,
                        expID: expID,
                        id: subID,
                        test: wtest,
                        trial: trialNum,
                        elicitation_type: elicitationType,
                        cont_idx_1: contIdx1,
                        cont_idx_2: contIdx2,
                        condition: -1,
                        symL: -1, //tochange
                        symR: -1, //tochange
                        choice: choice, //tochange
                        correct_choice: correctChoice, //tochange
                        outcome: thisReward, //tochange
                        cf_outcome: otherReward, //tochange
                        choice_left_right: leftRight, //tochange
                        reaction_time: reactionTime - choiceTime,
                        reward: sumReward, //tochange
                        session: sessionNum, //tochange
                        p1: p1, //tochange
                        p2: p2, //tochange
                        option1: -1, //tochange
                        option2: -1, //tochange
                        ev1: ev1,
                        ev2: ev2,
                        inverted: invertedPosition,
                        choice_time: choiceTime - initTime
                    },
                    async: true,
                    url: 'php/InsertLearningDataDB.php',
                    success: function (r) {

                        if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                            sendLearnDataDB(call + 1);
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {

                        if (call + 1 < maxDBCalls) {
                            sendLearnDataDB(call + 1);
                        }
                    }
                });
            }

            return thisReward;
        }

        function next() {
            trialNum++;
            if ([0, 1].includes(elicitationType)) {
                var nTrialPerElicitation = nTrialPerElicitationChoice;
            } else {
                var nTrialPerElicitation = nTrialPerElicitationSlider;
            }
              if (elicitationType === 2) {
                        fbdur = 200;
                    } else {
                        fbdur = feedbackDuration;
                    }
            if (trialNum < nTrialPerElicitation) {
                setTimeout(function () {
                    $('#stimrow').fadeOut(500);
                    $('#fbrow').fadeOut(500);
                    $('#cvrow').fadeOut(500);
                    $('main').fadeOut(500);

                    setTimeout(function () {
                        clickDisabled = false;
                        playElicitation(sessionNum, trialNum, elicitationType, phaseNum);
                    }, 500);
                }, fbdur);
            } else {
                console.log('phase num');
                console.log(phaseNum);
                trialNum = 0;
                setTimeout(function () {
                    $('#TextBoxDiv').fadeOut(500);
                    setTimeout(function () {
                        $('#Stage').empty();
                        $('#Bottom').empty();
                        clickDisabled = false;
                        if (phaseNum === 2) {
                            phaseNum++;
                            startElicitation(sessionNum, true, 2, phaseNum);
                        } else if (phaseNum === 3) {
                            phaseNum++;
                            endSession(0, phaseNum);
                        } else if (phaseNum === 5) {
                            phaseNum++;
                            startElicitation(sessionNum, true, 2, phaseNum);
                        } else if (phaseNum === 6) {
                            endExperiment()
                        }
                    }, 500);
                }, fbdur);
            }
        }
    }

    function playSessions(sessionNum, trialNum, phaseNum) {

        playOptions(sessionNum, trialNum, phaseNum);
    }

    function playOptions(sessionNum, trialNum, phaseNum) {

        if ($('#TextBoxDiv').length === 0) {
            createDiv('Stage', 'TextBoxDiv');
        }
        elicitationType = 2;
        nTrialPerElicitation = 8;

        /*Choisir une condition*/
        var conditionIdx = expCondition[sessionNum][trialNum];

        var option1ImgIdx = contexts[conditionIdx][0];
        var option2ImgIdx = contexts[conditionIdx][1];

        var option1 = images[option1ImgIdx];
        option1.id = "option1";
        option1 = option1.outerHTML;

        var option2 = images[option2ImgIdx];
        option2.id = "option2";
        option2 = option2.outerHTML;

        var feedback1 = feedbackImg["empty"];
        feedback1.id = "feedback1";
        feedback1 = feedback1.outerHTML;

        var feedback2 = feedbackImg["empty"];
        feedback2.id = "feedback2";
        feedback2 = feedback2.outerHTML;

        var Title = '<div id = "Title"><H2 align = "center"> <br><br><br><br></H2></div>';

        // Create canevas for the slot machine effect, of the size of the images
        var canvas1 = '<canvas id="canvas1" height="620"' +
            ' width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        var canvas2 = '<canvas id="canvas2" height="620"' +
            ' width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';
        /* Create canevas for the slot machine effect, of the size of the images */

        var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative"> ' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + option1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div>' +
            '<div class="col-xs-3 col-md-3">' + option2 + '</div><div class="col-xs-1 col-md-1"></div></div>';
        var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative"> ' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + feedback1 + '' +
            '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
            + feedback2 + '</div><div class="col-xs-1 col-md-1"></div></div>';
        var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
            '    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + canvas1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
            + canvas2 + '</div><div class="col-xs-1 col-md-1"></div></div>';

        var invertedPosition = +(Math.random() < 0.5);
        var symbols = [option1ImgIdx, option2ImgIdx];

        if (invertedPosition) {

            var Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative">' +
                ' <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + option2 + '</div>' +
                '<div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + option1 +
                '</div><div class="col-xs-1 col-md-1"></div></div>';
            var Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative">' +
                ' <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + feedback2 + '</div><div id = "Middle" class="col-xs-4 col-md-4">' +
                '</div><div class="col-xs-3 col-md-3">' + feedback1 + '</div><div class="col-xs-1 col-md-1"></div></div>';
            var myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
                '    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + canvas2 + '</div>' +
                '<div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">' + canvas1 + '</div>' +
                '<div class="col-xs-1 col-md-1"></div></div>';

            var symbols = [option2ImgIdx, option1ImgIdx];
        }

        $('#TextBoxDiv').html(Title + Feedback + Images + myCanvas);

        var choiceTime = (new Date()).getTime();

        var myEventHandler = function (e) {

            var key = getKeyCode(e);

            if ((key === 101 && !invertedPosition) || (key === 112 && invertedPosition)) {
                if (clickDisabled)
                    return;
                clickDisabled = true;

                fb = getReward(1);
                color = getColor(fb);
                document.getElementById("option1").style.borderColor = "black";
                targetElement.removeEventListener('keypress', myEventHandler);

            } else if ((key === 112 && !invertedPosition) || (key === 101 && invertedPosition)) {

                if (clickDisabled)
                    return;
                clickDisabled = true;

                fb = getReward(2);
                color = getColor(fb);
                document.getElementById("option2").style.borderColor = "black";
                targetElement.removeEventListener('keypress', myEventHandler);

            }

        };

        var targetElement = document.body;

        $('#canvas1').click(function () {
            if (clickDisabled)
                return;
            clickDisabled = true;
            fb = getReward(1);
            document.getElementById("canvas1").style.borderColor = "black";
        });

        $('#canvas2').click(function () {
            if (clickDisabled)
                return;
            clickDisabled = true;
            fb = getReward(2);
            document.getElementById("canvas2").style.borderColor = "black";
        });

        function getReward(choice) {

            var reactionTime = (new Date()).getTime();

            var leftRight = -1;

            if ((invertedPosition && (choice === 1)) || (!invertedPosition && (choice === 2))) {
                leftRight = 1;
            }

            var P1 = conditions[conditionIdx]['prob'][0][1];
            var P2 = conditions[conditionIdx]['prob'][1][1];
            var Mag1 = conditions[conditionIdx]['reward'][0];
            var Mag2 = conditions[conditionIdx]['reward'][1];

            p1 = conditions[conditionIdx]['prob'][0];
            p2 = conditions[conditionIdx]['prob'][1];
            contIdx1 = cont.findIndex(x => x.toString() === p1.toString());
            contIdx2 = cont.findIndex(x => x.toString() === p2.toString());
            r1 = conditions[conditionIdx]['reward'][0];
            r2 = conditions[conditionIdx]['reward'][1];

            if (sum(p1) === 2) {
                var ev1 = p1[0] * r1[0];
            } else {
                var ev1 = p1.reduce(
                    function (r, a, i) {
                        return r + a * r1[i]
                    }, 0);
            }

            if (sum(p2) === 2) {
                var ev2 = p2[0] * r2[0];
            } else {
                var ev2 = p2.reduce(
                    function (r, a, i) {
                        return r + a * r2[i]
                    }, 0);
            }

            if (choice === 1) { /*option1*/
                var thisReward = Mag1[+(Math.random() < P1)];
                var otherReward = Mag2[+(Math.random() < P2)];
                var correctChoice = +(ev1 > ev2);
            } else { /*option2*/
                var otherReward = Mag1[+(Math.random() < P1)];
                var thisReward = Mag2[+(Math.random() < P2)];
                var correctChoice = +(ev2 > ev1);
            }

            sumReward += thisReward;

            var fb1 = document.getElementById("feedback1");
            var fb2 = document.getElementById("feedback2");

            var pic1 = document.getElementById("option1");
            var pic2 = document.getElementById("option2");

            var cv1 = document.getElementById("canvas1");
            var cv2 = document.getElementById("canvas2");

            if (choice === 1) {
                fb1.src = feedbackImg['' + thisReward].src;
                setTimeout(function () {
                    slideCard(pic1, cv1);
                }, 500)

            } else {
                fb2.src = feedbackImg['' + thisReward].src;
                setTimeout(function () {
                    slideCard(pic2, cv2);
                }, 500)

            }

            if (offline === 0) sendLearnDataDB(0);

            next();

            function slideCard(pic, cv) {  /* faire défiler la carte pour decouvrir le feedback */

                var img = new Image();
                img.src = pic.src;
                img.width = pic.width;
                img.height = pic.height;

                var speed = 3; /*plus elle est basse, plus c'est rapide*/
                var y = 0; /*décalage vertical*/

                /*Programme principal*/

                var dy = 10;
                var x = 0;
                var ctx;

                img.onload = function () {

                    canvas = cv;
                    ctx = cv.getContext('2d');

                    canvas.width = img.width;
                    canvas.height = img.height;

                    var scroll = setInterval(draw, speed);

                    setTimeout(function () {
                        pic.style.visibility = "hidden";
                        clearInterval(scroll);
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                    }, 1000);
                };

                function draw() {

                    ctx.clearRect(0, 0, canvas.width, canvas.height); /* clear the canvas*/

                    if (y > img.height) {
                        y = -img.height + y;
                    }

                    if (y > 0) {
                        ctx.drawImage(img, x, -img.height + y, img.width, img.height);
                    }

                    ctx.drawImage(img, x, y, img.width, img.height);

                    /*quantité à déplacer*/
                    y += dy;
                }
            }

            function sendLearnDataDB(call) {
                wtest = 1;

                $.ajax({
                    type: 'POST',
                    data: {
                        exp: expName,
                        expID: expID,
                        id: subID,
                        test: wtest,
                        elicitation_type: elicitationType,
                        trial: trialNum,
                        condition: conditionIdx,
                        cont_idx_1: contIdx1,
                        cont_idx_2: contIdx2,
                        symL: symbols[0],
                        symR: symbols[1],
                        choice: choice,
                        correct_choice: correctChoice,
                        outcome: thisReward,
                        cf_outcome: otherReward,
                        choice_left_right: leftRight,
                        reaction_time: reactionTime - choiceTime,
                        reward: sumReward,
                        session: sessionNum,
                        p1: P1,
                        p2: P2,
                        option1: option1ImgIdx,
                        option2: option2ImgIdx,
                        ev1: ev1,
                        ev2: ev2,
                        inverted: invertedPosition,
                        choice_time: choiceTime - initTime
                    },
                    async: true,
                    url: 'php/InsertLearningDataDB.php',
                    /*dataType: 'json',*/
                    success: function (r) {

                        if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                            sendLearnDataDB(call + 1);
                        }
                    },
                    error: function (XMLHttpRequest, textStatus, errorThrown) {

                        if (call + 1 < maxDBCalls) {
                            sendLearnDataDB(call + 1);
                        }
                    }
                });
            }

            return thisReward;
        }

        function next() {
            trialNum++;
            if (trialNum < nTrialsPerSession) {
                setTimeout(function () {
                    $('#stimrow').fadeOut(500);
                    $('#fbrow').fadeOut(500);
                    $('#cvrow').fadeOut(500);
                    setTimeout(function () {
                        clickDisabled = false;
                        playOptions(sessionNum, trialNum, phaseNum);
                    }, 500);
                }, feedbackDuration);

            } else {
                trialNum = 0;
                setTimeout(function () {
                    $('#TextBoxDiv').fadeOut(500);
                    setTimeout(function () {
                        $('#Stage').empty();
                        $('#Bottom').empty();
                        clickDisabled = false;
                        phaseNum++;
                        startElicitation(sessionNum, trialNum, 0, phaseNum);
                    }, 500);
                }, feedbackDuration);
            }
        }
    }

    function nextSession(sessionNum, trialNum) {

        if (sessionNum < nSessions) {
            endSession(sessionNum, trialNum);
        } else {
            if (questionnaire) {
            } else {
                endExperiment();
            }
        }
    }

    function startElicitation(sessionNum, training = false, elicitationType, phaseNum) {

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center">PHASE ' + phaseNum + '</H2><br>';

        var p = 'This is the actual game, every point will be included in the final payoff.<br><br>'
            + 'Ready? <br></H3>';
        if (phaseNum === 5)
            var s = 'The phase 5 is the same as the phase 2<br>';
        if (phaseNum === 6)
            var s = 'The phase 6 is the same as the phase 3<br>';
        if (training) {
            var p = '(This is a training phase, the results do not count for the final payoff.)<br><br></h3>';
            var s = '';
        }
        switch (elicitationType) {
            case 0:

                Info = '<H3 align = "center">' + s
                    + 'In each round of phase ' + phaseNum + ' you have to choose '
                    + 'between one of two options displayed on either side of the screen<br><br>'
                    + 'You can select one of the two options with a left-click<br><br> '
                    + 'In each round, one of the two options will be a symbol<br> you already met during '
                    + 'the previous phase and that is equally rewarding. ' +
                    'The other option will display explicitly what chances you have to win by choosing it'
                    + '.<br><br>' + p;
                break;
            case 2:

                Info = '<H3 align = "center">' + s
                    + 'In each round of phase ' + phaseNum + ' you have to choose ... BDM bid?'
                    + '<br><br>' + p;
                break;

        }

        nextBut = '"Start"';

        $('#TextBoxDiv').html(Title + Info);

        var Buttons = '<div align="center"><input align="center" type="button" class="btn btn-default" id="Start" value='
            + nextBut + ' ></div>';

        $('#Bottom').html(Buttons);

        ready = 'Ready...';
        steady = 'Steady...';
        go = 'Go!';

        // if (training) {
        //     ready = '';
        //     steady = '';
        //     go = '';
        // }

        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            setTimeout(function () {
                $('#Stage').html('<H1 align = "center">' + ready + '</H1>');
                setTimeout(function () {
                    $('#Stage').html('<H1 align = "center">' + steady + '</H1>');
                    setTimeout(function () {
                        $('#Stage').html('<H1 align = "center">' + go + '</H1>');
                        setTimeout(function () {
                            $('#Stage').empty();
                            playElicitation(sessionNum, 0, elicitationType, phaseNum);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 10);
        });
    }

    // function endSession(sessionNum, trialNum) {

    // createDiv('Stage', 'TextBoxDiv');
    //
    // var Title = '<H2 align = "center">SESSION</H2>';
    //
    // var points = sumReward;
    // var pence = pointsToPence(points);
    // var pounds = pointsToPounds(points);
    //
    // var wonlost;
    // var Info;
    // var nextBut;
    //
    // wonlost = [' won ', ' lost '][+(points < 0)];
    // Info = '<H3 align = "center">So far, you have ' + wonlost + points + ' points = ' + pence +
    //     ' pence = ' + pounds + ' pounds!<br><br> Click when you are ready to continue';
    // nextBut = '"Next"';
    //
    // $('#TextBoxDiv').html(Info);
    //
    // var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Next" value='
    //     + nextBut + ' ></div>';
    //
    // $('#Bottom').html(Buttons);
    //
    // $('#Next').click(function () {
    //     $('#TextBoxDiv').remove();
    //     $('#Stage').empty();
    //     $('#Bottom').empty();
    //
    //     playSessions(sessionNum, trialNum);
    //
    // })
    // }

    function endExperiment() {

        createDiv('Stage', 'TextBoxDiv');

        var points = sumReward;
        var pence = pointsToPence(points);
        var pounds = pointsToPounds(points);

        var wonlost = [' won ', ' lost '][+(points < 0)];

        var Title = '<h3 align = "center">The game is over!<br>' +
            'You ' + wonlost + points + ' points in total, which is ' + pence + ' pence = ' + pounds + ' pounds!<br><br>' +
            'Thank you for playing!<br><br>Please click the link to complete this study:<br></h3><br>';
        var url = '';
        if (compLink)
            url = '<center><a href="' + link + '">Click here.</a></center>';

        $('#TextBoxDiv').html(Title + url);
    }

    //  Non-game / display text functions
    // ------------------------------------------------------------------------------------------------------------------------------------------ //

    function getUserID() {

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H3 align = "center">Please enter your Prolific ID: <input type="text" id = "textbox_id" name="ID"></H3>';
        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="toConsent" value="Next" ></div>';

        var TextInput = '';
        $('#TextBoxDiv').html(Title + TextInput);

        $('#Bottom').html(Buttons);

        $('#toConsent').click(function () {

            if (document.getElementById('textbox_id').value !== '') {

                subID = document.getElementById('textbox_id').value;
                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();
                consent();
            } else {
                alert('You must enter your Prolific ID.');
            }
        });

    }

    function consent() {

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center">CONSENT</H2><br>';

        var Info = '<H4>INFORMATION FOR THE PARTICIPANT</H4>' +
            'You are about to participate in the research study entitled:<br>' +
            'The domain-general role of reinforcement learning-based training in cognition across short and long time-spans<br>' +
            'Researcher in charge: Pr. Stefano PALMINTERI<br>' +
            'This study aims to understand the learning processes in decision-making. Its fundamental purpose is to investigate the cognitive mechanisms of these' +
            'learning and decision-making processes.' +
            'The proposed experiments have no immediate application or clinical value, but they will allow us to improve our understanding of the functioning brain.<br>' +
            'We are asking you to participate in this study because you have been recruited by the RISC or Prolific platforms. <br>' +
            '<H4>PROCEDURE</H4>' +
            'During your participation in this study, we will ask you to answer several simple questionnaires and tests, which do not require any particular competence.' +
            'Your internet-based participation will require approximately 30 minutes. <br>' +
            '<H4>VOLUNTARY PARTICIPATION AND CONFIDENTIALITY</H4>' +
            'Your participation in this study is voluntary. This means that you are consenting to participate in this project without external pressure.' +
            'During your participation in this project, the researcher in charge and his staff will collect and record information about you.<br>' +
            'In order to preserve your identity and the confidentiality of the data, the identification of each file will be coded, thus preserving the anonymity of your answers. ' +
            'We will not collect any personal data from the RISC or Prolific platforms.<br>' +
            'The researcher in charge of this study will only use the data for research purposes in order to answer the scientific objectives of the project.' +
            'The data may be published in scientific journals and shared within the scientific community,' +
            'in which case no publication or scientific communication will contain identifying information. <br>' +
            '<H4>RESEARCH RESULTS AND PUBLICATION</H4>' +
            'You will be able to check the publications resulting from this study on the following link:<br>' +
            'https://sites.google.com/site/stefanopalminteri/publications<br>' +
            '<H4>CONTACT AND ADDITIONAL INFORMATION</H4>' +
            'Email: humanreinforcementlearning@gmail.com<br>' +
            'This research has received a favorable opinion from the Inserm Ethical Review Committee / IRB0888 on November 13th, 2018.<br>' +
            'Your participation in this research confirms that you have read this information and wish to participate in the research study.<br><br>' +
            '<H4>Please check all boxes before starting:<H4>';

        var Ticks = '<H4><input type="checkbox" name="consent" value="consent1"> I am 18 years old or more<br>' +
            '<input type="checkbox" name="consent" value="consent2"> My participation in this experiment is voluntary <br>' +
            '<input type="checkbox" name="consent" value="consent3"> I understand that my data will be kept confidential and I can stop at any time without justification <br></H4>';

        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="toInstructions" value="Next" ></div>';

        $('#TextBoxDiv').html(Title + Info + Ticks);
        $('#Bottom').html(Buttons);

        $('#toInstructions').click(function () {
            if ($("input:checkbox:not(:checked)").length > 0) {
                alert('You must tick all check boxes to continue.');
            } else {
                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();
                instructions();
            }
        });
    }  /* function consent() */

    function instructions(pageNum = 1) {

        var nPages = 5;

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center">INSTRUCTIONS</H2>';

        switch (pageNum) {

            case 1:
                var Info = '<H3 align = "center">This experiment is composed of 6 phases.<br><br>'
                    + 'All phases consists in a cognitive test<br><br>'
                    + 'The first, second, and third phase are considered as training phases.<br>'
                    + 'The fourth, fifth and sixth phase consist in the same task as the first three phases.<br>'
                    + '<br><br> </H3>';
                break;

            case 2:
                var Info = '<H3 align = "center">In addition of the fixed compensation,'
                    + ' you will receive a bonus depending on your choices.<br><br>'
                    + 'The training does not count in the final payoff (first, second and third phase)<br>'
                    + '<br> while the others (fourth, fifth and sixth phase) do.<br>'
                    + 'Across the last three phases of the cognitive experiment, you can win up to ? points = ? pounds.<br>'
                    + 'The word "ready" will be displayed before the actual game starts.<br><br></H3>';
                break;

            case 3:
                var Info = '<H3 align = "center">In each round of the first phase you have to choose between one of two symbols displayed on either side of the screen.<br><br>'
                    + 'You can select one of the two symbols with a left-click.'
                    + 'After a choice, you can win/lose the following outcomes:<br><br>'
                    + '1 point = ? pence<br>-1 points = ? pence<br><br></H3>';
                //+ 'Across the two phases of the cognitive experiment, you can win up to ? points = ? pounds.<br><br></H3>';
                break;

            case 4:
                var Info = '<H3 align = "center">The outcome of your choice will appear in the location of the symbol you chose.<br><br>'
                    + 'The different symbols are most of the time not equal in terms of outcome: in most trials of the experiment<br><br>'
                    + 'one is in average more advantageous (‘lucky’) compared to the other in terms of both points to be won, as well as points not to be lost.<br><br>'
                    + 'Your task is to find out, by trial and error, which is the most advantageous symbol and win as many points as possible,'
                    + 'even if it’s not possible to win points on every round.';
                break;

            case 5:
                var Info = '<H3 align = "center">At the end of the experiment you will know the total amount of points you won.<br><br>'
                    + 'The points won during the experiment will be translated into actual money, which will affect your final payment.<br><br>'
                    + 'Since the total number of trials is fixed, your final payoff depends only your capacity to identify the advantageous symbol and not on your rapidity.<br><br>'
                    + 'Let\'s begin with the first training phase!<br><br>'
                    + '(points won during the training (first, second and third phase) do not count for the final payoff)<br><br></H3>';
                break;

            default:
                var Info;
                break;

        }

        $('#TextBoxDiv').html(Title + Info);

        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Back" value="Back" >\n\
		<input align="center" type="button"  class="btn btn-default" id="Next" value="Next" >\n\
		<input align="center" type="button"  class="btn btn-default" id="Start" value="Start the first phase!" ></div>';

        $('#Bottom').html(Buttons);

        if (pageNum === 1) {
            $('#Back').hide();
        }

        if (pageNum === nPages) {
            $('#Next').hide();
        }

        if (pageNum < nPages) {
            $('#Start').hide();
        }

        $('#Back').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            if (pageNum === 1) {
            } else {
                instructions(pageNum - 1);
            }

        });
        $('#Next').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            instructions(pageNum + 1);

        });
        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            if (offline === 0) sendExpDataDB(0);
            playTraining(0, 1);

        });
    }

    function GetUserInfo() {

        createDiv('Stage', 'TextBoxDiv');
        var Title = '<H3 align = "center">Please indicate your</H3><br>';
        var Age = '<div align="center">Age: <input type="text" id = "age_id" name="age"><br></div>';
        var Gender = '<div align="center">Gender: <input type= "radio" id="m" name= "gender" >Male'
            + '<input type= "radio" id="f" name= "gender">Female<br></div>';

        $('#TextBoxDiv').html(Title + Age + '<br><br>' + Gender);

        var Buttons = '<div align="center"><input align="center" type="button"'
            + 'class="btn btn-default" id="toQuestions" value="Next" ></div>';
        $('#Bottom').html(Buttons);

        $('#toQuestions').click(function () {
            age_val = parseInt(document.getElementById('age_id').value);

            if (($("input:radio:checked").length < 1)
                || isNaN(age_val) || (age_val < 0) || (age_val > 100)) {
                alert('Please fill the required fields.');
            } else {
                gender_val = $("input:radio:checked").attr('id');
                if (offline == 0) sendUserDataDB(0);

                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();

                playQuestionnaire(1);
            }
        });

        function sendUserDataDB() {
            $.ajax({
                type: 'POST',
                data: {id: subID, age: age_val, gender: gender_val},
                async: true,
                url: 'php/InsertSubDetails.php',
                /*dataType: 'json',*/
                success: function (r) {
                    if (r[0].ErrorNo > 0) {
                        /*subID = createCode();*/
                        /*RunExperiment(thisAge, thisEdu, thisSex);*/
                        /*DisplayError();*/
                    } else {
                        /*playSessions(0);*/
                    }
                    ;
                }, error: function (XMLHttpRequest, textStatus, errorThrown) {
                    alert("Status: " + textStatus);
                    alert("Error: " + errorThrown);
                }
            });
        }
    }

    //  Utils
    // ------------------------------------------------------------------------------------------------------------------------------------------ //

    function getKeyCode(event) {

        return event.which;
    }

    function getColor(FB) {
        color = borderColor;
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

        var d = $(document.createElement('div'))
            .attr("id", ChildID);
        var container = document.getElementById(ParentID);
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
        var a = [start], b = start;
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

    function getBrowser() {

        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;
        var browserName = navigator.appName;
        var fullVersion = '' + parseFloat(navigator.appVersion);
        var majorVersion = parseInt(navigator.appVersion, 10);
        var nameOffset, verOffset, ix;

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
        var OSName = "Unknown OS";
        if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
        if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
        if (navigator.appVersion.indexOf("X11") != -1) OSName = "UNIX";
        if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";
        return OSName;
    }
});



