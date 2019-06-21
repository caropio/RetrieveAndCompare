import numpy as np
import itertools as it


def main():

    # Define probs and rewards for each cond
    # ------------------------------------------------------------------------------- # 
    reward = [[] for _ in range(5)]
    prob = [[] for _ in range(5)]

    reward[0] = [[-1, 1], [-1, 1]]
    prob[0] = [[0.1, 0.9], [0.9, 0.1]]

    reward[1] = [[-1, 1], [-1, 1]]
    prob[1] = [[0.2, 0.8], [0.8, 0.2]]

    reward[2] = [[-1, 1], [-1, 1]]
    prob[2] = [[0.3, 0.7], [0.7, 0.3]]

    reward[3] = [[-1, 1], [-1, 1]]
    prob[3] = [[0.4, 0.6], [0.6, 0.4]]

    reward[4] = [[-1, 1], [-1, 1]]
    prob[4] = [[0.5, 0.5], [0.5, 0.5]]

    # reward[4] = [[-1, 1], [-1, 1]]
    # prob[4] = [[0.1, 0.9], [0.9, 0.1]]
    #
    # reward[5] = [[-1, 1], [-1, 1]]
    # prob[5] = [[1, 0], [0, 1]]
    cond = np.repeat(range(4), 30)
    tmax = len(cond)
    max_list = []
    rand_list = []
    for i in range(1000):
        max_reward = 0
        rand_reward = 0

        for t in range(tmax):
            r = np.array(reward[cond[t]])
            p = np.array(prob[cond[t]])
            ev1 = sum(r[0] * p[0])
            ev2 = sum(r[1] * p[1])
            max_reward += max([ev1, ev2])
            rand_reward += np.random.choice([ev1, ev2])

        expected_values = [-1, -.8, -.6, -.4, -.2, 0, .2, .4, .6, .8, 1]
        for r1, p1 in zip(reward, prob):
            for r2, p2 in zip(r1, p1):
                for e in expected_values:
                    r, p = np.array(r2), np.array(p2)
                    ev1 = sum(r * p)
                    ev2 = e
                    max_reward += max([ev1, ev2])
                    rand_reward += np.random.choice([ev1, ev2])
                    i += 1
        max_list.append(max_reward)
        rand_list.append(rand_reward)

    symbol = []
    for r1, p1 in zip(reward, prob):
        for r2, p2 in zip(r1, p1):
            if np.all(p2 != [.5, .5]):
                symbol.append(np.array([r2, p2]))

    for i in range(1000):
        rand_rew = 0
        max_rew = 0
        for s in symbol:
            ev = sum(s[0] * s[1])
            choice = np.random.random()
            lottery = np.random.random()
            if lottery < choice:
                rand_rew += np.random.choice([-1, 1], p=s[1])
            else:
                rand_rew += np.random.choice([-1, 1], p=[1-lottery, lottery])
            choice = ev
            lottery = np.random.random()
            if lottery < choice:
                max_rew += np.random.choice([-1, 1], p=s[1])
            else:
                max_rew += np.random.choice([-1, 1], p=[1-lottery, lottery])
            # if
            # rand_rew +=
            # max_rew +=
        max_list.append(max_rew)
        rand_list.append(rand_rew)

    print(np.mean(max_list))
    print(np.mean(rand_list))


if __name__ == "__main__":
    main()
