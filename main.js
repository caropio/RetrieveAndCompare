$(document).ready(function () {

    // TODO:
    // compensation calculation
    // maxTraining [X] [to check]
    // the questionnaires [to check]
    // outcome training [to check]
    // check reaction times [to check]
    // check endowment [to check]
    // vérifier le slider [to check]
    // test maxTRaining
    // test chrome
    // Initial Experiment Parameters
    // -------------------------------------------------------------------------------------------------- //
    var offline = 0;
    var expName = 'RetrieveAndCompare';
    //var language = "en"; // only en is available at the moment
    var compLink = 1;
    var nSessions = 1;

    var questionnaire = 1;
    var maxPoints = 98;

    // Main Exp
    var nCond = 4;
    nCond--; //because of range function
    var nCondPerSession = 4;
    var nTrialsPerCondition = 30;
    var nTrialsPerSession = (nTrialsPerCondition * nCondPerSession) * nSessions;

    // Single symbols per session
    var nSymbolPerSession = 8;

    var feedbackDuration = 2000;
    var sumReward = [0, 0, 0, 0, 0, 0, 0];

    var totalReward = 0;

    // Training
    var nCondTraining = 4;
    var nTrialTrainingPerCond = 3;
    var nTrainingTrials = nTrialTrainingPerCond * nCondTraining;//1;
    var maxTrainingSessions = 1;
    var nTrainingImg = nCondTraining * 2;
    nCondTraining--; // because of range function

    // Phase to print
    var phases = [-1, 1, 2, 3, 1, 2, 3];

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
    // one point equals 250 pence / maxPoints
    var conversionRate = (250 / maxPoints).toFixed(2);
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
    cont[9] = [0., 1.];
    cont[10] = [1., 0.];

    rewards[0] = [[-1, 1], [-1, 1]];
    probs[0] = [[0.1, 0.9], [0.9, 0.1]];

    rewards[1] = [[-1, 1], [-1, 1]];
    probs[1] = [[0.2, 0.8], [0.8, 0.2]];

    rewards[2] = [[-1, 1], [-1, 1]];
    probs[2] = [[0.3, 0.7], [0.7, 0.3]];

    rewards[3] = [[-1, 1], [-1, 1]];
    probs[3] = [[0.4, 0.6], [0.6, 0.4]];

    // only for lotteries
    // rewards[4] = [[-1, 1], [-1, 1]];
    // probs[4] = [[0.5, 0.5], [0.5, 0.5]];

    // Define conditions
    // -------------------------------------------------------------------------------------------------- //
    var expCondition = [];
    var conditions = [];

    // range cond for each session
    var cond = range(0, nCond);

    for (let i = 0; i < nSessions; i++)
        expCondition[i] = shuffle(
            Array(nTrialsPerSession / nCondPerSession).fill(cond).flat()
        );

    for (let i = 0; i <= nCond; i++)
        conditions.push({
            reward: rewards[i],
            prob: probs[i]
        });

    // training conditions
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
    var expectedValue = [
        "-1", "-0.8", "-0.6", "-0.4", "-0.2", "0", "0.2", "0.4", "0.6", "0.8", "1"];
    var expectedValueMap = {
        '-1': [cont[10], 10],
        '-0.8': [cont[1], 1],
        '-0.6': [cont[3], 3],
        '-0.4': [cont[5], 5],
        '-0.2': [cont[7], 7],
        '0': [cont[8], 8],
        '0.2': [cont[6], 6],
        '0.4': [cont[4], 4],
        '0.6': [cont[2], 2],
        '0.8': [cont[0], 0],
        '1': [cont[9], 9],
    };

    var choiceBasedOption = [];
    for (let i = 0; i < expectedValue.length; i++) {
        choiceBasedOption[expectedValue[i] + '_' + elicitationType] = new Image();
        choiceBasedOption[expectedValue[i] + '_' + elicitationType].src = imgPath + 'lotteries/' + expectedValue[i] + '_' + elicitationType + '.png';
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
    elicitationsStimEVTraining.push(["0.8", "-0.8"]);
    elicitationsStimEVTraining.push(["0.6", "-0.6"]);
    elicitationsStimEVTraining.push(["0.4", "-0.4"]);
    elicitationsStimEVTraining.push(["0.2", "-0.2"]);
    elicitationsStimEVTraining.push(["1", "-1"]);

    elicitationsStimEVTraining = shuffle(elicitationsStimEVTraining);

    var nTrialPerElicitationChoiceTraining = 12;

    trainingContexts = shuffle(trainingContexts);

    var symbolValueMapTraining = [];

    for (let i = 0; i < trainingContexts.length; i++) {
        v1 = conditions[i]['prob'][0];
        v2 = conditions[i]['prob'][1];
        symbolValueMapTraining[trainingContexts[i][0]] = [v1, cont.findIndex(x => x.toString() === v1.toString())];
        symbolValueMapTraining[trainingContexts[i][1]] = [v2, cont.findIndex(x => x.toString() === v2.toString())];
    }

    // EXP
    availableOptions = shuffle(availableOptions);
    var contexts = [];

    for (let i = 0; i <= nCond * 2; i += 2) {
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
    var elicitationsStimEV = [];

    var cidx = Array.from(new Set(expCondition[0].flat()));

    for (let j = 0; j < cidx.length; j++) {

        var stim1 = contexts[cidx[j]].flat()[0];
        var stim2 = contexts[cidx[j]].flat()[1];

        elicitationsStim.push(stim1);
        elicitationsStim.push(stim2);

        for (let k = 0; k < expectedValue.length; k++) {
            elicitationsStimEV.push(
                [stim1, expectedValue[k]]
            );
            elicitationsStimEV.push(
                [stim2, expectedValue[k]]
            );
        }
    }

    elicitationsStimEV.push(["0.8", "-0.8"]);
    elicitationsStimEV.push(["0.6", "-0.6"]);
    elicitationsStimEV.push(["0.4", "-0.4"]);
    elicitationsStimEV.push(["0.2", "-0.2"]);
    elicitationsStimEV.push(["1", "-1"]);
    elicitationsStimEV = shuffle(elicitationsStimEV);

    var elicitationsStimTraining = shuffle(range(1, 4));

    for (let i = 0; i < 2; i++) {
        elicitationsStimTraining.push(expectedValue[i]);
    }
    var randExpectedValue = shuffle(expectedValue);
    for (let i = 0; i < 4; i++) {
        elicitationsStim.push(randExpectedValue[i]);
    }

    elicitationsStimTraining = shuffle(elicitationsStimTraining);
    elicitationsStim = shuffle(elicitationsStim);

    var nTrialPerElicitationSliderTraining = elicitationsStimTraining.length;
    var nTrialPerElicitationSlider = elicitationsStim.length;
    var nTrialPerElicitationChoice = elicitationsStimEV.length;

    // Run the experiment
    // ------------------------------------------------------------------------------------------------ //
    goFullscreen();

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

            ev1 = Math.round(ev1 * 100) / 100;
            ev2 = Math.round(ev2 * 100) / 100;

            if (choice === 1) { /*option1*/
                var thisReward = Mag1[+(Math.random() < P1)];
                var otherReward = Mag2[+(Math.random() < P2)];
                var correctChoice = +(ev1 >= ev2);
            } else { /*option2*/
                var otherReward = Mag1[+(Math.random() < P1)];
                var thisReward = Mag2[+(Math.random() < P2)];
                var correctChoice = +(ev2 >= ev1);
            }

            console.log(P1);
            console.log(P2);
            // thisReward = [-1, 1][+(Math.random() > 0.5)];

            sumReward[phaseNum] += thisReward;

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
                        elicitation_type: -1,
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
                        cf_outcome: -1,
                        choice_left_right: leftRight,
                        reaction_time: reactionTime - choiceTime,
                        reward: totalReward,
                        session: trainSess,
                        p1: P1,
                        p2: P2,
                        option1: option1ImgIdx,
                        option2: option2ImgIdx,
                        ev1: ev1,
                        ev2: ev2,
                        iscatch: -1,
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
            }

            return thisReward;
        }

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
                        startElicitation(trainSess, true, 0, 2);
                    }, 500);
                }, feedbackDuration);
            }
        }
    }

    function endTraining(sessionNum, phaseNum, pageNum = 1) {


        createDiv('Stage', 'TextBoxDiv');

        var nPages = 2;

        switch (pageNum) {

            case 1:
                var Title = '<H2 align = "center">END OF THE TRAINING</H2>';
                var Info = '';

                var totalPoints = sumReward[1] + sumReward[2] + sumReward[3];
                var pence = pointsToPence(totalPoints).toFixed(2);
                var pounds = pointsToPounds(totalPoints).toFixed(2);

                var wonlost = ['won', 'lost'][+(totalPoints < 0)];

                Info += '<H3 align="center"> The training is over!<br><br>';
                Info += 'Overall, in this training, you ' + wonlost + ' ' + totalPoints +
                    ' points = ' + pence + ' pence = ' + pounds + ' pounds!<br><br>';

                Info += 'Test 1: ' + sumReward[1] + '<br>';
                Info += 'Test 2: ' + sumReward[2] + '<br>';
                Info += 'Test 3: ' + sumReward[3] + '<br>';

                Info += 'Now, you are about to start the first phase of the experiment.<br> Note that from now on the points will be counted in your final payoff.'
                    + ' Also note that the experiment includes much more trials and more points are at stake, compared to the training.<br>'
                    + 'Finally note that the real test will involve different symbols (i.e., not encountered in the training).<br>'
                    + 'If you want you can do the training a second time.</h3><br><br>';
                break;

            case 2:

                var Title = '<H2 align = "center">PHASE 1</H2>';

                Info = '<h3 align="center">The test of the phase 1 is like the first test of the training.<br><br>'
                    + 'In each round you have to choose between one of two symbols displayed on either side of the screen.<br>'
                    + 'You can select one of the two symbols by left-clicking on it.<br>'
                    + 'After a choice, you can win/lose the following outcomes:<br><br>'
                    + '1 point = ' + pointsToPence(1).toFixed(2) + ' pence<br>'
                    + '-1 points = -' + pointsToPence(1).toFixed(2) + ' pence<br><br>'
                    + 'The outcome of your choice will appear in the location of the symbol you chose.<br>'
                    + 'Click on start when you are ready.</h3><br><br>';
                break;

        }
        $('#TextBoxDiv').html(Title + Info);

        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Back" value="Back" >\n\
            <input align="center" type="button"  class="btn btn-default" id="Training" value="Play training again" >\n\
            <input align="center" type="button"  class="btn btn-default" id="Next" value="Next" >\n\
            <input align="center" type="button"  class="btn btn-default" id="Start" value="Start!" ></div>';

        $('#Bottom').html(Buttons);

        if (pageNum === 1) {
            $('#Back').hide();
        } else {
            $('#Training').hide();
        }

        if (trainSess === -2)
            $('#Training').hide();


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
                endTraining(sessionNum, phaseNum, pageNum - 1);
            }

        });

        $('#Training').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            trainSess--;
            sumReward[0] = 0;
            sumReward[1] = 0;
            sumReward[2] = 0;
            sumReward[3] = 0;
            elicitationsStimTraining = shuffle(elicitationsStimTraining);
            trainingCondition = shuffle(trainingCondition);
            elicitationsStimEVTraining = shuffle(elicitationsStimEVTraining);

            instructions();

        });

        $('#Next').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            endTraining(sessionNum, phaseNum, pageNum + 1);
        });

        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            ready = 'Ready...';
            steady = 'Steady...';
            go = 'Go!';

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

            var ev1 = undefined;
            var isCatchTrial = 0;

            if ([-1, -2].includes(sessionNum)) {
                var stimIdx = elicitationsStimEVTraining[trialNum][0];
                var choiceAgainst = elicitationsStimEVTraining[trialNum][1];
                var img = trainingImg;

            } else {
                var stimIdx = elicitationsStimEV[trialNum][0];
                var choiceAgainst = elicitationsStimEV[trialNum][1];
                var img = images;
            }

            if (isString(stimIdx)) {
                var img = choiceBasedOption;
                ev1 = stimIdx;
                stimIdx += '_' + '0';
                var isCatchTrial = 1;
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
                var img = trainingImg;
            } else {
                var stimIdx = elicitationsStim[trialNum];
                var img = images;
            }

            if (isString(stimIdx)) {
                var img = choiceBasedOption;
                ev1 = stimIdx;
                stimIdx += '_' + '0';
                var isCatchTrial = 1;
            }
            option1 = img[stimIdx];
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

        var choiceTime = (new Date()).getTime();

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

            $('#canvas1').click(function () {
                if (clickDisabled)
                    return;
                clickDisabled = true;
                var choice = 1;
                getReward(choice, false, ev1);
                document.getElementById("canvas1").style.borderColor = "black";
            });

            $('#canvas2').click(function () {
                if (clickDisabled)
                    return;
                clickDisabled = true;
                var choice = 2;
                getReward(choice, false, ev1);
                document.getElementById("canvas2").style.borderColor = "black";
            });

        } else {
            var Title = '<div id = "Title"><H2 align = "center">What are the odds this symbol gives a +1?<br><br><br><br></H2></div>';
            var Images = '<div id = "stimrow" style="transform: translate(0%, -100%);position:relative"> ' +
                '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
                + '</div><div id = "Middle" class="col-xs-4 col-md-4">' + option1 + '</div></div>';

            var initvalue = range(25, 75, 5)[Math.floor(Math.random() * 10)];

            var Slider = '<main>\n' +
                '  <form id="form">\n' +
                '    <h2>\n' +
                '    </h2>\n' +
                '    <div class="range">\n' +
                '      <input id="slider" name="range" type="range" value="' + initvalue + '" min="0" max="100" step="5">\n' +
                '      <div class="range-output">\n' +
                '        <output id="output" class="output" name="output" for="range">\n' +
                '          ' + initvalue + '%\n' +
                '        </output>\n' +
                '      </div>\n' +
                '    </div>\n' +
                '  </form>\n' +
                '</main>\n' +
                '<br><br><div align="center"><button id="ok" class="btn btn-default btn-lg">Ok</button></div>';
            $('#TextBoxDiv').html(Title + Images + myCanvas + Slider);

            rangeInputRun();

            var slider = document.getElementById('slider');
            var output = document.getElementById('output');
            var ok = document.getElementById('ok');
            var form = document.getElementById('form');
            var clickDisabled = false;

            form.oninput = function () {
                output.value = slider.valueAsNumber;
                output.innerHTML += "%";
            };

            ok.onclick = function () {
                if (!clickDisabled) {
                    clickDisabled = true;
                    var choice = slider.value;
                    getReward(choice, true, ev1)
                }
            };

            if ([-1, -2].includes(sessionNum)) {
                var symValueMap = symbolValueMapTraining;
            } else {
                var symValueMap = symbolValueMap;
            }

            if (!isCatchTrial) {
                var p1 = symValueMap[stimIdx][0];
                var contIdx1 = symValueMap[stimIdx][1];
                var r1 = [-1, 1];
                var ev1 = sum([p1[0] * r1[0], p1[1] * r1[1]]);
            }

            console.log('PWIN SLIDER:');
            console.log(p1[1]);

        }

        function getReward(choice, slider = false, ev1 = null) {

            var reactionTime = (new Date()).getTime();
            if ([-1, -2].includes(sessionNum)) {
                var symValueMap = symbolValueMapTraining;
            } else {
                var symValueMap = symbolValueMap;
            }

            var elicDistance = -1;

            if (!isCatchTrial) {
                var p1 = symValueMap[stimIdx][0];
                var contIdx1 = symValueMap[stimIdx][1];
                var r1 = [-1, 1];
                var ev1 = sum([p1[0] * r1[0], p1[1] * r1[1]]);
            } else {
                var contIdx1 = expectedValueMap[ev1.toString()][1];
                var p1 = expectedValueMap[ev1.toString()][0];
                var r1 = [-1, 1];
            }

            if (slider) {
                var pLottery = Math.random();
                if (pLottery < (choice / 100)) {
                    var thisReward = r1[+(Math.random() < p1[1])];
                } else {
                    var thisReward = r1[+(Math.random() < pLottery)]
                }
                var otherReward = -1;

                var correctChoice = +((choice / 100) === p1[1]);
                var elicDistance = Math.abs(choice - p1[1]*100);

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

                ev1 = Math.round(ev1 * 100) / 100;
                ev2 = Math.round(ev2 * 100) / 100;

                if (choice === 1) { /*option1*/
                    var thisReward = r1[+(Math.random() < p1[1])];
                    var otherReward = r1[+(Math.random() < p2[1])];
                    var correctChoice = +(ev1 >= ev2);
                } else { /*option2*/
                    var thisReward = r1[+(Math.random() < p2[1])];
                    var otherReward = r1[+(Math.random() < p1[1])];
                    var correctChoice = +(ev2 >= ev1);
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

            sumReward[phaseNum] += thisReward;

            if (!([-1, -2].includes(sessionNum)))
                totalReward += thisReward;

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
                        reward: totalReward, //tochange
                        session: sessionNum, //tochange
                        p1: p1[1], //tochange
                        p2: p2[1], //tochange
                        option1: -1, //tochange
                        option2: -1, //tochange
                        ev1: Math.round(ev1 * 100) / 100,
                        ev2: Math.round(ev2 * 100) / 100,
                        iscatch: isCatchTrial,
                        inverted: invertedPosition,
                        choice_time: choiceTime - initTime,
                        elic_distance: elicDistance,
                        p_lottery: pLottery
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
                if ([-1, -2].includes(sessionNum)) {
                    var nTrialPerElicitation = nTrialPerElicitationChoiceTraining;
                } else {
                    var nTrialPerElicitation = nTrialPerElicitationChoice;
                }
            } else {
                if ([-1, -2].includes(sessionNum)) {
                    var nTrialPerElicitation = nTrialPerElicitationSliderTraining;
                } else {
                    var nTrialPerElicitation = nTrialPerElicitationSlider;
                }
            }
            if (elicitationType === 2) {
                var fbdur = 200;
            } else {
                var fbdur = feedbackDuration;
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
                trialNum = 0;
                setTimeout(function () {
                    $('#TextBoxDiv').fadeOut(500);
                    setTimeout(function () {
                        $('#Stage').empty();
                        $('#Bottom').empty();
                        clickDisabled = false;
                        switch (phaseNum) {
                            case 2:
                                phaseNum++;
                                startElicitation(sessionNum, true, 2, phaseNum);
                                break;
                            case 3:
                                phaseNum++;
                                endTraining(0, phaseNum);
                                break;
                            case 5:
                                phaseNum++;
                                startElicitation(sessionNum, false, 2, phaseNum);
                                break;
                            case 6:
                                if (questionnaire) {
                                    startQuestionnaire();
                                } else {
                                    endExperiment();
                                }
                                break;
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

            ev1 = Math.round(ev1 * 100) / 100;
            ev2 = Math.round(ev2 * 100) / 100;

            if (choice === 1) { /*option1*/
                var thisReward = Mag1[+(Math.random() < P1)];
                var otherReward = Mag2[+(Math.random() < P2)];
                var correctChoice = +(ev1 >= ev2);
            } else { /*option2*/
                var otherReward = Mag1[+(Math.random() < P1)];
                var thisReward = Mag2[+(Math.random() < P2)];
                var correctChoice = +(ev2 >= ev1);
            }

            sumReward[phaseNum] += thisReward;
            totalReward += thisReward;

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
                        elicitation_type: -1,
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
                        reward: totalReward,
                        session: sessionNum,
                        p1: P1,
                        p2: P2,
                        option1: option1ImgIdx,
                        option2: option2ImgIdx,
                        ev1: Math.round(ev1 * 100) / 100,
                        ev2: Math.round(ev2 * 100) / 100,
                        iscatch: -1,
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
                        startElicitation(sessionNum, false, 0, phaseNum);
                    }, 500);
                }, feedbackDuration);
            }
        }
    }

    function startElicitation(sessionNum, training, elicitationType, phaseNum, pageNum = 1) {

        createDiv('Stage', 'TextBoxDiv');

        var points = sumReward[phaseNum - 1];
        var pence = pointsToPence(points).toFixed(2);
        var pounds = pointsToPounds(points).toFixed(2);

        if (training) {
            var Title = '<H2 align = "center">INSTRUCTIONS</H2><br>';
            var p = '<b>(Note: points won during the training do not count for the final payoff!)<br><br>'
                + '<b>The word "ready" will be displayed before the actual game starts.</b></H3><br><br>'
            var like = '';
        } else {
            var Title = '<H2 align = "center">PHASE ' + phases[phaseNum] + '</H2><br>';
            if (phases[phaseNum] === 3)
                var like = '<h3 align="center"><b>Note:</b> The test of the phase 3 is like the third test of the training.</h3><br><br>';

            if (phases[phaseNum] === 2)
                var like = '<h3 align="center"><b>Note:</b> The test of the phase 2 is like the second test of the training.</h3><br><br>';

            var p = 'This is the actual game, every point will be included in the final payoff.<br><br>'
                + 'Ready? <br></H3>';
        }

        switch (elicitationType) {
            case 0:

                var nPages = 3;

                switch (pageNum) {
                    case 1:
                        var wonlost = ['won', 'lost'][+(points < 0)];

                        Info = '<H3 align = "center">You ' + wonlost + ' ' + points +
                            ' points = ' + pence + ' pence = ' + pounds + ' pounds!</h3><br><br>';

                        Info += like;

                        Info += '<H3 align="center"> <b>Instructions for the second test (1/2)</b><br><br>'
                            + 'In each round you have to choose between one of two items displayed on either side of the screen.<br>'
                            + 'You can select one of the two items by left-clicking on it.<br><br>'
                            + 'Please note that the outcome of your choice will not be displayed on each trial.<br>'
                            + 'However, for each choice an outcome will be calculated and taken into account for the final payoff.<br>'
                            + 'At the end of the test you will be shown with the final payoff in terms of cumulated points and monetary bonus.<br><br></H3>';

                        break;

                    case 2:
                        Info = '<H3 align="center"> <b>Instructions for the second test (2/2)</b><br><br>'
                            + 'In the second test  there will be two kind of options.<br>'
                            + 'The first kind of options is represented by the symbols you already met during the previous test.<br><br>'
                            + '<b>Note</b>: the symbols keep the same outcome as in the first test.<br><br>'
                            + 'The second kind of options is represented by pie-charts explicitly describing the odds of winning / losing a point.<br><br>'
                            + 'Specifically, the green area indicates the chance of winning +1 (+' + pointsToPence(1).toFixed(2) + 'p) ; the red area indicates the chance of losing -1 (+' + pointsToPence(1).toFixed(2) + 'p).<br><br>';
                        break;

                    case 3:
                        if (training) {
                            var trainstring = "Let's begin with the second training test!<br>";
                        } else {
                            var trainstring = "";
                        }

                        Info = '<H3 align="center">' + trainstring + p;
                        break;

                }
                break;

            case 2:

                var nPages = 4;

                switch (pageNum) {
                    case 1:
                        var wonlost = ['won', 'lost'][+(points < 0)];

                        Info = '<H3 align = "center">You ' + wonlost + ' ' + points +
                            ' points = ' + pence + ' pence = ' + pounds + ' pounds!</h3><br><br>';

                        Info += like;

                        Info += '<H3 align = "center"><b>Instructions for the third test (1/3)</b><br><br>'
                            + 'In each round of third test you will be presented with the symbols and pie-charts you met in the first and the second test.<br><br>'
                            + 'You will be asked to indicate (in percentages), what are the odds that a given symbol or pie-chart makes you win a point (+1=+' + pointsToPence(1).toFixed(2) + 'p).<br><br>'
                            + 'You will be able to do this through moving a slider on the screen and then confirm your final answer by clicking on the confirmation button.<br><br>'
                            + '100%  = the symbol (or pie-chart) always gives +1pt.<br>'
                            + '50%  = the symbol (or pie-chart) always gives +1pt or -1pt with equal chances.<br>'
                            + '0% = the symbol (or pie-chart) always gives -1pt.<br><br>';
                        break;

                    case 2:
                        Info = '<H3 align = "center"><b>Instructions for the third test (2/3)</b><br><br>'
                            + 'After confirming your choice (denoted C hereafter) the computer will draw a random lottery number (denoted L hereafter) between 0 and 100.<br>'
                            + 'If C is bigger than L, you win the reward with the probabilities associated to the symbol.<br>'
                            + 'If C is smaller than L, the program will spin a wheel of fortune and you will win a reward of +1 point with a probability of L%, otherwise you will lose -1 point.<br><br>'
                        break;

                    case 3:
                        Info = '<H3 align = "center"><b>Instructions for the third test (3/3)</b><br><br>'
                            + 'To sum up, the higher the percentage you give, the higher the chances are the outcome will be determined by the symbol or the pie-chart.<br><br>'
                            + 'Conversely, the lower the percentage, the higher the chances are the outcome will be determined by the random lottery number.<br><br>'
                            + 'Please note that the outcome of your choice will not be displayed on each trial.<br><br>'
                            + 'However, for each choice an outcome will be calculated and taken into account for the final payoff.<br><br>'
                            + 'At the end of the test you will be shown with the final payoff in terms of cumulated points and monetary bonus.<br><br>'
                        break;

                    case 4:
                        if (training) {
                            var trainstring = "Let's begin with the third training test!<br>";
                        } else {
                            var trainstring = "";
                        }
                        Info = '<H3 align = "center">' + trainstring + p;
                        break;
                }
                break;
        }

        $('#TextBoxDiv').html(Title + Info);

        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Back" value="Back" >\n\
            <input align="center" type="button"  class="btn btn-default" id="Next" value="Next" >\n\
            <input align="center" type="button"  class="btn btn-default" id="Start" value="Start!" ></div>';

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
                startElicitation(sessionNum, training, elicitationType, phaseNum, pageNum - 1);
            }

        });

        $('#Next').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            startElicitation(sessionNum, training, elicitationType, phaseNum, pageNum + 1);

        });

        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            if (training) {
                ready = '3...';
                steady = '2...';
                go = '1...';
            } else {
                ready = 'Ready...';
                steady = 'Steady...';
                go = 'Go!';
            }

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

    function endExperiment() {

        createDiv('Stage', 'TextBoxDiv');

        var points = totalReward;
        var pence = pointsToPence(points).toFixed(2);
        var pounds = pointsToPounds(points).toFixed(2);

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
                var Info = '<H3 align = "center">This experiment is composed of 4 phases.<br><br>'
                    + 'The first three phases consist in different cognitive tests.<br><br>'
                    + 'There will be a training session composed of shorter versions of the 3 phases before the actual experiment starts.<br>'
                    + '<br><br> </H3>';
                break;

            case 2:
                var Info = '<H3 align = "center">In addition of the fixed compensation provided by Profilic, you have been endowed with an additional 2.5 pounds. '
                    + '<br><br>Depending on your choices you can either double this endowment or lose it.<br><br>Following experimental economics methodological standards, no deception is involved concerning the calculation of the final payoff.'
                    + '<br> Across the three phases of the experiment, you can win a bonus up to ' + maxPoints + ' points = ' + pointsToPounds(maxPoints).toFixed(2) + ' pounds!';
                break;

            case 3:
                var Info = '<H3 align = "center"><b>Instructions for the first test (1/2)</b><br><br>'
                    + 'In each round you have to choose between one of two symbols displayed on either side of the screen.<br><br>'
                    + 'You can select one of the two symbols by left-clicking on it. <br><br>'
                    + 'After a choice, you can win/lose the following outcomes:<br><br>'
                    + '1 point = +' + pointsToPence(1).toFixed(2) + ' pence<br>'
                    + '-1 points = -' + pointsToPence(1).toFixed(2) + ' pence<br><br>'
                    + 'The outcome of your choice will appear in the location of the symbol you chose.<br><br></H3>';
                break;

            case 4:
                var Info = '<H3 align = "center"><b>Instructions for the first test (2/2)</b><br><br>'
                    + 'The different symbols are not equal in terms of outcome: one is in average more advantageous compared to the other in terms of points to be won.<br><br>'
                    + 'At the end of the test you will be shown with the final payoff in terms of cumulated points and monetary bonus.<br><br></H3>'

                break;

            case 5:
                var Info = '<H3 align = "center">Let' + "'s " + 'begin with the first training test!<br><br>'
                    + '<b>(Note : points won during the training do not count for the final payoff !)<br><br>'
                    + 'The word "ready" will be displayed before the actual game starts.</H3></b><br><br>';
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

                // playQuestionnaire(1);
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

    // Questionnaires
    // ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ //

    function startQuestionnaire() {

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H3 align = "center">QUESTIONNAIRE</H3>';

        var startBut;
        startBut = '"Start"';
        var Info = '<H3 align = "center">You will now have to answer a few questions.<br><br>This won\'t take more than a few more minutes.<br><br>Your answers remain anonymous and will not be disclosed.<br><br>' +
            'Note that the experiment will be considered completed (and the payment issued) only if the questionnaires are correctly filled.<br><br>' +
            'Please click "Start" when you are ready.</H3><br><br>';

        $('#TextBoxDiv').html(Title + Info);

        var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Start" value=' + startBut + ' ></div>';

        $('#Bottom').html(Buttons);

        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            playQuestionnaire_CRT(1);
        });
    }

    function playQuestionnaire_CRT(QuestNum) {

        var NumQuestions = 7; /*mettre a jour le nombre de pages (questions) via le script*/

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center"></H2>';
        var Info;
        var questID;
        var itemNum;
        var answer;
        var answer_value;

        var Question_time;
        var Reaction_time;

        var nb_skip = 7;


        switch (QuestNum) {

            case 1:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'A bat and a ball cost £1.10 in total. The bat costs £1.00 more than the ball. How much does the ball cost?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var contents = new Array();
                contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> 5 pence </label><br>';
                contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> 10 pence </label><br>';
                contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> 9 pence </label><br>';
                contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 1 pence </label><br>';
                contents = shuffle(contents);
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CRT-7";
                itemNum = 1;

                break;

            case 2:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var contents = new Array();
                contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> 5 minutes </label><br>';
                contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> 100 minutes </label><br>';
                contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> 20 minutes </label><br>';
                contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 500 minutes </label><br>';
                contents = shuffle(contents);
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CRT-7";
                itemNum = 2;

                break;

            case 3:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'In a lake, there is a patch of lily pads. Every day, the patch doubles in size. If it takes 48 days for the patch to cover the entire lake, how long would it take for the patch to cover half of the lake?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var contents = new Array();
                contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> 47 days </label><br>';
                contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> 24 days </label><br>';
                contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> 12 days </label><br>';
                contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 36 days </label><br>';
                contents = shuffle(contents);
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CRT-7";
                itemNum = 3;

                break;

            case 4:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'If John can drink one barrel of water in 6 days, and Mary can drink one barrel of water in 12 days, how long would it take them to drink one barrel of water together?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var contents = new Array();
                contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> 4 days </label><br>';
                contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> 9 days </label><br>';
                contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> 12 days </label><br>';
                contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 3 days </label><br>';
                contents = shuffle(contents);
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CRT-7";
                itemNum = 4;

                break;

            case 5:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Jerry received both the 15th highest and the 15th lowest mark in the class. How many students are in the class?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var contents = new Array();
                contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> 29 students </label><br>';
                contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> 30 students </label><br>';
                contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> 1 student </label><br>';
                contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 15 students </label><br>';
                contents = shuffle(contents);
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CRT-7";
                itemNum = 5;

                break;

            case 6:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'A man buys a pig for £60, sells it for £70, buys it back for £80, and sells it finally for £90. How much has he made?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var contents = new Array();
                contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> 20 pounds </label><br>';
                contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> 10 pounds </label><br>';
                contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> 0 pounds </label><br>';
                contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> 30 pounds </label><br>';
                contents = shuffle(contents);
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CRT-7";
                itemNum = 6;

                break;

            case 7:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Simon decided to invest £8,000 in the stock market one day early in 2008.  Six months after he invested, on July 17, the stocks he had purchased were down 50%. ' +
                    'Fortunately for Simon, from July 17 to October 17, the stocks he had purchased went up 75%. At this point, Simon:' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var contents = new Array();
                contents[0] = '<input type= "radio" id="3" name= "answer" value= 2> <label for="3"> has lost money. </label><br>';
                contents[1] = '<input type= "radio" id="2" name= "answer" value= 1> <label for="2"> is ahead of where he began. </label><br>';
                contents[2] = '<input type= "radio" id="1" name= "answer" value= 0> <label for="1"> has broken even in the stock market. </label><br>';
                contents[3] = '<input type= "radio" id="0" name= "answer" value= 0> <label for="0"> it cannot be determined. </label><br>';
                contents = shuffle(contents);
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    contents[0] + contents[1] + contents[2] + contents[3] + '<br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "CRT-7";
                itemNum = 7;

                break;

            default:
                break;
        }

        var Buttons = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"> <input type="button"  class="btn btn-default" id="Next" value="Next" > </div><div class="col-xs-1 col-md-1"></div></div>';


        $('#TextBoxDiv').html(Title + Info + Ticks);

        Question_time = (new Date()).getTime();

        $('#Bottom').html(Buttons);


        $('#Next').click(function () {

            if ($("input:radio:checked").length < 1) {
                alert('Please select one answer.');

            } else {

                Reaction_time = (new Date()).getTime();
                answer = parseInt($("input:radio:checked").attr('value')); //console.log(answer)
                answer_value = $("input:radio:checked").val();

                // SendQuestDataDB(0);

                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();

                if (answer == -1) {
                    QuestNum += nb_skip + 1;
                } else {
                    QuestNum++;
                }

                if (QuestNum <= NumQuestions) {
                    playQuestionnaire_CRT(QuestNum);
                } else {
                    playQuestionnaire_SES(1);
                }
            }
            ;
        });

        function SendQuestDataDB(call) {
            clog = 'EXP: ' + expName + ' $ EXPID: ' + expID + ' $ ID: ' + subID + ' $ QUESTIONNAIRE: ' + questID + ' $ NUMBER: ' + 1 + ' $ ITEM: ' + itemNum + ' $ ANSWER: ' + answer + ' $ VAL:' + answer_value + ' $ RTIME: ' + (Reaction_time - Question_time);
            /*console.log(clog)*/

            $.ajax({
                type: 'POST',
                data: {
                    exp: expName,
                    expID: expID,
                    id: subID,
                    qid: questID,
                    qnum: 1,
                    item: itemNum,
                    ans: answer,
                    val: answer_value,
                    reaction_time: Reaction_time - Question_time
                },
                async: true,
                url: 'InsertQuestionnaireDataDB.php',
                /*dataType: 'json',*/
                success: function (r) {
                    clog = 'questionnaire_data $ ' + clog + ' $ dbcall success \n';
                    log += clog;

                    if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                        SendQuestDataDB(call + 1);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    clog = 'questionnaire_data $ ' + clog + ' $ dbcall failure \n';
                    log += clog;

                    if (call + 1 < maxDBCalls) {
                        SendQuestDataDB(call + 1);
                    }
                }
            });
        }
    }

    function playQuestionnaire_SES(QuestNum) {

        var NumQuestions = 13;

        createDiv('Stage', 'TextBoxDiv');

        var Title = '<H2 align = "center"></H2>';
        var Info;
        var questID;
        var itemNum;
        var answer;
        var answer_value;

        var Question_time;
        var Reaction_time;

        var nb_skip = 0;

        var Buttons = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"> <input type="button"  class="btn btn-default" id="Next" value="Next" > </div><div class="col-xs-1 col-md-1"></div></div>';

        switch (QuestNum) {

            case 1:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'The following questions measure your perception of your childhood and your current adult life. Please indicate your agreement with these statements. Please read each statement carefully, and then indicate how much you agree with the statement.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> I am ready. </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13_instruction";
                itemNum = 1;

                break;

            case 2:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'When I was growing up, someone in my house was always yelling at someone else.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 1;

                break;

            case 3:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Some of the punishments I received when I was a child now seem too harsh to me.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 2;

                break;

            case 4:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'I guess you could say that I wasn’t treated as well as I should have been at home.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 3;

                break;

            case 5:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'When I was younger than 10, things were often chaotic in my house.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 4;

                break;

            case 6:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'When I was younger than 10, people often moved in and out of my house on a pretty random basis.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 5;

                break;

            case 7:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'When I was younger than 10, I had a hard time knowing what my parents or other people in my house were going to say or do from day-to-day.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 6;

                break;

            case 8:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'When I was younger than 10, my family usually had enough money for things when I was growing up.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 7;

                break;

            case 9:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'When I was younger than 10, I grew up in a relatively wealthy neighborhood.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 8;

                break;

            case 10:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'When I was younger than 10, I felt relatively wealthy compared to the other kids in my school.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 9;

                break;

            case 11:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Now as an adult, I have enough money to buy things I want.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 10;

                break;

            case 12:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Now as an adult, I don\'t need to worry too much about paying my bills.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 11;

                break;

            case 13:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Now as an adult, I don\'t think I\'ll have to worry about money too much in the future.' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="1" name= "answer" value= 1> <label for="1"> 1 Strongly disagree </label><br>' +
                    '<input type= "radio" id="2" name= "answer" value= 2> <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="3" name= "answer" value= 3> <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="4" name= "answer" value= 4> <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="5" name= "answer" value= 5> <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="6" name= "answer" value= 6> <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="7" name= "answer" value= 7> <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="8" name= "answer" value= 8> <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="9" name= "answer" value= 9> <label for="9"> 9 Strongly agree </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 12;

                break;

            case 14:
                var Info = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7"><H3>' +
                    'Think of this ladder as representing where people stand in their communities. ' +
                    'People define community in different ways: please define it in whatever way is most meaningful to you.<br>' +
                    'At the top of the ladder are the people who have the highest standing in their community. At the bottom are the people who have the lowest standing in their community.<br><br>' +
                    'Where would you place yourself on this ladder?' +
                    '</h3><br><br></div><div class="col-xs-1 col-md-1"></div></div>';
                var Ticks = '<div class="row"><div class="col-xs-3 col-md-3"></div><div id = "Middle" class="col-xs-7 col-md-7">' +
                    '<input type= "radio" id="10" name= "answer" value= 10> <label for="10"> 10 Top - highest standing </label><br>' +
                    '<input type= "radio" id="9"  name= "answer" value= 9>  <label for="9"> 9 </label><br>' +
                    '<input type= "radio" id="8"  name= "answer" value= 8>  <label for="8"> 8 </label><br>' +
                    '<input type= "radio" id="7"  name= "answer" value= 7>  <label for="7"> 7 </label><br>' +
                    '<input type= "radio" id="6"  name= "answer" value= 6>  <label for="6"> 6 </label><br>' +
                    '<input type= "radio" id="5"  name= "answer" value= 5>  <label for="5"> 5 </label><br>' +
                    '<input type= "radio" id="4"  name= "answer" value= 4>  <label for="4"> 4 </label><br>' +
                    '<input type= "radio" id="3"  name= "answer" value= 3>  <label for="3"> 3 </label><br>' +
                    '<input type= "radio" id="2"  name= "answer" value= 2>  <label for="2"> 2 </label><br>' +
                    '<input type= "radio" id="1"  name= "answer" value= 1>  <label for="1"> 1 Bottom - lower standing </label><br><br><br><br>' +
                    '</div><div class="col-xs-1 col-md-1"></div></div>';
                questID = "SES-13";
                itemNum = 13;

                break;
            default:

                break;

        }

        $('#TextBoxDiv').html(Title + Info + Ticks);

        Question_time = (new Date()).getTime();

        $('#Bottom').html(Buttons);


        $('#Next').click(function () {

            if ($("input:radio:checked").length < 1) {

                alert('Please select one answer.');

            } else {

                Reaction_time = (new Date()).getTime();
                answer = parseInt($("input:radio:checked").attr('id')); //console.log(answer)
                answer_value = $("input:radio:checked").val();

                // SendQuestDataDB(0);

                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();

                if (answer == -1) {
                    QuestNum += nb_skip + 1;
                } else {
                    QuestNum++;
                }

                if (QuestNum <= NumQuestions + 1) {
                    playQuestionnaire_SES(QuestNum);
                } else {
                    endExperiment();
                }
            }
        });

        function SendQuestDataDB(call) {
            clog = 'EXP: ' + expName + ' $ EXPID: ' + expID + ' $ ID: ' + subID + ' $ QUESTIONNAIRE: ' + questID + ' $ NUMBER: ' + 5 + ' $ ITEM: ' + itemNum + ' $ ANSWER: ' + answer + ' $ VAL:' + answer_value + ' $ RTIME: ' + (Reaction_time - Question_time);
            /*console.log(clog)*/

            $.ajax({
                type: 'POST',
                data: {
                    exp: expName,
                    expID: expID,
                    id: subID,
                    qid: questID,
                    qnum: 5,
                    item: itemNum,
                    ans: answer,
                    val: answer_value,
                    reaction_time: Reaction_time - Question_time
                },
                async: true,
                url: 'InsertQuestionnaireDataDB.php',
                /*dataType: 'json',*/
                success: function (r) {
                    clog = 'questionnaire_data $ ' + clog + ' $ dbcall success \n';
                    log += clog;

                    if (r[0].ErrorNo > 0 && call + 1 < maxDBCalls) {
                        SendQuestDataDB(call + 1);
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                    clog = 'questionnaire_data $ ' + clog + ' $ dbcall failure \n';
                    log += clog;

                    if (call + 1 < maxDBCalls) {
                        SendQuestDataDB(call + 1);
                    }
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

    function isFloat(n) {
        return Number(n) === n && n % 1 !== 0;
    }

    function isString(x) {
        return Object.prototype.toString.call(x) === "[object String]"
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

    function goFullscreen() {
        createDiv('Stage', 'TextBoxDiv');
        var Title = '<H3 align = "center">To continue the experiment, you must enable fullscreen.</H3><br>';
        var Button = '<div align="center"><input align="center" id="fullscreen" type="button" value="Enable fullscreen" class="btn btn-default" onclick="openFullscreen();"></div>';

        $('#TextBoxDiv').html(Title);
        $('#Bottom').html(Button);

        var elem = document.documentElement;
        var button = document.getElementById('fullscreen');

        button.onclick = function () {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) { /* Firefox */
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) { /* IE/Edge */
                elem.msRequestFullscreen();
            }
            getUserID();
        }
    }
});
