import sys

from functions.decrypt import perform_decryption
from functions.encrypt import perform_encryption
from functions.sign import perform_signature
from functions.verify import perform_verification


def perform():
    args = sys.argv
    if len(args) == 1:
        raise RuntimeError("A command has to be passed: Either encrypt, decrypt, sign or verify.")
    command = args[1]
    args = args[2:]
    if command == "encrypt":
        perform_encryption(args)
        return

    if command == "decrypt":
        perform_decryption(args)
        return

    if command == "sign":
        perform_signature(args)
        return

    if command == "verify":
        perform_verification(args)
        return

    raise RuntimeError("You can only pass one of four commands: encrypt, decrypt, sign or verify")


if __name__ == "__main__":
    perform()
