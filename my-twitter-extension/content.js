document.addEventListener("DOMContentLoaded", () => {
    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.getURL) {
        addButtonToReplies();
    } else {
        console.error("Chrome runtime is not available.");
    }
});

function addButtonToReplies() {
    const replyFields = document.querySelectorAll("div[data-testid='tweetTextarea_0']");

    replyFields.forEach((replyField) => {
        if (!replyField.querySelector(".fetch-original-tweet")) {
            const button = document.createElement("button");
            const img = document.createElement("img");
            img.src = chrome.runtime.getURL("logo/logo.png"); 
            img.alt = "Fetch";
            img.style.width = "45px";
            img.style.height = "45px";
            button.appendChild(img);
            button.className = "fetch-original-tweet";
            button.style.cursor = "pointer";
            button.style.margin = "5px";
            button.style.backgroundColor = "transparent";
            button.style.fontSize = "12px";
            button.style.color = "white";
            button.style.border = "none";
            button.style.padding = "2px";
            button.style.borderRadius = "6px";
            button.onclick = () => handleButtonClick(replyField);
            replyField.appendChild(button);
        }
    });
}


function handleButtonClick(replyField) {
    console.log("Button clicked!");

    let tweetText = '';

    let tweetTextElement = null;

    let dialog = replyField.closest("div[role='dialog']");
    if (dialog) {
        console.log("In dialog");

        tweetTextElement = dialog.querySelector("div[data-testid='tweetText'][lang]");

        if (!tweetTextElement) {
            console.log("tweetTextElement not found in dialog");
            alert("Original tweet text not found in dialog.");
            return;
        }
    } else {
        console.log("Not in dialog");

        let cellInnerDiv = replyField.closest("div[data-testid='cellInnerDiv']");
        if (cellInnerDiv) {
            console.log("Found cellInnerDiv");

            let tweetContainer = cellInnerDiv.previousElementSibling;
            while (tweetContainer && !tweetContainer.querySelector("div[data-testid='tweetText'][lang]")) {
                tweetContainer = tweetContainer.previousElementSibling;
            }

            if (!tweetContainer) {
                tweetContainer = cellInnerDiv.parentElement;
                while (tweetContainer && !tweetContainer.querySelector("div[data-testid='tweetText'][lang]")) {
                    tweetContainer = tweetContainer.parentElement;
                }
            }

            if (tweetContainer) {
                console.log("Found tweetContainer");
                tweetTextElement = tweetContainer.querySelector("div[data-testid='tweetText'][lang]");
                if (!tweetTextElement) {
                    console.log("tweetTextElement not found in tweetContainer");
                    alert("Original tweet text not found in feed.");
                    return;
                }
            } else {
                console.log("tweetContainer not found");
                alert("Original tweet not found.");
                return;
            }
        } else {
            console.log("cellInnerDiv not found");
            alert("Unable to locate the tweet container.");
            return;
        }
    }

    if (tweetTextElement) {
        tweetText = tweetTextElement.innerText;
        console.log("Tweet text:", tweetText);
    } else {
        alert("Original tweet text not found.");
        return;
    }
    const replyInput = findReplyInput(replyField);

    if (replyInput) {
        console.log(`Fetched Tweet Text: ${tweetText}`); 
        setReplyInputValue(replyInput, ` reply: ${tweetText}`);
    } else {
        alert("Reply input field not found.");
    }
}


function findReplyInput(replyField) {
    let replyInput = replyField.querySelector("div.public-DraftEditor-content");

    if (replyInput) {
        console.log("Found replyInput via 'public-DraftEditor-content' class");
        return replyInput;
    }

    replyInput = replyField.querySelector("div[data-offset-key][class*='public-DraftStyleDefault-block']");

    if (replyInput) {
        console.log("Found replyInput via 'public-DraftStyleDefault-block' class");
        return replyInput;
    }

    replyInput = replyField.querySelector("div[data-offset-key]");

    if (replyInput) {
        console.log("Found replyInput via 'data-offset-key' attribute");
        return replyInput;
    }

    console.log("replyInput not found");
    return null;
}

function setReplyInputValue(replyInput, text) {
    replyInput.focus();
    replyInput.innerHTML = '';
    const textNode = document.createTextNode(text);
    const fragment = document.createDocumentFragment();
    const blockDiv = document.createElement('div');
    blockDiv.className = 'public-DraftStyleDefault-block public-DraftStyleDefault-ltr';
    const span = document.createElement('span');
    span.appendChild(textNode);
    blockDiv.appendChild(span);
    fragment.appendChild(blockDiv);

    replyInput.appendChild(fragment);
    placeCaretAtEnd(replyInput);

    const event = new Event('input', { bubbles: true });
    replyInput.dispatchEvent(event);
}

function placeCaretAtEnd(el) {
    el.focus();
    if (typeof window.getSelection != "undefined"
        && typeof document.createRange != "undefined") {
        let range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        let sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const observer = new MutationObserver(debounce(addButtonToReplies, 300));
observer.observe(document.body, { childList: true, subtree: true });