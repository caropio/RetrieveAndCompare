import {ExperimentParameters} from "./modules/exp.js";
import {Instructions} from "./modules/inst.js";
import {Questionnaire} from "./modules/quest.js";
import {ChoiceManager, SliderManager} from "./modules/trial_manager.js";
import {GUI} from "./modules/gui.js";
import {sendToDB} from "./modules/request.js";


// When the page is fully loaded, the main function will be called
$(document).ready(main);


function main() {
    /*
    Main function where
    we instantiate experiment parameters, in order to maintain
    their attributes throught the whole experiment scope
    TODO:
        * ???
        * Init dictionnaries instead of arrays
     */

    // initGameStageDiv main parameters
    /* ============================================================================= */
    // these three variables indicate what
    // has to be run in the state machine (i.e. current state of the experiment)
    // initial values are:
    // let sessionNum = -1;
    // let phaseNum = 1;
    // let instructionNum = 0;
    // let questNum = 0;

    let sessionNum = -1;
    let phaseNum = 1;
    let instructionNum = 0;
    let questNum = 0;

    // instantiate experiment parameters
    let exp = new ExperimentParameters(
        {
            online: true,   // send network requests
            isTesting: true, // isTesting==in development vs in production
            expName: 'RetrieveAndCompare', // experience name
            completeFeedback: true, // display feedback of both options
            maxPoints: undefined, // max points cumulated all along the experiment
                                 // if undefined or 0, will be computed automatically
            maxCompensation: 250, // in pence (in addition of the initial endowment)
            feedbackDuration: 2000, // how many milliseconds we present the outcome
            maxTrainingNum: -2, // if sessionNum == maxTrainingNum
                                // do not allow for new training sessions
            nTrialPerConditionTraining: 5,
            nTrialPerCondition: 30,
            nSession: 2,
            nCond: 4,
            imgPath: 'images/cards_gif/',
            compLink: 'https://app.prolific.ac/submissions/complete?cc=RNFS5HP5' // prolific completion link
                                                                                // will be displayed at the end
        }
    );
    
    // Run experiment!!
    stateMachine({instructionNum, sessionNum, phaseNum, questNum, exp});
}


function stateMachine({instructionNum, sessionNum, phaseNum, questNum, exp} = {}) {
    
    let inst = new Instructions(exp);
    let quest = new Questionnaire(exp);

    /* ============================ Instructions Management ========================== */

    // if sessionNum < 0, then it is a training session
    // here training sessionNum is in {-1, -2}
    let isTraining = +(sessionNum < 0);
    let isLastSession = +(sessionNum === (exp.nSession-1));

    switch (instructionNum) {
        case 0:
            inst.goFullscreen(
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 1, exp: exp, sessionNum: sessionNum, phaseNum: 1
                }
            );
            return;

        case 1:
            inst.setUserID(
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 2, exp: exp, sessionNum: sessionNum, phaseNum: 1
                }
            );
            return;

        case 2:
            inst.displayConsent(
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 3, exp: exp, sessionNum: sessionNum, phaseNum: 1
                }
            );
            return;

        case 3:
            inst.displayInitialInstruction(
                {pageNum: 1},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 4, exp: exp, sessionNum: sessionNum, phaseNum: 1
                }
            );
            return;

        case 4:
            inst.displayInstructionLearning(
                {pageNum: 1, isTraining: isTraining, phaseNum: 1, sessionNum: sessionNum},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', exp: exp, sessionNum: sessionNum, phaseNum: 1
                }
            );
            return;

        case 5:
            inst.displayInstructionChoiceElicitation(
                {pageNum: 1, isTraining: isTraining, phaseNum: 2, sessionNum: sessionNum},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', exp: exp, sessionNum: sessionNum, phaseNum: 2
                }
            );
            return;

        case 6:
            inst.displayInstructionSliderElicitation(
                {pageNum: 1, isTraining: isTraining, phaseNum: 3, sessionNum: sessionNum},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', exp: exp, sessionNum: sessionNum, phaseNum: 3
                }
             );
            return;
        case 7:
            inst.endTraining(
                {pageNum: 1, isTraining: 1, phaseNum: 3, sessionNum: sessionNum},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 4, exp: exp, sessionNum: 0, phaseNum: 1
                }
            );
            return;
        case 8:
            inst.endExperiment(
                {pageNum: 1, isTraining: 1, phaseNum: 3, sessionNum: sessionNum},
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', exp: exp, sessionNum: sessionNum, phaseNum: 'end'
                }
            );
            return;
        case 9:
            inst.displayInstructionQuestionnaire(
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', exp: exp, sessionNum: 0, phaseNum: 'end', questNum: 0
                }
            );
            return;
        case 10:
            inst.nextSession(
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 4, exp: exp, sessionNum: sessionNum, phaseNum: phaseNum, questNum: questNum
                }
            );
            return;


        case 'end':
        case undefined:
            break;

        default:
            error('Instructions: non-expected state');
    }

    /* ============================ Test Management ================================ */

    let trialObj;
    let imgObj = [exp.images, exp.trainingImg][isTraining];
    let choice;

    switch (phaseNum) {

        case 1:
            // select stimuli depending on sessionNum;
            // Using arrays allows to avoid multiple if statements
            trialObj = [
                exp.trialObjLearning[sessionNum],
                exp.trialObjLearningTraining[Math.abs(sessionNum) - 1]][isTraining];

            let conditionObj = [
                exp.expCondition[sessionNum],
                exp.trainingCondition[Math.abs(sessionNum) - 1]][isTraining];

            choice = new ChoiceManager(
                {
                    trialObj: trialObj,
                    feedbackDuration: exp.feedbackDuration,
                    completeFeedback: exp.completeFeedback,
                    feedbackObj: exp.feedbackImg,
                    imgObj: imgObj,
                    conditionObj: conditionObj,
                    sessionNum: sessionNum,
                    phaseNum: phaseNum,
                    exp: exp,
                    elicitationType: -1,
                    showFeedback: true,
                    maxTrials: undefined,
                    // what will be executed next
                    nextFunc: stateMachine,
                    nextParams: {
                        instructionNum: 5,
                        sessionNum: sessionNum,
                        phaseNum: 2,
                        exp: exp,
                    }
                }
            );
            choice.run();
            return;

        case 2:
            // select stimuli depending on sessionNum;
            // Using arrays allows to avoid multiple if statements
            trialObj = [
                exp.trialObjChoiceElicitation[sessionNum],
                exp.trialObjChoiceElicitationTraining[Math.abs(sessionNum) - 1]][isTraining];

            choice = new ChoiceManager(
                {
                    trialObj: trialObj,
                    feedbackDuration: exp.feedbackDuration,
                    completeFeedback: exp.completeFeedback,
                    feedbackObj: exp.feedbackImg,
                    imgObj: imgObj,
                    sessionNum: sessionNum,
                    phaseNum: phaseNum,
                    exp: exp,
                    elicitationType: 0,
                    showFeedback: false,
                    maxTrials: undefined,
                    // what will be executed next
                    nextFunc: stateMachine,
                    nextParams: {
                        instructionNum: [6, 10][+(sessionNum===0)],
                        sessionNum: sessionNum+(sessionNum===0),
                        phaseNum: [[1, 3][isTraining], 3][isLastSession],
                        exp: exp,
                    }
                }
            );
            choice.run();
            return;

        case 3:

            // select stimuli depending on sessionNum;
            trialObj = [
                exp.trialObjSliderElicitation[sessionNum],
                exp.trialObjSliderElicitationTraining[Math.abs(sessionNum) - 1]][isTraining];

            let slider = new SliderManager(
                {
                    trialObj: trialObj,
                    feedbackDuration: exp.feedbackDuration-1500,
                    completeFeedback: exp.completeFeedback,
                    feedbackObj: exp.feedbackImg,
                    imgObj: imgObj,
                    sessionNum: sessionNum,
                    phaseNum: phaseNum,
                    exp: exp,
                    elicitationType: 2,
                    showFeedback: exp.showFeedback,
                    // what will be executed next
                    nextFunc: stateMachine,
                    nextParams: {
                        instructionNum: [[4, 7][isTraining], 9][isLastSession],
                        sessionNum: sessionNum,
                        phaseNum: [1, 'end'][isLastSession],
                        exp: exp,
                    }
                }
            );
            slider.run();
            return;

        case 'end':
        case undefined:
            break;

        default:
            error('Test: non-expected state');
    }

    /* ============================ Questionnaire Management ====================== */

    switch (questNum) {
        case 0:
            quest.runCRT(
                {questNum: 1},
                stateMachine,
                {
                    instructionNum: 'end', exp: exp, sessionNum: 0, phaseNum: 'end', questNum: 1
                }
            );
            return;
        case 1:
            quest.runSES(
                {questNum: 1},
                stateMachine,
                {
                    instructionNum: 8, exp: exp, sessionNum: 0, phaseNum: 'end', questNum: 'end'
                }
            );
            return;

        case 'end':
        case undefined:
            break;

        default:
            error('Questionnaire: non-expected state');

    }

}
