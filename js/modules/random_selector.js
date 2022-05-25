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
        nTrial,
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
        
        this.nextFunc = nextFunc;
        this.nextParams = nextParams;

        this.nTrial = nTrial;

    }

    /* =================== public methods ================== */

    selectTrial(max) {
        return range(0, max - 1, 1)[Math.floor(Math.random() * (max - 1))];
    }

    run() {

        GUI.initGameStageDiv();


        this.selectedTrial = this.selectTrial(this.nTrial);


        this.selectedOpt = this.trialObj
        this.exp.selectedOutcome[this.sessionNum][this.phaseNum] =
            this.exp.outcomeList[this.sessionNum][this.phaseNum][this.selectedTrial]

        this.exp.selectedOpt[this.sessionNum][this.phaseNum] =
            this.exp.optList[this.sessionNum][this.phaseNum][this.selectedTrial]

        this.reward = this.exp.outcomeList[this.sessionNum][this.phaseNum][this.selectedTrial]
        this.opt = this.exp.selectedOpt[this.sessionNum][this.phaseNum]

        if (this.reward === undefined) {
            alert("As you've not played, a random symbol and reward will be selected among existing ones");
            this.reward = 1;
            this.opt = '2';
            this.exp.selectedOpt[this.sessionNum][this.phaseNum] = this.opt;
            this.exp.selectedOutcome[this.sessionNum][this.phaseNum] = 1;
        }

        GUI.generateRandomSelector()

        this.setup(this.selectedTrial, this.reward, this.opt);
        this.exp.totalReward += this.reward;
        this.exp.sumReward[this.phaseNum] = this.reward;

        setTimeout(() => {
            let str1 = '<b>Bonus for this test</b> = ' + this.reward + ' pts = ' + this.exp.pointsToPounds(this.reward) + " pounds!";
            let str2 = '<br><b>Total bonus</b> =' + (this.exp.pointsToPounds(this.exp.totalReward) + 2.5).toFixed(2) + " pounds!";
            $('#total').empty();
            $('#total').html(str1 + str2);
            $('#total-box').fadeIn(400);
            $('#next').click(() => {
                GUI.hideSkipButton();
                $('#stim-box').fadeOut(300);
                $('#Stage').empty();
                GUI.panelShow();
                this.nextFunc(this.nextParams);
            });
        }, 6000);
    }

    setup(selectedTrial, reward, opt) {

        let str = (selectedTrial + 1).toString();
        str = "0".repeat(3 - str.length) + str;
        const items = str.split("");
        items.push(`<label style="width: 70%;content: url('images/cards_gif/all_stim/${opt}.png')"></label>`)
        items.push(reward.toString());
        //document.querySelector(".info").textContent = items.join(" ");

        const doors = document.querySelectorAll(".door");
        //document.querySelector("#reseter").addEventListener("click", init);

        async function spin() {
            init(false, 1, 3);
            for (const door of doors) {
                const boxes = door.querySelector(".boxes");
                const duration = parseInt(boxes.style.transitionDuration);
                boxes.style.transform = "translateY(0)";
                await new Promise((resolve) => setTimeout(resolve, duration * 100));
            }
        }

        function init(firstInit = true, groups = 1, duration = 1) {
            let count = 0;
            for (const door of doors) {
                if (firstInit) {
                    door.dataset.spinned = "0";
                } else if (door.dataset.spinned === "1") {
                    return;
                }

                const boxes = door.querySelector(".boxes");
                const boxesClone = boxes.cloneNode(false);

                const pool = ["❓", "❓", "❓", "❓", "❓", "❓"];
                if (!firstInit) {
                    pool.push(items[count]);

                    boxesClone.addEventListener(
                        "transitionstart",
                        function () {
                            door.dataset.spinned = "1";
                            this.querySelectorAll(".box-rd").forEach((box) => {
                                box.style.filter = "blur(1px)";
                            });
                        },
                        { once: true }
                    );

                    boxesClone.addEventListener(
                        "transitionend",
                        function () {
                            this.querySelectorAll(".box-rd").forEach((box, index) => {
                                box.style.filter = "blur(0)";
                                if (index > 0) this.removeChild(box);
                            });
                        },
                        { once: true }
                    );
                }
                // console.log(pool);
                for (let i = pool.length - 1; i >= 0; i--) {
                    const box = document.createElement("div");
                    box.classList.add("box-rd");
                    box.style.width = door.clientWidth + "px";
                    box.style.height = door.clientHeight + "px";
                    box.innerHTML = pool[i];
                    boxesClone.appendChild(box);
                }

                boxesClone.style.transitionDuration = `${duration}s`;
                boxesClone.style.transform = `translateY(-${door.clientHeight * (pool.length - 1) * 1
                    }px)`;
                door.replaceChild(boxesClone, boxes);
                // console.log(door);
                count++;
            }
        }

        init();
        setTimeout(spin, 1000);
    }
}
