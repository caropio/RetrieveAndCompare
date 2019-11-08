import {GUI} from './gui.js';
import {sendToDB} from "./request.js";


export class Instructions {

    constructor(exp) {
        this.exp = exp;
    }

    goFullscreen(nextFunc, nextParams) {

        GUI.init();

        let Title = '<H3 align = "center">To continue the experiment, you must enable fullscreen.</H3><br>';
        let Button = '<div align="center">' +
            '<input align="center" id="fullscreen" type="button" value="Enable fullscreen"' +
            ' class="btn btn-default" onclick="openFullscreen();"></div>';

        $('#TextBoxDiv').html(Title);
        $('#Bottom').html(Button);

        let elem = document.documentElement;
        let button = document.getElementById('fullscreen');

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
            nextFunc(nextParams);
        }
    }

    setUserID(nextFunc, nextParams) {

        GUI.init();

        // prolific id is 24 characters
        let Title = '<H3 align = "center">Please enter your Prolific ID: <input maxlength="24" size="24" type="text" id = "textbox_id" name="ID"></H3>';
        let Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="toConsent" value="Next" ></div>';

        let TextInput = '';

        $('#TextBoxDiv').html(Title + TextInput);

        $('#Bottom').html(Buttons);

        $('#toConsent').click({obj: this}, function (event) {

            let answer = document.getElementById('textbox_id').value;

            if (answer.length === 24 || event.data.obj.exp.isTesting) {
                event.data.obj.exp.subID = answer;
                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();
                nextFunc(nextParams);
            } else {
                GUI.displayModalWindow('Error', 'You must enter a valid Prolific ID (24 alphanumeric characters).', 'error');
            }
        });
    };

    displayConsent(nextFunc, nextParams) {

        GUI.init();

        let Title = '<H2 align = "center">CONSENT</H2><br>';

        let Info = '<H4>INFORMATION FOR THE PARTICIPANT</H4>' +
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

        let Ticks = '<H4><input type="checkbox" name="consent" value="consent1"> I am 18 years old or more<br>' +
            '<input type="checkbox" name="consent" value="consent2"> My participation in this experiment is voluntary <br>' +
            '<input type="checkbox" name="consent" value="consent3"> I understand that my data will be kept confidential and I can stop at any time without justification <br></H4>';

        let Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="toInstructions" value="Next" ></div>';

        $('#TextBoxDiv').html(Title + Info + Ticks);
        $('#Bottom').html(Buttons);

        $('#toInstructions').click(function () {
            if ($("input:checkbox:not(:checked)").length > 0) {
                GUI.displayModalWindow('Error', 'You must tick all check boxes to continue.', 'error');
            } else {
                $('#TextBoxDiv').remove();
                $('#Stage').empty();
                $('#Bottom').empty();
                nextFunc(nextParams);
            }
        });
    }

    displayInitialInstruction(funcParams, nextFunc, nextParams) {

        let nPages = 2;
        let pageNum = funcParams["pageNum"];

        GUI.init();

        let Title = '<H2 align = "center">INSTRUCTIONS</H2>';
        let Info;
        switch (pageNum) {

            case 1:
                Info = '<H3 align = "center">This experiment is composed of 4 phases.<br><br>'
                    + 'The first three phases consist in different cognitive tests.<br><br>'
                    + 'The last phase consists in a short questionnaire.<br><br>'
                    + 'There will be a training session composed of shorter versions of the 3 phases before the actual experiment starts.<br>'
                    + '<br><br> </H3>';
                break;

            case 2:
                Info = '<H3 align = "center">In addition of the fixed compensation provided by Profilic, you have been endowed with an additional 2.5 pounds. '
                    + '<br><br>Depending on your choices you can either double this endowment or lose it.<br><br>'
                    + 'Following experimental economics methodological standards, no deception is involved concerning the calculation of the final payoff.'
                    + '<br> Across the three phases of the experiment, you can win a bonus up to ' + this.exp.maxPoints + ' points = ' + this.exp.pointsToPounds(this.exp.maxPoints).toFixed(2) + ' pounds!';
                break;
        }
        $('#TextBoxDiv').html(Title + Info);

        let Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Back" value="Back" >\n\
		<input align="center" type="button"  class="btn btn-default" id="Next" value="Next" ></div>';

        $('#Bottom').html(Buttons);

        if (pageNum === 1) {
            $('#Back').hide();
        }

        $('#Back').click({obj: this}, function (event) {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            if (pageNum === 1) {
            } else {
                event.data.obj.displayInitialInstruction({pageNum: pageNum - 1}, nextFunc, nextParams);
            }

        });

        $('#Next').click({obj: this}, function (event) {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            if (pageNum < nPages) {
                event.data.obj.displayInitialInstruction({pageNum: pageNum + 1}, nextFunc, nextParams);
            } else {
                if (event.data.obj.exp.online) {
                    sendToDB(0,
                        {
                            expID: event.data.obj.exp.expID,
                            id: event.data.obj.exp.subID,
                            exp: event.data.obj.exp.expName,
                            browser: event.data.obj.exp.browsInfo,
                            conversionRate: event.data.obj.exp.conversionRate
                        },
                        'php/InsertExpDetails.php'
                    );
                }
                nextFunc(nextParams);
            }
        });
    }

    displayInstructionLearning(funcParams, nextFunc, nextParams) {

        GUI.init();

        let nPages = 3;
        let pageNum = funcParams["pageNum"];
        let isTraining = funcParams["isTraining"];
        let phaseNum = funcParams['phaseNum'];

        let Title;
        if (isTraining) {
            Title = '<H2 align="center">TRAINING</H2>';
        } else {
            Title = '<H2 align="center">PHASE ' + phaseNum + '</H2>';
        }
        let Info;

        switch (pageNum) {

            case 1:
                Info = '<H3 align="center"><b>Instructions for the first test (1/2)</b><br><br>'
                    + 'In each round you have to choose between one of two symbols displayed on either side of the screen.<br><br>'
                    + 'You can select one of the two symbols by left-clicking on it. <br><br>'
                    + 'After a choice, you can win/lose the following outcomes:<br><br>'
                    + '1 point = +' + this.exp.pointsToPence(1).toFixed(2) + ' pence<br>'
                    + '-1 points = -' + this.exp.pointsToPence(1).toFixed(2) + ' pence<br><br>'
                    + 'The outcome of your choice will appear in the location of the symbol you chose.<br><br>'
                    + 'The outcome you would have won by choosing the other option will also be displayed.<br><br>'
                    + 'Please note that only the outcome of your choice will be taken into account in the final payoff.<br><br></H3>';
                break;

            case 2:
                Info = '<H3 align="center"><b>Instructions for the first test (2/2)</b><br><br>'
                    + 'The different symbols are not equal in terms of outcome: one is in average more advantageous compared to the other in terms of points to be won.<br><br>'
                    + 'At the end of the test you will be shown with the final payoff in terms of cumulated points and monetary bonus.<br><br></H3>';

                break;

            case 3:
                let like;
                if (isTraining) {
                    Info = '<H3 align="center">Let' + "'s " + 'begin with the first training test!<br><br>'
                        + '<b>(Note : points won during the training do not count for the final payoff !)<br><br>'
                        + 'The word "ready" will be displayed before the actual game starts.</H3></b><br><br>';
                    like = '';
                } else {
                    Title = '<H2 align="center">PHASE ' + phaseNum + '</H2><br>';
                    Info = '<h3 align="center"><b>Note:</b> The test of the phase 1 is like the first test of the training.<br><br>';

                    like = 'This is the actual game, every point will be included in the final payoff.<br><br>'
                        + 'Ready? <br></H3>';
                }
                Info += like;
                break;
        }

        $('#TextBoxDiv').html(Title + Info);

        let Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Back" value="Back" >\n\
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

        $('#Back').click({obj: this}, function (event) {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            funcParams['pageNum'] -= 1;

            if (pageNum === 1) {
            } else {
                event.data.obj.displayInstructionLearning(funcParams, nextFunc, nextParams);
            }

        });
        $('#Next').click({obj: this}, function (event) {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            funcParams['pageNum'] += 1;
            event.data.obj.displayInstructionLearning(funcParams, nextFunc, nextParams);
        });

        $('#Start').click({obj: this}, function (event) {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            nextFunc(nextParams);
        });
    }

    displayInstructionChoiceElicitation(funcParams, nextFunc, nextParams) {

        GUI.init();

        let isTraining = funcParams['isTraining'];
        let phaseNum = funcParams['phaseNum'];
        let pageNum = funcParams['pageNum'];
        let points = this.exp.sumReward[phaseNum - 1];
        let pence = this.exp.pointsToPence(points).toFixed(2);
        let pounds = this.exp.pointsToPounds(points).toFixed(2);
        let nPages = 3;
        let Title;
        let p;
        let like;
        let wonlost;

        let Info;
        let trainstring;

        if (isTraining) {
            Title = '<H2 align = "center">TRAINING</H2><br>';
            p = '<b>(Note: points won during the training do not count for the final payoff!)<br><br>'
                + '<b>The word "ready" will be displayed before the actual game starts.</b></H3><br><br>';
            like = '';
        } else {
            Title = '<H2 align = "center">PHASE ' + phaseNum + '</H2><br>';
            like = '<h3 align="center"><b>Note:</b> The test of the phase 2 is like the second test of the training.</h3><br><br>';

            p = '<H3 align="center">This is the actual game, every point will be included in the final payoff.<br><br>'
                + 'Ready? <br></H3>';
        }

        switch (pageNum) {
            case 1:
                wonlost = ['won', 'lost'][+(points < 0)];

                Info = '<H3 align = "center">You ' + wonlost + ' ' + points +
                    ' points = ' + pence + ' pence = ' + pounds + ' pounds!</h3><br><br>';


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
                    + '<b>Note</b>: the symbols keep the same odds of winning / losing a point as in the first test.<br><br>'
                    + 'The second kind of options is represented by pie-charts explicitly describing the odds of winning / losing a point.<br><br>'
                    + 'Specifically, the green area indicates the chance of winning +1 (+' + this.exp.pointsToPence(1).toFixed(2) + 'p) ; the red area indicates the chance of losing -1 (+'
                    + this.exp.pointsToPence(1).toFixed(2) + 'p).<br><br>'
                    + 'Sometimes you will be asked to choose between two symbols, sometime between two pie-charts, and sometimes between a pie-chart and a symbol.<br><br>';
                break;

            case 3:
                if (isTraining) {
                    trainstring = "Let's begin with the second training test!<br>";
                } else {
                    trainstring = "";
                }

                Info = '<H3 align="center">' + trainstring + like + p;
                break;

        }

        $('#TextBoxDiv').html(Title + Info);

        let Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Back" value="Back" >\n\
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

        $('#Back').click({obj: this}, function (event) {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            funcParams['pageNum'] -= 1;

            if (pageNum === 1) {
            } else {
                event.data.obj.displayInstructionChoiceElicitation(funcParams, nextFunc, nextParams);
            }
        });

        $('#Next').click({obj: this}, function (event) {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            funcParams['pageNum'] += 1;
            event.data.obj.displayInstructionChoiceElicitation(funcParams, nextFunc, nextParams);

        });

        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            let ready;
            let steady;
            let go;

            if (isTraining) {
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
                            nextFunc(nextParams);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 10);
        });
    }

    displayInstructionSliderElicitation(funcParams, nextFunc, nextParams) {

        GUI.init();

        let isTraining = funcParams['isTraining'];
        let pageNum = funcParams['pageNum'];
        let phaseNum = funcParams['phaseNum'];

        let trainstring;
        let wonlost;

        let points = this.exp.sumReward[phaseNum - 1];
        let pence = this.exp.pointsToPence(points).toFixed(2);
        let pounds = this.exp.pointsToPounds(points).toFixed(2);

        let nPages = 4;

        let Info;
        let Title;

        if (isTraining) {
            Title = '<H2 align="center">TRAINING</H2><br>';
        } else {
            Title = '<H2 align="center">PHASE ' + phaseNum + '</H2><br>';

        }

        switch (pageNum) {
            case 1:
                wonlost = ['won', 'lost'][+(points < 0)];

                Info = '<H3 align = "center">You ' + wonlost + ' ' + points +
                    ' points = ' + pence + ' pence = ' + pounds + ' pounds!</h3><br><br>';

                Info += '<H3 align = "center"><b>Instructions for the third test (1/3)</b><br><br>'
                    + 'In each round of third test you will be presented with the symbols and pie-charts you met in the first and the second test.<br><br>'
                    + 'You will be asked to indicate (in percentages), what are the odds that a given symbol or pie-chart makes you win a point (+1=+' + this.exp.pointsToPence(1).toFixed(2) + 'p).<br><br>'
                    + 'You will be able to do this through moving a slider on the screen and then confirm your final answer by clicking on the confirmation button.<br><br>'
                    + '100%  = the symbol (or pie-chart) always gives +1pt.<br>'
                    + '50%  = the symbol (or pie-chart) always gives +1pt or -1pt with equal chances.<br>'
                    + '0% = the symbol (or pie-chart) always gives -1pt.<br><br>';
                break;

            case 2:
                Info = '<H3 align = "center"><b>Instructions for the third test (2/3)</b><br><br>'
                    + 'After confirming your choice (denoted C hereafter) the computer will draw a random lottery number (denoted L hereafter) between 0 and 100.<br>'
                    + 'If C is bigger than L, you win the reward with the probabilities associated to the symbol.<br>'
                    + 'If C is smaller than L, the program will spin a wheel of fortune and you will win a reward of +1 point with a probability of L%, otherwise you will lose -1 point.<br><br>';
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
                let like;
                if (isTraining) {
                    Info = '<H3 align="center">Let' + "'s " + 'begin with the third training test!<br><br>'
                        + '<b>(Note : points won during the training do not count for the final payoff !)<br><br>'
                        + 'The word "ready" will be displayed before the actual game starts.</H3></b><br><br>';
                    like = '';
                } else {
                    Title = '<H2 align="center">PHASE ' + phaseNum + '</H2><br>';
                    Info = '<h3 align="center"><b>Note:</b> The test of the phase 3 is like the third test of the training.<br><br>';

                    like = 'This is the actual game, every point will be included in the final payoff.<br><br>'
                        + 'Ready? <br></H3>';
                }
                Info += like;
                break;
        }

        $('#TextBoxDiv').html(Title + Info);

        let Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Back" value="Back" >\n\
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

        $('#Back').click({obj: this}, function (event) {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            funcParams['pageNum'] -= 1;

            if (pageNum === 1) {
            } else {
                event.data.obj.displayInstructionSliderElicitation(funcParams, nextFunc, nextParams);
            }
        });

        $('#Next').click({obj: this}, function (event) {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            funcParams['pageNum'] += 1;

            event.data.obj.displayInstructionSliderElicitation(funcParams, nextFunc, nextParams);

        });

        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            let ready;
            let steady;
            let go;

            if (isTraining) {
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
                            nextFunc(nextParams);
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 10);
        });
    }

    displayInstructionQuestionnaire(nextFunc, nextParams) {

        GUI.init();

        let Title = '<H3 align = "center">QUESTIONNAIRE</H3>';

        let startBut;
        startBut = '"Start"';
        let Info = '<H3 align = "center">You will now have to answer a few questions.<br><br>This won\'t take more than a few more minutes.<br><br>Your answers remain anonymous and will not be disclosed.<br><br>' +
            'Note that the experiment will be considered completed (and the payment issued) only if the questionnaires are correctly filled.<br><br>' +
            'Please click "Start" when you are ready.</H3><br><br>';

        $('#TextBoxDiv').html(Title + Info);

        let Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="Start" value=' + startBut + ' ></div>';

        $('#Bottom').html(Buttons);

        $('#Start').click(function () {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            nextFunc(nextParams);
        });
    }

    endTraining(funcParams, nextFunc, nextParams) {


        GUI.init();

        let sessionNum = funcParams['sessionNum'];

        let Title;
        let Info;
        let totalPoints;
        let pence;
        let pounds;
        let wonlost;

        Title = '<H2 align = "center">END OF THE TRAINING</H2>';
        Info = '';

        totalPoints = this.exp.sumReward[1] + this.exp.sumReward[2] + this.exp.sumReward[3];
        pence = this.exp.pointsToPence(totalPoints).toFixed(2);
        pounds = this.exp.pointsToPounds(totalPoints).toFixed(2);

        wonlost = ['won', 'lost'][+(totalPoints < 0)];

        Info += '<H3 align="center"> The training is over!<br><br>';
        Info += 'Overall, in this training, you ' + wonlost + ' ' + totalPoints +
            ' points = ' + pence + ' pence = ' + pounds + ' pounds!<br><br>';

        Info += 'Test 1: ' + this.exp.sumReward[1] + '<br>';
        Info += 'Test 2: ' + this.exp.sumReward[2] + '<br>';
        Info += 'Test 3: ' + this.exp.sumReward[3] + '<br>';

        Info += 'Now, you are about to start the first phase of the experiment.<br> Note that from now on the points will be counted in your final payoff.'
            + ' Also note that the experiment includes much more trials and more points are at stake, compared to the training.<br>'
            + 'Finally note that the real test will involve different symbols (i.e., not encountered in the training).<br>'
            + 'If you want you can do the training a second time.</h3><br><br>';

        $('#TextBoxDiv').html(Title + Info);

        let Buttons = '<div align="center">\n\
            <input align="center" type="button"  class="btn btn-default" id="Training" value="Play training again" >\n\
            <input align="center" type="button"  class="btn btn-default" id="Next" value="Next" >\n\
            </div>';

        $('#Bottom').html(Buttons);

        if (sessionNum === this.exp.maxTrainingNum)
            $('#Training').hide();

        $('#Training').click({obj: this}, function (event) {

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();

            event.data.obj.exp.sumReward[0] = 0;
            event.data.obj.exp.sumReward[1] = 0;
            event.data.obj.exp.sumReward[2] = 0;
            event.data.obj.exp.sumReward[3] = 0;
            nextParams['phaseNum'] = 1;
            nextParams['sessionNum'] = -2;
            nextParams['instructionNum'] = 4;
            nextFunc(nextParams);
            // TODO: restart training
            // nextParams

        });

        $('#Next').click({obj: this}, function (event) {

            event.data.obj.exp.sumReward[0] = 0;
            event.data.obj.exp.sumReward[1] = 0;
            event.data.obj.exp.sumReward[2] = 0;
            event.data.obj.exp.sumReward[3] = 0;

            $('#TextBoxDiv').remove();
            $('#Stage').empty();
            $('#Bottom').empty();
            nextFunc(nextParams);
        });
    }

    endExperiment() {

        GUI.init();

        let points = this.exp.totalReward;
        let pence = this.exp.pointsToPence(points).toFixed(2);
        let pounds = this.exp.pointsToPounds(points).toFixed(2);

        let wonlost = [' won ', ' lost '][+(points < 0)];

        let Title = '<h3 align = "center">The game is over!<br>' +
            'You ' + wonlost + points + ' points in total, which is ' + pence + ' pence = ' + pounds + ' pounds!<br><br>'
            + 'Test 1: ' + this.exp.sumReward[1] + ' = ' + this.exp.pointsToPounds(this.exp.sumReward[1]) + ' pounds' + '<br>'
            + 'Test 2: ' + this.exp.sumReward[2] + ' = ' + this.exp.pointsToPounds(this.exp.sumReward[2]) + ' pounds' + '<br>'
            + 'Test 3: ' + this.exp.sumReward[1] + ' = ' + this.exp.pointsToPounds(this.exp.sumReward[3]) + ' pounds' + '<br>'
            + 'With your initial endowment, you won a total bonus of ' + (parseFloat(pence) + 250) + ' pence = ' + (parseFloat(pounds) + 2.5) + ' pounds!<br><br>' +
            'Thank you for playing!<br><br><a href="' + this.exp.compLink + '">Please click the link to complete this study</a><br></h3><br>';

        $('#TextBoxDiv').html(Title);
    }


}


//
//
// /* Abstract experience model */
// function Exp(
//     {
//         nOption,
//         nContext,
//         rewards,
//         probs,
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
//     this.rewards = rewards;
//     this.probs = probs;
//     this.nTrialPerContext = nTrialPerContext;
//     this.nTrial = nTrial;
//     this.nInterleaved = nInterleaved;
//     this.interleaved = interleaved;
//     this.language = language;
//     this.nTrialTraining = nTrialTraining;
//
//     this.order = [];
//     this.context = [];
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
//         // first define contexts for each time-steps
//         if (this.interleaved) {
//             for (let i = 0; i < this.nTrial; i += this.nInterleaved) {
//                 this.context = this.context.concat(
//                     shuffle(range(0, nContext - 1))
//                 );
//             }
//         } else {
//             for (let i = 0; i < this.nContext; i++) {
//                 this.context = this.context.concat(
//                     Array(this.nTrialPerContext[i]).fill(i)
//                 )
//             }
//         }
//         // set rewards and probabilities accordingly
//         for (let t = 0; t < this.nTrial; t++) {
//             this.r[t] = this.rewards[this.context[t]];
//             this.p[t] = this.probs[this.context[t]];
//         }
//         assert(this.context.length === this.nTrial, 'Errors in context length.');
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
//         let rewards = [
//             [[0, 0], [-1, 1]],
//             [[0, 0], [-1, 1]],
//             [[-1, 1], [-1, 1]],
//             [[0, 1], [0, -1]]
//         ];
//         let probs = [
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
//                 rewards: rewards,
//                 probs: probs,
//                 nTrialPerContext: nTrialPerContext,
//                 nTrial: nTrial,
//                 nInterleaved: nInterleaved,
//                 interleaved: interleaved
//             }
//         );
//         exp.init();
//     }
// }

