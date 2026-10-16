/* Parla! — 60 atividades de italiano em 7 dias + Supabase e salvamento local. */
const SUPABASE_URL = "https://ufoxlwbdfqjhjvdpbqxm.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_w6rR0guwZNz1uj7CdwtoKA_CCWH6wsb";
const configured = SUPABASE_URL.startsWith("https://") && !SUPABASE_URL.includes("COLE_A_") && !SUPABASE_ANON_KEY.includes("COLE_A_");
const supabaseClient = configured && window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } })
  : null;

const $ = (id) => document.getElementById(id);
const authView = $("authView"), dashboardView = $("dashboardView");
let authMode = "login", currentUser = null, progress = defaultProgress();
let currentLesson = null, questionIndex = 0, selectedAnswer = null, lessonCorrect = 0, checking = false, lessonFinished = false;

function defaultProgress() {
  return { xp: 0, level: 1, streak: 0, last_study_date: null, lessons_completed: [], study_dates: [] };
}

// Cada atividade contém título, tema, expressão italiana, significado e situação prática.
const curriculum = [
  ["Ciao e buongiorno","Saudações","Buongiorno","Bom dia","Você encontra alguém pela manhã."],
  ["Dizer olá e tchau","Saudações","Arrivederci","Até logo","Você se despede educadamente."],
  ["Perguntar como alguém está","Conversação","Come stai?","Como você está?","Você cumprimenta um amigo."],
  ["Responder que está bem","Conversação","Sto bene, grazie","Estou bem, obrigado(a)","Alguém pergunta como você está."],
  ["Apresentar-se","Apresentações","Mi chiamo Ana","Eu me chamo Ana","Você diz seu nome a alguém."],
  ["Perguntar o nome","Apresentações","Come ti chiami?","Como você se chama?","Você quer saber o nome de alguém."],
  ["Dizer de onde vem","Apresentações","Vengo dal Brasile","Venho do Brasil","Alguém pergunta de onde você vem."],
  ["Falar idiomas","Apresentações","Parlo portoghese","Falo português","Você conta qual idioma fala."],
  ["Ser gentil","Boas maneiras","Per favore","Por favor","Você faz um pedido educado."],
  ["Agradecer","Boas maneiras","Grazie mille","Muito obrigado(a)","Alguém ajuda você e você agradece."],
  ["Responder ao agradecimento","Boas maneiras","Prego","De nada","Alguém agradece a você."],
  ["Pedir desculpas","Boas maneiras","Mi dispiace","Sinto muito","Você quer se desculpar por um engano."],
  ["Pedir para repetir","Sala de aula","Puoi ripetere?","Pode repetir?","Você não ouviu o que foi dito."],
  ["Dizer que não entendeu","Sala de aula","Non capisco","Não entendo","Você precisa avisar que não compreendeu."],
  ["Pedir para falar devagar","Sala de aula","Più lentamente, per favore","Mais devagar, por favor","A pessoa fala muito rápido."],
  ["Pedir água","No café","Un'acqua, per favore","Uma água, por favor","Você pede água em um café."],
  ["Pedir um café","No café","Un caffè, per favore","Um café, por favor","Você pede um café no balcão."],
  ["Escolher um cappuccino","No café","Vorrei un cappuccino","Eu gostaria de um cappuccino","Você faz um pedido com educação."],
  ["Perguntar pelo cardápio","Restaurante","Il menù, per favore","O cardápio, por favor","Você acabou de se sentar à mesa."],
  ["Pedir a conta","Restaurante","Il conto, per favore","A conta, por favor","Você terminou de comer."],
  ["Dizer que está delicioso","Restaurante","È buonissimo!","Está delicioso!","Você elogia a comida."],
  ["Perguntar o preço","Compras","Quanto costa?","Quanto custa?","Você quer saber o preço de um item."],
  ["Comprar pão","Mercado","Vorrei del pane","Eu gostaria de pão","Você pede pão em uma padaria."],
  ["Perguntar onde fica","Orientação","Dov'è la stazione?","Onde fica a estação?","Você procura a estação de trem."],
  ["Entender à direita","Orientação","A destra","À direita","Alguém explica para onde virar."],
  ["Entender à esquerda","Orientação","A sinistra","À esquerda","Alguém indica o caminho."],
  ["Seguir em frente","Orientação","Sempre dritto","Sempre em frente","Você recebe instruções na rua."],
  ["Perguntar pela estação de ônibus","Viagem","Dov'è la fermata dell'autobus?","Onde fica o ponto de ônibus?","Você precisa encontrar o ponto de ônibus."],
  ["Comprar uma passagem","Viagem","Un biglietto, per favore","Uma passagem, por favor","Você compra uma passagem."],
  ["Perguntar o horário","Viagem","A che ora parte?","A que horas parte?","Você quer saber quando o trem sai."],
  ["Falar os números","Números","Quarantadue","Quarenta e dois","Você vê o número 42 em uma placa."],
  ["Perguntar a hora","Rotina","Che ore sono?","Que horas são?","Você quer saber o horário atual."],
  ["Falar sobre hoje","Rotina","Oggi","Hoje","Você fala do dia atual."],
  ["Falar sobre amanhã","Rotina","Domani","Amanhã","Você combina algo para o dia seguinte."],
  ["Dizer que horas são","Rotina","È l'una","É uma hora","Você informa que é uma hora."],
  ["Descrever o tempo","Clima","Fa caldo","Está calor","Você comenta sobre um dia quente."],
  ["Dizer que está frio","Clima","Fa freddo","Está frio","Você comenta sobre um dia frio."],
  ["Falar sobre a família","Família","Mia sorella","Minha irmã","Você apresenta sua irmã."],
  ["Falar sobre um amigo","Família e amigos","Il mio amico","Meu amigo","Você fala de um amigo seu."],
  ["Falar do trabalho","Rotina","Lavoro oggi","Trabalho hoje","Você explica sua rotina."],
  ["Falar sobre estudar","Rotina","Studio italiano","Estudo italiano","Você conta o que está estudando."],
  ["Dizer o que gosta","Preferências","Mi piace la musica","Eu gosto de música","Você fala de algo de que gosta."],
  ["Dizer o que prefere","Preferências","Preferisco il tè","Prefiro chá","Você escolhe entre chá e café."],
  ["Convidar alguém","Conversação","Vuoi venire con me?","Quer vir comigo?","Você convida alguém para passear."],
  ["Aceitar um convite","Conversação","Volentieri!","Com prazer!","Você aceita um convite animado."],
  ["Recusar com educação","Conversação","Mi dispiace, non posso","Sinto muito, não posso","Você não pode aceitar um convite."],
  ["Reservar uma mesa","Restaurante","Un tavolo per due, per favore","Uma mesa para duas pessoas, por favor","Você chega a um restaurante com outra pessoa."],
  ["Informar uma alergia","Restaurante","Sono allergico alle noci","Sou alérgico(a) a nozes","Você precisa informar uma alergia alimentar."],
  ["Pedir uma opção vegetariana","Restaurante","Avete un piatto vegetariano?","Vocês têm um prato vegetariano?","Você procura uma refeição vegetariana."],
  ["Perguntar o caminho a pé","Orientação","È lontano da qui?","É longe daqui?","Você quer saber se o lugar fica distante."],
  ["Dizer que está perdido","Orientação","Mi sono perso","Estou perdido","Você não consegue encontrar seu destino."],
  ["Pedir ajuda","Emergências","Può aiutarmi?","Pode me ajudar?","Você precisa pedir ajuda de forma educada."],
  ["Encontrar uma farmácia","Emergências","Dov'è la farmacia?","Onde fica a farmácia?","Você precisa encontrar uma farmácia."],
  ["Fazer o check-in","Hotel","Ho una prenotazione","Tenho uma reserva","Você chega ao hotel com uma reserva."],
  ["Perguntar a senha do Wi-Fi","Hotel","Qual è la password del Wi-Fi?","Qual é a senha do Wi-Fi?","Você quer conectar seu celular à internet."],
  ["Pedir toalhas extras","Hotel","Potrei avere degli asciugamani?","Poderia receber toalhas?","Você precisa de mais toalhas no hotel."],
  ["Falar sobre planos","Futuro","Domani visiterò il museo","Amanhã visitarei o museu","Você conta o que pretende fazer amanhã."],
  ["Contar algo do passado","Passado","Ieri ho visitato Roma","Ontem visitei Roma","Você conta o que fez ontem."],
  ["Comparar opções","Opiniões","Questo è più economico","Este é mais barato","Você compara dois produtos."],
  ["Encerrar uma conversa","Despedidas","È stato un piacere conoscerti","Foi um prazer conhecer você","Você encerra uma conversa com educação."]
];

const dayPlan = [9,9,9,9,8,8,8];
const dayNames = ["Segunda-feira","Terça-feira","Quarta-feira","Quinta-feira","Sexta-feira","Sábado","Domingo"];
const dayThemes = ["Primeiros passos","Café, comida e compras","Cidade e transporte","Rotina e conversação","Preferências e convites","Viagem e situações práticas","Desafios de italiano"];
let selectedDay = 1;
const difficultyPatterns = ["Fácil","Fácil","Médio","Fácil","Médio","Difícil","Médio","Fácil","Difícil"];
const lessons = {};
let curriculumIndex = 0;

for (let day = 0; day < dayPlan.length; day++) {
  for (let slot = 0; slot < dayPlan[day]; slot++) {
    const [title, topic, italian, portuguese, context] = curriculum[curriculumIndex];
    const id = `atividade-${String(curriculumIndex+1).padStart(2,"0")}`;
    const difficulty = day < 2
      ? (slot % 4 === 3 ? "Médio" : "Fácil")
      : day < 4
        ? difficultyPatterns[slot]
        : (slot % 3 === 0 ? "Médio" : "Difícil");
    const related = curriculum.filter((_, i) => i !== curriculumIndex);
    const distractorsPt = [related[(curriculumIndex+7)%related.length][3], related[(curriculumIndex+19)%related.length][3]];
    const distractorsIt = [related[(curriculumIndex+11)%related.length][2], related[(curriculumIndex+23)%related.length][2]];

    lessons[id] = {
      title, topic, emoji: emojiFor(topic), day: day+1, dayName: dayNames[day], difficulty,
      description: context,
      questions: [
        {
          level: "Fácil",
          prompt: `O que significa “${italian}”?`,
          hint: "Leia a expressão em italiano e escolha o significado em português.",
          options: shuffle([portuguese,...distractorsPt]),
          answer: portuguese,
          explanation: `“${italian}” significa “${portuguese}”.`
        },
        {
          level: "Médio",
          prompt: `Como você diria “${portuguese}” em italiano?`,
          hint: "Escolha a expressão italiana equivalente.",
          options: shuffle([italian,...distractorsIt]),
          answer: italian,
          explanation: `A expressão correta é “${italian}”.`
        },
        {
          level: "Difícil",
          prompt: `Situação: ${context} Qual expressão você usaria?`,
          hint: "Pense na situação prática antes de responder.",
          options: shuffle([italian,...distractorsIt]),
          answer: italian,
          explanation: `Nesta situação, você pode dizer “${italian}” (${portuguese.toLowerCase()}).`
        }
      ]
    };
    curriculumIndex++;
  }
}

function shuffle(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

function emojiFor(topic) {
  return ({
    "Saudações":"👋","Conversação":"💬","Apresentações":"🗣️",
    "Boas maneiras":"🤝","Sala de aula":"📘","No café":"☕",
    "Restaurante":"🍝","Compras":"🛍️","Mercado":"🥖",
    "Orientação":"🧭","Viagem":"🚆","Números":"🔢",
    "Rotina":"🗓️","Clima":"🌦️","Família":"👨‍👩‍👧",
    "Família e amigos":"🫶","Preferências":"✨","Emergências":"🆘",
    "Hotel":"🛎️","Futuro":"🔮","Passado":"🕰️",
    "Opiniões":"💡","Despedidas":"👋"
  })[topic] || "🇮🇹";
}

function showMessage(id, text, type = "") {
  const el = $(id);
  el.textContent = text;
  el.className = `message ${type}`;
}

function showToast(text) {
  const toast = $("toast");
  toast.textContent = text;
  toast.classList.remove("hidden");
  window.setTimeout(() => toast.classList.add("hidden"), 3500);
}

function setAuthMode(mode) {
  authMode = mode;
  document.querySelectorAll(".auth-tab").forEach(tab =>
    tab.classList.toggle("active", tab.dataset.mode === mode)
  );
  $("authTitle").textContent = mode === "login"
    ? "Que bom ter você de volta!"
    : "Comece sua jornada!";
  $("authSubtitle").textContent = mode === "login"
    ? "Entre para continuar sua jornada."
    : "Crie sua conta gratuita e salve seu progresso.";
  $("authSubmit").textContent = mode === "login"
    ? "Entrar na minha conta"
    : "Criar minha conta";
  $("password").autocomplete = mode === "login" ? "current-password" : "new-password";
  $("forgotBtn").classList.toggle("hidden", mode !== "login");
  showMessage("authMessage", "");
}

document.querySelectorAll(".auth-tab").forEach(tab =>
  tab.addEventListener("click", () => setAuthMode(tab.dataset.mode))
);

$("authForm").addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!supabaseClient) {
    showMessage("authMessage", "Configure a URL e a chave pública do Supabase no arquivo app.js e siga o README.", "error");
    return;
  }

  const email = $("email").value.trim();
  const password = $("password").value;
  const submit = $("authSubmit");
  submit.disabled = true;
  submit.textContent = "Aguarde...";

  try {
    if (authMode === "signup") {
      const { data, error } = await supabaseClient.auth.signUp({ email, password });
      if (error) throw error;

      if (data.session) {
        await enterApp(data.session.user);
      } else {
        showMessage("authMessage", "Conta criada! Confira seu e-mail para confirmar o cadastro e depois entre.", "success");
      }
    } else {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await enterApp(data.user);
    }
  } catch (error) {
    showMessage("authMessage", friendlyError(error), "error");
  } finally {
    submit.disabled = false;
    submit.textContent = authMode === "login" ? "Entrar na minha conta" : "Criar minha conta";
  }
});

$("forgotBtn").addEventListener("click", async () => {
  if (!supabaseClient) {
    return showMessage("authMessage", "Configure o Supabase primeiro.", "error");
  }

  const email = $("email").value.trim();
  if (!email) {
    return showMessage("authMessage", "Digite seu e-mail no campo acima primeiro.", "error");
  }

  try {
    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin
    });
    if (error) throw error;
    showMessage("authMessage", "Se o e-mail estiver cadastrado, você receberá as instruções de recuperação.", "success");
  } catch (error) {
    showMessage("authMessage", friendlyError(error), "error");
  }
});

$("logoutBtn").addEventListener("click", async () => {
  if (supabaseClient) await supabaseClient.auth.signOut();
  currentUser = null;
  authView.classList.remove("hidden");
  dashboardView.classList.add("hidden");
  $("logoutBtn").classList.add("hidden");
});

function friendlyError(error) {
  const msg = (error?.message || "Ocorreu um erro. Tente novamente.").toLowerCase();
  if (msg.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (msg.includes("user already registered")) return "Este e-mail já possui uma conta. Tente entrar.";
  if (msg.includes("password")) return "A senha precisa ter pelo menos 6 caracteres.";
  if (msg.includes("fetch")) return "Não foi possível conectar. Verifique sua internet e a configuração do Supabase.";
  return error?.message || "Ocorreu um erro. Tente novamente.";
}

function localProgressKey(userId) {
  return `parla_progress_${userId}`;
}

function readLocalProgress(userId) {
  try {
    const raw = localStorage.getItem(localProgressKey(userId));
    return raw ? normalizeProgress(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function mergeProgress(a, b) {
  if (!a) return b || defaultProgress();
  if (!b) return a;

  return {
    xp: Math.max(a.xp, b.xp),
    level: Math.max(a.level, b.level),
    streak: Math.max(a.streak, b.streak),
    last_study_date: [a.last_study_date, b.last_study_date].filter(Boolean).sort().at(-1) || null,
    lessons_completed: [...new Set([...a.lessons_completed, ...b.lessons_completed])],
    study_dates: [...new Set([...a.study_dates, ...b.study_dates])]
  };
}

async function enterApp(user) {
  currentUser = user;
  authView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  $("logoutBtn").classList.remove("hidden");
  $("userEmail").textContent = user.email || "";
  $("welcomeTitle").textContent = "Bentornato!";

  const local = readLocalProgress(user.id);

  try {
    const { data, error } = await supabaseClient
      .from("progress")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) throw error;
    progress = mergeProgress(data ? normalizeProgress(data) : null, local) || defaultProgress();
    await saveProgress();
  } catch (error) {
    progress = mergeProgress(local, defaultProgress());
    showToast("Progresso carregado neste computador. O banco respondeu: " + error.message);
  }

  renderProgress();
}

function normalizeProgress(data) {
  const legacyMap = {
    greetings: "atividade-01",
    food: "atividade-16",
    numbers: "atividade-31"
  };

  const completed = Array.isArray(data.lessons_completed)
    ? data.lessons_completed.map(id => legacyMap[id] || id)
    : [];

  return {
    xp: Number(data.xp || 0),
    level: Number(data.level || 1),
    streak: Number(data.streak || 0),
    last_study_date: data.last_study_date || null,
    lessons_completed: [...new Set(completed)],
    study_dates: Array.isArray(data.study_dates) ? data.study_dates : []
  };
}

async function saveProgress() {
  if (currentUser) {
    try {
      localStorage.setItem(localProgressKey(currentUser.id), JSON.stringify(progress));
    } catch (e) {
      console.warn("Local storage indisponível", e);
    }
  }

  if (!supabaseClient || !currentUser) return false;

  const payload = {
    user_id: currentUser.id,
    xp: progress.xp,
    level: progress.level,
    streak: progress.streak,
    last_study_date: progress.last_study_date,
    lessons_completed: progress.lessons_completed,
    study_dates: progress.study_dates,
    updated_at: new Date().toISOString()
  };

  const { error } = await supabaseClient
    .from("progress")
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    console.error("Erro ao salvar progresso no Supabase:", error);
    showToast("Salvo neste computador, mas não no Supabase: " + error.message);
    return false;
  }

  return true;
}

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function previousDay(dateString) {
  const d = new Date(`${dateString}T12:00:00`);
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}

function recordStudyDay() {
  const today = todayLocal();
  if (progress.last_study_date === today) return;

  progress.streak = progress.last_study_date === previousDay(today)
    ? progress.streak + 1
    : 1;

  progress.last_study_date = today;
  if (!progress.study_dates.includes(today)) progress.study_dates.push(today);
}

function renderProgress() {
  progress.level = Math.floor(progress.xp / 100) + 1;
  $("xpValue").textContent = progress.xp;
  $("levelValue").textContent = progress.level;
  $("levelCaption").textContent = progress.level < 3
    ? "Principiante"
    : progress.level < 6
      ? "Esploratore"
      : progress.level < 10
        ? "Parlante in crescita"
        : "Maestro di italiano";

  $("streakValue").textContent = progress.streak;
  $("topStreak").textContent = progress.streak;
  $("lessonsValue").textContent = progress.lessons_completed.length;

  const completed = progress.lessons_completed.length;
  const pct = Math.round(completed / 60 * 100);
  $("courseProgress").style.width = `${pct}%`;
  $("courseProgressLabel").textContent = `${completed}/60 atividades · ${pct}% concluído`;

  const withinLevel = progress.xp % 100;
  $("xpProgress").style.width = `${withinLevel}%`;
  $("xpToNext").textContent = `${100-withinLevel} XP para o próximo nível`;

  renderLessons();
  renderWeek();
}

function renderLessons() {
  const container = $("lessonList");
  if (!container) return;

  const dayHeading = $("selectedDayEyebrow");
  const dayTitle = $("selectedDayTitle");
  const dayDescription = $("selectedDayDescription");

  if (dayHeading) {
    dayHeading.textContent = `GIORNO ${String(selectedDay).padStart(2, "0")} · ${dayThemes[selectedDay - 1].toUpperCase()}`;
  }

  if (dayTitle) dayTitle.textContent = dayNames[selectedDay - 1];

  if (dayDescription) {
    const descriptions = [
      "Comece sua jornada pelo italiano com cumprimentos e apresentações.",
      "Pratique como pedir comidas e bebidas e fazer compras.",
      "Aprenda a pedir informações e se locomover pela cidade.",
      "Fale sobre horários, clima e atividades do cotidiano.",
      "Expresse preferências e aprenda a fazer convites.",
      "Pratique frases úteis para viagens e situações práticas.",
      "Revise e desafie seus conhecimentos de italiano."
    ];
    dayDescription.textContent = descriptions[selectedDay - 1];
  }

  document.querySelectorAll(".day-button[data-day]").forEach(button => {
    const isActive = Number(button.dataset.day) === selectedDay;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });

  container.innerHTML = "";

  const dayLessons = Object.entries(lessons)
    .filter(([, lesson]) => lesson.day === selectedDay);

  const done = dayLessons.filter(([id]) =>
    progress.lessons_completed.includes(id)
  ).length;

  const heading = document.createElement("div");
  heading.className = "week-section-heading";
  heading.innerHTML = `
    <div>
      <span class="eyebrow">DIA ${selectedDay} · ${dayThemes[selectedDay - 1].toUpperCase()}</span>
      <h3>${dayNames[selectedDay - 1]}</h3>
    </div>
    <span class="day-count">${done}/${dayLessons.length} concluídas</span>
  `;
  container.append(heading);

  dayLessons.forEach(([id, lesson], index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "lesson-row lesson-available";
    button.dataset.lesson = id;

    const status = progress.lessons_completed.includes(id)
      ? "✓ Concluída"
      : "Abrir ↗";

    const firstNumber = selectedDay === 1
      ? 0
      : dayPlan.slice(0, selectedDay - 1).reduce((sum, count) => sum + count, 0);

    button.innerHTML = `
      <span class="lesson-index">${String(firstNumber + index + 1).padStart(2, "0")}</span>
      <span class="lesson-emoji">${lesson.emoji}</span>
      <span class="lesson-info">
        <b>${lesson.title}</b>
        <small>${lesson.description}</small>
        <span class="lesson-meta">
          ${lesson.topic.toUpperCase()} · 3 PERGUNTAS ·
          <span class="difficulty ${lesson.difficulty.toLowerCase()}">${lesson.difficulty.toUpperCase()}</span>
        </span>
      </span>
      <span class="lesson-status">${status}</span>
    `;

    button.addEventListener("click", () => startLesson(id));
    container.append(button);
  });
}

// Liga os botões de segunda a domingo às atividades de cada dia.
document.querySelectorAll(".day-button[data-day]").forEach(button => {
  button.addEventListener("click", () => {
    const day = Number(button.dataset.day);
    if (!Number.isInteger(day) || day < 1 || day > 7) return;
    selectedDay = day;
    renderLessons();
  });
});

function renderWeek() {
  const container = $("weekDays");
  container.innerHTML = "";

  const labels = ["S","T","Q","Q","S","S","D"];
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - ((today.getDay() + 6) % 7));

  for (let i = 0; i < 7; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);

    const date = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,"0")}-${String(day.getDate()).padStart(2,"0")}`;
    const cell = document.createElement("div");
    cell.className = "day-cell";

    const dot = document.createElement("span");
    dot.className = "day-dot";

    if (date === todayLocal()) dot.classList.add("today");

    if (progress.study_dates.includes(date)) {
      dot.classList.add("done");
      dot.textContent = "✓";
    } else {
      dot.textContent = day.getDate();
    }

    const label = document.createElement("span");
    label.textContent = labels[i];
    cell.append(dot, label);
    container.append(cell);
  }
}

function startLesson(id) {
  if (!lessons[id]) return;

  currentLesson = id;
  questionIndex = 0;
  selectedAnswer = null;
  lessonCorrect = 0;
  checking = false;
  lessonFinished = false;

  $("lessonPanel").classList.remove("hidden");
  $("lessonPanel").scrollIntoView({ behavior: "smooth", block: "start" });
  renderQuestion();
}

function renderQuestion() {
  const lesson = lessons[currentLesson];
  const q = lesson.questions[questionIndex];

  $("lessonStepLabel").textContent = `Pergunta ${questionIndex+1} de ${lesson.questions.length} · ${q.level}`;
  $("lessonProgressFill").style.width = `${questionIndex / lesson.questions.length * 100}%`;
  $("lessonFeedback").textContent = "";
  $("lessonFeedback").className = "message";
  $("checkAnswer").textContent = "Conferir resposta";
  $("checkAnswer").disabled = true;

  checking = false;
  selectedAnswer = null;

  const content = $("lessonContent");
  content.innerHTML = "";

  const emoji = document.createElement("div");
  emoji.className = "lesson-emoji";
  emoji.textContent = lesson.emoji;

  const title = document.createElement("h2");
  title.className = "lesson-question";
  title.textContent = q.prompt;

  const hint = document.createElement("p");
  hint.className = "lesson-hint";
  hint.textContent = q.hint;

  const options = document.createElement("div");
  options.className = "answer-options";

  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "answer-option";
    btn.textContent = option;

    btn.addEventListener("click", () => {
      if (checking || lessonFinished) return;

      selectedAnswer = option;
      options.querySelectorAll("button").forEach(b => {
        b.classList.toggle("selected", b.textContent === option);
      });

      $("checkAnswer").disabled = false;
    });

    options.append(btn);
  });

  content.append(emoji, title, hint, options);
}

$("checkAnswer").addEventListener("click", async () => {
  if (lessonFinished) {
    $("lessonPanel").classList.add("hidden");
    return;
  }

  const lesson = lessons[currentLesson];
  const q = lesson.questions[questionIndex];

  if (!checking) {
    if (!selectedAnswer) return;

    checking = true;
    const buttons = $("lessonContent").querySelectorAll(".answer-option");

    buttons.forEach(b => {
      if (b.textContent === q.answer) b.classList.add("correct");
      else if (b.textContent === selectedAnswer) b.classList.add("wrong");
    });

    if (selectedAnswer === q.answer) {
      lessonCorrect++;
      showMessage("lessonFeedback", "Perfetto! " + q.explanation, "success");
    } else {
      showMessage("lessonFeedback", "Resposta correta: " + q.answer + ". " + q.explanation, "error");
    }

    $("checkAnswer").textContent = questionIndex === lesson.questions.length - 1
      ? "Concluir atividade"
      : "Próxima pergunta";

    $("lessonProgressFill").style.width = `${(questionIndex + 1) / lesson.questions.length * 100}%`;
  } else {
    if (questionIndex < lesson.questions.length - 1) {
      questionIndex++;
      renderQuestion();
    } else {
      await finishLesson();
    }
  }
});

async function finishLesson() {
  const alreadyCompleted = progress.lessons_completed.includes(currentLesson);
  const earned = alreadyCompleted ? 0 : 10 + lessonCorrect * 10;

  if (!alreadyCompleted) progress.lessons_completed.push(currentLesson);

  progress.xp += earned;
  recordStudyDay();
  progress.level = Math.floor(progress.xp / 100) + 1;

  await saveProgress();
  renderProgress();
  lessonFinished = true;

  $("lessonContent").innerHTML = `
    <div style="text-align:center;padding:25px 0">
      <div style="font-size:52px">🎉</div>
      <h2 class="lesson-question">Attività completata!</h2>
      <p class="muted">Você acertou ${lessonCorrect} de ${lessons[currentLesson].questions.length} perguntas.</p>
      <p style="font-weight:800;color:var(--green);font-size:20px">
        ${alreadyCompleted ? "Atividade revisada!" : "+" + earned + " XP"}
      </p>
      <p class="muted">Ottimo lavoro! Continue praticando.</p>
    </div>
  `;

  $("lessonStepLabel").textContent = "Atividade concluída";
  $("lessonProgressFill").style.width = "100%";
  $("lessonFeedback").textContent = "";
  $("checkAnswer").textContent = "Voltar ao curso";
  $("checkAnswer").disabled = false;

  showToast(alreadyCompleted ? "Revisão concluída!" : `Você ganhou ${earned} XP!`);
}

$("closeLesson").addEventListener("click", () => {
  $("lessonPanel").classList.add("hidden");
});

(async function init() {
  renderLessons();

  if (!supabaseClient) return;

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session?.user) await enterApp(session.user);

  supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      currentUser = null;
      authView.classList.remove("hidden");
      dashboardView.classList.add("hidden");
      $("logoutBtn").classList.add("hidden");
    }
  });
})();