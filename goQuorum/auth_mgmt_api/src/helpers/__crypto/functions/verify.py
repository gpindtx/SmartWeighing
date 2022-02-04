import base64

import cryptography.hazmat.primitives.asymmetric.padding as padding
import cryptography.hazmat.primitives.hashes as hashes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization


def verify(ciphertext, signature, public_key):
    pem_public_key = serialization.load_pem_public_key(
        bytes(public_key, "utf8"),
        backend=default_backend()
    )
    signature_bytes = base64.b64decode(signature.encode("utf8"))
    message_bytes = base64.b64decode(ciphertext.encode("utf8"))
    #message_bytes = bytes(ciphertext, "utf8")
    pem_public_key.verify(
        signature_bytes,
        message_bytes,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )


def perform_verification(args: list):
    if len(args) < 3:
        raise RuntimeError("You need to specify at least the message and "
                           "signature for verification as well as the public key to use.")
    ciphertext, signature, public_key = args[0], args[1], args[2]
    verify(ciphertext, signature, public_key)
    print("true")
    return True
