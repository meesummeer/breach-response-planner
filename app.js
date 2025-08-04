const steps = [
    {
        id: "start",
        title: "Select Breach Scenario",
        desc: "What type of incident occurred?",
        input: {
            label: "Breach Type:",
            options: [
                { value: "lost_device", label: "Lost/stolen device (laptop/phone/USB)" },
                { value: "hacking", label: "Hacking or ransomware" },
                { value: "insider", label: "Employee error or unauthorized access" },
                { value: "paper", label: "Paper records lost or exposed" }
            ]
        },
        next: "initial"
    },
    {
        id: "initial",
        title: "Immediate Response",
        desc: "What should you do first?",
        actions: [
            "Stop further data loss—disconnect device(s) if possible.",
            "Secure any compromised physical areas.",
            "Document who discovered the breach and how."
        ],
        next: "notify"
    },
    {
        id: "notify",
        title: "Notify Internal Parties",
        desc: "Who should be alerted in your organization?",
        actions: [
            "Contact your Privacy/Security Officer immediately.",
            "Alert IT department for investigation.",
            "Begin a detailed incident log."
        ],
        next: "investigate"
    },
    {
        id: "investigate",
        title: "Investigation & Documentation",
        desc: "What information needs to be collected?",
        actions: [
            "Identify what data was accessed or taken (PHI, PII, financial).",
            "Determine the scope—whose data, how much, and over what period?",
            "Record dates, times, people involved, and technical findings."
        ],
        next: "report"
    },
    {
        id: "report",
        title: "Reporting & Notification",
        desc: "Based on severity and type, follow these:",
        input: {
            label: "Was patient data (PHI) involved?",
            options: [
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" }
            ]
        },
        next_map: { yes: "notify_patients", no: "final" }
    },
    {
        id: "notify_patients",
        title: "Notify Patients & HHS",
        desc: "Regulatory notifications for HIPAA covered entities:",
        actions: [
            "Prepare notification letters to affected patients.",
            "If >500 patients: notify HHS and local media immediately.",
            "If <500 patients: report to HHS at year-end.",
            "Document all notification steps and communications."
        ],
        next: "final"
    },
    {
        id: "final",
        title: "Post-Incident Actions",
        desc: "How do you prevent a repeat?",
        actions: [
            "Review root causes with staff.",
            "Update policies/procedures.",
            "Provide workforce training based on findings.",
            "Perform a security risk assessment."
        ],
        next: null
    }
];

let state = { scenario: "", plan: [], step: "start" };

function renderStep() {
    const s = steps.find(st => st.id === state.step);
    if (!s) return;
    let html = `<div class="step-title">${s.title}</div>`;
    if (s.desc) html += `<div class="step-desc">${s.desc}</div>`;

    if (s.input) {
        html += `<label>${s.input.label}</label><br><select id="step-input">`;
        s.input.options.forEach(opt => {
            html += `<option value="${opt.value}">${opt.label}</option>`;
        });
        html += `</select><br>`;
    }

    if (s.actions) {
        html += `<div class="step-actions"><ul>`;
        s.actions.forEach(act => html += `<li>${act}</li>`);
        html += `</ul></div>`;
        // Add to action plan
        state.plan.push(...s.actions);
    }

    html += `<button id="next-btn">${s.next ? "Next" : "Finish"}</button>`;
    document.getElementById("wizard-container").innerHTML = html;
    document.getElementById("wizard-container").classList.remove("hidden");
    document.getElementById("action-plan").classList.add("hidden");

    document.getElementById("next-btn").onclick = function () {
        let nextStep = s.next;
        if (s.input) {
            const val = document.getElementById("step-input").value;
            if (state.step === "start") state.scenario = val;
            if (s.next_map) nextStep = s.next_map[val];
        }
        if (nextStep) {
            state.step = nextStep;
            renderStep();
        } else {
            showActionPlan();
        }
    };
}

function showActionPlan() {
    document.getElementById("wizard-container").classList.add("hidden");
    document.getElementById("action-plan").classList.remove("hidden");
    let planHtml = `<strong>Scenario:</strong> ${steps[0].input.options.find(opt => opt.value === state.scenario).label}<br><br>`;
    planHtml += "<ol>";
    state.plan.forEach(item => planHtml += `<li>${item}</li>`);
    planHtml += "</ol>";
    document.getElementById("plan-steps").innerHTML = planHtml;
}

document.getElementById("copy-btn").onclick = function () {
    const temp = document.createElement("textarea");
    temp.value = document.getElementById("plan-steps").innerText;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    document.body.removeChild(temp);
    alert("Action Plan copied to clipboard!");
};

window.onload = function () {
    state = { scenario: "", plan: [], step: "start" };
    renderStep();
};
