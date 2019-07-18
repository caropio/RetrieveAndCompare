import numpy as np
import itertools as it


def main():

    # Define probs and rewards for each cond
    # ------------------------------------------------------------------------------- # 
    reward = [[] for _ in range(4)]
    prob = [[] for _ in range(4)]

    reward[0] = [[-1, 1], [-1, 1]]
    prob[0] = [[0.1, 0.9], [0.9, 0.1]]

    reward[1] = [[-1, 1], [-1, 1]]
    prob[1] = [[0.2, 0.8], [0.8, 0.2]]

    reward[2] = [[-1, 1], [-1, 1]]
    prob[2] = [[0.3, 0.7], [0.7, 0.3]]

    reward[3] = [[-1, 1], [-1, 1]]
    prob[3] = [[0.4, 0.6], [0.6, 0.4]]

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
        #max_list.append(max_reward)
        #continue
        max_reward = 0
        #expected_values = [-1, -.8, -.6, -.4, -.2, 0, .2, .4, .6, .8, 1]
        cont = [[] for _ in range(11)]
        cont[0] = [0.1, 0.9]
        cont[1] = [0.9, 0.1]
        cont[2] = [0.2, 0.8]
        cont[3] = [0.8, 0.2]
        cont[4] = [0.3, 0.7]
        cont[5] = [0.7, 0.3]
        cont[6] = [0.4, 0.6]
        cont[7] = [0.6, 0.4]
        cont[8] = [0.5, 0.5]
        cont[9] = [0., 1.]
        cont[10] = [1., 0.]
        i = 0
        for r1, p1 in zip(reward, prob):
            for r2, p2 in zip(r1, p1):
                for p22 in cont:
                    r, p = np.array(r2), np.array(p2)
                    ev1 = sum(r * p)
                    ev2 = sum(np.array([-1, 1]) * np.array(p22))

                    p = [p2, p22][int(np.argmax([ev1, ev2]))]
                    pl = [p2, p22][int(np.argmin([ev1, ev2]))]

                    max_reward += np.random.choice([-1, 1], p=p)

                    rand_reward += np.random.choice([ev1, ev2])
                    i += 1

        expected_values = [[-1, 1], [-.8, .8],  [-.6, .6], [-.4, .4], [-.2, .2]]
        for ev in expected_values:
            e1, e2 = ev
            max_reward += max([e1, e2])
            rand_reward += np.random.choice([e1, e2])
            i += 1
        max_list.append(max_reward)
        rand_list.append(rand_reward)

        continue

        symbol = []
        for r1, p1 in zip(reward, prob):
            for r2, p2 in zip(r1, p1):
                symbol.append(np.array([r2, p2]))

        for r1, p1 in zip([[-1, 1], ] * 11, cont):
            symbol.append(np.array([r1, p1]))
        max_reward = 0

        for s in symbol:

            ev = sum(s[0] * s[1])
            choice = np.random.random()
            lottery = np.random.random()

            if lottery < choice:
                rand_reward += np.random.choice([-1, 1], p=s[1])
            else:
                rand_reward += np.random.choice([-1, 1], p=[1-lottery, lottery])

            choice = ev
            lottery = np.random.random()
            print(ev)
            if lottery < choice:
                max_reward += np.random.choice([-1, 1], p=s[1])
            else:
                max_reward += np.random.choice([-1, 1], p=[1-lottery, lottery])

        max_list.append(max_reward)
        rand_list.append(rand_reward)
    print(i)
    print(np.mean(max_list))
    #print(np.array(max_list) < 20)
    #print(np.mean(rand_list))


if __name__ == "__main__":
    main()
