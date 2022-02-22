from PIL import Image
import matplotlib.pyplot as plt

from numpy import asarray, newaxis, expand_dims, zeros


# letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
letters = ['../fb/empty.gif', '../fb/-1.gif', '../fb/1.gif']

# load the image

for l in letters:
    image = Image.open(f'{l}')

    image = image.convert('RGB')
    # import pdb; pdb.set_trace()

    # convert image to numpy array
    color = [250, 250, 250]

    data = asarray(image).copy()
    data.setflags(write=1)
    # print(data[1, :])

    # d = zeros((620, 620, 3), dtype=object)
    # d[:, :, :] = color
    data[:, 0:10, :] = color
    data[:, 610:620, :] = color
    data[0:10, :, :] = color
    data[data.shape[1]-20:data.shape[1], :, :] = color

    # create Pillow image
    image2 = Image.fromarray(data)

    image2.save(f'{l.replace(".gif", "")}.gif')
