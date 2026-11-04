// استيراد فايربيس وقاعدة البيانات من السيرفر السحابي
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// إعدادات الربط الخاصة بمشروعك على Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBqr0iIt4envmWuLJ6srR7nL56AiANc",
  authDomain: "fishbowl-9785d.firebaseapp.com",
  projectId: "fishbowl-9785d",
  storageBucket: "fishbowl-9785d.firebasestorage.app",
  messagingSenderId: "645453147595",
  appId: "1:645453147595:web:d427Fcd5f1707e735d5a4e",
  measurementId: "G-RQVP42JRRA4"
};

// تهيئة تطبيق فايربيس وقاعدة البيانات
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// التنقل بين الصفحات
window.showPage = function(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });
    document.getElementById(pageId).classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// اختيار الدور
let selectedRole = "";

window.chooseRole = function(role) {
    selectedRole = role;
    let message = document.getElementById("roleMessage");
    if (role === "discussion") {
        message.innerHTML = "💬 اخترت دور المناقش في الجولة الأولى.";
    } else {
        message.innerHTML = "👀 اخترت دور المراقب في الجولة الأولى.";
    }
}

// عرض الجولة
window.showRound = function(round) {
    if (!selectedRole) {
        alert("من فضلك اختر دورك أولاً.");
        window.showPage("case");
        return;
    }
    if (round === 1) {
        window.showPage("round1");
    } else {
        let newRole = selectedRole === "discussion"
            ? "👀 في الجولة الثانية أصبحت مراقباً بدلاً من المناقش."
            : "💬 في الجولة الثانية أصبحت مناقشاً بدلاً من المراقب.";
        document.getElementById("newRole").innerText = newRole;
        window.showPage("round2");
    }
}

// دالة إضافة المشاركات وإرسالها لـ Firebase لتظهر للجميع لحظياً
window.addParticipation = async function(roundNum, type) {
    let inputId = `input${type.charAt(0).toUpperCase() + type.slice(1)}${roundNum}`;
    let inputElement = document.getElementById(inputId);
    let text = inputElement.value.trim();

    if (text === "") {
        alert("من فضلك اكتب نص المشاركة أولاً.");
        return;
    }

    try {
        // حفظ المشاركة في قاعدة البيانات السحابية
        await addDoc(collection(db, "participations"), {
            round: roundNum,
            type: type, // 'discussion' أو 'observation'
            text: text,
            timestamp: new Date()
        });
        inputElement.value = "";
    } catch (e) {
        console.error("خطأ في حفظ البيانات: ", e);
        alert("حدث خطأ أثناء الإرسال، تأكد من اتصال الإنترنت.");
    }
}

// الاستماع المباشر للتغييرات وعرض المشاركات تلقائياً لكل الطلاب
function listenToParticipations() {
    onSnapshot(collection(db, "participations"), (snapshot) => {
        let listDiscussion1 = document.getElementById("listDiscussion1");
        let listObservation1 = document.getElementById("listObservation1");
        let listDiscussion2 = document.getElementById("listDiscussion2");
        let listObservation2 = document.getElementById("listObservation2");

        if (listDiscussion1) listDiscussion1.innerHTML = "";
        if (listObservation1) listObservation1.innerHTML = "";
        if (listDiscussion2) listDiscussion2.innerHTML = "";
        if (listObservation2) listObservation2.innerHTML = "";

        let hasDisc1 = false, hasObs1 = false, hasDisc2 = false, hasObs2 = false;

        snapshot.forEach((doc) => {
            let data = doc.data();
            let li = document.createElement("li");
            li.innerText = data.text;
            li.style.margin = "5px 0";

            if (data.round === 1) {
                if (data.type === "discussion") {
                    listDiscussion1.appendChild(li);
                    hasDisc1 = true;
                } else {
                    listObservation1.appendChild(li);
                    hasObs1 = true;
                }
            } else if (data.round === 2) {
                if (data.type === "discussion") {
                    listDiscussion2.appendChild(li);
                    hasDisc2 = true;
                } else {
                    listObservation2.appendChild(li);
                    hasObs2 = true;
                }
            }
        });

        // رسائل افتراضية في حال عدم وجود مشاركات بعد
        if (!hasDisc1 && listDiscussion1) listDiscussion1.innerHTML = "<li>كل آراء المناقشين تظهر هنا.</li>";
        if (!hasObs1 && listObservation1) listObservation1.innerHTML = "<li>كل ملاحظات المراقبين تظهر هنا.</li>";
        if (!hasDisc2 && listDiscussion2) listDiscussion2.innerHTML = "<li>آراء المناقشين الجديدة تظهر هنا.</li>";
        if (!hasObs2 && listObservation2) listObservation2.innerHTML = "<li>ملاحظات المراقبين الجديدة تظهر هنا.</li>";
    });
}

// تشغيل الاستماع للقاعدة فور فتح الصفحة
window.addEventListener("DOMContentLoaded", () => {
    listenToParticipations();
});

// الأسئلة والاختبار التفاعلي
const questions = [
    {
        question: "لماذا تُعد المراقبة في استراتيجية حوض السمك عنصراً أساسياً وليس مجرد مشاهدة صامتة؟",
        answers: [
            "لأن المراقبين يحلون محل المعلم تماماً.",
            "لأنهم يحللون الحوار ويرصدون جودة المشاركة ويقدمون تغذية راجعة.",
            "لأنهم يستمعون دون الحاجة إلى التركيز.",
            "لأنهم يحددون الإجابة الصحيحة فقط."
        ],
        correct: 1,
        explanation: "المراقبة عملية تحليل وتقويم تساعد على تحسين التعلم."
    },
    {
        question: "ما الهدف التربوي الأهم من تبادل الأدوار بين المجموعتين في الجولة الثانية؟",
        answers: [
            "تقليل وقت النشاط.",
            "السماح لمجموعة واحدة بالسيطرة على الحوار.",
            "إكساب الطلاب خبرة المناقشة والملاحظة معاً.",
            "إلغاء دور المجموعة الخارجية."
        ],
        correct: 2,
        explanation: "تبادل الأدوار ينمي مهارات الحوار والتفكير النقدي والتقويم لدى جميع الطلاب."
    },
    {
        question: "إذا احتكرت مجموعة المناقشة الحوار ولم تسمح لجميع أعضائها بالمشاركة، فما الإجراء التربوي الأنسب؟",
        answers: [
            "إنهاء الاستراتيجية فوراً.",
            "توجيه الطلاب لتحقيق المشاركة المتوازنة واحترام جميع الآراء.",
            "إلغاء مجموعة المراقبة.",
            "السماح لطالب واحد فقط باستكمال الحديث."
        ],
        correct: 1,
        explanation: "من أهداف الاستراتيجية تحقيق التفاعل والمشاركة الفعالة بين الطلاب."
    },
    {
        question: "كيف يمكن الاستفادة من ملاحظات المجموعة الخارجية عند بدء الجولة الثانية؟",
        answers: [
            "تجاهلها والبدء من جديد.",
            "استخدامها لتحسين أسلوب الحوار ومعالجة نقاط الضعف.",
            "تحويلها إلى درجات دون مناقشة.",
            "استخدامها لمنع الطلاب من الاختلاف."
        ],
        correct: 1,
        explanation: "الملاحظات والتغذية الراجعة تساعد على تطوير الأداء في الجولة التالية."
    },
    {
        question: "أي المواقف التالية يدل على نجاح المعلم في توظيف استراتيجية حوض السمك؟",
        answers: [
            "أن يقدم المعلم جميع الأفكار والإجابات بنفسه.",
            "أن يترك الطلاب دون تنظيم أو متابعة.",
            "أن ينظم الأدوار ويحفز الحوار ويضمن بيئة آمنة للمشاركة.",
            "أن يختار طالباً واحداً للإجابة طوال النشاط."
        ],
        correct: 2,
        explanation: "المعلم ميسر ومنظم للتعلم، ويضمن مشاركة فعالة وبيئة حوارية إيجابية."
    }
];

let currentQuestion = 0;
let score = 0;
let answered = false;

// دالة تشغيل الأصوات الخاصة بكل سؤال (صح / خطأ)
function playSound(isCorrect, questionIndex) {
    let qNum = questionIndex + 1;
    let soundFileName = isCorrect ? `q${qNum}-correct.mpeg` : `q${qNum}-wrong.mpeg`;
    let audio = new Audio(soundFileName);
    audio.play().catch(e => console.log("الصوت يحتاج تفاعل مستخدم:", e));
}

window.startQuiz = function() {
    currentQuestion = 0;
    score = 0;
    answered = false;
    window.showPage("quiz");
    displayQuestion();
}

function displayQuestion() {
    answered = false;
    let q = questions[currentQuestion];
    document.getElementById("progress").innerText = `السؤال ${currentQuestion + 1} من ${questions.length}`;
    document.getElementById("question").innerText = q.question;
    document.getElementById("feedback").innerHTML = "";
    document.getElementById("nextQuestion").hidden = true;

    let answersContainer = document.getElementById("answers");
    answersContainer.innerHTML = "";

    q.answers.forEach((answer, index) => {
        let button = document.createElement("button");
        button.className = "answer";
        button.innerText = answer;
        button.onclick = () => checkAnswer(index, button);
        answersContainer.appendChild(button);
    });
}

function checkAnswer(selected, selectedButton) {
    if (answered) return;
    answered = true;
    let q = questions[currentQuestion];
    let allButtons = document.querySelectorAll(".answer");
    allButtons.forEach(button => { button.disabled = true; });

    // تشغيل الصوت التفاعلي للإجابة
    playSound(selected === q.correct, currentQuestion);

    if (selected === q.correct) {
        score++;
        selectedButton.classList.add("correct");
        document.getElementById("feedback").innerHTML = "🎉😍 إجابة صحيحة! أحسنت!<br>" + q.explanation;
    } else {
        selectedButton.classList.add("wrong");
        allButtons[q.correct].classList.add("correct");
        document.getElementById("feedback").innerHTML = "😢🐠 إجابة غير صحيحة، حاول الاستفادة من التوضيح!<br>الإجابة الصحيحة: " + q.answers[q.correct] + "<br>" + q.explanation;
    }

    document.getElementById("nextQuestion").hidden = false;
    if (currentQuestion === questions.length - 1) {
        document.getElementById("nextQuestion").innerText = "عرض النتيجة النهائية";
    } else {
        document.getElementById("nextQuestion").innerText = "السؤال التالي";
    }
}

window.nextQuestion = function() {
    if (!answered) return;
    currentQuestion++;
    if (currentQuestion < questions.length) {
        displayQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById("finalScore").innerText = `حصلت على ${score} من ${questions.length}`;
    window.showPage("result");
}
