const board = document.getElementById("board");
const popup = document.getElementById("popup");
const popupText = document.getElementById("popupText");
const popupButtons = document.getElementById("popupButtons");
const questionsPopup = document.getElementById("questionsPopup");
const showQuestionsBtn = document.getElementById("showQuestionsBtn");
const questionsClose = document.getElementById("questionsClose");
const categoriesDiv = document.getElementById("categories");
const questionsGrid = document.getElementById("questionsGrid");
const questionAnswer = document.getElementById("questionAnswer");
const rulesPopup = document.getElementById("rulesPopup");
const rulesBtn = document.getElementById("rulesBtn");
const rulesClose = document.getElementById("rulesClose");
const rulesOk = document.getElementById("rulesOk");
const placeholder = "img/placeholder.png";

let characters = [];
let questions = [];
let secret = null;
let startTime = 0;
let questionCount = 0;
let wrongGuesses = 0;

let activeCharacters = [];

function showPopup(text, buttons) {
    popupText.innerText = text;
    popupButtons.innerHTML = "";
    buttons.forEach(btn => {
        const b = document.createElement("button");
        b.innerText = btn.text;
        b.className = btn.class;
        b.onclick = btn.action;
        popupButtons.appendChild(b);
    });
    popup.classList.remove("hidden");
}

function hidePopup() {
    popup.classList.add("hidden");
}

fetch("data.json")
    .then(r => r.json())
    .then(data => {
        characters = data.karakterek;
        questions = data.kerdesek;
        startGame();
    });

function startGame() {
    board.innerHTML = "";
    secret = characters[Math.floor(Math.random() * characters.length)];
    startTime = Date.now();
    questionCount = 0;
    wrongGuesses = 0;

    activeCharacters = characters.map(() => true);

    characters.forEach((char, index) => {
        const card = document.createElement("div");
        card.className = "card";

        const img = document.createElement("img");
        img.src = char.img || placeholder;
        img.onerror = () => img.src = placeholder;

        const name = document.createElement("div");
        name.className = "name";
        name.innerText = char.nev;

        card.append(img, name);

        card.onclick = () => {
            showPopup(
                `Szeretnéd tippelni, hogy ${char.nev} a titkos karakter?`,
                [
                    { text: "IGEN", class: "yes", action: () => { hidePopup(); guess(char, card); } },
                    { text: "NEM", class: "no", action: hidePopup }
                ]
            );
        };

        board.appendChild(card);
    });
}

function guess(char, card) {
    if (char.id === secret.id) {
        const time = Math.floor((Date.now() - startTime) / 1000);
        showPopup(
            `🎉 Győztél!\nKérdések: ${questionCount}\nHibás tippek: ${wrongGuesses}\nIdő: ${time} mp`,
            [{ text: "Új játék", class: "newgame", action: () => { hidePopup(); startGame(); } }]
        );
    } else {
        wrongGuesses++;
        card.classList.add("inactive");
        showPopup("❌ Nem ő volt!", [{ text: "OK", class: "ok", action: hidePopup }]);
    }
}

showQuestionsBtn.onclick = () => {
    questionsPopup.classList.remove("hidden");
    loadCategories();
};

questionsClose.onclick = () => questionsPopup.classList.add("hidden");

function loadCategories() {
    const uniqueCats = [...new Set(questions.map(q => q.category))];
    categoriesDiv.innerHTML = "";
    uniqueCats.forEach(cat => {
        const btn = document.createElement("button");
        btn.innerText = cat;
        btn.dataset.cat = cat;
        btn.onclick = () => selectCategory(cat);
        categoriesDiv.appendChild(btn);
    });
}

function selectCategory(cat) {
    questionsGrid.innerHTML = "";
    questionAnswer.innerText = "";

    document.querySelectorAll("#categories button").forEach(btn => btn.classList.remove("active"));
    document.querySelector(`#categories button[data-cat='${cat}']`).classList.add("active");

    questions.filter(q => q.category === cat).forEach(q => {
        const qBtn = document.createElement("button");
        qBtn.innerText = q.text;

        qBtn.onclick = () => {
            questionCount++;

            const secretValue = secret[q.field];
            const questionValue = q.value;
            const answer = secretValue === questionValue ? "IGEN" : "NEM";

            questionAnswer.classList.remove("answer-flash");
            void questionAnswer.offsetWidth;
            questionAnswer.innerText = `Válasz: ${answer}`;
            questionAnswer.classList.add("answer-flash");

            characters.forEach((char, i) => {
                if (char.id === secret.id) return;
                if (!activeCharacters[i]) return;
                if ((answer === "IGEN" && char[q.field] !== questionValue) ||
                    (answer === "NEM" && char[q.field] === questionValue)) {
                    activeCharacters[i] = false;
                }
            });

            document.querySelectorAll(".card").forEach((card, i) => {
                if (activeCharacters[i]) {
                    card.classList.remove("inactive");
                } else {
                    card.classList.add("inactive");
                }
            });
        };

        questionsGrid.appendChild(qBtn);
    });
}

rulesBtn.onclick = () => rulesPopup.classList.remove("hidden");
rulesClose.onclick = () => rulesPopup.classList.add("hidden");
rulesOk.onclick = () => rulesPopup.classList.add("hidden");

const popups = document.querySelectorAll('.popup');

popups.forEach(popup => {
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            popup.classList.add('hidden');
        }
    });
});

