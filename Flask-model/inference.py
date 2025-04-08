import base64
from io import BytesIO
from PIL import Image
import torch
import torchvision.transforms as transforms

from models import Generator, Discriminator

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
IMAGE_SIZE = 64       # e.g., 64x64 images
CHANNELS_IMG = 3      # 3 channels for RGB
Z_DIM = 100
FEATURES_GEN = 64
FEATURES_CRITIC = 64

def load_models():
    """
    Load the pre-trained Generator and Discriminator.
    Adjust file paths as needed.
    """
    generator = Generator(Z_DIM, CHANNELS_IMG, FEATURES_GEN).to(DEVICE)
    discriminator = Discriminator(CHANNELS_IMG, FEATURES_CRITIC).to(DEVICE)
    
    # Adjust these paths if the weight files reside elsewhere
    generator.load_state_dict(torch.load("models/generator.pth", map_location=DEVICE))
    discriminator.load_state_dict(torch.load("models/critic_retrained.pth", map_location=DEVICE))
    
    generator.eval()
    discriminator.eval()
    
    return generator, discriminator

def preprocess_image(image_base64):
    """
    Decode the base64 string into an image tensor.
    """
    image_bytes = base64.b64decode(image_base64)
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    
    transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.5] * CHANNELS_IMG, [0.5] * CHANNELS_IMG)
    ])
    image_tensor = transform(image).unsqueeze(0).to(DEVICE)
    return image_tensor

def run_inference(image_base64):
    """
    Run inference on the given base64 image.
    """
    generator, discriminator = load_models()  # Load models here
    image_tensor = preprocess_image(image_base64)
    
    with torch.no_grad():
        prediction = discriminator(image_tensor)
    
    confidence = prediction.item()  # Adjust according to your model's output
    is_ai_generated = confidence > 0.5  # Example threshold
    
    artifacts = []
    if is_ai_generated:
        artifacts = [
            "Unnatural color consistency",
            "Blurred texture boundaries",
            "Symmetry artifacts"
        ]
    
    return {
        "isAI": is_ai_generated,
        "confidence": confidence,
        "artifacts": artifacts
    }