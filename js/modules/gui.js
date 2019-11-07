import {createDiv, range} from './utils.js'


export class GUI {
    /*
    Class to display graphic contents
     */


    /* =================== public methods ================== */

    static init() {
        if ($('#TextBoxDiv').length === 0) {
            createDiv('Stage', 'TextBoxDiv');
        }
    }

    static displayOptions(id1, id2, img, feedbackImg, invertedPosition) {
       let [option1, option2, feedback1, feedback2] = GUI._getOptions(id1, id2, img, feedbackImg);
       GUI._displayTwoOptions(option1, option2, feedback1, feedback2, invertedPosition);
    }


    static displayOptionSlider(id, imgObj, initValue) {

        let option = imgObj[id];
        option.id = "option1";
        option = option.outerHTML;

        let canvas1 = '<canvas id="canvas1" height="620"' +
            ' width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        let canvas2 = '<canvas id="canvas2" height="620"' +
            ' width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        let myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
            '    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + canvas1 + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
            + canvas2 + '</div><div class="col-xs-1 col-md-1"></div></div>';

        let Title = '<div id = "Title"><H2 align = "center">What are the odds this symbol gives a +1?<br><br><br><br></H2></div>';
        let Images = '<div id = "stimrow" style="transform: translate(0%, -100%);position:relative"> ' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + '</div><div id = "Middle" class="col-xs-4 col-md-4">' + option + '</div></div>';


        let Slider = '<main>\n' +
            '  <form id="form">\n' +
            '    <h2>\n' +
            '    </h2>\n' +
            '    <div class="range">\n' +
            '      <input id="slider" name="range" type="range" value="' + initValue + '" min="0" max="100" step="5">\n' +
            '      <div class="range-output">\n' +
            '        <output id="output" class="output" name="output" for="range">\n' +
            '          ' + initValue + '%\n' +
            '        </output>\n' +
            '      </div>\n' +
            '    </div>\n' +
            '  </form>\n' +
            '</main>\n' +
            '<br><br><div align="center"><button id="ok" class="btn btn-default btn-lg">Ok</button></div>';

        let str = Title + Images + myCanvas + Slider;
        $('#TextBoxDiv').html(str);
    }

    static slideCard(pic, cv, showFeedback) {

        let img = new Image();
        let canvas;
        img.src = pic.src;
        img.width = pic.width;
        img.height = pic.height;

        let speed = 3;
        let y = 0;

        let dy = 10;
        let x = 0;
        let ctx;

        img.onload = function () {

            canvas = cv;
            ctx = cv.getContext('2d');

            canvas.width = img.width;
            canvas.height = img.height;

            let scroll = setInterval(draw, speed);

            if (showFeedback) {
                setTimeout(function () {
                    pic.style.visibility = "hidden";
                    clearInterval(scroll);
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }, 1000);
            }

        };

        function draw() {

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            if (y > img.height) {
                y = -img.height + y;
            }

            if (y > 0) {
                ctx.drawImage(img, x, -img.height + y, img.width, img.height);
            }

            ctx.drawImage(img, x, y, img.width, img.height);

            y += dy;
        }
    }

    static displayModalWindow(title, message, type) {
        /*
        Method used to display error messages, warning, infos...
         */

        let sym;
        let color;
        if (type === 'info') {
            sym = 'fa-check';
            color = 'green';
        } else if (type === 'error') {
            sym = 'fa-window-close';
            color = 'red';
        } else {
            sym = 'fa-check';
            color = 'gray';
        }

        let str =
            '<div class="modal fade" id="myModal" role="dialog">\n' +
            '    <div class="modal-dialog modal-sm">\n' +
            '      <div class="modal-content">\n' +
            '        <div class="modal-header">\n' +
            '          <button type="button" class="close" data-dismiss="modal">&times;</button>\n' +
            '          <center><span class="fa ' + sym + '" style="font-size: 30px; color: '+ color + ';">  ' + title + '</center>\n' +
            '        </div>\n' +
            '        <div class="modal-body">\n' +
            '        <center><p>' + message + '</p></center>\n' +
            '        </div>\n' +
            //'        <div class="modal-footer">\n' +
            //'          <button type="button" class="btn btn-default" data-dismiss="modal">Close</button>\n' +
            //'        </div>\n' +
            '      </div>\n' +
            '    </div>\n' +
            '</div>\n';

        if (!$('#Modal').html().includes('myModal')) {
            $('#Modal').html(str);
        }
        $('#myModal').modal();

    }

    static insertSkipButton(Obj=undefined, br=false) {

        let b = ['', '<br><br>'][+(br)];

        let button = b +
            '<div align="center"><input align="center" type="button"' +
            '  class="btn btn-default" id="skip" value="Skip all trials" ></div>';


        $('#Bottom').html(button);
        $('#skip').click(function () {
            if (Obj.skipEnabled) {
                Obj.skip = true;
                Obj._next();
            }
        });

    }

    /* =================== private methods ================== */

    static _getOptions(id1, id2, img, feedbackImg){

        let option1 = img[id1];
        option1.id = "option1";
        option1 = option1.outerHTML;

        let option2 = img[id2];
        option2.id = "option2";
        option2 = option2.outerHTML;

        let feedback1 = feedbackImg["empty"];
        feedback1.id = "feedback1";
        feedback1 = feedback1.outerHTML;

        let feedback2 = feedbackImg["empty"];
        feedback2.id = "feedback2";
        feedback2 = feedback2.outerHTML;

        return [option1, option2, feedback1, feedback2]
    }

    static _displayTwoOptions(option1, option2, feedback1, feedback2, invertedPosition) {

        let Title = '<div id = "Title"><H2 align = "center"> <br><br><br><br></H2></div>';

        let canvas1 = '<canvas id="canvas1" height="620"' +
            ' width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        let canvas2 = '<canvas id="canvas2" height="620"' +
            ' width="620" class="img-responsive center-block"' +
            ' style="border: 5px solid transparent; position: relative; top: 0px;">';

        let options = [[option1, option2], [option2, option1]][+(invertedPosition)];
        let feedbacks = [[feedback1, feedback2], [feedback2, feedback1]][+(invertedPosition)];
        let canvas = [[canvas1, canvas2], [canvas2, canvas1]][+(invertedPosition)];

        /* Create canevas for the slot machine effect, of the size of the images */
        let Images = '<div id = "stimrow" class="row" style= "transform: translate(0%, -100%);position:relative"> ' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + options[0] + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div>' +
            '<div class="col-xs-3 col-md-3">' + options[1] + '</div><div class="col-xs-1 col-md-1"></div></div>';

        let Feedback = '<div id = "fbrow" class="row" style= "transform: translate(0%, 0%);position:relative"> ' +
            '<div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">' + feedbacks[0] + '' +
            '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
            + feedbacks[1] + '</div><div class="col-xs-1 col-md-1"></div></div>';

        let myCanvas = '<div id = "cvrow" class="row" style= "transform: translate(0%, -200%);position:relative">' +
            '    <div class="col-xs-1 col-md-1"></div>  <div class="col-xs-3 col-md-3">'
            + canvas[0] + '</div><div id = "Middle" class="col-xs-4 col-md-4"></div><div class="col-xs-3 col-md-3">'
            + canvas[1] + '</div><div class="col-xs-1 col-md-1"></div></div>';

        $('#TextBoxDiv').html(Title + Feedback + Images + myCanvas);
    }

}


// function Gui({imgPath, imgExt, nImg, feedbackDuration}={}) {
//     // private Members (accessible in the whole function)
//     // Should be accessed with a getter/setter
//     this.feedbackDuration = feedbackDuration;
//     this.imgPath = imgPath;
//     this.imgExt = imgExt;
//     this.nImg = nImg;
//     this.images = [];
//
//     /* =================== private methods ================= */
//
//     this.loadImg = function () {
//         for (let i = 1; i <= this.nImg; i++) {
//             this.images[i] = new Image();
//             this.images[i].src = this.imgPath + i + '.' + this.imgExt;
//             this.images[i].className = "img-responsive center-block";
//             this.images[i].style.border = "5px solid transparent";
//             this.images[i].style.position = "relative";
//             this.images[i].style.top = "0px";
//         }
//     };
//
//     /* =================== public methods ================== */
//
//     // main init method
//     this.init = function () {
//         this.loadImg();
//     };
//
//     this.getImg = function (idx) {
//         return this.images[idx];
//     };
//
//     this.createDiv = function (parentID, childID) {
// 		let d = $(document.createElement('di?v'))
// 		.attr("id", childID);
// 		let container = document.getElementById(parentID);
// 		d.appendTo(container);
// 	};  /* function CreateDiv(ParentID, ChildID) */
//
//     this.getKeyCode = function (event) {
// 		return event.which;
// 	}
//
// 	this.displayConsent = function () {
// 		CreateDiv('Stage', 'TextBoxDiv');
//
// 		if(Language=='en'){
// 			var Title = '<H2 align = "center">Consent</H2><br>';
//
// 			var Info = '<H4>INFORMATION FOR THE PARTICIPANT</H4>' +
// 				'You are about to participate in the research study entitled:<br>' +
// 				'The domain-general role of reinforcement learning-based training in cognition across short and long time-spans<br>' +
// 				'Researcher in charge: Pr. Stefano PALMINTERI<br>' +
// 				'This study aims to understand the learning processes in decision-making. Its fundamental purpose is to investigate the cognitive mechanisms of these learning and decision-making processes. The proposed experiments have no immediate application or clinical value, but they will allow us to improve our understanding of the functioning brain.<br>' +
// 				'We are asking you to participate in this study because you have been recruited by the RISC or Prolific platforms. <br>' +
// 				'<H4>PROCEDURE</H4>' +
// 				'During your participation in this study, we will ask you to answer several simple questionnaires and tests, which do not require any particular competence. Your internet-based participation will require approximately 30 minutes. <br>' +
// 				'<H4>VOLUNTARY PARTICIPATION AND CONFIDENTIALITY</H4>' +
// 				'Your participation in this study is voluntary. This means that you are consenting to participate in this project without external pressure. During your participation in this project, the researcher in charge and his staff will collect and record information about you.<br>' +
// 				'In order to preserve your identity and the confidentiality of the data, the identification of each file will be coded, thus preserving the anonymity of your answers. We will not collect any personal data from the RISC or Prolific platforms.<br>' +
// 				'The researcher in charge of this study will only use the data for research purposes in order to answer the scientific objectives of the project. The data may be published in scientific journals and shared within the scientific community, in which case no publication or scientific communication will contain identifying information. <br>' +
// 				'<H4>RESEARCH RESULTS AND PUBLICATION</H4>' +
// 				'You will be able to check the publications resulting from this study on the following link:<br>' +
// 				'https://sites.google.com/site/stefanopalminteri/publications<br>' +
// 				'<H4>CONTACT AND ADDITIONAL INFORMATION</H4>' +
// 				'Email: humanreinforcementlearning@gmail.com<br>' +
// 				'This research has received a favorable opinion from the Inserm Ethical Review Committee / IRB00003888 on November 13th, 2018.<br>' +
// 				'Your participation in this research confirms that you have read this information and wish to participate in the research study.<br><br>'+
// 				'<H4>Please check all boxes before starting:<H4>';
//
// 			var Ticks ='<H4><input type="checkbox" name="consent" value="consent1"> I am 18 years old or more<br>' +
// 			'<input type="checkbox" name="consent" value="consent2"> My participation in this experiment is voluntary <br>' +
// 			'<input type="checkbox" name="consent" value="consent3"> I understand that my data will be kept confidential and I can stop at any time without justification <br></H4>' ;
//
// 			var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="toInstructions" value="Next" ></div>';
// 		}
// 		else if(Language=='fr'){
// 			var Title = '<H2 align = "center">Consentement</H2><br>';
// 			var Info = '<H4>INFORMATION A L’ATTENTION DU PARTICIPANT</H4>' +
// 				'Nous vous proposons de participer à la recherche intitulée :<br>' +
// 				'The domain-general role of reinforcement learning-based training in cognition across short and long time-spans<br>' +
// 				'Sous la direction du Pr. Stefano PALMINTERI,<br>' +
// 				'visant à comprendre les processus d’apprentissage dans la prise de décision. Cette recherche a une visée fondamentale. Nous visons à comprendre les processus cognitifs de ces processus d’apprentissage et prise de décision et nous n’envisageons aucune application immédiate pour ces recherches. Les tests proposés n’ont aucune valeur clinique, cependant ils nous permettront d’avancer nos connaissances sur le fonctionnement du cerveau.<br>' +
// 				'Nous vous sollicitons pour participer à cette étude car vous avez été recruté par la plateforme RISC ou Prolific. <br>' +
// 				'<H4>PROCEDURE</H4>' +
// 				'Lors de votre participation à cette étude, nous vous demanderons de répondre à plusieurs questionnaires et tests simples, qui ne nécessitent pas de compétence particulière. Votre participation repose sur des réponses sur internet d’une durée de à peu près 30 minutes. <br>' +
// 				'<H4>PARTICIPATION VOLONTAIRE ET CONFIDENTIALITE</H4>' +
// 				'Votre participation à cette étude est volontaire. Cela signifie que vous acceptez de participer à ce projet sans pression extérieure ou contrainte. Durant votre participation à ce projet, le chercheur responsable ainsi que son personnel recueilleront et consigneront dans un dossier les renseignements vous concernant.<br>'+
// 				'Afin de préserver votre identité ainsi que la confidentialité des données, l’identification de chaque dossier se fera par un numéro de code, préservant ainsi l’anonymat de vos réponses et nous ne demanderons aucune donnée personnelle au RISC ou a Prolific.<br>'+
// 				'Le chercheur responsable de cette étude n’utilisera les données qu’à des fins de recherche, dans le but de répondre aux objectifs scientifiques du projet. Les données pourront être publiées dans des revues scientifiques et partagées au sein de la communauté scientifique. Aucune publication ou communication scientifique ne renfermera d’information permettant de vous identifier. <br>' +
// 				'<H4>RESULTATS DE LA RECHERCHE ET PUBLICATION</H4>' +
// 				'Vous pourrez consulter les publications issues de cette étude sur le lien suivant :<br>' +
// 				'https://sites.google.com/site/stefanopalminteri/publications<br>' +
// 				'<H4>CONTACT ET INFORMATIONS SUPPLEMENTAIRES</H4>' +
// 				'Email: humanreinforcementlearning@gmail.com<br>' +
// 				'Cette recherche a reçu un avis favorable du comité d’évaluation éthique de l’Inserm/IRB00003888 le 13 novembre 2018.<br>' +
// 				'Votre participation à cette recherche confirme que vous avez lu ces informations et acceptez de participer à cette étude.<br><br>'+
// 				'<H4>Veuillez cocher toutes les cases avant de commencer :<H4>';
//
// 			var Ticks ='<H4><input type="checkbox" name="consent" value="consent1"> J\'ai plus de 18 ans<br>' +
// 			'<input type="checkbox" name="consent" value="consent2"> Je suis volontaire pour participer à cette étude <br>' +
// 			'<input type="checkbox" name="consent" value="consent3"> Je comprends que mes données seront confidentielles et je peux abandonner l\'expérience sans justification<br></H4>' ;
//
// 			var Buttons = '<div align="center"><input align="center" type="button"  class="btn btn-default" id="toInstructions" value="Suivant" ></div>';
// 		}
//
// 		$('#TextBoxDiv').html(Title + Info + Ticks);
// 		$('#Bottom').html(Buttons);
//
// 		$('#toInstructions').click(function() {
// 			if ($("input:checkbox:not(:checked)").length > 0) {
// 				alert('You must tick all check boxes to continue.');
// 			}else {
// 				$('#TextBoxDiv').remove();
// 				$('#Stage').empty();
// 				$('#Bottom').empty();
// 				/*SubID = GetUserID();*/
// 				Instructions(1);
// 			};
// 		});
//
//     }
//
// 	// this.setFeedback = function (x) {
//     //
//     // }
// }
//
// // set to true to test the module
// // using "$ node --experimental-modules myscript.mjs"
// // /!\ can't be run using node because Image() is missing /!\
// main({test: false});
//
// function main({test}={}) {
//     if (test) {
//         console.log('Testing module...');
//
//         let gui = new Gui(
//             {
//                 imgPath: 'src/assets/images/cards_gif/stim/',
//                 imgExt: '.gif',
//                 nImg: 12,
//                 feedbackDuration: 2000
//             }
//         );
//         gui.init();
//     }
// }

