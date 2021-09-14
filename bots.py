from selenium import webdriver
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
import multiprocessing as mp
from multiprocessing.pool import ThreadPool
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
from matplotlib.animation import FuncAnimation


if os.name == 'nt':
    CHROMEDRIVER = \
        'C:/Users/Basile/.wdm/drivers/chromedriver/win32/90.0.4430.24/chromedriver.exe'
else:
    CHROMEDRIVER = '/snap/bin/chromium.chromedriver'


class Bot:
    def __init__(self, idx, url):
        super().__init__()

        self.idx = idx

        with mp.Lock():
            options = webdriver.ChromeOptions()
            # options.add_argument('headless')
            self.driver = webdriver.Chrome(CHROMEDRIVER, options=options)
            self.driver.get(url)

    def find_endless(self, el_id):
        while True:
            try:
                return self.driver.find_element_by_id(el_id)

            except Exception as e:
                # print(f'Bot {self.idx}: {e}')
                time.sleep(.2)

    def find(self, el_id):
        try:
            return self.driver.find_element_by_id(el_id)
        except Exception as e:
            # print(f'Bot {self.idx}: {e}')
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

    def get_option(self, n):
        return self.driver.find_element_by_id(f'option{n}').get_attribute('src').split('/')[-1]

    def set_choice(self, n):
        self.driver.find_element_by_id(f'canvas{n}').click()


class QLearningAgent(Bot):
    def __init__(self, alpha, beta, q0, **kwargs):
        super().__init__(**kwargs)
        self.alpha = alpha
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

    def run(self, q):
        t = 0
        while True:

            el = self.find('next')
            if el is not None:
                el.click()
                continue

            el = self.find('ok_1')
            if el is not None:
                el.click()
                continue

            el = self.find('option1')
            if el is not None:
                s1, s2 = self.get_state()
                v1 = self.q[s1]
                v2 = self.q[s2]
                learn = True
                if "png" in s2:
                    v2 = int(s2.replace('.png', ''))
                    learn = False
                
                a = self.make_choice([v1, v2])
                s = [s1, s2][a]
                self.set_choice(a+1)

                out = int(self.get_value('out'))
                cfout = int(self.get_value('cfout'))
                cfa = int((a+1) == 1)
                cfs = s2 if s == s1 else s1

                if learn:
                    self.learn(s, out)
                # self.learn(cfs, cfout)

                corr = a == 0

                q.put([corr, t])

            time.sleep(3)
            t += 1

    def get_state(self):
        opt1 = self.get_option(1)
        opt2 = self.get_option(2)

        # k = '_'.join([opt1, opt2])

        # if k not in self.q:
            # self.q[k] = np.ones(2, dtype=float) * self.q0
        
        for opt in (opt1, opt2):
            if opt not in self.q:
                self.q[opt] = 1. * self.q0
            
        return opt1, opt2


def plot(q, ax):

    dd = []
    items = sorted(q.items())
    for (s, (v1, v2)) in items:
        for i, j in enumerate((v1, v2)):
            dd.append(({'s': s, 'v': j, 'a': i}))

    df = pd.DataFrame(dd)
    ax.clear()
    sns.barplot(x="s", y='v', data=df, ax=ax, hue="a")
    plt.ylim([-1, 1])
    plt.draw()
    plt.pause(.1)


def run(idx, url, q, alpha, beta):

    b = QLearningAgent(
        url=url+f"?prolific_id=Bob{idx}", idx=idx, alpha=alpha, beta=beta, q0=0)

    print(f'Bot {b.idx} is running')
    b.run(q)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-u', '--url', help='global link for the experiment')
    parser.add_argument('-n', '--nbot', help='number of bots')
    args = parser.parse_args()

    n_bot = int(args.nbot)
    n_process = n_bot

    q = queue.LifoQueue()

    # with ThreadPool(processes=n_process) as pool:
    np.random.seed(1)

    # idx = [(i, i+1, i+2) for i in range(0, n_bot, 3)]
    # pool.starmap(run, [(i, args.url, q) for i in range(n_bot)])
    alphas = np.random.beta(1.1, 1.1, size=n_bot)
    betas = np.random.gamma(1.2, 5, size=n_bot)
    alphas = np.ones(n_bot) * .2
    betas = np.ones(n_bot) * 4

    for i in range(n_bot):
        t = threading.Thread(target=run, args=(i, args.url, q, alphas[i], betas[i]))
        t.start()

    fig, ax = plt.subplots(
        1, 1, figsize=(10, 8))

    d = {}

    while True:
        out, t = q.get()
        if t not in d:
            d[t] = []

        d[t].append(out)

        m = np.array([np.mean(d[i]) for i in range(max(d.keys()))])
        sem = np.array([stats.sem(d[i]) for i in range(max(d.keys()))])
        x = list(range(len(m)))

        ax.clear()

        ax.plot(x, m, color='C0')
        ax.fill_between(x=x, y1=m+sem, y2=m-sem, color='C0', alpha=.2)

        ax.set_ylim([0, 1])

        ax.set_xlabel('t')
        ax.set_ylabel('Correct choice rate')

        plt.draw()
        plt.pause(.1)
