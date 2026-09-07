/* =========================================
   MINDDUMP
   Dump it. Plan it. Do it.
========================================= */


// =========================================
// APP STATE
// =========================================

let tasks = [];

let currentTaskIndex = 0;

let timerInterval = null;

let remainingSeconds = 0;

let totalSeconds = 0;

let isPaused = false;

let audioContext = null;


// =========================================
// EXAMPLES
// =========================================

const examples = {

    school:
        "I have a Computer Science assignment due tomorrow, I need to study for my networking test on Friday, finish my portfolio project this week, submit my class notes and email my lecturer tonight.",

    work:
        "I need to reply to important messages, finish the report, prepare for tomorrow's meeting, organize my work files and call my colleague tonight.",

    life:
        "I need to buy groceries, clean my room, do laundry, call Mum tonight, book an appointment and organize my wardrobe.",

    everything:
        "I have a Computer Science assignment due tomorrow, I need to study for my networking test on Friday, finish my portfolio project this week, reply to Sarah, buy groceries, clean my room, call Mum tonight and start learning Python."
};


// =========================================
// ELEMENTS
// =========================================

const brainDump =
    document.getElementById("brain-dump");

const organizeBtn =
    document.getElementById("organize-btn");


// =========================================
// EXAMPLE BUTTONS
// =========================================

document
    .querySelectorAll(".example-btn")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const type =
                    button.dataset.example;

                brainDump.value =
                    examples[type] || "";

                brainDump.focus();

            }
        );

    });


// =========================================
// SCREEN CONTROL
// =========================================

function showScreen(id) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove("active");

        });


    const target =
        document.getElementById(id);


    if (target) {
        target.classList.add("active");
    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =========================================
// ORGANIZE
// =========================================

organizeBtn.addEventListener(
    "click",
    organizeThoughts
);


function organizeThoughts() {

    const text =
        brainDump.value.trim();


    if (!text) {

        alert(
            "Dump something first — your mind is safe here."
        );

        brainDump.focus();

        return;
    }


    tasks =
        extractTasks(text);


    if (!tasks.length) {

        alert(
            "I couldn't find any tasks. Try describing a few things you need to do."
        );

        return;
    }


    showScreen(
        "processing-screen"
    );


    runProcessingAnimation();
}


// =========================================
// PROCESSING ANIMATION
// =========================================

function runProcessingAnimation() {

    const messages = [
        "Reading your thoughts...",
        "Identifying tasks...",
        "Detecting priorities...",
        "Estimating time...",
        "Building your plan..."
    ];


    const message =
        document.getElementById(
            "processing-message"
        );


    let index = 0;


    message.textContent =
        messages[0];


    const interval =
        setInterval(() => {

            index++;


            if (index < messages.length) {

                message.textContent =
                    messages[index];

            }

        }, 500);


    setTimeout(() => {

        clearInterval(interval);

        renderDashboard();

        showScreen(
            "dashboard-screen"
        );

    }, 2800);
}


// =========================================
// TASK EXTRACTION
// =========================================

function extractTasks(text) {

    let normalized =
        text

            .replace(/\n+/g, ",")
            .replace(/[•;]/g, ",")
            .replace(/\s+/g, " ")
            .trim();


    /*
       Detect natural task boundaries.
    */

    normalized =
        normalized.replace(
            /\s+and\s+(?=(?:I\s+)?(?:need|have|want|should|must|finish|study|buy|call|reply|clean|do|submit|prepare|organize|book|learn|start|send|write|complete|practice|email))/gi,
            ","
        );


    let parts =
        normalized
            .split(/,\s*|\.\s+/)
            .map(item => item.trim())
            .filter(
                item => item.length > 3
            );


    const uniqueTasks = [];


    parts.forEach(part => {

        const cleaned =
            cleanTask(part);


        if (
            cleaned.length > 3 &&
            !uniqueTasks.some(
                existing =>
                    existing.toLowerCase() ===
                    cleaned.toLowerCase()
            )
        ) {

            uniqueTasks.push(cleaned);

        }

    });


    return uniqueTasks.map(
        (title, index) => {

            const lower =
                title.toLowerCase();


            return {

                id: index + 1,

                title,

                priority:
                    detectPriority(lower),

                duration:
                    estimateDuration(lower),

                category:
                    detectCategory(lower),

                completed: false

            };

        }
    );
}


// =========================================
// CLEAN TASK
// =========================================

function cleanTask(text) {

    return text

        .replace(
            /^(i\s+)?(need to|have to|want to|should|must|i need|i have)\s+/i,
            ""
        )

        .replace(
            /^(and|also)\s+/i,
            ""
        )

        .replace(
            /^[,\s]+|[.!?]+$/g,
            ""
        )

        .trim()

        .replace(
            /^./,
            char =>
                char.toUpperCase()
        );
}


// =========================================
// PRIORITY
// =========================================

function detectPriority(text) {

    const highKeywords = [
        "tomorrow",
        "today",
        "tonight",
        "urgent",
        "asap",
        "deadline",
        "due",
        "immediately",
        "submit",
        "exam",
        "test"
    ];


    const mediumKeywords = [
        "this week",
        "assignment",
        "project",
        "report",
        "presentation",
        "meeting",
        "study",
        "portfolio",
        "prepare",
        "important"
    ];


    if (
        highKeywords.some(
            word => text.includes(word)
        )
    ) {

        return "high";

    }


    if (
        mediumKeywords.some(
            word => text.includes(word)
        )
    ) {

        return "medium";

    }


    return "low";
}


// =========================================
// CATEGORY
// =========================================

function detectCategory(text) {

    if (
        text.includes("assignment") ||
        text.includes("study") ||
        text.includes("exam") ||
        text.includes("test") ||
        text.includes("school") ||
        text.includes("class") ||
        text.includes("python") ||
        text.includes("portfolio") ||
        text.includes("lecturer")
    ) {

        return "School";

    }


    if (
        text.includes("meeting") ||
        text.includes("report") ||
        text.includes("work") ||
        text.includes("colleague") ||
        text.includes("client")
    ) {

        return "Work";

    }


    if (
        text.includes("call") ||
        text.includes("mum") ||
        text.includes("groceries") ||
        text.includes("laundry") ||
        text.includes("clean") ||
        text.includes("appointment")
    ) {

        return "Life";

    }


    return "Personal";
}


// =========================================
// TIME ESTIMATION
// =========================================

function estimateDuration(text) {

    if (
        text.includes("assignment") ||
        text.includes("project") ||
        text.includes("portfolio") ||
        text.includes("report") ||
        text.includes("presentation")
    ) {

        return 60;

    }


    if (
        text.includes("study") ||
        text.includes("exam") ||
        text.includes("test") ||
        text.includes("learn")
    ) {

        return 45;

    }


    if (
        text.includes("clean") ||
        text.includes("groceries") ||
        text.includes("laundry") ||
        text.includes("organize")
    ) {

        return 30;

    }


    if (
        text.includes("call") ||
        text.includes("reply") ||
        text.includes("message") ||
        text.includes("email") ||
        text.includes("send")
    ) {

        return 10;

    }


    return 20;
}


// =========================================
// DASHBOARD
// =========================================

function renderDashboard() {

    const high =
        tasks.filter(
            task =>
                task.priority === "high"
        );


    const medium =
        tasks.filter(
            task =>
                task.priority === "medium"
        );


    const low =
        tasks.filter(
            task =>
                task.priority === "low"
        );


    const totalTime =
        tasks.reduce(
            (total, task) =>
                total + task.duration,
            0
        );


    document.getElementById(
        "total-tasks"
    ).textContent =
        tasks.length;


    document.getElementById(
        "urgent-tasks"
    ).textContent =
        high.length;


    document.getElementById(
        "total-time"
    ).textContent =
        formatMinutes(totalTime);


    /*
       Calculate brain load.
    */

    const score =
        Math.min(
            98,
            Math.max(
                20,
                35 +
                tasks.length * 7 +
                high.length * 8
            )
        );


    document.getElementById(
        "brain-load-score"
    ).textContent =
        `${score}%`;


    document.getElementById(
        "brain-load-progress"
    ).style.width =
        `${score}%`;


    document.getElementById(
        "summary"
    ).textContent =
        generateSummary(
            tasks.length,
            high.length
        );


    renderTaskList(
        "high-tasks",
        high
    );


    renderTaskList(
        "medium-tasks",
        medium
    );


    renderTaskList(
        "low-tasks",
        low
    );


    renderPlan();
}


// =========================================
// SUMMARY
// =========================================

function generateSummary(
    total,
    urgent
) {

    if (urgent >= 3) {

        return `You have ${total} things competing for your attention. We've pulled the urgent ones forward.`;

    }


    if (urgent > 0) {

        return `You have ${total} tasks on your mind. We've identified what deserves your attention first.`;

    }


    return `Your thoughts are out of your head and into a clear plan.`;
}


// =========================================
// TASK CARDS
// =========================================

function renderTaskList(
    containerId,
    taskList
) {

    const container =
        document.getElementById(
            containerId
        );


    container.innerHTML = "";


    if (!taskList.length) {

        container.innerHTML = `
            <div class="task-item">
                Nothing here 🎉
            </div>
        `;

        return;
    }


    taskList.forEach(task => {

        const item =
            document.createElement("div");


        item.className =
            "task-item";


        item.innerHTML = `

            <div>
                ${task.title}
            </div>

            <div class="task-duration">
                ${task.duration} min · ${task.category}
            </div>

        `;


        container.appendChild(item);

    });
}


// =========================================
// AUTO PLAN
// =========================================

function renderPlan() {

    const planList =
        document.getElementById(
            "plan-list"
        );


    planList.innerHTML = "";


    const priorityOrder = {
        high: 1,
        medium: 2,
        low: 3
    };


    const plannedTasks =
        [...tasks].sort(
            (a, b) =>
                priorityOrder[a.priority] -
                priorityOrder[b.priority]
        );


    let currentMinutes =
        16 * 60;


    plannedTasks.forEach(task => {

        const item =
            document.createElement("div");


        item.className =
            "plan-item";


        item.innerHTML = `

            <div class="plan-time">
                ${formatClock(currentMinutes)}
            </div>

            <div>

                <div class="plan-task">
                    ${task.title}
                </div>

                <div class="plan-duration">
                    ${task.duration} min ·
                    ${capitalize(task.priority)}
                </div>

            </div>

        `;


        planList.appendChild(item);


        currentMinutes +=
            task.duration + 5;

    });
}


// =========================================
// FORMAT CLOCK
// =========================================

function formatClock(minutes) {

    const hours =
        Math.floor(minutes / 60);


    const mins =
        minutes % 60;


    const suffix =
        hours >= 12
            ? "PM"
            : "AM";


    let hour =
        hours % 12;


    if (hour === 0) {
        hour = 12;
    }


    return `${hour}:${String(mins).padStart(2, "0")} ${suffix}`;
}


// =========================================
// FORMAT MINUTES
// =========================================

function formatMinutes(minutes) {

    if (minutes < 60) {
        return `${minutes}m`;
    }


    const hours =
        Math.floor(minutes / 60);


    const mins =
        minutes % 60;


    if (mins === 0) {
        return `${hours}h`;
    }


    return `${hours}h ${mins}m`;
}


// =========================================
// START MINDFLOW
// =========================================

document.getElementById(
    "start-flow-btn"
).addEventListener(
    "click",
    startFlow
);


function startFlow() {

    if (!tasks.length) {
        return;
    }


    currentTaskIndex = 0;

    isPaused = false;


    initializeAudio();


    showScreen(
        "flow-screen"
    );


    startCurrentTask();
}


// =========================================
// AUDIO INITIALIZATION
// =========================================

function initializeAudio() {

    try {

        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;


        if (!AudioContext) {
            return;
        }


        if (!audioContext) {

            audioContext =
                new AudioContext();

        }


        if (
            audioContext.state ===
            "suspended"
        ) {

            audioContext.resume();

        }

    } catch (error) {

        console.log(
            "Audio unavailable."
        );

    }
}


// =========================================
// START CURRENT TASK
// =========================================

function startCurrentTask() {

    clearInterval(
        timerInterval
    );


    const task =
        tasks[currentTaskIndex];


    if (!task) {

        finishFlow();

        return;
    }


    /*
       ONLY THE CURRENT TASK
       appears on the timer screen.
    */

    document.getElementById(
        "flow-task"
    ).textContent =
        task.title;


    document.getElementById(
        "focus-status"
    ).textContent =
        `Task ${currentTaskIndex + 1} of ${tasks.length}`;


    document.getElementById(
        "flow-message"
    ).textContent =
        `Focus for ${task.duration} minutes. Nothing else.`;


    /*
       NEW TIMER FOR THIS TASK.
    */

    totalSeconds =
        task.duration * 60;


    remainingSeconds =
        totalSeconds;


    isPaused = false;


    document.getElementById(
        "pause-btn"
    ).textContent =
        "Pause";


    updateTimerDisplay();

    updateNextTask();


    timerInterval =
        setInterval(
            updateTimer,
            1000
        );
}


// =========================================
// TIMER ENGINE
// =========================================

function updateTimer() {

    if (isPaused) {
        return;
    }


    remainingSeconds--;


    updateTimerDisplay();


    if (remainingSeconds <= 0) {

        clearInterval(
            timerInterval
        );


        taskFinished();

    }
}


// =========================================
// TIMER DISPLAY
// =========================================

function updateTimerDisplay() {

    const minutes =
        Math.floor(
            remainingSeconds / 60
        );


    const seconds =
        remainingSeconds % 60;


    document.getElementById(
        "timer"
    ).textContent =
        `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;


    const progress =
        totalSeconds > 0
            ? (
                remainingSeconds /
                totalSeconds
            ) * 100
            : 0;


    document.getElementById(
        "timer-progress"
    ).style.width =
        `${progress}%`;
}


// =========================================
// PAUSE / RESUME
// =========================================

document.getElementById(
    "pause-btn"
).addEventListener(
    "click",
    toggleTimer
);


function toggleTimer() {

    isPaused =
        !isPaused;


    document.getElementById(
        "pause-btn"
    ).textContent =
        isPaused
            ? "Resume"
            : "Pause";


    document.getElementById(
        "flow-message"
    ).textContent =
        isPaused
            ? "Flow paused."
            : "Back to it. You've got this.";
}


// =========================================
// SKIP TASK
// =========================================

document.getElementById(
    "skip-btn"
).addEventListener(
    "click",
    skipTask
);


function skipTask() {

    clearInterval(
        timerInterval
    );


    currentTaskIndex++;


    if (
        currentTaskIndex >=
        tasks.length
    ) {

        finishFlow();

        return;
    }


    startCurrentTask();
}


// =========================================
// END TASK
// =========================================

document.getElementById(
    "end-btn"
).addEventListener(
    "click",
    endCurrentTask
);


function endCurrentTask() {

    clearInterval(
        timerInterval
    );


    tasks[currentTaskIndex]
        .completed = true;


    document.getElementById(
        "flow-message"
    ).textContent =
        "Task ended. Moving to the next one...";


    setTimeout(() => {

        currentTaskIndex++;


        if (
            currentTaskIndex >=
            tasks.length
        ) {

            finishFlow();

        } else {

            startCurrentTask();

        }

    }, 1200);
}


// =========================================
// TASK FINISHED NATURALLY
// =========================================

function taskFinished() {

    tasks[currentTaskIndex]
        .completed = true;


    playBeep();


    document.getElementById(
        "flow-message"
    ).textContent =
        "Time's up. Great job — moving to the next task.";


    setTimeout(() => {

        currentTaskIndex++;


        if (
            currentTaskIndex >=
            tasks.length
        ) {

            finishFlow();

        } else {

            startCurrentTask();

        }

    }, 2500);
}


// =========================================
// NEXT TASK
// =========================================

function updateNextTask() {

    const nextTask =
        tasks[currentTaskIndex + 1];


    const name =
        document.getElementById(
            "next-task-name"
        );


    const duration =
        document.getElementById(
            "next-task-duration"
        );


    if (!nextTask) {

        name.textContent =
            "Final task";


        duration.textContent =
            "You're almost there";


        return;
    }


    name.textContent =
        nextTask.title;


    duration.textContent =
        `${nextTask.duration} min`;
}


// =========================================
// BEEP
// =========================================

function playBeep() {

    try {

        if (!audioContext) {

            initializeAudio();

        }


        if (!audioContext) {
            return;
        }


        const frequencies = [
            880,
            880,
            1046
        ];


        frequencies.forEach(
            (frequency, index) => {

                const oscillator =
                    audioContext.createOscillator();


                const gain =
                    audioContext.createGain();


                oscillator.type =
                    "sine";


                oscillator.frequency.value =
                    frequency;


                oscillator.connect(gain);

                gain.connect(
                    audioContext.destination
                );


                const startTime =
                    audioContext.currentTime +
                    index * 0.22;


                gain.gain.setValueAtTime(
                    0.0001,
                    startTime
                );


                gain.gain.exponentialRampToValueAtTime(
                    0.2,
                    startTime + 0.02
                );


                gain.gain.exponentialRampToValueAtTime(
                    0.0001,
                    startTime + 0.16
                );


                oscillator.start(
                    startTime
                );


                oscillator.stop(
                    startTime + 0.18
                );

            }
        );

    } catch (error) {

        console.log(
            "Beep unavailable."
        );

    }
}


// =========================================
// COMPLETE
// =========================================

function finishFlow() {

    clearInterval(
        timerInterval
    );


    timerInterval = null;


    showScreen(
        "complete-screen"
    );
}


// =========================================
// RESET
// =========================================

document.getElementById(
    "new-dump-btn"
).addEventListener(
    "click",
    resetApp
);


document.getElementById(
    "restart-btn"
).addEventListener(
    "click",
    resetApp
);


function resetApp() {

    clearInterval(
        timerInterval
    );


    timerInterval = null;


    tasks = [];

    currentTaskIndex = 0;

    remainingSeconds = 0;

    totalSeconds = 0;

    isPaused = false;


    brainDump.value = "";


    showScreen(
        "home-screen"
    );
}


// =========================================
// HELPER
// =========================================

function capitalize(text) {

    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );
}