/*
PC DASHBOARD
Everything here runs locally in the browser.
*/

/* =========================================================
CONSENT
========================================================= */

const consentScreen = document.getElementById("consentScreen");
const app = document.getElementById("app");

const agreeButton = document.getElementById("agreeButton");
const disagreeButton = document.getElementById("disagreeButton");

const disagreeMessage =
document.getElementById("disagreeMessage");

function hasConsent() {
return localStorage.getItem("pcDashboardConsent") === "agreed";
}

function showApplication() {
consentScreen.classList.add("hidden");
app.classList.remove("hidden");

```
collectDeviceInformation();
```

}

if (hasConsent()) {
showApplication();
}

agreeButton.addEventListener("click", () => {

```
localStorage.setItem(
    "pcDashboardConsent",
    "agreed"
);

showApplication();
```

});

disagreeButton.addEventListener("click", () => {

```
app.classList.add("hidden");
consentScreen.classList.remove("hidden");

disagreeMessage.textContent =
    "You must choose Agree to use this website.";
```

});

document
.getElementById("resetConsentButton")
.addEventListener("click", () => {

```
    localStorage.removeItem(
        "pcDashboardConsent"
    );

    location.reload();
});
```

/* =========================================================
NAVIGATION
========================================================= */

const pages =
document.querySelectorAll(".page");

const navItems =
document.querySelectorAll(".nav-item");

const pageButtons =
document.querySelectorAll("[data-page]");

function showPage(pageName) {

```
pages.forEach(page => {

    page.classList.toggle(
        "active",
        page.id === pageName
    );

});


navItems.forEach(item => {

    item.classList.toggle(
        "active",
        item.dataset.page === pageName
    );

});


window.scrollTo({
    top: 0,
    behavior: "smooth"
});
```

}

pageButtons.forEach(button => {

```
button.addEventListener("click", () => {

    showPage(button.dataset.page);

});
```

});

/* =========================================================
CLOCK
========================================================= */

function updateClock() {

```
const now = new Date();


const time =
    now.toLocaleTimeString("sk-SK", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });


const date =
    now.toLocaleDateString("sk-SK", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });


document.getElementById("clock")
    .textContent = time;


document.getElementById("date")
    .textContent =
        date.charAt(0).toUpperCase()
        + date.slice(1);
```

}

updateClock();

setInterval(
updateClock,
1000
);

/* =========================================================
DEVICE INFORMATION
========================================================= */

function getMemory() {

```
if (
    typeof navigator.deviceMemory ===
    "number"
) {

    return `${navigator.deviceMemory} GB`;

}

return "Not available";
```

}

function getCores() {

```
if (
    typeof navigator.hardwareConcurrency ===
    "number"
) {

    return navigator.hardwareConcurrency;

}

return "Not available";
```

}

function getConnection() {

```
if (
    navigator.connection &&
    navigator.connection.effectiveType
) {

    return navigator.connection.effectiveType
        .toUpperCase();

}

return "Not available";
```

}

function getTouchSupport() {

```
if (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0
) {

    return "Supported";

}

return "Not detected";
```

}

function getPlatform() {

```
return navigator.platform ||
    "Not available";
```

}

function getScreenResolution() {

```
return `${screen.width} × ${screen.height}`;
```

}

function collectDeviceInformation() {

```
const cores =
    getCores();

const memory =
    getMemory();

const resolution =
    getScreenResolution();

const platform =
    getPlatform();


/* DASHBOARD */

document.getElementById(
    "cpuValue"
).textContent =
    cores === "Not available"
        ? "Not available"
        : `${cores} cores`;


document.getElementById(
    "memoryValue"
).textContent =
    memory;


document.getElementById(
    "screenValue"
).textContent =
    resolution;


document.getElementById(
    "platformValue"
).textContent =
    platform;


document.getElementById(
    "dashboardCores"
).textContent =
    cores;


document.getElementById(
    "dashboardMemory"
).textContent =
    memory;


document.getElementById(
    "dashboardResolution"
).textContent =
    resolution;


document.getElementById(
    "dashboardDpr"
).textContent =
    window.devicePixelRatio || "—";


updateOnlineStatus();


/* HARDWARE */

document.getElementById(
    "hardwareCores"
).textContent =
    cores;


document.getElementById(
    "hardwareMemory"
).textContent =
    memory;


document.getElementById(
    "hardwareTouch"
).textContent =
    getTouchSupport();


document.getElementById(
    "hardwareConnection"
).textContent =
    getConnection();


/* DISPLAY */

document.getElementById(
    "displayResolution"
).textContent =
    resolution;


document.getElementById(
    "displayAvailWidth"
).textContent =
    `${screen.availWidth}px`;


document.getElementById(
    "displayAvailHeight"
).textContent =
    `${screen.availHeight}px`;


document.getElementById(
    "displayDpr"
).textContent =
    window.devicePixelRatio;


document.getElementById(
    "displayWindowWidth"
).textContent =
    `${window.innerWidth}px`;


document.getElementById(
    "displayWindowHeight"
).textContent =
    `${window.innerHeight}px`;


/* BROWSER */

document.getElementById(
    "browserName"
).textContent =
    detectBrowser();


document.getElementById(
    "browserPlatform"
).textContent =
    platform;


document.getElementById(
    "browserLanguage"
).textContent =
    navigator.language ||
    "Not available";


document.getElementById(
    "browserOnline"
).textContent =
    navigator.onLine
        ? "Online"
        : "Offline";


document.getElementById(
    "browserCookies"
).textContent =
    navigator.cookieEnabled
        ? "Enabled"
        : "Disabled";


document.getElementById(
    "browserColorDepth"
).textContent =
    `${screen.colorDepth}-bit`;
```

}

/* =========================================================
BROWSER DETECTION
========================================================= */

function detectBrowser() {

```
const ua =
    navigator.userAgent;


if (
    ua.includes("Edg/")
) {

    return "Microsoft Edge";

}


if (
    ua.includes("OPR/")
) {

    return "Opera";

}


if (
    ua.includes("Chrome/")
) {

    return "Google Chrome";

}


if (
    ua.includes("Firefox/")
) {

    return "Mozilla Firefox";

}


if (
    ua.includes("Safari/")
) {

    return "Safari";

}


return "Unknown browser";
```

}

/* =========================================================
ONLINE STATUS
========================================================= */

function updateOnlineStatus() {

```
const online =
    navigator.onLine;


document.getElementById(
    "dashboardOnline"
).textContent =
    online
        ? "Online"
        : "Offline";


document.getElementById(
    "onlineText"
).textContent =
    online
        ? "Online"
        : "Offline";


document.getElementById(
    "onlineIndicator"
).classList.toggle(
    "offline",
    !online
);
```

}

window.addEventListener(
"online",
updateOnlineStatus
);

window.addEventListener(
"offline",
updateOnlineStatus
);

/* =========================================================
THEME
========================================================= */

const themeButton =
document.getElementById(
"themeButton"
);

if (
localStorage.getItem(
"pcDashboardTheme"
) === "light"
) {

```
document.body.classList.add(
    "light"
);
```

}

themeButton.addEventListener(
"click",
() => {

```
    document.body.classList.toggle(
        "light"
    );


    localStorage.setItem(
        "pcDashboardTheme",

        document.body.classList.contains(
            "light"
        )
            ? "light"
            : "dark"
    );

}
```

);

/* =========================================================
EDPI CALCULATOR
========================================================= */

document
.getElementById("edpiButton")
.addEventListener(
"click",
() => {

```
        const dpi =
            Number(
                document.getElementById(
                    "dpiInput"
                ).value
            );


        const sensitivity =
            Number(
                document.getElementById(
                    "sensInput"
                ).value
            );


        const result =
            document.getElementById(
                "edpiResult"
            );


        if (
            !dpi ||
            !sensitivity
        ) {

            result.textContent =
                "Please enter both values.";

            return;
        }


        const edpi =
            dpi * sensitivity;


        result.textContent =
            `Your eDPI is ${edpi.toFixed(2)}.`;

    }
);
```

/* =========================================================
STOPWATCH
========================================================= */

let stopwatchSeconds = 0;

let stopwatchInterval = null;

let stopwatchRunning = false;

function formatStopwatch(seconds) {

```
const hours =
    Math.floor(
        seconds / 3600
    );


const minutes =
    Math.floor(
        (seconds % 3600) / 60
    );


const secs =
    seconds % 60;


return [
    hours,
    minutes,
    secs
]
    .map(
        value =>
            String(value)
                .padStart(2, "0")
    )
    .join(":");
```

}

function updateStopwatch() {

```
document.getElementById(
    "stopwatch"
).textContent =
    formatStopwatch(
        stopwatchSeconds
    );
```

}

document
.getElementById(
"startStopwatch"
)
.addEventListener(
"click",
() => {

```
        if (
            !stopwatchRunning
        ) {

            stopwatchRunning =
                true;


            document.getElementById(
                "startStopwatch"
            ).textContent =
                "Pause";


            stopwatchInterval =
                setInterval(
                    () => {

                        stopwatchSeconds++;

                        updateStopwatch();

                    },
                    1000
                );

        } else {

            stopwatchRunning =
                false;


            document.getElementById(
                "startStopwatch"
            ).textContent =
                "Start";


            clearInterval(
                stopwatchInterval
            );

        }

    }
);
```

document
.getElementById(
"resetStopwatch"
)
.addEventListener(
"click",
() => {

```
        clearInterval(
            stopwatchInterval
        );


        stopwatchSeconds = 0;

        stopwatchRunning = false;


        document.getElementById(
            "startStopwatch"
        ).textContent =
            "Start";


        updateStopwatch();

    }
);
```

/* =========================================================
PASSWORD GENERATOR
========================================================= */

document
.getElementById(
"generatePassword"
)
.addEventListener(
"click",
() => {

```
        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "abcdefghijklmnopqrstuvwxyz" +
            "0123456789" +
            "!@#$%^&*()_+-=";


        let password = "";


        for (
            let i = 0;
            i < 18;
            i++
        ) {

            password +=
                characters[
                    Math.floor(
                        Math.random() *
                        characters.length
                    )
                ];

        }


        document.getElementById(
            "passwordOutput"
        ).textContent =
            password;

    }
);
```

/* =========================================================
RESIZE
========================================================= */

window.addEventListener(
"resize",
() => {

```
    const resolution =
        getScreenResolution();


    document.getElementById(
        "screenValue"
    ).textContent =
        resolution;


    document.getElementById(
        "dashboardResolution"
    ).textContent =
        resolution;


    document.getElementById(
        "displayWindowWidth"
    ).textContent =
        `${window.innerWidth}px`;


    document.getElementById(
        "displayWindowHeight"
    ).textContent =
        `${window.innerHeight}px`;

}
```

);
