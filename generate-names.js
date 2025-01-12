const asciiOffset = 97; // offset of 'a', all chars are assumed lowercase
const lenAlphabet = 26;

let chainsData = {
  fchains: null,
  mchains: null,
  cchains: null,
};

async function fetchJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
}

async function fetchChains() {
  // If chains are already loaded, don't load them again
  if (chainsData.fchains && chainsData.mchains && chainsData.cchains) {
    return;
  }

  const furl = "name_data/female_2023_chains.json";
  const murl = "name_data/male_2023_chains.json";
  const curl = "name_data/combined_2023_chains.json";

  try {
    chainsData.fchains = await fetchJson(furl); // female chains
    chainsData.mchains = await fetchJson(murl); // male chains
    chainsData.cchains = await fetchJson(curl); // combined chains
  } catch (error) {
    console.error("Failed to fetch data: ", error);
  }
}

function createHtmlList(names, listId) {
  let htmlList = document.getElementById(listId);
  let fragList = document.createDocumentFragment();

  for (let i = 0; i < names.length; i++) {
    let li = document.createElement("li");
    li.textContent = names[i].charAt(0).toUpperCase() + names[i].slice(1); // uppercases first char
    fragList.appendChild(li);
  }
  htmlList.appendChild(fragList);
}

function removeHtmlList(listId) {
  let htmlList = document.getElementById(listId);
  while (htmlList.firstChild) {
    htmlList.removeChild(htmlList.firstChild);
  }
}

// json chains are in the format: (ngram) --> (array of letter liklihoods),
// letter liklihoods are indexed from array using letter asciiValue - asciiOffset

// dynamic ngrams are used, so 1gram -> 2gram -> 3gram... nameLen reached
function generateName(chains) {
  // selects initial letter and name length
  let letter = Math.floor(Math.random() * lenAlphabet);
  let name = String.fromCharCode(letter + asciiOffset);
  const nameLen = Math.floor(Math.random() * 7) + 3;

  let resets = 0; // if an ngram can't be found generation is reset
  while (name.length < nameLen) {
    let likelys = [];
    if (name in chains) {
      likelys = chains[name];
    } else if (resets < 50) {
      // resets name generation if ngram not found
      resets += 1;

      letter = Math.floor(Math.random() * lenAlphabet);
      name = String.fromCharCode(letter + asciiOffset);
      continue;
    } else if (name.slice(-1) in chains) {
      // if reset more than 50 times default to 1gram when necessary
      likelys = chains[name.slice(-1)];
    } else {
      // if reset more than 50 times and 1gram doesn't exist select char randomly
      letter = Math.floor(Math.random() * lenAlphabet);
      name += letter;
      continue;
    }

    let cumulative = [];
    let likelySum = 0;

    for (let i = 0; i < likelys.length; i++) {
      likelySum += likelys[i];
      cumulative.push(likelySum);
    }

    // selects next letter according to probability distribution associated with ngram
    let rint = Math.floor(Math.random() * likelySum) + 1;
    let selectedIdx = -1;
    for (let i = 0; i < cumulative.length; i++) {
      if (rint <= cumulative[i]) {
        selectedIdx = i;
        break;
      }
    }

    let genChar = String.fromCharCode(selectedIdx + asciiOffset);
    name += genChar;
  }
  return name;
}

async function main() {
  // loads in json chain data first
  await fetchChains();
  if (!chainsData.fchains || !chainsData.mchains || !chainsData.cchains) {
    console.error("One or more chain data is missing.");
    return;
  }

  const maxNames = 10; // max names per dataset

  let generatedFemaleNames = [];
  let generatedMaleNames = [];
  let generatedBothNames = [];

  for (let i = 0; i < maxNames; i++) {
    generatedFemaleNames.push(generateName(chainsData.fchains));
    generatedMaleNames.push(generateName(chainsData.mchains));
    generatedBothNames.push(generateName(chainsData.cchains));
  }

  removeHtmlList("female-names");
  createHtmlList(generatedFemaleNames, "female-names");

  removeHtmlList("male-names");
  createHtmlList(generatedMaleNames, "male-names");

  removeHtmlList("both-names");
  createHtmlList(generatedBothNames, "both-names");
}

main();
