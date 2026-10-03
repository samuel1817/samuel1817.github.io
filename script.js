const pages = document.querySelectorAll(".page");
const navItems = document.querySelectorAll(".nav-item");
const pageButtons = document.querySelectorAll("[data-page]");

function showPage(pageName) {
pages.forEach(page => {
page.classList.toggle("active", page.id === pageName);
});

```
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
button.addEventListener("click", () => {
showPage(button.dataset.page);
});
});

// CLOCK
function updateClock() {
const now = new Date();

```
const time = now.toLocaleTimeString("sk-SK", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
});

const date = now.toLocaleDateString("sk-SK", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
});

document.getElementById("clock").textContent = time;
document.getElementById("date").textContent =
    date.charAt(0).toUpperCase() + date.slice(1);
```

}

updateClock();
setInterval(updateClock, 1000);

// BROWSER INFORMATION
const browserInfo = document.getElementById("browserInfo");
const screenInfo = document.getElementById("screenInfo");
const platformInfo = document.getElementById("platformInfo");

browserInfo.textContent = navigator.userAgent.includes("Chrome")
? "Google Chrome"
: navigator.userAgent;

screenInfo.textContent =
`${window.screen.width} × ${window.screen.height}`;

platformInfo.textContent = navigator.platform;

// PC INFORMATION
const pcFields = {
cpu: document.getElementById("cpuInput"),
gpu: document.getElementById("gpuInput"),
ram: document.getElementById("ramInput"),
storage: document.getElementById("storageInput"),
os: document.getElementById("osInput"),
monitor: document.getElementById("monitorInput")
};

function loadPcInfo() {
const saved = JSON.parse(
localStorage.getItem("pcDashboardData") || "{}"
);

```
Object.keys(pcFields).forEach(key => {
    if (saved[key]) {
        pcFields[key].value = saved[key];
    }
});

document.getElementById("dashboardCpu").textContent =
    saved.cpu || "Not set";

document.getElementById("dashboardGpu").textContent =
    saved.gpu || "Not set";

document.getElementById("dashboardRam").textContent =
    saved.ram || "Not set";

document.getElementById("dashboardStorage").textContent =
    saved.storage || "Not set";
```

}

document.getElementById("savePcButton").addEventListener("click", () => {

```
const data = {};

Object.keys(pcFields).forEach(key => {
    data[key] = pcFields[key].value.trim();
});

localStorage.setItem(
    "pcDashboardData",
    JSON.stringify(data)
);

loadPcInfo();

const message = document.getElementById("saveMessage");

message.textContent = "✓ PC information saved.";

setTimeout(() => {
    message.textContent = "";
}, 2500);
```

});

loadPcInfo();

// THEME
const themeButton = document.getElementById("themeButton");

if (localStorage.getItem("pcDashboardTheme") === "light") {
document.body.classList.add("light");
}

themeButton.addEventListener("click", () => {

```
document.body.classList.toggle("light");

localStorage.setItem(
    "pcDashboardTheme",
    document.body.classList.contains("light")
        ? "light"
        : "dark"
);
```

});

// EDPI CALCULATOR
document.getElementById("edpiButton").addEventListener("click", () => {

```
const dpi = Number(
    document.getElementById("dpiInput").value
);

const sensitivity = Number(
    document.getElementById("sensInput").value
);

const result = document.getElementById("edpiResult");

if (!dpi || !sensitivity) {
    result.textContent =
        "Please enter both DPI and sensitivity.";
    return;
}

const edpi = dpi * sensitivity;

result.textContent =
    `Your eDPI is ${edpi.toFixed(2)}.`;
```

});

// GB → MB
document.getElementById("gbButton").addEventListener("click", () => {

```
const gb = Number(
    document.getElementById("gbInput").value
);

const result = document.getElementById("gbResult");

if (!gb && gb !== 0) {
    result.textContent = "Please enter a value.";
    return;
}

const mb = gb * 1024;

result.textContent =
    `${gb} GB = ${mb.toLocaleString()} MB`;
```

});

// PERCENTAGE
document.getElementById("percentButton").addEventListener("click", () => {

```
const number = Number(
    document.getElementById("percentNumber").value
);

const percentage = Number(
    document.getElementById("percentValue").value
);

const result = document.getElementById("percentResult");

if (
    document.getElementById("percentNumber").value === "" ||
    document.getElementById("percentValue").value === ""
) {
    result.textContent = "Please enter both values.";
    return;
}

const answer = number * (percentage / 100);

result.textContent =
    `${percentage}% of ${number} = ${answer}`;
```

});

// STOPWATCH
let stopwatchSeconds = 0;
let stopwatchInterval = null;
let stopwatchRunning = false;

function formatStopwatch(seconds) {

```
const hours = Math.floor(seconds / 3600);
const minutes = Math.floor((seconds % 3600) / 60);
const secs = seconds % 60;

return [
    hours,
    minutes,
    secs
]
    .map(value => String(value).padStart(2, "0"))
    .join(":");
```

}

function updateStopwatch() {
document.getElementById("stopwatch").textContent =
formatStopwatch(stopwatchSeconds);
}

document.getElementById("startStopwatch").addEventListener("click", () => {

```
if (!stopwatchRunning) {

    stopwatchRunning = true;

    document.getElementById(
        "startStopwatch"
    ).textContent = "Pause";

    stopwatchInterval = setInterval(() => {
        stopwatchSeconds++;
        updateStopwatch();
    }, 1000);

} else {

    stopwatchRunning = false;

    document.getElementById(
        "startStopwatch"
    ).textContent = "Start";

    clearInterval(stopwatchInterval);
}
```

});

document.getElementById("resetStopwatch").addEventListener("click", () => {

```
clearInterval(stopwatchInterval);

stopwatchSeconds = 0;
stopwatchRunning = false;

document.getElementById(
    "startStopwatch"
).textContent = "Start";

updateStopwatch();
```

});

// PASSWORD GENERATOR
document.getElementById("generatePassword").addEventListener("click", () => {

```
const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";

let password = "";

for (let i = 0; i < 18; i++) {
    password += characters.charAt(
        Math.floor(Math.random() * characters.length)
    );
}

document.getElementById(
    "passwordOutput"
).textContent = password;
```

});
