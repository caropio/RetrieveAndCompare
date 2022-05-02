import { sendToDB } from "./request.js"
import { randint, shuffle, range, sleep } from "./utils.js";
import { GUI } from "./gui.js";


export class RandomSelector {
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
        beforeFeedbackDuration,
        feedbackDuration,
        feedbackObj,
        reward,
        nextFunc,
        nextParams,
    } = {}) {

        // members
        this.exp = exp;

        this.trialObj = trialObj;
        this.feedbackObj = feedbackObj;
        this.imgObj = imgObj;

        this.feedbackDuration = feedbackDuration;
        this.beforeFeedbackDuration = beforeFeedbackDuration;

        this.sessionNum = sessionNum;
        if (sessionNum >= 0) {
            GUI.setActiveCurrentStep('experiment' + (sessionNum + 1));
        } else {
            GUI.setActiveCurrentStep('training');
        }
        this.phaseNum = phaseNum;
        
        this.reward = reward;

        this.nextFunc = nextFunc;
        this.nextParams = nextParams;

    }

    /* =================== public methods ================== */

    run() {

        GUI.initGameStageDiv();

        let slider = GUI.displayOneOption(
            "?",
            this.imgObj,
            this.feedbackObj,
            undefined,
            false,
            "Please wait while we randomly select one of the reward you've earned...");
        if (this.reward===undefined) {
            alert("Reward is undefined! Setting reward to +1");
            this.reward = 1;
            this.exp.selectedOutcome[this.sessionNum][this.phaseNum] = 1;
        }

        GUI.showSingleFeedback(
            {feedbackDuration: this.feedbackDuration,
            beforeFeedbackDuration: this.beforeFeedbackDuration,
             reward1: this.reward, feedbackObj: this.feedbackObj})
    };

}
