import json
import sys


def ngram(name, gram, chains):
    offset = 97  # ascii offset for lowercase 'a'

    start = 0
    end = gram
    while end < len(name):  # ensures the end index does not go out of bounds
        substring = name[start:end]

        if substring not in chains:
            chains[substring] = [0] * 26

        char = name[end]
        if char.isalpha():  # This ensures it's a letter
            chains[substring][ord(char) - offset] += 1
        else:
            print(
                f"ERROR: non-alphabetical character '{char}' found in {name}, ignoring..."
            )

        start += 1
        end += 1


def nameFreq(name, chains):
    name = name.lower().strip()
    for i in range(1, len(name)):
        ngram(name, i, chains)


def readFile(filename):
    names = []

    try:
        with open(filename, "r") as file:
            names = file.readlines()
            names = [name.strip() for name in names]

    except FileNotFoundError:
        print("ERROR: File not found")
    except PermissionError:
        print("ERROR: You do not have read permission")
    except UnicodeDecodeError:
        print("ERROR: Encoding error while reading file")
    except Exception as e:
        print(f"Unexpected error occurred: {e}")

    return names


def main():
    args = sys.argv
    if len(args) != 2:
        print("ERROR: Filename argument expected")

    filename = args[1]  # args[0] is name of program
    names = readFile(filename)
    if len(names) == 0:  # error in reading file, or file empty
        return

    print("Generating markov chains...")

    chains = dict()
    for name in names:
        nameFreq(name, chains)  # dicts are passed by reference

    print("Writing to json file...")

    if filename[-4] == ".":  # removes previous file extension from filename if exists
        filename = filename[:-4]

    with open(f"{filename}_chains.json", "w") as file:
        json.dump(chains, file)
    print("File written")


main()
