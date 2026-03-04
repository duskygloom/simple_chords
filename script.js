const chordSelector = { "wrytin.com": "div.wrytUp", "indichords.com": "div#mainData", "chordsfactory.com": "div.entry-content" }

browser.tabs.query({ active: true, currentWindow: true })
    .then((tabs) => {
        const activeTab = tabs[0]
        const pageURL = new URL(activeTab.url)
        const basename = pageURL.hostname

        const listTag = document.getElementById("supported-websites")

        for (var key in chordSelector) {
            var li = document.createElement("li")
            li.textContent = key
            listTag.appendChild(li)
        }

        document.getElementById("website-name").textContent = basename
        document.getElementById("website-status").textContent = basename in chordSelector
        document.getElementById("simple-button").disabled = !(basename in chordSelector)

        if (!(basename in chordSelector)) {
            document.getElementById("simple-button").onclick = null
            return
        }

        document.getElementById("simple-button").onclick = () => {
            browser.scripting.executeScript({
                target: {
                    tabId: activeTab.id
                }, func: (selector) => {
                    const element = document.querySelector(selector)
                    if (element == null) {
                        alert("No element " + chordSelector[basename] + " found.")
                        return null
                    } else {
                        return element.outerHTML
                    }
                }, args: [chordSelector[basename]]
            }).then((results) => {
                const outer = results[0].result
                if (outer == null) return
                document.body.innerHTML = outer
            })
        }
    })

