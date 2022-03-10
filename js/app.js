import { ExperimentParameters } from "./modules/exp.js";
import { Instructions } from "./modules/inst.js";
import { Questionnaire } from "./modules/quest.js";
import { GUI } from "./modules/gui.js";
import { ChoiceManager, SliderManager } from "./modules/trial_manager.js";
import { saveState, stateStored, loadState } from './modules/utils.js';

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
    // these four variables indicate what
    // has to be run in the state machine (i.e. current state of the experiment)
    // initial values are:
    // let sessionNum = -1; training sessions are < 0 
    // let phaseNum = 1; phases starts at 1
    // let instructionNum = 0; 
    // let questNum = 0;
    let stateEnabled = 1;

    let sessionNum = 0;
    let phaseNum = 1;
    let instructionNum = 0;
    let questNum = 'end';

    // instantiate experiment parameters
    let exp = new ExperimentParameters(
        {
            online: true,   // send network requests
            isTesting: true, // isTesting==in development vs in production
            expName: 'EvOutcome', // experience name
            completeFeedback: true, // display feedback of both options
            maxPoints: undefined, // max points cumulated all along the experiment
            // if undefined or 0, will be computed automatically
            maxCompensation: 250, // in pence (in addition of the initial endowment)
            feedbackDuration: 1400, // how many milliseconds we present the outcome
            beforeFeedbackDuration: 900, // how many milliseconds before the outcome
            maxTrainingNum: -2, // if sessionNum == maxTrainingNum
            // do not allow for new training sessions
            nTrialPerConditionTraining: 5,
            nTrialPerCondition: 28,
            nSession: 2,
            nCond: 4,
            imgPath: 'images/cards_gif/',
            compLink: 'aHR0cHM6Ly9hcHAucHJvbGlmaWMuYWMvc3VibWlzc2lvbnMvY29tcGxldGU/Y2M9Uk5GUzVIUDU=',
            fromCookie: false
        }
    );

    // if (exp.isTesting) {
    //     $('#experiment2').click(() => {
    //         ((instructionNum, sessionNum, phaseNum, questNum, exp) => {
    //         sessionNum = 1;
    //         phaseNum = 1;
    //         instructionNum = 4;
    //         stateMachine(
    //             { instructionNum, sessionNum, phaseNum, questNum, exp }
    //         )})(instructionNum, sessionNum, phaseNum, questNum, exp);
    //     });
    //     $('#experiment1').click(() => {
    //         ((instructionNum, sessionNum, phaseNum, questNum, exp) => {
    //         sessionNum = 0;
    //         phaseNum = 1;
    //         instructionNum = 4;
    //         stateMachine(
    //             {instructionNum, sessionNum, phaseNum, questNum, exp}
    //         )})(instructionNum, sessionNum, phaseNum, questNum, exp);
    //     });

    //     $('#training').click(() => {
    //         sessionNum = -1;
    //         phaseNum = 1;
    //         instructionNum = 4;
    //         stateMachine({ instructionNum, sessionNum, phaseNum, questNum, exp })
    //     });

    //     $('#introduction').click(() => {
    //         sessionNum = -1;
    //         phaseNum = 1;
    //         instructionNum = 1;
    //         stateMachine({ instructionNum, sessionNum, phaseNum, questNum, exp })
    //     });

    // }

    // manage state
    // if user closes/reloads the tab he/she has the possibility
    // to continue where he left off
    if (stateStored() && stateEnabled) {
        GUI.displayChoiceModalWindow('Continue experiment?',
            'Do you want to continue the experiment where you left off?', 'Continue', 'Reset',
            // if continue
            function () {
                stateManagement();
            },
            // if reset
            function () {
                // // Run experiment!!
                stateMachine({ instructionNum, sessionNum, phaseNum, questNum, exp });
            }
        );
    } else {
        // // Run experiment!!
        stateMachine({ instructionNum, sessionNum, phaseNum, questNum, exp });
    }
}


function stateManagement() {
    let [sessionNum, instructionNum, phaseNum, questNum, prevexp] = loadState();
    // instantiate new exp with previous exp parameters
    let exp = new ExperimentParameters(
        {
            online: prevexp.online,   // send network requests
            isTesting: prevexp.isTesting, // isTesting==in development vs in production
            expName: prevexp.expName, // experience name
            completeFeedback: prevexp.completeFeedback, // display feedback of both options
            maxPoints: prevexp.maxPoints, // max points cumulated all along the experiment
            // if undefined or 0, will be computed automatically
            maxCompensation: prevexp.maxCompensation, // in pence (in addition of the initial endowment)
            feedbackDuration: prevexp.feedbackDuration, // how many milliseconds we present the outcome
            beforeFeedbackDuration: prevexp.beforeFeedbackDuration, // how many milliseconds before the outcome
            maxTrainingNum: prevexp.maxTrainingNum, // if sessionNum == maxTrainingNum
            // do not allow for new training sessions
            nTrialPerConditionTraining: prevexp.nTrialPerConditionTraining,
            nTrialPerCondition: prevexp.nTrialPerCondition,
            nSession: prevexp.nSession,
            nCond: prevexp.nCond,
            imgPath: prevexp.imgPath,
            compLink: prevexp.compLink, // prolific completion link
            fromCookie: true,
            obj: prevexp,
        }
    );
    // // Run experiment!!
    stateMachine({ instructionNum, sessionNum, phaseNum, questNum, exp });
}


function stateMachine({ instructionNum, sessionNum, phaseNum, questNum, exp } = {}) {

    saveState({
        instructionNum: instructionNum, sessionNum: sessionNum,
        phaseNum: phaseNum, questNum: questNum, exp: exp
    });

    
    
    let inst;
    if (instructionNum != 'end')
        inst = new Instructions(exp);
    let quest = new Questionnaire(exp);

    /* ============================ Instructions Management ========================== */

    // if sessionNum < 0, then it is a training session
    // here training sessionNum is in {-1, -2}
    let isTraining = +(sessionNum < 0);
    let isLastSession = +(sessionNum === (exp.nSession - 1));

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
                { pageNum: 1 },
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 4, exp: exp, sessionNum: sessionNum, phaseNum: 1
                }
            );
            return;

        case 4:
            inst.displayInstructionLearning(
                { pageNum: 1, isTraining: isTraining, phaseNum: 1, sessionNum: sessionNum },
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', exp: exp, sessionNum: sessionNum, phaseNum: 1
                }
            );
            return;

        case 5:
            inst.displayInstructionChoiceElicitation(
                { pageNum: 1, isTraining: isTraining, phaseNum: 2, sessionNum: sessionNum },
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', exp: exp, sessionNum: sessionNum, phaseNum: 2
                }
            );
            return;

        case 6:
            inst.displayInstructionSliderElicitation(
                { pageNum: 1, isTraining: isTraining, phaseNum: 3, sessionNum: sessionNum },
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 'end', exp: exp, sessionNum: sessionNum, phaseNum: 3
                }
            );
            return;
        case 7:
            inst.endTraining(
                { pageNum: 1, isTraining: 1, phaseNum: 3, sessionNum: sessionNum, maxTrainingNum: exp.maxTrainingNum },
                // what will be executed next
                stateMachine,
                {
                    instructionNum: 4, exp: exp, sessionNum: 0, phaseNum: 1
                }
            );
            return;
        case 8:
            inst.endExperiment(
                { pageNum: 1, isTraining: 1, phaseNum: 3, sessionNum: sessionNum },
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
                    instructionNum: 4, exp: exp, sessionNum: sessionNum + 1, phaseNum: phaseNum, questNum: questNum
                }
            );
            return;


        case 'end':
        case undefined:
            break;

        default:
            console.error('Instructions: non-expected state');
    }



    /* ============================ Test Management ================================ */

    // select stimuli depending on sessionNum;
    // Using arrays allows to avoid multiple if statements
    let trialObj;
    if (phaseNum !== 'end')
        trialObj = isTraining ? 
        exp.trialObjTraining[phaseNum][Math.abs(sessionNum) - 1] : exp.trialObj[phaseNum][sessionNum];

    let imgObj = [exp.images, exp.trainingImg][isTraining];
    let choice;

    switch (phaseNum) {

        case 1:

            choice = new ChoiceManager(
                {
                    trialObj: trialObj,
                    feedbackDuration: exp.feedbackDuration,
                    beforeFeedbackDuration: exp.beforeFeedbackDuration,
                    completeFeedback: exp.completeFeedback,
                    feedbackObj: exp.feedbackImg,
                    outcomeType: [1, 2][+(sessionNum==0)],
                    imgObj: imgObj,
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

            choice = new ChoiceManager(
                {
                    trialObj: trialObj,
                    feedbackDuration: exp.feedbackDuration,
                    beforeFeedbackDuration: exp.beforeFeedbackDuration,
                    completeFeedback: exp.completeFeedback,
                    feedbackObj: exp.feedbackImg,
                    imgObj: imgObj,
                    sessionNum: sessionNum,
                    phaseNum: phaseNum,
                    exp: exp,
                    elicitationType: 0,
                    showFeedback: [1].includes(sessionNum),
                    maxTrials: undefined,
                    // what will be executed next
                    nextFunc: stateMachine,
                    nextParams: {
                        instructionNum: 6,
                        sessionNum: sessionNum,
                        phaseNum: 3,
                        exp: exp,
                    }
                }
            );
            choice.run();
            return;

        case 3:

            let slider = new SliderManager(
                {
                    trialObj: trialObj,
                    feedbackDuration: exp.feedbackDuration - 1500,
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
                        instructionNum: [[10, 7][isTraining], 8][isLastSession],
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
                { questNum: 1 },
                stateMachine,
                {
                    instructionNum: 'end', exp: exp, sessionNum: 0, phaseNum: 'end', questNum: 1
                }
            );
            return;
        case 1:
            quest.runSES(
                { questNum: 1 },
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
