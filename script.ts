const chordSelector: { [key: string]: string } = {
  "wrytin.com": "div.wrytUp",
  "indichords.com": "div#mainData",
  "chordsfactory.com": "div.entry-content",
  "tabs.ultimate-guitar.com": "pre",
};

chrome.tabs.query({ active: true, currentWindow: true })
  .then((tabs) => {
    const activeTab = tabs[0];
    if (activeTab.url == null) {
      console.log(
        "Cannot access active tab. Try putting the active tab in host_permissions.",
      );
      return;
    }

    const pageURL = new URL(activeTab.url);
    const basename = pageURL.hostname;

    const listTag = document.getElementById("supported-websites");
    if (listTag == null) {
      console.log(
        "List tag not found. Was there any change in the popup HTML?",
      );
      return;
    }

    for (const key in chordSelector) {
      const li = document.createElement("li");
      li.textContent = key;
      listTag.appendChild(li);
    }

    const nameTag = document.getElementById("website-name");
    if (nameTag == null) {
      console.log(
        "Name tag not found. Was there any change in the popup HTML?",
      );
      return;
    }
    nameTag.textContent = basename;

    const statusTag = document.getElementById("website-status");
    if (statusTag == null) {
      console.log(
        "Status tag not found. Was there any change in the popup HTML?",
      );
      return;
    }
    statusTag.textContent = `${basename in chordSelector}`;

    const buttonTag = document.getElementById("simple-button");
    if (buttonTag == null) {
      console.log(
        "Button tag not found. Was there any change in the popup HTML?",
      );
      return;
    }
    if (buttonTag instanceof HTMLButtonElement) {
      buttonTag.disabled = !(basename in chordSelector);
    }

    if (!(basename in chordSelector)) {
      buttonTag.onclick = null;
      return;
    }

    buttonTag.onclick = () => {
      chrome.scripting.executeScript({
        target: {
          tabId: activeTab.id,
        },
        func: (selector: string) => {
          const element = document.querySelector(selector);
          if (element == null) {
            alert("No element " + selector + " found.");
            return null;
          } else {
            return element.outerHTML;
          }
        },
        args: [chordSelector[basename]],
      }).then((results) => {
        if (results.length === 0) {
          console.log("No results returned. Strange...");
          return;
        }
        const outer = results[0].result;
        if (outer == null) return;
        document.body.innerHTML = outer;
        const spans = document.getElementsByTagName("span");
        for (let index = 0; index < spans.length; index++) {
          spans[index].textContent = "[" + spans[index].textContent + "]";
        }
      });
    };
  });
