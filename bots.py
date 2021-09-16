from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
import multiprocessing as mp
# from multiprocessing.pool import ThreadPool
import threading
import argparse
import time
import os
import numpy as np
import pandas as pd
import seaborn as sns
from scipy import stats
import queue
import matplotlib.pyplot as plt


# PUT YOUR OWN PATH HERE
# if os is windows
if os.name == 'nt':
    CHROMEDRIVER = \
        'C:/Users/Basile/.wdm/drivers/chromedriver/win32/90.0.4430.24/chromedriver.exe'
# if os is linux
else:
    CHROMEDRIVER = '/snap/bin/chromium.chromedriver'


class Bot:
    def __init__(self, idx, url):
        super().__init__()

        self.idx = idx

        with mp.Lock():
            options = webdriver.ChromeOptions()
            #  uncomment to open windows in the background
            # options.add_argument('headless')
            self.driver = webdriver.Chrome(CHROMEDRIVER, options=options)
            self.driver.get(url)

    def find_endlessly(self, el_id):
        while True:
            try:
                return self.driver.find_element_by_id(el_id)

            except Exception as e:
                print(f'Bot {self.idx}: {e}')
                time.sleep(.2)

    def find(self, el_id):
        try:
            return self.driver.find_element_by_id(el_id)
        except Exception as e:
            print(f'Bot {self.idx}: {e}')
            return None

    def wait_until_el(self, el_id):
        timeout = 5
        try:
            element_present = EC.presence_of_element_located((By.ID, el_id))
            WebDriverWait(self.driver, timeout).until(element_present)
        except TimeoutException:
            print(f"Bot {self.idx}: Timed out waiting for page to load")
            time.sleep(.2)

    def get_value(self, el_id):
        return self.driver.find_element_by_id(el_id).get_attribute('value')

    def get_phaseNum(self):
        return self.driver.execute_script('return localStorage["phaseNum"]')

    def set_value(self, el_id, v):
        self.driver.execute_script(f"$('#{el_id}').val({v})")

    def get_option(self, n):
        return self.driver.find_element_by_id(f'option{n}').get_attribute('src').split('/')[-1]

    def set_choice(self, n):
        self.driver.find_element_by_id(f'canvas{n}').click()

    def find_and_click(self, el_id):
        el = self.find(el_id)
        if el is not None:
            try:
                el.click()
                return True
            except:
                pass
        return None


class QLearningAgent(Bot):
    def __init__(self, alpha, beta, q0, **kwargs):
        super().__init__(**kwargs)
        # learning rate
        self.alpha = alpha
        # softmax temperature
        self.beta = beta
        self.q0 = q0
        self.q = {}

    def make_choice(self, values):
        return np.random.choice(
            (0, 1), p=self.softmax(np.array(values)))

    def softmax(self, v):
        return np.exp(self.beta * v)/(np.sum(np.exp(self.beta * v)))

    def learn(self, s, r):
        self.q[s] += self.alpha * (r - self.q[s])

    def slider(self):
        el = self.find('ok_1')
        if el is not None:
            s = self.get_option(1)
            if "png" in s:
                v = float(s.replace('.png', ''))
            elif s in self.q:
                v = self.q[s]
            else:
                v = 0

            v = ((v + 1)/2)*100

            # q.put({'reset': True})
            self.set_value('slider_1', v)
            el.click()

    def bandit(self):
        el = self.find('option2')
        if el is not None:
            s1, s2 = self.get_state()
            v1 = self.q[s1]
            v2 = self.q[s2]
            learn = int(self.get_phaseNum()) == 1
            heuristic = False

            if "png" in s1:
                v1 = float(s1.replace('.png', ''))
                learn = False

            if "png" in s2:
                v2 = float(s2.replace('.png', ''))
                learn = False
                heuristic = v1 == self.q[s1]

            a = self.make_choice([v1, v2])
            s = [s1, s2][a]

            if heuristic:
                a = int(v2 > 0)
            self.set_choice(a+1)

            out = int(self.get_value('out'))
            cfout = int(self.get_value('cfout'))
            cfa = int((a+1) == 1)
            cfs = s2 if s == s1 else s1

            if learn:
                self.learn(s, out)
                self.learn(cfs, cfout)

    def get_state(self):
        opt1 = self.get_option(1)
        opt2 = self.get_option(2)

        for opt in (opt1, opt2):
            if opt not in self.q:
                self.q[opt] = 1. * self.q0

        return opt1, opt2

    def run(self, q):
        while True:

            try:

                # ----------------------------------------------------------- #
                # skip instructions
                # ----------------------------------------------------------- #
                if self.find_and_click('next'):
                    continue

                # ----------------------------------------------------------- #
                # manage slider choices
                # ----------------------------------------------------------- #
                self.slider()

                # ----------------------------------------------------------- #
                # manage bandit choices
                # ----------------------------------------------------------- #
                self.bandit()

                # in case you want to transmit live data to the main thread
                # q.put({'reset': False, 'data': [corr, t]})

                # if some element appears on the page, stop the thread/bot
                if self.find('end'):
                    # end thread
                    break

            except Exception as e:
                print(f'Error: {e}')
                time.sleep(1)
                continue

            time.sleep(3)


def run(idx, url, q, alpha, beta, q0):

    b = QLearningAgent(
        url=url+f"?prolific_id=Bob{idx}", idx=idx, alpha=alpha, beta=beta, q0=q0)

    print(f'Bot {b.idx} is running')
    b.run(q)


if __name__ == '__main__':
    # run in terminal like
    # python bots.py -u <your task url> -n <number of bots you desire> 
    parser = argparse.ArgumentParser()
    parser.add_argument('-u', '--url', help='link for the experiment')
    parser.add_argument('-n', '--nbot', help='number of bots')
    args = parser.parse_args()

    n_bot = int(args.nbot)
    n_process = n_bot

    # queue use to transmit information between the main thread and the other threads (the bots)
    # q.put(args) is used to put something in the queue in a certain thread
    # q.get() is used to get the information from another thread
    q = queue.LifoQueue()

    np.random.seed(1)

    # alphas = np.random.beta(1.1, 1.1, size=n_bot)
    # betas = np.random.gamma(1.2, 5, size=n_bot)
    alphas = np.ones(n_bot) * .2
    betas = np.ones(n_bot) * 4
    # initialization of qvalues
    q0 = 0

    # run one thread per bot
    for i in range(n_bot):
        t = threading.Thread(target=run, args=(
            i, args.url, q, alphas[i], betas[i], q0))
        t.start()

    # -----------------------------------------------------------------------------#
    # Plot some data in real time using queue
    # ---------------------------------------------------------------------------- # 
    # fig, ax = plt.subplots(
    #     1, 1, figsize=(10, 8))

    # d = {}

    # while True:
    #     out = q.get()
    #     if out['reset']:
    #         d = {}
    #     try:
    #         t = out['data'][0]
    #         out = out['data'][1]

    #         if t not in d:
    #             d[t] = []

    #         d[t].append(out)

    #         m = np.array([np.mean(d[i]) for i in range(max(d.keys()))])
    #         sem = np.array([stats.sem(d[i]) for i in range(max(d.keys()))])
    #         x = list(range(len(m)))

    #         ax.clear()

    #         ax.plot(x, m, color='C0')
    #         ax.fill_between(x=x, y1=m+sem, y2=m-sem, color='C0', alpha=.2)

    #         ax.set_ylim([0, 1])

    #         ax.set_xlabel('t')
    #         ax.set_ylabel('Correct choice rate')

    #         plt.draw()
    #         plt.pause(.1)
    #     except:
    #         pass
