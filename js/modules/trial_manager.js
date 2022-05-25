import { sendToDB } from "./request.js"
import { randint, shuffle, range } from "./utils.js";
import { GUI } from "./gui.js";
import { RandomSelector } from "./random_selector.js";


export class ChoiceManager {
    /*
    Manage trials with 2 options
    Private methods are prefixed with _
     */
    constructor({
        exp,
        trialObj,
        imgObj,
        sessionNum,
        phaseNum,
        feedbackDuration,
        completeFeedback,
        showFeedback,
        elicitationType,
        conditionObj,
        feedbackObj,
        maxTrials,
        nextFunc,
        nextParams,
        outcomeType
    } = {}) {

        // members
        this.exp = exp;

        this.trialObj = trialObj;
        this.feedbackObj = feedbackObj;
        this.imgObj = imgObj;

        this.outcomeType = outcomeType;

        this.sessionNum = sessionNum;
        if (sessionNum >= 0) {
            GUI.setActiveCurrentStep('experiment' + (sessionNum + 1));
        } else {
            GUI.setActiveCurrentStep('training');
        }
        this.phaseNum = phaseNum;

        this.feedbackDuration = feedbackDuration;
        this.completeFeedback = completeFeedback;
        this.beforeFeedbackDuration = this.exp.beforeFeedbackDuration;
        this.showFeedback = showFeedback;
        this.elicitationType = elicitationType;

        this.nextFunc = nextFunc;
        this.nextParams = nextParams;


        // initGameStageDiv non parametric variables
        this.trialNum = 0;

        if (!maxTrials) {
            this.nTrial = trialObj.length;
        } else {
            this.nTrial = maxTrials;
        }

        this.invertedPosition = shuffle(
            Array.from(Array(this.nTrial), x => randint(0, 1))
        );

        if (this.exp.isTesting) {
            this._isTesting();
        }

        this.skip = undefined;
        this.skipEnabled = true;

        this.rd = new RandomSelector({
            exp: this.exp,
            trialObj: this.trialObj,
            imgObj: this.imgObj,
            sessionNum: this.sessionNum,
            phaseNum: this.phaseNum,
            nTrial: this.nTrial,
            feedbackObj: this.feedbackObj,
            nextFunc: nextFunc,
            nextParams: nextParams,
        });

    }

    /* =================== public methods ================== */

    run() {

        GUI.initGameStageDiv();

        this.skipEnabled = true;

        if (this.exp.fromCookie) {
            if (this.exp.trialNum != undefined)
                this.trialNum = this.exp.trialNum;
            this.exp.fromCookie = false;
        } else {
            this.exp.trialNum = this.trialNum;
            localStorage['exp'] = JSON.stringify(this.exp);
        }

        let trialObj = this.trialObj[this.trialNum];

        let presentationTime = (new Date()).getTime();

        trialObj["presentationTime"] = presentationTime;

        GUI.displayOptions(
            trialObj["file1"],
            trialObj["file2"],
            this.imgObj,
            this.feedbackObj,
            this.invertedPosition[this.trialNum]
        );

        let clickEnabled = true;

        $('#canvas1').click({ obj: this }, function (event) {
            if (!clickEnabled)
                return;
            clickEnabled = false;
            event.data.obj.skipEnabled = false;
            $('.clickable').removeClass('clickable');
            this.style.borderColor = "black";
            this.style.borderWidth = "10px";
            event.data.obj._clickEvent(1, trialObj);
        });

        $('#canvas2').click({ obj: this }, function (event) {
            if (!clickEnabled)
                return;
            clickEnabled = false;
            event.data.obj.skipEnabled = false;
            this.style.borderWidth = "10px";
            this.style.borderColor = "black";
            $('.clickable').removeClass('clickable');
            event.data.obj._clickEvent(2, trialObj);
        });

    };


    /* =================== private methods ================== */
    _isTesting() {
        GUI.insertSkipButton(this, this.nTrial, this.trialNum);
    }

    _clickEvent(choice, params) {

        let choiceTime = (new Date()).getTime();
        let reactionTime = choiceTime - params["presentationTime"];
        let invertedPosition = this.invertedPosition[this.trialNum];
        let leftRight =
            +((invertedPosition && (choice === 1)) || (!invertedPosition && (choice === 2)));

        let option1Type = params['option1Type'];
        let option2Type = params['option2Type'];

        let isCatchTrial = +(params['isCatchTrial']);

        let condition = params['condition'];

        let contIdx1 = params["contIdx1"];
        let contIdx2 = params["contIdx2"];

        let p1 = params['p1'];
        let p2 = params['p2'];

        let symL;
        let symR;

        if (!invertedPosition) {
            symL = params['file1'];
            symR = params['file2'];
        } else {
            symL = params['file2'];
            symR = params['file1'];
        }

        let [reward1, reward2, ev1, ev2, thisReward, otherReward, correctChoice] = this._getReward(choice, params);

        if (this.exp.isTesting)
            GUI.setOutcomes(thisReward, otherReward);

        if (this.outcomeType) {
            this._showReward(
                ev1 + '_' + this.outcomeType,
                ev2 + '_' + this.outcomeType,
                thisReward, choice);
        } else {
            this._showReward(
                reward1 + '',
                reward2 + '',
                thisReward, choice);
        }

        if (this.exp.online) {
            sendToDB(0,
                {
                    exp: this.exp.expName,
                    expID: this.exp.expID,
                    id: this.exp.subID,
                    test: +(this.exp.isTesting),
                    trial: this.trialNum,
                    elicitation_type: this.elicitationType,
                    cont_idx_1: contIdx1,
                    cont_idx_2: contIdx2,
                    condition: condition,
                    symL: symL, // sym left filename
                    symR: symR, // sym right filename
                    choice: choice,
                    correct_choice: correctChoice,
                    outcome: thisReward,
                    cf_outcome: otherReward,
                    choice_left_right: leftRight,
                    reaction_time: reactionTime,
                    reward: this.exp.totalReward,
                    session: this.sessionNum,
                    p1: p1[1],
                    p2: p2[1],
                    option1: option1Type,
                    option2: option2Type,
                    ev1: Math.round(params["ev1"] * 100) / 100,
                    ev2: Math.round(params["ev2"] * 100) / 100,
                    iscatch: isCatchTrial,
                    inverted: invertedPosition,
                    choice_time: choiceTime - this.exp.initTime,
                    elic_distance: -1,
                    p_lottery: -1
                },
                'php/InsertLearningDataDB.php'
            );
        }

        setTimeout(function (event) {
            event.obj.next()
        }, this.feedbackDuration + this.beforeFeedbackDuration * (+(this.showFeedback)), { obj: this });
    }

    _getReward(choice, params) {

        let p1 = params["p1"];
        let p2 = params["p2"];
        let ev1 = params["ev1"];
        let ev2 = params["ev2"];

        let r1 = params["r1"];
        let r2 = params["r2"];

        ev1 = Math.round(ev1 * 100) / 100;
        ev2 = Math.round(ev2 * 100) / 100;

        let reward1;
        let reward2;
        let thisReward;
        let otherReward;
        let correctChoice;

        if ([0, 2].includes(this.outcomeType)) {
            reward1 = r1[+(Math.random() < p1[1])];
            reward2 = r2[+(Math.random() < p2[1])];
        } else {
            reward1 = ev1;
            reward2 = ev2;
        }

        thisReward = [reward2, reward1][+(choice === 1)];
        otherReward = [reward1, reward2][+(choice === 1)];


        // debugger;
        this.exp.outcomeList[this.sessionNum][this.phaseNum].push(thisReward);

        let invertedPosition = this.invertedPosition[this.trialNum];
        let leftRight =
            +((invertedPosition && (choice === 1)) || (!invertedPosition && (choice === 2)));

        let symL;
        let symR;

        if (!invertedPosition) {
            symL = params['file1'];
            symR = params['file2'];
        } else {
            symL = params['file2'];
            symR = params['file1'];
        }

        this.exp.optList[this.sessionNum][this.phaseNum].push([symL, symR][+(leftRight)]);

        correctChoice = [+(ev2 >= ev1), +(ev1 >= ev2)][+(choice === 1)];


        // if session is not training add to total reward
        // this.exp.totalReward += thisReward * !([-1, -2].includes(this.sessionNum));


        return [reward1, reward2, ev1, ev2, thisReward, otherReward, correctChoice];

    };

    _showReward(reward1, reward2, thisReward, choice) {
        GUI.showFeedback({
            completeFeedback: this.completeFeedback,
            showFeedback: this.showFeedback,
            feedbackDuration: this.feedbackDuration,
            beforeFeedbackDuration: this.exp.beforeFeedbackDuration,
            feedbackObj: this.feedbackObj,
            choice: choice,
            thisReward: thisReward,
            reward1: reward1,
            reward2: reward2
        });

    }

    next(nTrial = undefined) {
        if (nTrial !== undefined) {
            GUI.hideOptions();
            this.trialNum = nTrial;
            setTimeout(function (event) {
                if (nTrial === event.obj.nTrial) {
                    event.obj.next();
                } else {
                    event.obj.run();
                }
            }, 500, { obj: this });
            return;
        }
        this.trialNum++;
        if (this.trialNum < this.nTrial) {
            GUI.hideOptions();
            setTimeout(function (event) {
                event.obj.run();
            }, 500, { obj: this });
        } else {

            this.rd.run()
        }
    };
}


export class SliderManager {

    constructor({
        exp,
        trialObj,
        imgObj,
        feedbackObj,
        sessionNum,
        phaseNum,
        feedbackDuration,
        elicitationType,
        nextFunc,
        nextParams
    } = {}) {
        // members
        this.exp = exp;
        this.trialObj = trialObj;
        this.nTrial = trialObj.length;
        this.feedbackObj = feedbackObj;

        this.sessionNum = sessionNum;
        if (sessionNum >= 0) {
            GUI.setActiveCurrentStep('experiment' + (sessionNum + 1));
        } else {
            GUI.setActiveCurrentStep('training');
        }
        this.phaseNum = phaseNum;

        this.imgObj = imgObj;
        this.trialNum = 0;

        this.invertedPosition = shuffle(
            Array.from(Array(this.nTrial), x => randint(0, 1))
        );

        this.feedbackDuration = feedbackDuration;

        this.elicitationType = elicitationType;

        this.nextFunc = nextFunc;
        this.nextParams = nextParams;

        if (this.exp.isTesting) {
            this._isTesting();
        }
        this.skip = undefined;
        this.skipEnabled = true;
    }

    /* =================== public methods ================== */

    run() {

        GUI.initGameStageDiv();

        if (this.exp.fromCookie) {
            if (this.exp.trialNum != undefined)
                this.trialNum = this.exp.trialNum;
            this.exp.fromCookie = false;
        } else {
            this.exp.trialNum = this.trialNum;
            localStorage['exp'] = JSON.stringify(this.exp);
        }

        this.skipEnabled = true;

        let trialObj = this.trialObj[this.trialNum];

        let presentationTime = (new Date()).getTime();

        let params = {
            stimIdx: trialObj['file1'],
            contIdx: trialObj['contIdx1'],
            p1: trialObj['p1'],
            ev1: trialObj['ev1'],
            r1: trialObj['r1'],
            isCatchTrial: trialObj['isCatchTrial'],
            option1Type: trialObj['option1Type'],
            presentationTime: presentationTime
        };


        let initValue = range(25, 75, 5)[Math.floor(Math.random() * 10)];
        let clickEnabled = true;

        let slider = GUI.displayOneOption(
            params['stimIdx'],
            this.imgObj,
            this.feedbackObj,
            initValue,
            true,
            'What are the odds this symbol gives a +1?');

        GUI.listenOnSlider({ obj: this, slider: slider }, function (event) {
            if (clickEnabled) {
                clickEnabled = false;
                event.data.obj.skipEnabled = false;
                let choice = slider.value;
                event.data.obj._clickEvent(choice, params);
            }
        });

    };

    /* =================== private methods ================== */
    _isTesting() {
        GUI.insertSkipButton(this, this.nTrial, this.trialNum);
    }

    _clickEvent(choice, params) {

        let choiceTime = (new Date()).getTime();
        let reactionTime = choiceTime - params["presentationTime"];
        let invertedPosition = this.invertedPosition[this.trialNum];
        let ev1 = params["ev1"];
        let p1 = params["p1"][1];
        let contIdx = params['contIdx'];
        let stimIdx = params['stimIdx'];
        let isCatchTrial = +(params["isCatchTrial"]);
        let option1Type = params['option1Type'];

        let [correctChoice, thisReward,
            otherReward, pLottery, elicDistance] = this._getReward(choice, params);

        if (this.exp.online) {
            sendToDB(0,
                {
                    exp: this.exp.expName,
                    expID: this.exp.expID,
                    id: this.exp.subID,
                    test: +(this.exp.isTesting),
                    trial: this.trialNum,
                    elicitation_type: this.elicitationType,
                    cont_idx_1: contIdx,
                    cont_idx_2: -1,
                    condition: -1,
                    symL: stimIdx,
                    symR: -1,
                    choice: choice,
                    correct_choice: correctChoice,
                    outcome: thisReward,
                    cf_outcome: otherReward,
                    choice_left_right: -1,
                    reaction_time: reactionTime,
                    reward: this.exp.totalReward,
                    session: this.sessionNum,
                    p1: p1,
                    p2: -1,
                    option1: option1Type,
                    option2: -1,
                    ev1: Math.round(ev1 * 100) / 100,
                    ev2: -1,
                    iscatch: isCatchTrial,
                    inverted: invertedPosition,
                    choice_time: choiceTime - this.exp.initTime,
                    elic_distance: elicDistance,
                    p_lottery: pLottery
                },
                'php/InsertLearningDataDB.php'
            );
        }

        this.next();

    }

    _getReward(choice, params) {

        let p1 = params["p1"];
        let r1 = params["r1"];
        let thisReward = undefined;

        let pLottery = Math.random().toFixed(2);
        if (pLottery < (choice / 100)) {
            thisReward = r1[+(Math.random() < p1[1])];
        } else {
            thisReward = r1[+(Math.random() < pLottery)]
        }
        let otherReward = -1;

        let correctChoice = +((choice / 100) === p1[1]);
        let elicDistance = Math.abs(choice - p1[1] * 100);

        this.exp.sumReward[this.phaseNum] += thisReward;

        // this.exp.totalReward += thisReward * !([-1, -2].includes(this.sessionNum));

        return [correctChoice, thisReward, otherReward, pLottery, elicDistance]

    };

    next(nTrial = undefined) {
        if (nTrial !== undefined) {
            GUI.hideOptions();
            this.trialNum = nTrial;
            setTimeout(function (event) {
                if (nTrial === event.obj.nTrial) {
                    event.obj.next();
                } else {
                    event.obj.run();
                }
            }, 500, { obj: this });
            return;
        }
        this.trialNum++;
        if (this.trialNum < this.nTrial) {
            setTimeout(function (event) {
                GUI.hideOptions();
                setTimeout(function (event) {
                    event.obj.run();
                }, 500, { obj: event.obj });
            }, this.feedbackDuration, { obj: this });
        } else {
            GUI.hideSkipButton();
            setTimeout(function (event) {
                $('#stim-box').fadeOut(500);
                setTimeout(function (event) {
                    $('#Stage').empty();
                    $('#Bottom').empty();
                    event.obj.nextFunc(event.obj.nextParams);
                }, 500, { obj: event.obj })
            }, this.feedbackDuration, { obj: this }
            );
        }
    };
}
