import base64

import cryptography.hazmat.primitives.asymmetric.padding as padding
import cryptography.hazmat.primitives.hashes as hashes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization


def sign(message, private_key, password = None):
    if password is not None:
        password = bytes(password, "utf8")
    pem_private_key = serialization.load_pem_private_key(
        bytes(private_key, "utf8"),
        password=password,
        backend=default_backend()
    )
    message_bytes = base64.b64decode(message.encode("utf8"))
    signature = pem_private_key.sign(
        message_bytes,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    return base64.b64encode(signature).decode("utf8")


def perform_signature(args: list):
    if len(args) < 2:
        raise RuntimeError("You need to specify at least the message to sign as well as the private key to use.")
    message, private_key = args[0], args[1]
    if len(args) == 3:
        password = args[2]
    else:
        password = None
    signature = sign(message, private_key, password=password)
    print(signature)
    return signature
