# !pip install kaggle Pillow imageio matplotlib pandas torchsummary
# !mkdir ~/.kaggle
# !cp kaggle.json ~/.kaggle/
# !chmod 600 ~/.kaggle/kaggle.json
# ! kaggle datasets download xhlulu/140k-real-and-fake-faces
# # ! unzip -q 140k-real-and-fake-faces.zip

# import shutil
# shutil.unpack_archive('140k-real-and-fake-faces.zip')

import os
import numpy as np
import datetime
from copy import deepcopy
from tqdm import tqdm
import random
import matplotlib.pyplot as plt
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Subset
import torchvision
from torchvision.utils import save_image
import torchvision.datasets as datasets
import torchvision.transforms as transforms
from torchsummary import summary

# Hyperparameters
device = "cuda" if torch.cuda.is_available() else "cpu"
NUM_EPOCHS = 20
BATCH_SIZE = 256
TRAIN_SUBSET_SIZE = 25000
LEARNING_RATE = 1e-4
IMAGE_SIZE = 64
CHANNELS_IMG = 3
Z_DIM = 100
FEATURES_CRITIC = 64
FEATURES_GEN = 64
CRITIC_ITERATIONS = 5
LAMBDA_GP = 10

class Discriminator(nn.Module):
    def __init__(self, channels_img, features_d):
        super(Discriminator, self).__init__()
        self.disc = nn.Sequential(
            # input: N x channels_img x 64 x 64
            nn.Conv2d(
                channels_img, features_d, kernel_size=4, stride=2, padding=1
            ),
            nn.LeakyReLU(0.2),
            # _block(in_channels, out_channels, kernel_size, stride, padding)
            self._block(features_d, features_d * 2, 4, 2, 1),
            self._block(features_d * 2, features_d * 4, 4, 2, 1),
            self._block(features_d * 4, features_d * 8, 4, 2, 1),
            self._block(features_d * 8, features_d * 16, 4, 2, 1),
            # After all _block img output is 4x4 (Conv2d below makes into 1x1)
            nn.Conv2d(features_d * 16, 1, kernel_size=2, stride=1, padding=0),
        )

    def _block(self, in_channels, out_channels, kernel_size, stride, padding):
        return nn.Sequential(
            nn.Conv2d(
                in_channels,
                out_channels,
                kernel_size,
                stride,
                padding,
                bias=False,
            ),
            nn.InstanceNorm2d(out_channels, affine=True),
            nn.LeakyReLU(0.2),
        )

    def forward(self, x):
        return self.disc(x)
    

data_transforms = transforms.Compose([
    transforms.Resize(IMAGE_SIZE),
    transforms.ToTensor(),
    transforms.Normalize([0.5] * CHANNELS_IMG, [0.5] * CHANNELS_IMG),
])


dataset = datasets.ImageFolder(root="real_vs_fake/real-vs-fake/test", transform=data_transforms)
real_class_idx = dataset.class_to_idx["real"]
fake_class_idx = dataset.class_to_idx["fake"]
real_indices = [i for i, label in enumerate(dataset.targets) if label==real_class_idx]
fake_indices = [i for i, label in enumerate(dataset.targets) if label==fake_class_idx]
real_subset_indices = random.sample(real_indices, 2500)
fake_subset_indices = random.sample(fake_indices, 2500)
subset_indices = real_subset_indices + fake_subset_indices
subset_dataset = Subset(dataset, subset_indices)
test_loader = DataLoader(subset_dataset, batch_size=BATCH_SIZE, shuffle=False, drop_last=True)
print("No. of testing images: ", len(subset_dataset))

critic = Discriminator(3, 64)
critic.disc.add_module("7",nn.Flatten())
critic.disc.add_module("8",nn.Sigmoid())
critic.to(device)
critic.load_state_dict(torch.load("critic.pth", weights_only=True))

for i, labels in test_loader:
    image = i[10]
    plt.imshow(image.permute(1, 2, 0))
    label = labels[10]
    image = image[None,:,:,:]
    image = image.to(device)
    print(image.shape)
    print(critic(image))
    print(label)
    break