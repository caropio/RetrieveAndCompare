from PIL import Image
import matplotlib.pyplot as plt
from os import listdir
from os.path import isfile, join
from numpy import asarray, newaxis, expand_dims, zeros, where

def border(imgpath, border_size=10, savename=None):
    image = Image.open(imgpath)

    image = image.convert('RGB')
    # import pdb; pdb.set_trace()

    # convert image to numpy array
    color = [255, 255, 255]

    data = asarray(image).copy()
    data.setflags(write=1)
    # print(data[1, :])

    # d = zeros((620, 620, 3), dtype=object)
    # d[:, :, :] = color
    data[:, 0:border_size, :] = color
    data[:, data.shape[1]-border_size:, :] = color
    data[0:border_size, :, :] = color
    data[data.shape[1]-border_size:, :, :] = color

    # create Pillow image
    image2 = Image.fromarray(data)

    if savename is not None:
        image2.save('/'.join(imgpath.split('/')[:-1]) + '/' + savename)
        return
    filename = imgpath.split('/')[-1]
    # image2 = image2.convert("1")
    image2.save('/'.join(imgpath.split('/')[:-1]) + '/' + filename)

def gray_to_white(imgpath):
    image = Image.open(imgpath)

    image = image.convert('RGB')
    # import pdb; pdb.set_trace()

    # convert image to numpy array
    color = [255, 255, 255]

    data = asarray(image).copy()
    data.setflags(write=1)
    # print(data[1, :])

    # d = zeros((620, 620, 3), dtype=object)
    # d[:, :, :] = color

    data[data > 200] = 255
    # create Pillow image
    image2 = Image.fromarray(data)

    filename = imgpath.split('/')[-1]
    # image2 = image2.convert("1")
    image2.save('/'.join(imgpath.split('/')[:-1]) + '/' + filename)


if __name__ == "__main__":

    # path = './stim2/'
    # files = [path+f for f in listdir(path) if isfile(join(path, f))]

    # print('Treating files: ', files)

    # for f in files:
        # border(imgpath=f, border_size=10)
        
    path = './stim2/'
    files = [path+f for f in listdir(path) if isfile(join(path, f))]

    print('Treating files: ', files)

    for f in files:
        gray_to_white(imgpath=f)
        # border(imgpath=f, border_size=10)
     