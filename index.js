const categoriesNames = ['animals', 'food', 'clothes', 'jobs', 'sports'];
const propsClasses = [...document.querySelector('.props').children].map(
    (child) => child.className,
);
const hangmanClasses = [...document.querySelector('.hangman').children].map(
    (child) => child.className,
);
const maxAttempts = 8;
const propsCount = 8;
const correctAttemptScore = 100;
const failedAttemptScore = -20;

let categoriesSaved = getArrayCookie('categories') ?? categoriesNames;
let scoreSaved = getCookie('score') ?? 0;
let audioMuted = getCookie('audio') ? JSON.parse(getCookie('audio')) : true;

let wordGenerated = '';
let wordDisplayed = '';

let failIndex = 0;

function setArrayCookie(name, arr) {
    document.cookie = `${name}=${encodeURIComponent(JSON.stringify(arr))}; path=/`;
}

function getArrayCookie(name) {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));
    if (!cookie) return null;
    return JSON.parse(decodeURIComponent(cookie.split('=')[1]));
}
function setCookie(name, value) {
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/`;
}

function getCookie(name) {
    const cookies = document.cookie.split('; ');
    const cookie = cookies.find((cookie) => cookie.startsWith(`${name}=`));
    if (!cookie) return null;
    return decodeURIComponent(cookie.split('=')[1]);
}

function randomize(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function indexesOf(char, string) {
    let indexes = [];
    let i = -1;
    while ((i = string.indexOf(char, i + 1)) != -1) {
        indexes.push(i);
    }
    return indexes;
}

function replaceAt(index, string, char) {
    return (
        string.substring(0, index) +
        char +
        string.substring(index + 1, string.length)
    );
}

function startProgressBar() {
    let currentProgress = 0;
    const progressBar = document.querySelector('.progressBar');
    const interval = setInterval(() => {
        if (currentProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                progressBar.firstElementChild.innerHTML = '100% Complete';
                document.querySelector('.loading').classList.add('hidden');
                document.querySelector('.loading h2').classList.add('active');
                setTimeout(() => {
                    document.querySelector('.loading').classList.add('active');
                }, 50);
            }, 400);
        } else {
            let increment = Math.floor(Math.random() * 5) + 1;
            currentProgress += increment;
            if (currentProgress > 100) {
                currentProgress = 100;
            }

            progressBar.style.width = currentProgress + '%';
            progressBar.firstElementChild.innerHTML =
                Math.round(currentProgress) + '%';
        }
    }, 50);
}

function toggleAudio() {
    audioMuted = !audioMuted;
    setCookie('audio', audioMuted);
    audio.muted = audioMuted;
    document.querySelector('.audio-normal').classList.toggle('display-none');
    document.querySelector('.audio-muted').classList.toggle('display-none');
}

function enterGame() {
    document.getElementById('loading').classList.toggle('drop-out');
    document.getElementById('main-menu').classList.toggle('active');
    document.getElementById('watermark').classList.toggle('active');
    document.getElementById('audio-control').classList.toggle('active');
    document.getElementById('audio').play();
    document.getElementById('audio').muted = audioMuted;
    if (audioMuted) {
        document
            .querySelector('.audio-normal')
            .classList.toggle('display-none');
        document.querySelector('.audio-muted').classList.toggle('display-none');
    }
}

function setWord() {
    let category = '';
    do {
        category = categoriesNames[randomize(0, categoriesNames.length - 1)];
    } while (!categoriesSaved.includes(category));
    wordGenerated =
        word_list[category][randomize(0, word_list[category].length) - 1];
    document.querySelector('.word h2').innerHTML = category;
}

function changeScore(change) {
    scoreSaved = Number.parseInt(scoreSaved) + change;
    setCookie('score', scoreSaved);
    document
        .querySelectorAll('.score')
        .forEach((element) => (element.innerHTML = `Score : ${scoreSaved}`));
}

function mainMenuStart() {
    document.getElementById('main-menu').classList.toggle('active');
    document.getElementById('in-progress').classList.toggle('active');

    setWord();
    wordDisplayed = '-'.repeat(wordGenerated.length);
    document.querySelector('.word h1').innerHTML = wordDisplayed;
    document.querySelector('.exit').classList.toggle('active');
}

function mainMenuCategorySettings() {
    const categoriesElements = [
        ...document.querySelector('.categories').children,
    ];

    document.getElementById('main-menu').classList.toggle('active');
    document.getElementById('category-select').classList.toggle('active');

    categoriesElements.forEach((category) => {
        let input = category.firstElementChild;
        input.checked = categoriesSaved.includes(input.value);
    });
}

function categorySelectSave() {
    const categoriesElements = [
        ...document.querySelector('.categories').children,
    ];

    let categories = [];
    categoriesElements.forEach((category) => {
        let input = category.firstElementChild;
        if (input.checked) categories.push(input.value);
    });

    setArrayCookie('categories', categories);
    categoriesSaved = categories;

    categorySelectCancel();
}

function categorySelectCancel() {
    document.getElementById('main-menu').classList.toggle('active');
    document.getElementById('category-select').classList.toggle('active');
}

function checkGameStatus() {
    if (failIndex >= maxAttempts) {
        document.querySelector('.hangman').classList.add('slide-down');
        document.querySelector('.rock').classList.add('slide-down-rock');

        document.querySelector('.in-progress-actions button').className = '';

        document.querySelector('.status h1').innerHTML = 'Game Over';

        setTimeout(() => {
            document.getElementById('in-progress').style.backgroundImage =
                "url('./resources/background/animated.gif')";

            [...document.querySelector('.hangman').children].forEach(
                (child) => {
                    child.classList.remove('fade-reveal');
                    child.classList.add('display-none');
                },
            );

            document
                .querySelector('.rock')
                .classList.remove('fade-reveal-reverse');
            document.querySelector('.rock').classList.add('display-none');
        }, 200);
    } else if (wordDisplayed.toLowerCase() === wordGenerated) {
        [...document.querySelector('.hangman').children].forEach(
            (child, index) => {
                if (index == 0) {
                    child.classList.add('reverse');
                    return;
                }
                child.classList.add('fade-reveal');
                child.classList.remove('display-none');
            },
        );

        setTimeout(() => {
            document.querySelector('.hangman').classList.add('slide-down-won');
            document.querySelector('.rock').classList.remove('display-none');
            document
                .querySelector('.rock')
                .classList.remove('fade-reveal-reverse');
            document
                .querySelector('.rock')
                .classList.add('slide-down-rock-won');
        }, 600);

        document.querySelector('.status h1').innerHTML = 'Good Job';
    } else {
        return;
    }

    [...document.querySelector('.keyboard').children].forEach((child) => {
        [...child.children].forEach((grandChild) => {
            grandChild.classList.add('disabled');
            grandChild.disabled = true;
        });
    });

    document.querySelector('.in-progress-actions').classList.add('active');
    document.querySelector('.status h1').classList.add('active');
    document.querySelector('.status').classList.add('hidden');
    setTimeout(() => {
        document.querySelector('.status').classList.add('active');
    }, 200);
}

function reveal() {
    document.querySelector('.word h1').innerHTML = wordGenerated.toUpperCase();
}

function resetGame() {
    failIndex = 0;
    [...document.querySelector('.keyboard').children].forEach((child) => {
        [...child.children].forEach((grandChild) => {
            grandChild.className = '';
            grandChild.disabled = false;
        });
    });

    [...document.querySelector('.props').children].forEach((child, index) => {
        child.className = propsClasses[index];
    });

    [...document.querySelector('.hangman').children].forEach((child, index) => {
        child.className = hangmanClasses[index];
    });

    document.querySelector('.status').className = 'status';
    document.querySelector('.status h1').classList.remove('active');
    document.querySelector('.in-progress-actions').classList.remove('active');

    document.querySelector('.in-progress-actions button').className =
        'display-none';

    document.getElementById('main-menu').classList.toggle('active');
    document.getElementById('in-progress').classList.toggle('active');

    document.getElementById('in-progress').style.backgroundImage =
        "url('./resources/background/cleared.png')";

    document.querySelector('.exit').classList.toggle('active');
}

function clearScoreCancel() {
    document.getElementById('main-menu').classList.toggle('active');
    document.getElementById('clear-score').classList.toggle('active');
}

function clearScoreReset() {
    changeScore(scoreSaved * -1);
    clearScoreCancel();
}

function creditGoBack() {
    document.getElementById('main-menu').classList.toggle('active');
    document.getElementById('watermark').classList.toggle('active');
    document.getElementById('credit').classList.toggle('active');
}

document.querySelector('.keyboard').addEventListener('click', (key) => {
    const letter = key.target.innerHTML.toLowerCase();

    if (key.target.tagName != 'BUTTON') return;

    if (wordGenerated.includes(letter)) {
        indexesOf(letter, wordGenerated).forEach((index) => {
            wordDisplayed = replaceAt(
                index,
                wordDisplayed,
                letter.toUpperCase(),
            );
        });
        document.querySelector('.word h1').innerHTML = wordDisplayed;
        key.target.classList.add('correct-letter');
        changeScore(correctAttemptScore);
    } else {
        key.target.classList.add('wrong-letter');
        if (failIndex < propsCount - 1) {
            document
                .querySelector('.hangman')
                .children[failIndex].classList.remove('display-none');
            document
                .querySelector('.hangman')
                .children[failIndex].classList.add('fade-reveal');
            if (failIndex == 0) {
                document
                    .querySelector('.rock')
                    .classList.remove('display-none');
                document
                    .querySelector('.rock')
                    .classList.add('fade-reveal-reverse');
            }
        }
        changeScore(failedAttemptScore);
        failIndex++;
    }
    key.target.disabled = true;

    checkGameStatus();
});

document.querySelectorAll('.category').forEach((category) => {
    category.addEventListener('change', (event) => {
        let foundAtLeastOne = false;
        document.querySelectorAll('.category').forEach((_category) => {
            if (_category.firstElementChild.checked) foundAtLeastOne = true;
        });
        document
            .querySelector('.category-actions h3')
            .setAttribute(
                'onclick',
                foundAtLeastOne ? 'categorySelectSave()' : '',
            );
        document.querySelector('.category-actions h3').className =
            foundAtLeastOne ? '' : 'category-action-disabled';
    });
});

changeScore(0);
startProgressBar();
console.log('Ahmed Ramadan');
