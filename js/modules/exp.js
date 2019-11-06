import {range, shuffle, getOS, getBrowser, createCode} from './utils.js';


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
        maxCompensation,
        nTrialPerCondition,
        nTrialPerConditionTraining,
        nCond}={}) {

        // Initial Experiment Parameters
        // ===================================================================== // 
        this.online = online;
        this.completeFeedback = completeFeedback;
        this.expName = expName;
        this.isTesting = isTesting;

        this.feedbackDuration = feedbackDuration;

        this.sumReward = [0, 0, 0, 0, 0, 0, 0];

        this.totalReward = 0;

        this.maxTrainingNum = maxTrainingNum;

        this.initTime = (new Date()).getTime();

        this.expID = createCode();

        this.browsInfo = getOS() + ' - ' + getBrowser();

        this.subID = undefined;

        this.compLink = compLink;


        // init
        this._initContingencies();
        this._loadImg(imgPath);
        this._initConditionArrays(nTrialPerCondition, nTrialPerConditionTraining, nCond);
        this._initTrialObj(nCond);

        if (maxPoints) {
            this.maxPoints = maxPoints;
        } else {
            this.maxPoints = this._computeMaxPoints();
        }

        // define compensation functions
        // ===================================================================== //
        let conversionRate = (maxCompensation/this.maxPoints).toFixed(2);
        this.pointsToPence = points => points * conversionRate;
        this.penceToPounds = pence => pence / 100;
        this.pointsToPounds = points => this.penceToPounds(this.pointsToPence(points));

    }

    _initContingencies() {
        this.cont = [];
        this.probs = [];
        this.rewards = [];
        this.ev = [];
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

        // compute ev for each cont
        for (let i = 0; i < this.cont.length; i++) {
            this.ev[i] = math.round(
                math.multiply(this.rew, this.cont[i]), 2);
        }

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

    }

    _initConditionArrays(nTrialPerCondition, nTrialPerConditionTraining, nCond) {

        // Define conditions
        // ===================================================================== //
        this.expCondition = [];
        this.trainingCondition = [];


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
        this.learningOptions = shuffle(this.learningOptions);
        this.contexts = [];

        for (let i = 0; i < nCond * 2; i += 2) {
            this.contexts.push([
                this.learningOptions[i], this.learningOptions[i + 1]
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

    _initTrialObj(nCond) {

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

            let ev1 = this.ev[contIdx1];
            let ev2 = this.ev[contIdx2];

            let file1 = ev1.toString();
            let file2 = ev2.toString();

            let p1 = this.cont[contIdx1];
            let p2 = this.cont[contIdx2];

            let r1 = this.rew;
            let r2 = this.rew;

            let isCatchTrial = true;
            let option2isSymbol = false;

            catchTrials[i] = [
                file1, file2, contIdx1, contIdx2, p1, p2, ev1, ev2, r1, r2, isCatchTrial, option2isSymbol
            ];
        }

        // Learning Phase -- Trial obj definition
        // ===================================================================== //
        // ===================================================================== //
        this.trialObjLearning = [];
        this.trialObjLearningTraining = [];


        for (let i = 0; i < this.expCondition.length; i++) {

            let idx = this.expCondition[i];

            let contIdx1 = this.probs[idx][0];
            let contIdx2 = this.probs[idx][1];

            let [file1, file2] = this.contexts[idx];

            let ev1 = this.ev[contIdx1];
            let ev2 = this.ev[contIdx2];

            let p1 = this.cont[contIdx1];
            let p2 = this.cont[contIdx2];

            let r1 = this.rew;
            let r2 = this.rew;

            let isCatchTrial = false;

            this.trialObjLearning.push(
                [file1, file2, contIdx1, contIdx2, p1, p2, ev1, ev2, r1, r2, isCatchTrial]
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

            let r1 = this.rew;
            let r2 = this.rew;

            let isCatchTrial = false;

            this.trialObjLearningTraining.push(
                [file1, file2, contIdx1, contIdx2, p1, p2, ev1, ev2, r1, r2, isCatchTrial]
            );

        }

        // Elicitation Phase -- Description experience + slider trial obj definition
        // ===================================================================== //
        // ===================================================================== //

        // Training
        this.trialObjSliderElicitationTraining = [];
        this.trialObjChoiceElicitationTraining = [];
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

            let r1 = this.rew;
            let r2 = this.rew;

            let isCatchTrial = false;

            this.trialObjSliderElicitationTraining.push(
                [file1, contIdx1, p1, ev1, r1, isCatchTrial]
            );

            // mix lotteries and stim 1
            let temp = [];
            for (let j = 0; j < this.cont.length - 7; j++) {

                let lotteryFile = this.ev[j].toString();
                let lotteryContIdx = j;
                let lotteryEV = this.ev[j];
                let lotteryP = this.ev[j];

                let option2isSymbol = false;

                temp.push([
                    file1, lotteryFile, contIdx1, lotteryContIdx, p1, lotteryP,
                    ev1, lotteryEV, r1, r2, isCatchTrial, option2isSymbol
                ]);

            }

            for (let k = 0; k < nCond - 2; k++) {
                let [sym1, sym2] = this.trainingContexts[k];

                let sym1contIdx = this.probs[k][0];
                let sym2contIdx = this.probs[k][1];

                let symEv1 = this.ev[sym1contIdx];
                let symEv2 = this.ev[sym2contIdx];

                let symP1 = this.cont[sym1contIdx];
                let symP2 = this.cont[sym2contIdx];

                let symR1 = this.rew;
                let symR2 = this.rew;

                let isCatchTrial = false;
                let option2isSymbol = true;

                if (sym1 !== file1) {
                    temp.push([
                        file1, sym1,
                        contIdx1, sym1contIdx,
                        p1, symP1,
                        ev1, symEv1,
                        r1, symR1,
                        isCatchTrial,
                        option2isSymbol
                    ])
                }
                if (sym2 !== file1) {
                    temp.push([
                        file1, sym2,
                        contIdx1, sym2contIdx,
                        p1, symP2,
                        ev1, symEv2,
                        r1, symR2,
                        isCatchTrial,
                        option2isSymbol
                    ])
                }
            }

            this.trialObjChoiceElicitationTraining =
                this.trialObjChoiceElicitationTraining.concat(shuffle(temp));
            this.trialObjChoiceElicitationTraining.push(catchTrials[catchTrialIdx]);
            catchTrialIdx++;

            // mix lotteries and stim 2
            temp = [];
            for (let j = 0; j < this.cont.length - 7; j++) {

                let lotteryFile = this.ev[j].toString();
                let lotteryContIdx = j;
                let lotteryEV = this.ev[j];
                let lotteryP = this.cont[j];

                let option2isSymbol = false;

                temp.push([
                    file2, lotteryFile, contIdx2, lotteryContIdx, p2, lotteryP,
                    ev2, lotteryEV, r1, r2, isCatchTrial, option2isSymbol
                ]);
            }

            for (let k = 0; k < nCond - 2; k++) {
                let [sym1, sym2] = this.trainingContexts[k];

                let sym1contIdx = this.probs[k][0];
                let sym2contIdx = this.probs[k][1];

                let symEv1 = this.ev[sym1contIdx];
                let symEv2 = this.ev[sym2contIdx];

                let symP1 = this.cont[sym1contIdx];
                let symP2 = this.cont[sym2contIdx];

                let symR1 = this.rew;
                let symR2 = this.rew;

                let isCatchTrial = false;
                let option2isSymbol = true;

                if (sym1 !== file2) {
                    temp.push([
                        file2, sym1,
                        contIdx2, sym1contIdx,
                        p2, symP1,
                        ev2, symEv1,
                        r2, symR1,
                        isCatchTrial,
                        option2isSymbol
                    ])
                }
                if (sym2 !== file2) {
                    temp.push([
                        file2, sym2,
                        contIdx2, sym2contIdx,
                        p2, symP2,
                        ev2, symEv2,
                        r2, symR2,
                        isCatchTrial,
                        option2isSymbol
                    ])
                }
            }

            this.trialObjChoiceElicitationTraining =
                this.trialObjChoiceElicitationTraining.concat(shuffle(temp));
            this.trialObjChoiceElicitationTraining.push(catchTrials[catchTrialIdx]);

        }

        // add catch trials to slider
        this.trialObjSliderElicitationTraining.push(
            [this.ev[2].toString(), 2, this.cont[2], this.ev[2], this.rew, true]
        );
        this.trialObjSliderElicitationTraining.push(
            [this.ev[8].toString(), 8, this.cont[8], this.ev[8], this.rew, true]
        );

        this.trialObjSliderElicitationTraining = shuffle(this.trialObjSliderElicitationTraining);

        // Phase 2
        // ===================================================================== //
        this.trialObjSliderElicitation = [];
        this.trialObjChoiceElicitation = [];
        catchTrialIdx = 0;

        for (let i = 0; i < nCond; i++) {

            let [file1, file2] = this.contexts[i];

            let contIdx1 = this.probs[i][0];
            let contIdx2 = this.probs[i][1];

            let ev1 = this.ev[contIdx1];
            let ev2 = this.ev[contIdx2];

            let p1 = this.cont[contIdx1];
            let p2 = this.cont[contIdx2];

            let r1 = this.rew;
            let r2 = this.rew;

            let isCatchTrial = false;

            this.trialObjSliderElicitation.push(
                [file1, contIdx1, p1, ev1, r1, isCatchTrial]
            );

            this.trialObjSliderElicitation.push(
                [file2, contIdx2, p2, ev2, r2, isCatchTrial]
            );

            // mix lotteries and stim 1
            let temp = [];
            for (let j = 0; j < this.cont.length; j++) {

                let lotteryFile = this.ev[j].toString();
                let lotteryContIdx = j;
                let lotteryEV = this.ev[j];
                let lotteryP = this.cont[j];

                let option2isSymbol = false;

                temp.push([
                    file1, lotteryFile, contIdx1, lotteryContIdx, p1,
                    lotteryP, ev1, lotteryEV, r1, r2, isCatchTrial, option2isSymbol
                ]);
            }
            for (let k = 0; k < nCond; k++) {
                let [sym1, sym2] = this.contexts[k];

                let sym1contIdx = this.probs[k][0];
                let sym2contIdx = this.probs[k][1];

                let symEv1 = this.ev[sym1contIdx];
                let symEv2 = this.ev[sym2contIdx];

                let symP1 = this.cont[sym1contIdx];
                let symP2 = this.cont[sym2contIdx];

                let symR1 = this.rew;
                let symR2 = this.rew;

                let option2isSymbol = true;

                let isCatchTrial = false;

                if (sym1 !== file1) {
                    temp.push([
                        file1, sym1,
                        contIdx1, sym1contIdx,
                        p1, symP1,
                        ev1, symEv1,
                        r1, symR1,
                        isCatchTrial,
                        option2isSymbol
                    ])
                }
                if (sym2 !== file1) {
                    temp.push([
                        file1, sym2,
                        contIdx1, sym2contIdx,
                        p1, symP2,
                        ev1, symEv2,
                        r1, symR2,
                        isCatchTrial,
                        option2isSymbol
                    ])
                }
            }

            this.trialObjChoiceElicitation =
                this.trialObjChoiceElicitation.concat(shuffle(temp));
            this.trialObjChoiceElicitation.push(catchTrials[catchTrialIdx]);
            catchTrialIdx++;

            // mix lotteries and stim 2
            temp = [];
            for (let j = 0; j < this.cont.length; j++) {

                let lotteryFile = this.ev[j].toString();
                let lotteryContIdx = j;
                let lotteryEV = this.ev[j];
                let lotteryP = this.cont[j];

                let option2isSymbol = false;

                temp.push([
                    file2, lotteryFile, contIdx2, lotteryContIdx, p2,
                    lotteryP, ev2, lotteryEV, r1, r2, isCatchTrial, option2isSymbol
                ]);
            }

            for (let k = 0; k < nCond; k++) {
                let [sym1, sym2] = this.contexts[k];

                let sym1contIdx = this.probs[k][0];
                let sym2contIdx = this.probs[k][1];

                let symEv1 = this.ev[sym1contIdx];
                let symEv2 = this.ev[sym2contIdx];

                let symP1 = this.cont[sym1contIdx];
                let symP2 = this.cont[sym2contIdx];

                let symR1 = this.rew;
                let symR2 = this.rew;

                let option2isSymbol = true;
                let isCatchTrial = false;

                if (sym1 !== file2) {
                    temp.push([
                        file2, sym1,
                        contIdx2, sym1contIdx,
                        p2, symP1,
                        ev2, symEv1,
                        r2, symR1,
                        isCatchTrial,
                        option2isSymbol
                    ])
                }
                if (sym2 !== file2) {
                    temp.push([
                        file2, sym2,
                        contIdx2, sym2contIdx,
                        p2, symP2,
                        ev2, symEv2,
                        r2, symR2,
                        isCatchTrial,
                        option2isSymbol
                    ])
                }
            }

            this.trialObjChoiceElicitation =
                this.trialObjChoiceElicitation.concat(shuffle(temp));
            this.trialObjChoiceElicitation.push(catchTrials[catchTrialIdx]);

        }
        // add catch trials to slider
        this.trialObjSliderElicitation.push(
            [this.ev[1].toString(), 1, this.cont[1], this.ev[1], this.rew, true]
        );
        this.trialObjSliderElicitation.push(
            [this.ev[9].toString(), 9, this.cont[9], this.ev[9], this.rew, true]
        );

        this.trialObjSliderElicitation = shuffle(this.trialObjSliderElicitation);

    }

    _computeMaxPoints() {
        // using expected value compute what will be the final score
        // if the subject makes optimal choices
        // here we have one session so we compute it once

        let maxPoints = 0;

        for (let i = 0; i < this.trialObjLearning.length; i++) {

            let ev1 = this.trialObjLearning[i][6];
            let ev2 = this.trialObjLearning[i][7];

            maxPoints += Math.max(ev1, ev2)
        }

        for (let i = 0; i < this.trialObjChoiceElicitation.length; i++) {

            let ev1 = this.trialObjChoiceElicitation[i][6];
            let ev2 = this.trialObjChoiceElicitation[i][7];

            maxPoints += Math.max(ev1, ev2)
        }

        for (let i = 0; i < this.trialObjSliderElicitation.length; i++) {

            let ev1 = this.trialObjSliderElicitation[i][3];
            maxPoints += ev1;
        }

        return Math.round(maxPoints)
    }

    _loadImg(imgPath) {

        // Get stims, feedbacks, resources
        let nImg = 8;
        let nTrainingImg = 8;
        let imgExt = 'gif';
        let borderColor = "transparent";

        this.images = [];
        this.learningOptions = [];
        for (let i = 2; i < nImg + 2; i++) {
            this.learningOptions.push(i);
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
        for (let i = 2; i <= nTrainingImg + 1; i++) {
            this.trainingOptions.push(i);
            this.trainingImg[i] = new Image();
            this.trainingImg[i].src = imgPath + 'stim/' + letters[i] + '.' + imgExt;
            this.trainingImg[i].className = "img-responsive center-block";
            this.trainingImg[i].style.border = "5px solid " + borderColor;
            this.trainingImg[i].style.position = "relative";
            this.trainingImg[i].style.top = "0px";
        }

        for (let i = 0; i < this.ev.length; i++) {
            let idx = this.ev[i].toString();
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

