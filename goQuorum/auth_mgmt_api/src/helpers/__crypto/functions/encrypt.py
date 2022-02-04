import base64

import cryptography.hazmat.primitives.asymmetric.padding as padding
import cryptography.hazmat.primitives.hashes as hashes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization


def encrypt(message, public_key):
    pem_public_key = serialization.load_pem_public_key(
        bytes(public_key, "utf8"),
        backend=default_backend()
    )
    data = bytes(message, encoding="utf8")
    ciphertext = pem_public_key.encrypt(
        data,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return base64.b64encode(ciphertext).decode("utf8")


def perform_encryption(args: list):
    if len(args) < 2:
        raise RuntimeError("You need to specify the message to encrypt as well as the public key.")
    message, public_key = args[0], args[1]
    ciphertext = encrypt(message, public_key)
    print(ciphertext)
    return ciphertext
