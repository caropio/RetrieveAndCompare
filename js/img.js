// stimuli
export const stim = {
    path: "images/cards_gif/stim1/",
    filenames: Array.from({ 'length': 24 }, (_, i) => i + 2),
    extension: 'png',
}

export const lotteries = {
    path: "images/cards_gif/lotteries/",
    filenames: ['-1', '-0.8', '-0.6', '-0.4', '-0.2', '0', '0.2', '0.4', '0.6', '0.8', '1'],
    extension: 'png',
}

export const trainingStim = {
    path: "images/cards_gif/stim2/",
    filenames: [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F",
        "G",
        "H",
        "I",
        "J",
        "K",
        "L",
        "M",
        "N",
        "O",
        "P",
        "Q",
        "R",
        "S",
        "T",
        "U",
        "V",
        "W",
        "X",
        "Y",
        "Z",
    ],
    extension: 'png',
}

// feedback
export const fb = {
    path: "images/cards_gif/fb/",
    filenames: ['1', '-1', 'empty'],
    extension: 'png',
}