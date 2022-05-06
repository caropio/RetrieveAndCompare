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
        
        // this.selectedTrial = undefined;

    }

    /* =================== public methods ================== */

    selectTrial(max) {
        return range(0, max - 1, 1)[Math.floor(Math.random() * (max - 1))];
    }

    run() {

        GUI.initGameStageDiv();


        this.selectedTrial = this.selectTrial(this.nTrial);
        

        this.exp.selectedOutcome[this.sessionNum][this.phaseNum] =
            this.exp.outcomeList[this.sessionNum][this.phaseNum][this.selectedTrial]

        this.reward = this.exp.outcomeList[this.sessionNum][this.phaseNum][this.selectedTrial]

        if (this.reward === undefined) {
            alert("Reward is undefined! Setting reward to +1");
            this.reward = 1;
            this.exp.selectedOutcome[this.sessionNum][this.phaseNum] = 1;
        }

        GUI.generateRandomSelector()

        this.setup(this.selectedTrial, this.reward);
        this.exp.totalReward += this.exp.reward;
        
        console.log(this.exp.totalReward);
        setTimeout(() => {
            let str1 = '<br><b>Current bonus</b>=' + this.exp.pointsToPounds(this.reward) + " pounds!";
            let str2 = '<br><b>Total bonus</b>=' + this.exp.pointsToPounds(this.exp.totalReward) + this.exp.pointsToPounds(2.5) + " pounds!";
            $('#total').empty();
            $('#total').html(str1+str2);
            $('#total').fadeIn(400);
        }, 6000);
        // let slider = GUI.displayOneOption(
        //     "?",
        //     this.imgObj,
        //     this.feedbackObj,
        //     undefined,
        //     false,
        //     "Please wait while we randomly select one of the reward you've earned...");

        // GUI.showSingleFeedback(Math.floor(Math.random() * max-1
        //
    }

    setup(selectedTrial, reward) {

        let str = selectedTrial.toString();
        str = "0".repeat(3 - str.length) + str ;
        const items = str.split("");
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

                const pool = ["❓", "❓", "❓", "❓",  "❓", "❓"];
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
                    box.textContent = pool[i];
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
        setTimeout(spin, 2000);
    }
}
