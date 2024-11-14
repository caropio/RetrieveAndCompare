import { GUI } from './gui.js'
import { sendToDB } from './request.js'
import { decode } from './utils.js'


export class Instructions {

    constructor(exp) {
        this.exp = exp
    }

    goFullscreen(nextFunc, nextParams) {

        GUI.panelSetTitle('Introduction')
        GUI.panelInsertParagraph('To continue the experiment, you must enable fullscreen')
        GUI.panelInsertButton({
            id: 'next', value: 'Next',
            clickFunc: function () {
                let elem = document.documentElement
                if (elem.requestFullscreen) {
                    elem.requestFullscreen()
                } else if (elem.mozRequestFullScreen) { /* Firefox */
                    elem.mozRequestFullScreen()
                } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
                    elem.webkitRequestFullscreen()
                } else if (elem.msRequestFullscreen) { /* IE/Edge */
                    elem.msRequestFullscreen()
                }
                nextFunc(nextParams)
            }
        })
    }

    setUserID(nextFunc, nextParams) {

        GUI.panelFlush()
        GUI.panelSetTitle('Identification')

        // prolific id is 24 characters
        GUI.panelInsertParagraph('Please enter your Prolific id.')
        GUI.panelInsertInput({ maxlength: 24, size: 24, id: 'ID', value: this.exp.subID })
        GUI.panelInsertButton({
            id: 'next', value: 'Next',
            clickArgs: { obj: this },
            clickFunc: function (event) {
                let answer = document.getElementById('ID').value

                if (answer.length === 24 || event.data.obj.exp.isTesting) {
                    event.data.obj.exp.subID = answer
                    nextFunc(nextParams)
                } else {
                    GUI.displayModalWindow('Error',
                        'You must enter a valid Prolific ID (24 alphanumeric characters).', 'error')
                }
            }
        })
    }

    displayConsent(nextFunc, nextParams) {

        GUI.panelFlush()

        GUI.panelSetTitle('Consent')

        GUI.panelInsertParagraphTitle('Information for the participant')
        GUI.panelInsertParagraph('You are about to participate in the research study entitled:\n' +
            'The domain-general role of reinforcement learning-based training in cognition across short and long time-spans.\n' +
            'Researcher in charge: Pr. Stefano PALMINTERI.\n' +
            'This study aims to understand the learning processes in decision-making. Its fundamental purpose is to investigate the cognitive mechanisms of these ' +
            'learning and decision-making processes.' +
            'The proposed experiments have no immediate application or clinical value, but they will allow us to improve our understanding of the functioning brain. ' +
            'We are asking you to participate in this study because you have been recruited by the RISC or Prolific platforms.')

        GUI.panelInsertParagraphTitle('Procedure')
        GUI.panelInsertParagraph('During your participation in this study, we will ask you to answer several simple ' +
            'questionnaires and tests, which do not require any particular competence.' +
            'Your internet-based participation will require approximately 50 minutes.')

        GUI.panelInsertParagraphTitle('Voluntary Participation And Confidentiality')
        GUI.panelInsertParagraph('Your participation in this study is voluntary. This means that you are consenting to participate in this project without external pressure.' +
            'During your participation in this project, the researcher in charge and his staff will collect and record information about you. ' +
            'In order to preserve your identity and the confidentiality of the data, the identification of each file will be coded, thus preserving the anonymity of your answers. ' +
            'We will not collect any personal data from the RISC or Prolific platforms. ' +
            'The researcher in charge of this study will only use the data for research purposes in order to answer the scientific objectives of the project.' +
            'The data may be published in scientific journals and shared within the scientific community, ' +
            'in which case no publication or scientific communication will contain identifying information.')


        GUI.panelInsertParagraphTitle('Research Results And Publication')
        GUI.panelInsertParagraph('You will be able to check the publications resulting from this study on the following link: \n' +
            'https://sites.google.com/site/stefanopalminteri/publications')

        GUI.panelInsertParagraphTitle('Contact And Additional Information')
        GUI.panelInsertParagraph('Email: humanreinforcementlearning@gmail.com\n' +
            'This research has received a favorable opinion from the Inserm Ethical Review Committee / IRB00003888 on February 6th, 2024.' +
            'Your participation in this research confirms that you have read this information and wish to participate in the research study.')

        GUI.panelInsertCheckBox({ text: 'I am 18 years old or more', id: 'c1' })
        GUI.panelInsertCheckBox({ text: 'My participation in this experiment is voluntary', id: 'c2' })
        GUI.panelInsertCheckBox({
            text: 'I understand that my data will be kept confidential and I can stop at any time without justification',
            id: 'c3'
        })

        let isTesting = this.exp.isTesting;
        GUI.panelInsertButton({
            value: 'Next', id: 'next',
            clickFunc: function () {
                if (($('input:checkbox:not(:checked)').length > 0) && (!isTesting)) {
                    GUI.displayModalWindow('Error', 'You must tick all check boxes to continue.', 'error')
                } else {
                    nextFunc(nextParams)
                }
            }
        })
    }

    nextSession(nextFunc, nextParams) {

        GUI.panelFlush()
        GUI.panelShow()
        GUI.setActiveCurrentStep('training')
        let sessionNum = nextParams['sessionNum'] + 1;
        GUI.setActiveCurrentStep('experiment' + sessionNum)

        GUI.panelSetTitle('End of the first part')

        GUI.panelSetParagraph(`
            • This the end of the first part of the experiment\n\n
            • You will now pass 3 tests that are identical to the ones during the training phase.
            • Please note that previous symbols are now replaced by new ones. 
        `)

        GUI.panelInsertDiv({ id: 'buttonBox' });
        GUI.panelInsertButton({
            id: 'next', value: 'Next', clickArgs: { obj: this }, div: 'buttonBox',
            classname: 'btn btn-default card-button',
            clickFunc: function (event) {
                setTimeout(
                    nextFunc(nextParams), 800
                )

            }
        })
    }

    displayInitialInstruction(funcParams, nextFunc, nextParams) {

        let nPages = 2
        let pageNum = funcParams['pageNum']

        GUI.panelFlush()
        GUI.panelSetTitle('General Instructions')

        let text = {
            1: ' • This experiment is composed of 3 main steps. \n\n'
                + ' • The first step is a training phase consisting in 3 different cognitive tests.\n\n'
                + ' • The actual experiment starts with the second step, i.e. the first phase of the experiment. It is composed of longer versions of the 3 cognitive tests .\n\n'
                + ' • The third step is the second phase of the experiment. It is also composed of longer versions of the 3 cognitive tests .\n\n',
            2: ' • In addition of the fixed compensation provided by Prolific, you have been endowed with an additional 2.5 pounds. \n\n'
                + ' • Depending on your choices you can either double this endowment or lose it. \n\n'
                + ' • Following experimental economics methodological standards, no deception is involved concerning the calculation of the final payoff.\n\n'
                + ' • Across the three phases of the experiment, you can win a bonus up to '
                + this.exp.maxPoints + ' points = ' + this.exp.pointsToPounds(this.exp.maxPoints).toFixed(2) + ' pounds!',
            3: ' • Points won during the training are not included in the final payoff.'
                + ' • Your progression in the experiment is displayed on the timeline on top of the page'
        }

        GUI.panelSetParagraph(text[pageNum])

        // to center two buttons inline
        GUI.panelInsertDiv({ id: 'buttonBox' })

        GUI.panelInsertButton({
            id: 'back', value: 'Back',
            div: 'buttonBox', classname: 'btn btn-default card-button',
            clickFunc: function () {
                if (pageNum > 1) {
                    pageNum--
                    GUI.panelSetParagraph(text[pageNum])
                }
                if (pageNum === 1) {
                    GUI.hideElement('back')
                }
            }
        })

        // If pagenum is 1 we can't go back
        if (pageNum === 1) {
            GUI.hideElement('back')
        }

        GUI.panelInsertButton({
            id: 'next', value: 'Next', clickArgs: { obj: this },
            div: 'buttonBox', classname: 'btn btn-default card-button',
            clickFunc: function (event) {

                GUI.showElement('back')
                if (pageNum < nPages) {
                    pageNum++
                    GUI.panelSetParagraph(text[pageNum])
                } else {
                    if (event.data.obj.exp.online) {
                        // sendToDB(0,
                        //     {
                        //         expID: event.data.obj.exp.expID,
                        //         id: event.data.obj.exp.subID,
                        //         exp: event.data.obj.exp.expName,
                        //         browser: event.data.obj.exp.browsInfo,
                        //         conversionRate: event.data.obj.exp.conversionRate
                        //     },
                        //     'php/InsertExpDetails.php'
                        // );
                    }
                    nextFunc(nextParams)
                }
            }
        })

    }

    displayInstructionLearning(funcParams, nextFunc, nextParams) {

        let pageNum = funcParams['pageNum']
        let isTraining = funcParams['isTraining']
        let sessionNum = funcParams['sessionNum'] + 1

        GUI.panelFlush()
        GUI.setActiveCurrentStep('training')
        if (!isTraining) {
            GUI.setActiveCurrentStep('experiment' + sessionNum)
        }

        GUI.panelSetTitle('Instructions for the first test')

        let text;
        if ([-1, 0, 1].includes(sessionNum)) {
            text = {
                1: ' • In each round you have to choose between one of two symbols displayed on either side of the screen. \n'
                    + ' • In a first step, you will have to select one of the two symbols by left-clicking on it.\n\n'
                    + '<center><b>Options</b></center>\n'
                    + [GUI.panelGenerateImg({ src: 'images/instructions/1.png', width: '40%' }),
                    GUI.panelGenerateImg({ src: 'images/instructions/3.png', width: '40%' })][+(isTraining)]
                    + '• After a choice, you can win/lose the following outcomes:\n\n'
                    + '1 point = +' + this.exp.pointsToPence(1).toFixed(2) + ' pence\n'
                    + '-1 points = -' + this.exp.pointsToPence(1).toFixed(2) + ' pence\n\n',
                2: ' • However, please note that this numerical outcome will not be directly displayed. Instead, in a second step, you will see the odds of losing/winning a point'
                    + ' associated to the two symbols previously displayed. Odds are represented by a pie-chart. Specifically, the green area indicates the chance of winning +1 (+1.32p) ; the red area indicates the chance of losing -1 (-1.32p).'
                    + ' Pie-charts go from 100% chance of winning a point to 100% chance of losing a point. \n\n'
                    + '<center><b>Outcomes</b></center>\n'
                    + GUI.panelGenerateImg({ src: 'images/instructions/4.png', width: '40%' })
                    + 'In the above example, the option on the left has been selected (its border is highlighted in black), and the outcome (the pie-chart) is shown. It will yield either +1, either -1, according to the odds displayed by the pie-chart.\n\n'
                    + ' • Please note that only the outcome of your choice will be taken into account in the final payoff.\n',
                3: ' • The different symbols are not equal in terms of outcome (and more precisely, in terms of odds of winning of losing/winning): in a given pair, one is in average more advantageous compared to the other. \n'
                    + 'At the end of the test you will be shown with the final payoff in terms of cumulated points and monetary bonus.\n\n'
                    + ['• Note: This test is like the first test of the training.\n'
                        + 'This is the actual game, every point will be included in the final payoff. \n\n Ready?',
                    ' • Let\'s begin with the first training test! \n\n'
                    + '(Note : points won during the training do not count for the final payoff!)'][+(isTraining)]
            }
            } else {
                text = {
                    1: ' • In each round you have to choose between one of two symbols displayed on either side of the screen. \n'
                        + ' • In a first step, you will have to select one of the two symbols by left-clicking on it.\n\n'
                        + GUI.panelGenerateImg({ src: 'images/instructions/1.png', width: '40%' })
                        + '• After a choice, you can win/lose the following outcomes:\n\n'
                    + '1 point = +' + this.exp.pointsToPence(1).toFixed(2) + ' pence\n'
                    + '-1 points = -' + this.exp.pointsToPence(1).toFixed(2) + ' pence\n\n'
                        + ' • Please note that only the outcome of your choice will be taken into account in the final payoff.\n'
                        + GUI.panelGenerateImg({ src: 'images/instructions/2.png', width: '40%' }),
                    2: ' • The different symbols are not equal in terms of outcome (and more precisely, in terms of odds of winning of losing/winning): in a given pair, one is in average more advantageous compared to the other. \n'
                        + 'At the end of the test you will be shown with the final payoff in terms of cumulated points and monetary bonus.\n\n'
                        + 'This is the actual game, every point will be included in the final payoff. \n\n Ready?'
                }
            }

            let nPages = Object.keys(text).length;

            GUI.panelSetParagraph(text[pageNum])

            // to center two buttons inline
            GUI.panelInsertDiv({ id: 'buttonBox' })

            GUI.panelInsertButton({
                id: 'back', value: 'Back',
                div: 'buttonBox', classname: 'btn btn-default card-button',
                clickFunc: function () {
                    if (pageNum > 1) {
                        pageNum--
                        GUI.panelSetParagraph(text[pageNum])
                    }
                    if (pageNum === 1) {
                        GUI.hideElement('back')
                    }
                }
            })

            // If pagenum is 1 we can't go back
            if (pageNum === 1) {
                GUI.hideElement('back')
            }

            GUI.panelInsertButton({
                id: 'next', value: 'Next', clickArgs: { obj: this },
                div: 'buttonBox', classname: 'btn btn-default card-button',
                clickFunc: function (event) {

                    GUI.showElement('back')
                    if (pageNum < nPages) {
                        pageNum++
                        GUI.panelSetParagraph(text[pageNum])
                    } else {
                        GUI.panelFlush()
                        GUI.panelHide()

                        setTimeout(
                            nextFunc(nextParams), 800
                        )

                    }
                }
            })
        }

        displayInstructionChoiceElicitation(funcParams, nextFunc, nextParams) {

            let pageNum = funcParams['pageNum']
            let phaseNum = funcParams['phaseNum']
            let isTraining = funcParams['isTraining']
            let sessionNum = funcParams['sessionNum'] + 1
            let points = this.exp.sumReward[phaseNum - 1]
            let pence = this.exp.pointsToPence(points).toFixed(2)
            let pounds = this.exp.pointsToPounds(points).toFixed(2)
            let nPages = 3

            GUI.panelFlush()
            GUI.panelShow()
            GUI.setActiveCurrentStep('training')

            if (!isTraining) {
                GUI.setActiveCurrentStep('experiment' + sessionNum)
            }

            GUI.panelSetTitle('Instructions for the second test')

            let text
            if (isTraining) {
                text = {
                    1: ' • In each round you have to choose between one of two items displayed on either side of the screen. \n'
                        + ' • You can select one of the two symbols by left-clicking on it.\n'
                        + ' • Please note that in this test, <b>no outcome will be displayed</b>, such that after a choice, the next pair of options will be shown without intermediate step.\n'
                        + ' • At the end of the test you will be shown with the final payoff in terms of cumulated points and monetary bonus.',
                    2: ' • In the second test  there will be two kind of options. \n'
                        + ' • The first kind of options is represented by the symbols you already met during the previous test.\n'
                        + GUI.panelGenerateImg({ src: 'images/cards_gif/stim/A.jpg', width: '15%' })
                        + 'Note: the symbols keep the same odds of winning / losing a point as in the first test.\n\n'
                        + ' • The second kind of options is represented by pie-charts explicitly describing the odds of winning / losing a point.\n'
                        + GUI.panelGenerateImg({ src: 'images/cards_gif/lotteries/0.png', width: '15%' })
                        + 'Specifically, the green area indicates the chance of winning +1 (+' + this.exp.pointsToPence(1).toFixed(2) + 'p) ; the red area indicates the chance of losing -1 (-'
                        + this.exp.pointsToPence(1).toFixed(2) + 'p).\n'
                        + 'Pie-charts go from 100% chance of winning a point to 100% chance of losing a point.\n\n'
                        // + ' • Sometimes the pie-chart will be hidden an represented by a question mark, in such a way that the odds of winning / losing are unknown.\n\n'
                        // + GUI.panelGenerateImg({src: 'images/cards_gif/stim/question.jpg', width: '15%'})
                        // + 'As for regular pie-charts, hidden pie-charts go from 70% chance of winning a point to 70% chance of losing a point.\n\n'
                        + ' • Sometimes you will be asked to choose between two symbols, a pie-chart and a symbol, and sometimes between two pie-charts.\n',
                    3: ' • (Note : points won during the training do not count for the final payoff!) \n\n'
                        + ' • Let\'s begin with the second training test! \n\n'
                }
            } else {
                text = {
                    1: ' • In each round you have to choose between one of two items displayed on either side of the screen. \n'
                        + 'You can select one of the two symbols by left-clicking on it.\n\n'
                        + ' • Please note that in this test, <b>no outcome will be displayed</b>, such that after a choice, the next pair of options will be shown without intermediate step.\n'
                        + ' • At the end of the test you will be shown with the final payoff in terms of cumulated points and monetary bonus.',
                    2: ' • In the second test  there will be two kind of options. \n'
                        + ' • The first kind of options is represented by the symbols you already met during the previous test.\n'
                        + GUI.panelGenerateImg({ src: 'images/cards_gif/stim_old/2.gif', width: '15%' })
                        + 'Note: the symbols keep the same odds of winning / losing a point as in the first test. \n\n'
                        + ' • The second kind of options is represented by pie-charts explicitly describing the odds of winning / losing a point.\n'
                        + GUI.panelGenerateImg({ src: 'images/cards_gif/lotteries/0.png', width: '15%' })
                        + 'Specifically, the green area indicates the chance of winning +1 (+' + this.exp.pointsToPence(1).toFixed(2) + 'p) ; the red area indicates the chance of losing -1 (-'
                        + this.exp.pointsToPence(1).toFixed(2) + 'p).\n'
                        + 'Pie-charts go from 100% chance of winning a point to 100% chance of losing a point.\n\n'
                        // + ' • Sometimes the pie-chart will be hidden an represented by a question mark, in such a way that the odds of winning / losing are unknown.\n'
                        // + GUI.panelGenerateImg({src: 'images/cards_gif/stim/question.jpg', width: '15%'})
                        // + 'As for regular pie-charts, hidden pie-charts go from 70% chance of winning a point to 70% chance of losing a point.\n\n'
                        + ' • Sometimes you will be asked to choose between two symbols, a pie-chart and a symbol, and sometimes between two pie-charts.\n',
                    3: '• Note: This test is like the second test of the training.\n'
                        + 'This is the actual game, every point will be included in the final payoff. \n\n Ready?',
                }
            }

            GUI.panelSetParagraph(text[pageNum])

            // to center two buttons inline
            GUI.panelInsertDiv({ id: 'buttonBox' })

            GUI.panelInsertButton({
                id: 'back', value: 'Back',
                div: 'buttonBox', classname: 'btn btn-default card-button',
                clickFunc: function () {
                    if (pageNum > 1) {
                        pageNum--
                        GUI.panelSetParagraph(text[pageNum])
                    }
                    if (pageNum === 1) {
                        GUI.hideElement('back')
                    }
                }
            })

            // If pagenum is 1 we can't go back
            if (pageNum === 1) {
                GUI.hideElement('back')
            }

            GUI.panelInsertButton({
                id: 'next', value: 'Next', clickArgs: { obj: this },
                div: 'buttonBox', classname: 'btn btn-default card-button',
                clickFunc: function (event) {

                    GUI.showElement('back')
                    if (pageNum < nPages) {
                        pageNum++
                        GUI.panelSetParagraph(text[pageNum])
                    } else {
                        GUI.panelFlush()
                        GUI.panelHide()

                        setTimeout(
                            nextFunc(nextParams), 800
                        )

                    }
                }
            })
        }

        displayInstructionSliderElicitation(funcParams, nextFunc, nextParams) {

            let pageNum = funcParams['pageNum']
            let phaseNum = funcParams['phaseNum']
            let isTraining = funcParams['isTraining']
            let sessionNum = funcParams['sessionNum'] + 1
            let points = this.exp.sumReward[phaseNum - 1]
            // let pence = this.exp.pointsToPence(points).toFixed(2)
            // let pounds = this.exp.pointsToPounds(points).toFixed(2)
            let nPages = 2

            GUI.panelFlush()
            GUI.panelShow()
            GUI.setActiveCurrentStep('training')
            if (!isTraining) {
                GUI.setActiveCurrentStep('experiment' + sessionNum)
            }
            GUI.panelSetTitle('Instructions for the third test')

            let text = {
                1: ` • In each round of the third test you will be presented with the symbols and pie-charts you met in the first and the second test. This is the occasion to test your knowledge of each symbol average outcome. \n
                     • You will be asked to indicate (in percentages), what are the odds that a given symbol or pie-chart makes you win a point (+1=+${this.exp.pointsToPence(1).toFixed(2)}p).\n\n
                     • You will be able to do this through moving a slider on the screen and then confirm your final answer by clicking on the confirmation button.\n\n
                     • 100%  = the symbol (or pie-chart) always gives +1pt.\n
                     • 50%  = the symbol (or pie-chart) always gives +1pt or -1pt with equal chances.\n
                     • 0% = the symbol (or pie-chart) always gives -1pt.\n`
            }
            if (isTraining) {
                text[2] = ' • Let\'s begin with the third training test!\n\n'
                    + ' • Note : points won during the training do not count for the final payoff !)';
            } else {
                text[2] = ' • Let\'s begin with the third training test!\n\n'
                    + ' • Note: This test is like the third test of the training.\n\n '
            }

            GUI.panelSetParagraph(text[pageNum])

            // to center two buttons inline
            GUI.panelInsertDiv({ id: 'buttonBox' })

            GUI.panelInsertButton({
                id: 'back', value: 'Back',
                div: 'buttonBox', classname: 'btn btn-default card-button',
                clickFunc: function () {
                    if (pageNum > 1) {
                        pageNum--
                        GUI.panelSetParagraph(text[pageNum])
                    }
                    if (pageNum === 1) {
                        GUI.hideElement('back')
                    }
                }
            })

            // If pagenum is 1 we can't go back
            if (pageNum === 1) {
                GUI.hideElement('back')
            }

            GUI.panelInsertButton({
                id: 'next', value: 'Next', clickArgs: { obj: this },
                div: 'buttonBox', classname: 'btn btn-default card-button',
                clickFunc: function (event) {

                    GUI.showElement('back')
                    if (pageNum < nPages) {
                        pageNum++
                        GUI.panelSetParagraph(text[pageNum])
                    } else {
                        GUI.panelFlush()
                        GUI.panelHide()

                        setTimeout(
                            nextFunc(nextParams), 800
                        )

                    }
                }
            })
        }

        displayInstructionQuestionnaire(nextFunc, nextParams) {

            GUI.panelFlush()
            GUI.panelShow()
            GUI.setActiveCurrentStep('questionnaire')
            GUI.panelSetTitle('Questionnaire')

            GUI.panelSetParagraph(
                ` • You will now have to answer a few questions.\n\n
              • This won\'t take more than a few more minutes. Your answers remain anonymous and will not be disclosed.\n\n
              • Note that the experiment will be considered completed (and the payment issued) only if the questionnaires are correctly filled.\n\n
              • Please click "Start" when you are ready.`)

            GUI.panelInsertButton({
                id: 'next', value: 'Start', clickArgs: { obj: this },
                classname: 'btn btn-default card-button card-center',
                clickFunc: function (event) {
                    setTimeout(
                        nextFunc(nextParams), 800
                    )

                }
            })

        }

        endTraining(funcParams, nextFunc, nextParams) {

            let totalPoints
            let pence
            let pounds
            let wonlost
            let sessionNum = funcParams['sessionNum'];
            let maxTrainingNum = funcParams['maxTrainingNum'];

            totalPoints = this.exp.sumReward[1] + this.exp.sumReward[2] + this.exp.sumReward[3]
            pence = this.exp.pointsToPence(totalPoints).toFixed(2)
            pounds = this.exp.pointsToPounds(totalPoints).toFixed(2)

            wonlost = ['won', 'lost'][+(totalPoints < 0)]

            GUI.panelFlush()
            GUI.panelShow()
            GUI.setActiveCurrentStep('training')

            GUI.panelSetTitle('End of training')

            GUI.panelSetParagraph(`• The training is over!\n\n
         • Overall, in this training, you ${wonlost} ${totalPoints.toFixed(2)} points = ${pence} pence = ${pounds} pounds!\n\n
         • Now, you are about to start the first phase of the experiment. Note that from now on the points will be counted in your final payoff.\n
           Also note that the experiment includes much more trials and more points are at stake, compared to the training.\n
           Finally note that the real test will involve different symbols (i.e., not encountered in the training).\n\n
         • If you want you can do the training a second time.
        `)

            // to center two buttons inline
            GUI.panelInsertDiv({ id: 'buttonBox' })

            if (sessionNum != maxTrainingNum) {
                GUI.panelInsertButton({
                    id: 'toTraining', value: 'Restart training',
                    div: 'buttonBox', classname: 'btn btn-default card-button',
                    clickFunc: function (event) {
                        event.data.obj.exp.sumReward.fill(0)
                        nextParams['phaseNum'] = 1
                        nextParams['sessionNum'] = -2
                        nextParams['instructionNum'] = 4
                        nextFunc(nextParams)
                    },
                    clickArgs: { obj: this }
                })
            }

            GUI.panelInsertButton({
                id: 'next', value: 'Next', clickArgs: { obj: this },
                div: 'buttonBox', classname: 'btn btn-default card-button',
                clickFunc: function (event) {
                    event.data.obj.exp.sumReward.fill(0)

                    GUI.setActiveCurrentStep('experiment' + (sessionNum + 1))
                    setTimeout(
                        nextFunc(nextParams), 800
                    )

                }
            })
        }

        endExperiment() {

            GUI.initGameStageDiv()

            let points = this.exp.totalReward
            let pence = this.exp.pointsToPence(points).toFixed(2)
            let pounds = this.exp.pointsToPounds(points).toFixed(2)

            let wonlost = [' won ', ' lost '][+(points < 0)]

            let Title = '<h3 align = "center">The game is over!<br>' +
                'You ' + wonlost + points + ' points in total, which is ' + pence + ' pence = ' + pounds + ' pounds!<br><br>'
                + 'With your initial endowment, you won a total bonus of ' + (parseFloat(pence) + 250) + ' pence = ' + (parseFloat(pounds) + 2.5) + ' pounds!<br><br>' +
                'Thank you for playing!<br><br><a href="' + decode(this.exp.compLink) + '">Please click the link to complete this study</a><br></h3><br>'

            $('#stim-box').html(Title)
        }

    }
