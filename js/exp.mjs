import {range, shuffle, getOS, getBrowser, createCode} from './utils.mjs';
export {ExperimentParameters};


class ExperimentParameters {
    /***

     Experiment initializer

     ***/

    constructor ({
        online,
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
        nCond

                 }={}) {
        // TODO:
        // Initial Experiment Parameters
        // ===================================================================== // 
        this.online = online;
        this.completeFeedback = completeFeedback;
        this.expName = expName;

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

    }

    _initConditionsAndContingencies() {
        // Define conditions
        // ===================================================================== //
        this.probs = [];
        this.rewards = [];
        this.cont = [];

        // Define ind this.cont
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

        this.rewards[0] = [[-1, 1], [-1, 1]];
        this.probs[0] = [[0.1, 0.9], [0.9, 0.1]];

        this.rewards[1] = [[-1, 1], [-1, 1]];
        this.probs[1] = [[0.2, 0.8], [0.8, 0.2]];

        this.rewards[2] = [[-1, 1], [-1, 1]];
        this.probs[2] = [[0.3, 0.7], [0.7, 0.3]];

        this.rewards[3] = [[-1, 1], [-1, 1]];
        this.probs[3] = [[0.4, 0.6], [0.6, 0.4]];

        // Elicitations
        // ===================================================================== //
        this.expectedValue = [
            "-1", "-0.8", "-0.6", "-0.4", "-0.2", "0", "0.2", "0.4", "0.6", "0.8", "1"];

        // Define maps
        // ===================================================================== //
        this.expectedValueMap = {
            '-1': [this.cont[0], 0],
            '-0.8': [this.cont[1], 1],
            '-0.6': [this.cont[2], 2],
            '-0.4': [this.cont[3], 3],
            '-0.2': [this.cont[4], 4],
            '0': [this.cont[5], 5],
            '0.2': [this.cont[6], 6],
            '0.4': [this.cont[7], 7],
            '0.6': [this.cont[8], 8],
            '0.8': [this.cont[9], 9],
            '1': [this.cont[10], 10],
        };

    }

    _defineConditionArrays(nTrialPerCondition, nTrialPerConditionTraining, nCond) {

        // Define conditions
        // ===================================================================== //
        this.expCondition = [];
        this.trainingCondition = [];
        this.conditions = [];

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

        for (let i = 0; i <= nCond; i++)
            this.conditions.push({
                reward: this.rewards[i],
                prob: this.probs[i]
            });

        // training conditions
        for (let i = 0; i < cond.length; i++) {
            this.trainingCondition.push(
                Array(nTrialPerConditionTraining).fill(cond[i]).flat()
            );
        }
        this.trainingCondition = this.trainingCondition.flat();

        // EXP
        this.availableOptions = shuffle(this.availableOptions);
        this.contexts = [];

        for (let i = 0; i <= nCond * 2 - 1; i += 2) {
            this.contexts.push([
                this.availableOptions[i], this.availableOptions[i + 1]
            ]);
        }
        this.contexts = shuffle(this.contexts);

        this.trainingOptions = shuffle(this.trainingOptions);
        this.trainingContexts = [];
        let arr = [];
        (new Set(this.trainingCondition)).forEach(x => arr.push(x));
        let j = 0;
        for (let i = 0; i <= nCond * 2 - 1; i += 2) {

            this.trainingContexts[arr[j]] = [
                this.trainingOptions[i], this.trainingOptions[i + 1]
            ];
            j++;
        }

        this.trainingContexts = shuffle(this.trainingContexts);


        this.symbolValueMapTraining = [];

        for (let i = 0; i < this.trainingContexts.length; i++) {
            let v1 = this.conditions[i]['prob'][0];
            let v2 = this.conditions[i]['prob'][1];
            let r = [-1, 1];
            this.symbolValueMapTraining[this.trainingContexts[i][0]] = [
                v1,
                this.cont.findIndex(x => x.toString() === v1.toString()),
                v1[0] * r[0] + v1[1] * r[1],
            ];
            this.symbolValueMapTraining[this.trainingContexts[i][1]] = [
                v2,
                this.cont.findIndex(x => x.toString() === v2.toString()),
                v2[0] * r[0] + v2[1] * r[1]
            ];
        }


        this.symbolValueMap = [];

        for (let i = 0; i < this.contexts.length; i++) {
            let v1 = this.conditions[i]['prob'][0];
            let v2 = this.conditions[i]['prob'][1];
            let r = [-1, 1];
            this.symbolValueMap[this.contexts[i][0]] = [
                v1,
                this.cont.findIndex(x => x.toString() === v1.toString()),
                v1[0] * r[0] + v1[1] * r[1]
            ];
            this.symbolValueMap[this.contexts[i][1]] = [
                v2,
                this.cont.findIndex(x => x.toString() === v2.toString()),
                v2[0] * r[0] + v2[1] * r[1]
            ];
        }

        let catchTrialsTemp = shuffle([
            ["0.8", "-0.8"],
            ["0.6", "-0.6"],
            ["0.6", "-0.4"],
            ["0.4", "-0.4"],
            ["0.4", "-0.6"],
            ["0.2", "-0.2"],
            ["0.4", "-0.2"],
            ["1", "-1"],
        ]);

        let catchTrials = [];
        for (let i = 0; i < catchTrialsTemp.length; i++) {

            let stim1 = catchTrialsTemp[i][0];
            let stim2 = catchTrialsTemp[i][1];

            catchTrials[i] = [
                stim1,
                stim2,
                this.expectedValueMap[stim1],
                this.expectedValueMap[stim2],
                true
            ].flat();
        }

        this.elicitationStimTraining = [];
        this.elicitationStimEVTraining = [];
        for (let i = 0; i < nCond * 2; i += 2) {

            this.trainingContexts[arr[j]] = [
                this.trainingOptions[i], this.trainingOptions[i + 1]
            ];
            j++;

            let stim1 = this.trainingOptions[i];
            let stim2 = this.trainingOptions[i + 1];

            this.elicitationStimTraining.push(
                [stim1, this.symbolValueMapTraining[stim1], false].flat()
            );

            this.elicitationStimTraining.push(
                [stim2, this.symbolValueMapTraining[stim2], false].flat()
            );

            let temp = [];
            for (let k = 0; k < this.probs.length; k++) {
                temp.push([
                    this.trainingOptions[i],
                    this.expectedValue[k],
                    this.symbolValueMapTraining[this.trainingOptions[i]],
                    this.expectedValueMap[this.expectedValue[k]],
                    false
                ].flat());
            }
            this.elicitationStimEVTraining = this.elicitationStimEVTraining.concat(shuffle(temp));
            this.elicitationStimEVTraining.push(catchTrials[i]);

            temp = [];
            for (let k = 0; k < this.probs.length; k++) {
                temp.push([
                    this.trainingOptions[i + 1],
                    this.expectedValue[k],
                    this.symbolValueMap[this.trainingOptions[i + 1]],
                    this.expectedValueMap[this.expectedValue[k]],
                    false
                ].flat());
            }
            this.elicitationStimEVTraining = this.elicitationStimEVTraining.concat(shuffle(temp));
            this.elicitationStimEVTraining.push(catchTrials[i + 1]);

        }

        for (let i = 0; i < this.expCondition.length; i++) {

            let idx = this.expCondition[i];

            let [stimIdx1, stimIdx2] = this.contexts[idx];

            this.learningStim.push(
                [stimIdx1, stimIdx2, this.symbolValueMap[stimIdx1], this.symbolValueMap[stimIdx2], false].flat()
            );

        }

        for (let i = 0; i < this.trainingCondition.length; i++) {

            let idx = this.trainingCondition[i];

            let [stimIdx1, stimIdx2] = this.trainingContexts[idx];

            this.learningStimTraining.push(
                [stimIdx1, stimIdx2, this.symbolValueMapTraining[stimIdx1], this.symbolValueMapTraining[stimIdx2], false].flat()
            );

        }

        // Elicitation
        let elicitationsStim = [];
        this.elicitationStimEV = [];

        let cidx = Array.from(new Set(shuffle(this.expCondition.flat())));
        let catchIdx = 0;

        for (let j = 0; j < cidx.length; j++) {

            let stim1 = this.contexts[cidx[j]].flat()[0];
            let stim2 = this.contexts[cidx[j]].flat()[1];

            elicitationsStim.push([
                stim1,
                this.symbolValueMap[stim1],
                false
            ].flat());

            elicitationsStim.push([
                stim2,
                this.symbolValueMap[stim2],
                false
            ].flat());

            let temp = [];
            for (let k = 0; k < this.expectedValue.length; k++) {
                temp.push(
                    [
                        stim1,
                        this.expectedValue[k],
                        this.symbolValueMap[stim1],
                        this.expectedValueMap[this.expectedValue[k]],
                        false
                    ].flat()
                );
            }
            this.elicitationStimEV = this.elicitationStimEV.concat(shuffle(temp));
            this.elicitationStimEV.push(catchTrials[catchIdx]);
            catchIdx++;

            temp = [];
            for (let k = 0; k < this.expectedValue.length; k++) {
                temp.push(
                    [
                        stim2,
                        this.expectedValue[k],
                        this.symbolValueMap[stim2],
                        this.expectedValueMap[this.expectedValue[k]],
                        false
                    ].flat()
                );
            }
            this.elicitationStimEV = this.elicitationStimEV.concat(shuffle(temp));
            this.elicitationStimEV.push(catchTrials[catchIdx]);
            catchIdx++;

        }

        let randExpectedValue = shuffle(this.expectedValue);
        for (let i = 0; i < 4; i++) {
            elicitationsStim.push([
                randExpectedValue[i],
                this.expectedValueMap[randExpectedValue[i]],
                false
            ].flat());

        }
        randExpectedValue = shuffle(this.expectedValue);
        for (let i = 0; i < 2; i++) {
            this.elicitationStimTraining.push([
                randExpectedValue[i],
                this.expectedValueMap[randExpectedValue[i]],
                false
            ].flat());
        }

        this.elicitationStimTraining = shuffle(this.elicitationStimTraining);
        this.elicitationStim = shuffle(elicitationsStim);
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


        for (let i = 0; i < this.expectedValue.length; i++) {
            let idx = this.expectedValue[i];
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

