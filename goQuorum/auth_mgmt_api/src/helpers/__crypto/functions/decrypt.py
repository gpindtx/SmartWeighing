import base64

import cryptography.hazmat.primitives.asymmetric.padding as padding
import cryptography.hazmat.primitives.hashes as hashes
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives import serialization


def decrypt(ciphertext, private_key, password = None):
    if password == "":
        password = None
    if password is not None:
        password = bytes(password, "utf8")
    pem_private_key = serialization.load_pem_private_key(
        bytes(private_key, "utf8"),
        password=password,
        backend=default_backend()
    )
    message_bytes = base64.b64decode(ciphertext.encode("utf8"))
    message = pem_private_key.decrypt(
        message_bytes,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    return message.decode("utf8")


def perform_decryption(args: list):
    if len(args) < 2:
        raise RuntimeError("You need to specify at least the ciphertext to decrypt as well as the private key to use.")
    message, private_key = args[0], args[1]
    if len(args) == 3:
        password = args[2]
    else:
        password = None
    decrypted_message = decrypt(message, private_key, password=password)
    print(decrypted_message)
    return decrypted_message
