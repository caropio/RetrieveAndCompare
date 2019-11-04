import {range, shuffle, getOS, getBrowser, createCode} from './utils.mjs';


export class ExperimentParameters {
    /***

     Experiment initializer
     All the parameters for
     the experiment are defined here
     ***/

    constructor ({
        online,
        isTesting,
        completeFeedback,
        maxPoints,
        expName,
        feedbackDuration,
        maxTrainingNum,
        compLink,
        imgPath,
        howMuchPenceForOnePoint,
        nTrialPerCondition,
        nTrialPerConditionTraining,
        nCond}={}) {
        // TODO:
        // Initial Experiment Parameters
        // ===================================================================== // 
        this.online = online;
        this.completeFeedback = completeFeedback;
        this.expName = expName;
        this.isTesting = isTesting;

        this.maxPoints = maxPoints; //98 

        this.feedbackDuration = feedbackDuration;

        this.sumReward = [0, 0, 0, 0, 0, 0, 0];

        this.totalReward = 0;

        this.maxTrainingNum = maxTrainingNum;


        this.initTime = (new Date()).getTime();

        this.expID = createCode();

        this.browsInfo = getOS() + ' - ' + getBrowser();

        this.subID = undefined;

        this.compLink = compLink;//'https://app.prolific.ac/submissions/complete?cc=RNFS5HP5';

        // define compensations
        // ===================================================================== //
        // one point equals 250 pence / maxPoints
        let conversionRate = (howMuchPenceForOnePoint / this.maxPoints).toFixed(2);
        this.pointsToPence = points => points * conversionRate;
        this.penceToPounds = pence => pence / 100;
        this.pointsToPounds = points => this.penceToPounds(this.pointsToPence(points));

        // init
        this._initConditionsAndContingencies();
        this._loadImg(imgPath);
        this._defineConditionArrays(nTrialPerCondition, nTrialPerConditionTraining, nCond);
        this._defineTrialObj(nCond);

    }

    _initConditionsAndContingencies() {
        this.cont = [];
        this.probs = [];
        this.rewards = [];
        this.ev = [];
        this.lotteryCont = [];
        this.lotteryEV = [];
        this.rew = undefined;


        // Define all possible probabilities and rewards
        // structure is [lose, win]
        // ===================================================================== //
        this.cont[0] = [1., 0.];
        this.cont[1] = [0.9, 0.1];
        this.cont[2] = [0.8, 0.2];
        this.cont[3] = [0.7, 0.3];
        this.cont[4] = [0.6, 0.4];
        this.cont[5] = [0.5, 0.5];
        this.cont[6] = [0.4, 0.6];
        this.cont[7] = [0.3, 0.7];
        this.cont[8] = [0.2, 0.8];
        this.cont[9] = [0.1, 0.9];
        this.cont[10] = [0., 1.];
        // only magnitudes in the experiment
        this.rew = [-1, 1];


        // Define Learning using rew and cont idx
        // structure is [option 1, option 2]
        // option 1 is always the best here
        // ===================================================================== //
        this.rewards[0] = [this.rew, this.rew];
        this.probs[0] = [9, 1];

        this.rewards[1] = [this.rew, this.rew];
        this.probs[1] = [8, 2];

        this.rewards[2] = [this.rew, this.rew];
        this.probs[2] = [7, 3];

        this.rewards[3] = [this.rew, this.rew];
        this.probs[3] = [6, 4];

        // compute ev learning
        for (let i = 0; i < this.probs.length; i++) {

            let p1 = this.cont[this.probs[i][0]];
            let p2 = this.cont[this.probs[i][1]];

            this.ev.push([
                math.round(math.multiply(this.rewards[i][0], p1), 2),
                math.round(math.multiply(this.rewards[i][1], p2), 2)
            ]);
        }

        // Define lottery contingencies
        // ===================================================================== //
        this.lotteryRew = [-1, 1];
        // lottery cont is all possible cont
        this.lotteryCont = this.cont;

        // compute ev lottery
        for (let i = 0; i < this.lotteryCont.length; i++) {
            this.lotteryEV[i] = math.round(
                math.multiply(this.lotteryRew, this.lotteryCont[i]), 2);
        }
    }

    _defineConditionArrays(nTrialPerCondition, nTrialPerConditionTraining, nCond) {

        // Define conditions
        // ===================================================================== //
        this.expCondition = [];
        this.trainingCondition = [];

        this.learningStim = [];
        this.learningStimTraining = [];

        // range cond for each session
        let cond = shuffle(range(0, nCond - 1));

        for (let i = 0; i < cond.length; i++) {
            this.expCondition.push(
                Array(nTrialPerCondition).fill(cond[i]).flat()
            );
        }
        this.expCondition = this.expCondition.flat();


        // training conditions
        for (let i = 0; i < cond.length; i++) {
            this.trainingCondition.push(
                Array(nTrialPerConditionTraining).fill(cond[i]).flat()
            );
        }
        this.trainingCondition = this.trainingCondition.flat();

        // EXP
        // ===================================================================== //
        // shuffle the options to randomize context content
        this.availableOptions = shuffle(this.availableOptions);
        this.contexts = [];

        for (let i = 0; i < nCond * 2; i += 2) {
            this.contexts.push([
                this.availableOptions[i], this.availableOptions[i + 1]
            ]);
        }

        // shuffle contexts
        this.contexts = shuffle(this.contexts);

        // Same for training
        this.trainingOptions = shuffle(this.trainingOptions);
        this.trainingContexts = [];
        for (let i = 0; i < nCond * 2; i += 2) {
            this.trainingContexts.push([
                this.trainingOptions[i], this.trainingOptions[i + 1]
            ]);
        }

        this.trainingContexts = shuffle(this.trainingContexts);
    }

    _defineTrialObj(nCond) {

        // define catch trials
        // ===================================================================== //
        // ===================================================================== //
        // using cont idx
        let catchTrialsTemp = shuffle([
            [1, 9],
            [2, 9],
            [3, 9],
            [1, 8],
            [2, 8],
            [3, 8],
            [0, 10],
            [1, 7],
            [2, 7]
        ]);

        let catchTrials = [];
        for (let i = 0; i < catchTrialsTemp.length; i++) {

            let contIdx1 = catchTrialsTemp[i][0];
            let contIdx2 = catchTrialsTemp[i][1];

            let ev1 = this.lotteryEV[contIdx1];
            let ev2 = this.lotteryEV[contIdx2];

            let file1 = ev1.toString();
            let file2 = ev2.toString();

            let p1 = this.lotteryCont[contIdx1];
            let p2 = this.lotteryCont[contIdx2];

            let isCatchTrial = true;

            catchTrials[i] = [
                file1, file2, contIdx1, contIdx2, p1, p2, ev1, ev2, isCatchTrial
            ];
        }

        // Learning Phase -- Trial obj definition
        // ===================================================================== //
        // ===================================================================== //

        for (let i = 0; i < this.expCondition.length; i++) {

            let idx = this.expCondition[i];

            let contIdx1 = this.probs[idx][0];
            let contIdx2 = this.probs[idx][1];

            let [file1, file2] = this.contexts[idx];

            let ev1 = this.ev[contIdx1];
            let ev2 = this.ev[contIdx2];

            let p1 = this.cont[contIdx1];
            let p2 = this.cont[contIdx2];

            let isCatchTrial = false;

            this.learningStim.push(
                [file1, file2, contIdx1, contIdx2, p1, p2, ev1, ev2, isCatchTrial]
            );

        }

        for (let i = 0; i < this.trainingCondition.length; i++) {

            let idx = this.trainingCondition[i];

            let contIdx1 = this.probs[idx][0];
            let contIdx2 = this.probs[idx][1];

            let [file1, file2] = this.trainingContexts[idx];

            let ev1 = this.ev[contIdx1];
            let ev2 = this.ev[contIdx2];

            let p1 = this.cont[contIdx1];
            let p2 = this.cont[contIdx2];

            let isCatchTrial = false;

            this.learningStimTraining.push(
                [file1, file2, contIdx1, contIdx2, p1, p2, ev1, ev2, isCatchTrial]
            );

        }

        // Elicitation Phase -- Description experience + slider trial obj definition
        // ===================================================================== //
        // ===================================================================== //

        // Training
        this.elicitationStimTraining = [];
        this.elicitationStimEVTraining = [];
        let catchTrialIdx = 0;

        // Training
        // ===================================================================== //
        for (let i = 0; i < nCond; i++) {

            let [file1, file2] = this.trainingContexts[i];

            let contIdx1 = this.probs[i][0];
            let contIdx2 = this.probs[i][1];

            let ev1 = this.ev[contIdx1];
            let ev2 = this.ev[contIdx2];

            let p1 = this.cont[contIdx1];
            let p2 = this.cont[contIdx2];

            let isCatchTrial = false;

            this.elicitationStimTraining.push(
                [file1, contIdx1, p1, ev1, isCatchTrial]
            );

            this.elicitationStimTraining.push(
                [file2, contIdx2, p2, ev2, isCatchTrial]
            );

            // mix lotteries and stim 1
            let temp = [];
            for (let j = 0; j < this.lotteryCont.length; j++) {

                let lotteryFile = this.lotteryEV[j].toString();
                let lotteryContIdx = j;
                let lotteryEV = this.lotteryEV[j];
                let lotteryP = this.lotteryCont[j];

                temp.push([
                    file1, lotteryFile, contIdx1, lotteryContIdx, p1, lotteryP, ev1, lotteryEV
                ]);
            }

            this.elicitationStimEVTraining = this.elicitationStimEVTraining.concat(shuffle(temp));
            this.elicitationStimEVTraining.push(catchTrials[catchTrialIdx]);
            catchTrialIdx++;

            // mix lotteries and stim 2
            temp = [];
            for (let j = 0; j < this.lotteryCont.length; j++) {

                let lotteryFile = this.lotteryEV[j].toString();
                let lotteryContIdx = j;
                let lotteryEV = this.lotteryEV[j];
                let lotteryP = this.lotteryCont[j];

                temp.push([
                    file2, lotteryFile, contIdx2, lotteryContIdx, p2, lotteryP, ev2, lotteryEV
                ]);
            }

            this.elicitationStimEVTraining = this.elicitationStimEVTraining.concat(shuffle(temp));
            this.elicitationStimEVTraining.push(catchTrials[catchTrialIdx]);

        }

        // Phase 2
        // ===================================================================== //
        this.elicitationStim = [];
        this.elicitationStimEV = [];
        catchTrialIdx = 0;

        for (let i = 0; i < nCond; i++) {

            let [file1, file2] = this.contexts[i];

            let contIdx1 = this.probs[i][0];
            let contIdx2 = this.probs[i][1];

            let ev1 = this.ev[contIdx1];
            let ev2 = this.ev[contIdx2];

            let p1 = this.cont[contIdx1];
            let p2 = this.cont[contIdx2];

            let isCatchTrial = false;

            this.elicitationStim.push(
                [file1, contIdx1, p1, ev1, isCatchTrial]
            );

            this.elicitationStim.push(
                [file2, contIdx2, p2, ev2, isCatchTrial]
            );

            // mix lotteries and stim 1
            let temp = [];
            for (let j = 0; j < this.lotteryCont.length; j++) {

                let lotteryFile = this.lotteryEV[j].toString();
                let lotteryContIdx = j;
                let lotteryEV = this.lotteryEV[j];
                let lotteryP = this.lotteryCont[j];

                temp.push([
                    file1, lotteryFile, contIdx1, lotteryContIdx, p1, lotteryP, ev1, lotteryEV
                ]);
            }

            this.elicitationStimEV = this.elicitationStimEV.concat(shuffle(temp));
            this.elicitationStimEV.push(catchTrials[catchTrialIdx]);
            catchTrialIdx++;

            // mix lotteries and stim 2
            temp = [];
            for (let j = 0; j < this.lotteryCont.length; j++) {

                let lotteryFile = this.lotteryEV[j].toString();
                let lotteryContIdx = j;
                let lotteryEV = this.lotteryEV[j];
                let lotteryP = this.lotteryCont[j];

                temp.push([
                    file2, lotteryFile, contIdx2, lotteryContIdx, p2, lotteryP, ev2, lotteryEV
                ]);
            }

            this.elicitationStimEV = this.elicitationStimEV.concat(shuffle(temp));
            this.elicitationStimEV.push(catchTrials[catchTrialIdx]);

        }
    }

    _loadImg(imgPath) {

        // Get stims, feedbacks, resources
        let nImg = 8;
        let nTrainingImg = 8;
        let imgExt = 'gif';
        let borderColor = "transparent";

        this.images = [];
        this.availableOptions = [];
        for (let i = 2; i <= nImg; i++) {
            this.availableOptions.push(i);
            this.images[i] = new Image();
            this.images[i].src = imgPath + 'stim_old/' + i + '.' + imgExt;
            this.images[i].className = "img-responsive center-block";
            this.images[i].style.border = "5px solid " + borderColor;
            this.images[i].style.position = "relative";
            this.images[i].style.top = "0px";
        }

        let feedbackNames = ["empty", "0", "1", "-1", '-2', '2'];
        this.feedbackImg = [];
        for (let i = 0; i < feedbackNames.length; i++) {
            let fb = feedbackNames[i];
            this.feedbackImg[fb] = new Image();
            this.feedbackImg[fb].src = imgPath + 'fb/' + fb + '.' + imgExt;
            this.feedbackImg[fb].className = "img-responsive center-block";
            this.feedbackImg[fb].style.border = "5px solid " + borderColor;
            this.feedbackImg[fb].style.position = "relative";
            this.feedbackImg[fb].style.top = "0px";
        }

        // Training stims
        imgExt = 'jpg';
        this.trainingImg = [];
        this.trainingOptions = [];
        let letters = [null, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L',
            'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        for (let i = 1; i <= nTrainingImg; i++) {
            this.trainingOptions.push(i);
            this.trainingImg[i] = new Image();
            this.trainingImg[i].src = imgPath + 'stim/' + letters[i] + '.' + imgExt;
            this.trainingImg[i].className = "img-responsive center-block";
            this.trainingImg[i].style.border = "5px solid " + borderColor;
            this.trainingImg[i].style.position = "relative";
            this.trainingImg[i].style.top = "0px";
        }


        for (let i = 0; i < this.lotteryEV.length; i++) {
            let idx = this.lotteryEV[i].toString();
            this.images[idx] = new Image();
            this.images[idx].src = imgPath + 'lotteries/' + idx + '.png';
            this.images[idx].className = "img-responsive center-block";
            this.images[idx].style.border = "5px solid " + borderColor;
            this.images[idx].style.position = "relative";
            this.images[idx].style.top = "0px";
            this.trainingImg[idx] = new Image();
            this.trainingImg[idx].src = imgPath + 'lotteries/' + idx + '.png';
            this.trainingImg[idx].className = "img-responsive center-block";
            this.trainingImg[idx].style.border = "5px solid " + borderColor;
            this.trainingImg[idx].style.position = "relative";
            this.trainingImg[idx].style.top = "0px";
        }

    }

}



//
//
// /* Abstract experience model */
// function Exp(
//     {
//         nOption,
//         nContext,
//         this.rewards,
//         this.probs,
//         interleaved,
//         nInterleaved,
//         nTrialPerContext,
//         nTrial,
//         nTrialTraining,
//         language,
//     }={}
//     ) {
//
//     // private members (accessible in the whole function)
//     this.nOption = nOption;
//     this.nContext = nContext;
//
//     this.this.rewards = this.rewards;
//     this.this.probs = this.probs;
//     this.nTrialPerContext = nTrialPerContext;
//     this.nTrial = nTrial;
//     this.nInterleaved = nInterleaved;
//     this.interleaved = interleaved;
//     this.language = language;
//     this.nTrialTraining = nTrialTraining;
//
//     this.order = [];
//     this.this.context = [];
//     this.r = [];
//     this.p = [];
//
//     assert(
//         sum(nTrialPerContext) === nTrial, 'nTrial does not correspond to nTrialPerContext'
//     );
//
//     /* =================== private methods ================= */
//
//     /* randomize order of options on screens
//     idx=0 is the most far on the left
//     idx=max ist the most far on the right */
//     this.randomizeOrder = function () {
//         for (let t = 0; t < this.nTrial; t++) {
//             this.order.push(shuffle(range(this.nOption)));
//         }
//         assert(this.order.length === this.nTrial, 'Error in this.order length');
//     };
//
//     this.initContexts = function () {
//         // first define this.contexts for each time-steps
//         if (this.interleaved) {
//             for (let i = 0; i < this.nTrial; i += this.nInterleaved) {
//                 this.this.context = this.this.context.concat(
//                     shuffle(range(0, nContext - 1))
//                 );
//             }
//         } else {
//             for (let i = 0; i < this.nContext; i++) {
//                 this.this.context = this.this.context.concat(
//                     Array(this.nTrialPerContext[i]).fill(i)
//                 )
//             }
//         }
//         // set this.rewards and probabilities accordingly
//         for (let t = 0; t < this.nTrial; t++) {
//             this.r[t] = this.this.rewards[this.this.context[t]];
//             this.p[t] = this.this.probs[this.this.context[t]];
//         }
//         assert(this.this.context.length === this.nTrial, 'Errors in this.context length.');
//     };
//
//     /* =================== public methods ================== */
//
//     // main init method
//     this.init = function () {
//         this.initContexts();
//         this.randomizeOrder();
//     };
//
//
// }
//
// // set to true to test the module
// // using "$ node --experimental-modules myscript.mjs"
// main({test: false});
//
// function main({test}={}) {
//     if (test) {
//         console.log('Testing module...');
//         let nOption = 2;
//         let nContext = 4;
//         let this.rewards = [
//             [[0, 0], [-1, 1]],
//             [[0, 0], [-1, 1]],
//             [[-1, 1], [-1, 1]],
//             [[0, 1], [0, -1]]
//         ];
//         let this.probs = [
//             [[0.5, 0.5], [0.5, 0.5]],
//             [[0.5, 0.5], [0.5, 0.5]],
//             [[0.25, 0.75], [0.75, 0.25]],
//             [[0.5, 0.5], [0.5, 0.5]]
//         ];
//         let nTrialPerContext = [24, 24, 24, 24];
//         let nTrial = 96;
//         let nInterleaved = 4;
//         let interleaved = true;
//
//         let exp = new Exp(
//             {
//                 nOption: nOption,
//                 nContext: nContext,
//                 this.rewards: this.rewards,
//                 this.probs: this.probs,
//                 nTrialPerContext: nTrialPerContext,
//                 nTrial: nTrial,
//                 nInterleaved: nInterleaved,
//                 interleaved: interleaved
//             }
//         );
//         exp.init();
//     }
// }

