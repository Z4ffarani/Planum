const estado = {
  usuario: null,
  atividades: [],
  tipoCalendario: "profissional",
  metodoAtivo: "pomodoro",
  barraLateralAberta: false,
  atividadeEditando: null,
  mensagens: [],
  temporizadoresPomodoro: {},
  ordemOriginalAtividades: [],
  habitMixingOriginal: [],
  proximaHoraDisponivel: 9,
}

document.addEventListener("DOMContentLoaded", () => {
  carregarUsuarios()
  configurarEventosLogin()
})

async function carregarUsuarios() {
  try {
    const resposta = await fetch("./usuarios.json")
    estado.usuarios = await resposta.json()
  } catch (erro) {
    console.error("Erro ao carregar usuários:", erro)
    estado.usuarios = [
      { id: "1", nome: "Alura Cursos", email: "alura@planum.com", senha: "123" },
      { id: "2", nome: "Maria Santos", email: "maria@planum.com", senha: "123" },
    ]
  }
}

function configurarEventosLogin() {
  const formLogin = document.getElementById("login-form")
  formLogin.addEventListener("submit", executarLogin)
}

function executarLogin(e) {
  e.preventDefault()
  const email = document.getElementById("login-email").value
  const senha = document.getElementById("login-senha").value

  const usuario = estado.usuarios.find((u) => u.email === email && u.senha === senha)

  if (usuario) {
    estado.usuario = { id: usuario.id, nome: usuario.nome, email: usuario.email }
    document.getElementById("tela-login").style.display = "none"
    document.getElementById("app-container").style.display = "flex"
    document.getElementById("user-name").textContent = usuario.nome

    carregarAtividades()
    configurarEventosApp()
    renderizarCalendario()
    iniciarChat()
  } else {
    const erroEl = document.getElementById("login-error")
    erroEl.textContent = "Email ou senha incorretos"
    erroEl.style.display = "block"
  }
}

async function carregarAtividades() {
  try {
    const resposta = await fetch("./atividades.json")
    const todas = await resposta.json()
    estado.atividades = todas.filter((t) => t.userId === estado.usuario.id)
  } catch (erro) {
    console.error("Erro ao carregar atividades:", erro)
    estado.atividades = [
      {
        id: "1",
        titulo: "Relatório",
        descricao: "",
        data: "2023-11-24",
        hora: "09:00",
        complexidade: "alta",
        tipo: "profissional",
        coluna: "segunda",
        completo: false,
        userId: estado.usuario.id,
      },
    ]
  }
  salvarAtividadesLocal()
}

function salvarAtividadesLocal() {
  localStorage.setItem("planum_atividades_" + estado.usuario.id, JSON.stringify(estado.atividades))
}

function configurarEventosApp() {
  document.getElementById("fechar-chat").addEventListener("click", alternarSidebar)
  document.getElementById("botao-sidebar").addEventListener("click", alternarSidebar)

  document.querySelectorAll(".troca-btn").forEach((btn) => {
    btn.addEventListener("click", trocarCalendario)
  })

  document.querySelectorAll(".metodo-btn").forEach((btn) => {
    btn.addEventListener("click", trocarMetodo)
  })

  document.getElementById("logout-btn").addEventListener("click", executarLogout)
  document.getElementById("enviar-btn").addEventListener("click", enviarMensagem)
  document.getElementById("prompt-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      enviarMensagem()
    }
  })

  const textarea = document.getElementById("prompt-input")
  textarea.addEventListener("input", () => {
    textarea.style.height = "auto"
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px"
  })

  document.querySelector(".fechar-modal").addEventListener("click", fecharModalAtividade)
  document.getElementById("salvar-atividade-btn").addEventListener("click", salvarAtividade)
  document.getElementById("deletar-atividade-btn").addEventListener("click", excluirAtividade)
  document.getElementById("atividade-concluida").addEventListener("click", marcarAtividadeComoConcluida)

  document.querySelectorAll(".botao-complexidade").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault()
      document.querySelectorAll(".botao-complexidade").forEach((b) => b.classList.remove("active"))
      btn.classList.add("active")
    })
  })

  document.getElementById("info-btn").addEventListener("click", abrirInfo)
  document.querySelector(".info-fechar-modal").addEventListener("click", fecharInfo)
}

function marcarAtividadeComoConcluida() {
  if (!estado.atividadeEditando) return
  estado.atividadeEditando.completo = true
  salvarAtividadesLocal()
  fecharModalAtividade()
  renderizarCalendario()
}

function alternarSidebar() {
  const sidebar = document.getElementById("sidebar")
  const hamburger = document.querySelector(".hamburger-btn")
  estado.barraLateralAberta = !estado.barraLateralAberta

  if (estado.barraLateralAberta) {
    sidebar.classList.remove("closed")
    sidebar.classList.add("open")
    hamburger.classList.add("hidden")
  } else {
    sidebar.classList.add("closed")
    sidebar.classList.remove("open")
    hamburger.classList.remove("hidden")
  }
}

function trocarCalendario(e) {
  const botao = e.target.closest(".troca-btn")

  if (botao.classList.contains("active")) return

  document.querySelectorAll(".troca-btn").forEach((b) => b.classList.remove("active"))
  botao.classList.add("active")

  estado.tipoCalendario = botao.dataset.type
  renderizarCalendario()
}

function trocarMetodo(e) {
  const metodoAnterior = estado.metodoAtivo
  document.querySelectorAll(".metodo-btn").forEach((b) => b.classList.remove("active"))
  e.target.closest(".metodo-btn").classList.add("active")

  estado.metodoAtivo = e.target.closest(".metodo-btn").dataset.method

  if (metodoAnterior === "eisenhower" && estado.ordemOriginalAtividades.length > 0) {
    estado.atividades = [...estado.ordemOriginalAtividades]
    estado.ordemOriginalAtividades = []
    salvarAtividadesLocal()
  }

  if (metodoAnterior === "habit-mixing" && estado.habitMixingOriginal.length > 0) {
    estado.atividades = [...estado.habitMixingOriginal]
    estado.habitMixingOriginal = []
    salvarAtividadesLocal()
  }

  renderizarCalendario()
}

function renderizarCalendario() {
  const dias = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]

  dias.forEach((dia) => {
    const conteudoDia = document.querySelector(`.dia-coluna[data-dia="${dia}"] .dia-conteudo`)
    conteudoDia.innerHTML = ""

    const atividadesDia = obterAtividadesDia(dia)
    const reorganizadas = reorganizarAtividades(atividadesDia)

    reorganizadas.forEach((atividade) => {
      conteudoDia.appendChild(criarCardAtividade(atividade))
    })

    if (estado.metodoAtivo === "ivy-lee") {
      const restantes = Math.max(0, 6 - reorganizadas.length)
      for (let i = 0; i < restantes; i++) {
        const botao = document.createElement("button")
        botao.className = "add-atividade-btn"
        botao.innerHTML = '<span style="font-size: 20px;">+</span> Nova Atividade'
        botao.addEventListener("click", () => criarNovaAtividade(dia))
        conteudoDia.appendChild(botao)
      }
    }

    if (estado.metodoAtivo !== "ivy-lee") {
      const botao = document.createElement("button")
      botao.className = "add-atividade-btn"
      botao.innerHTML = '<span style="font-size: 20px;">+</span> Nova Atividade'
      botao.addEventListener("click", () => criarNovaAtividade(dia))
      conteudoDia.appendChild(botao)
    }
  })

  configurarDragDrop()
}

function obterAtividadesDia(dia) {
  return estado.atividades.filter((t) => t.coluna === dia && t.tipo === estado.tipoCalendario)
}

function reorganizarAtividades(lista) {
  switch (estado.metodoAtivo) {
    case "eisenhower":
      if (estado.ordemOriginalAtividades.length === 0) {
        estado.ordemOriginalAtividades = JSON.parse(JSON.stringify(estado.atividades))
      }
      return [...lista].sort((a, b) => {
        const ordem = { alta: 0, media: 1, baixa: 2 }
        return ordem[a.complexidade] - ordem[b.complexidade]
      })

    case "ivy-lee":
      return [...lista]
        .sort((a, b) => {
          const ordem = { alta: 0, media: 1, baixa: 2 }
          return ordem[a.complexidade] - ordem[b.complexidade]
        })
        .slice(0, 6)

    case "pomodoro":
      return [...lista].sort((a, b) => a.hora.localeCompare(b.hora))

    case "habit-mixing":
      if (estado.tipoCalendario === "pessoal" && estado.habitMixingOriginal.length === 0) {
        estado.habitMixingOriginal = JSON.parse(JSON.stringify(estado.atividades))

        const pessoais = estado.atividades.filter((t) => t.tipo === "pessoal")
        const dias = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]
        const horas = ["08:00", "10:00", "14:00", "16:00", "18:00", "20:00"]

        pessoais.forEach((tarefa) => {
          const diaAleatorio = dias[Math.floor(Math.random() * dias.length)]
          const horaAleatoria = horas[Math.floor(Math.random() * horas.length)]
          const ref = estado.atividades.find((t) => t.id === tarefa.id)
          if (ref) {
            ref.coluna = diaAleatorio
            ref.hora = horaAleatoria
          }
        })

        salvarAtividadesLocal()
      }
      return lista

    default:
      return lista.sort((a, b) => a.hora.localeCompare(b.hora))
  }
}

function criarCardAtividade(atividade) {
  const card = document.createElement("div")
  card.className = "atividade-card"
  if (atividade.completo) card.classList.add("completed")
  card.draggable = true
  card.dataset.atividadeId = atividade.id

  const coresComplexidade = {
    alta: "complexidade-alta",
    media: "complexidade-media",
    baixa: "complexidade-baixa",
  }

  let htmlPomodoro = ""
  if (estado.metodoAtivo === "pomodoro") {
    const tm = estado.temporizadoresPomodoro[atividade.id] || { minutes: 25, seconds: 0, running: false }
    const display = `${String(tm.minutes).padStart(2, "0")}:${String(tm.seconds).padStart(2, "0")}`

    htmlPomodoro = `
      <div class="pomodoro-timer">
        <span class="timer-display">${display}</span>
        <div class="pomodoro-timer-buttons">
          <button class="timer-btn ${tm.running ? "pause" : "start"}" data-atividade-id="${atividade.id}">
            ${tm.running ? "⏸ Pausar" : "▶ Iniciar"}
          </button>
          <button class="timer-btn reset" data-atividade-id="${atividade.id}" data-action="reset">
            ⭯ Reset
          </button>
        </div>
      </div>
    `
  }

  const descricaoHTML = atividade.descricao
    ? `<div class="card-description" style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 0.25rem;">${atividade.descricao}</div>`
    : ""

  card.innerHTML = `
    <div class="card-header">
      <span class="badge ${coresComplexidade[atividade.complexidade]}">${atividade.complexidade}</span>
      <span class="card-time">${atividade.hora}</span>
    </div>
    <div class="card-title">${atividade.titulo}</div>
    ${descricaoHTML}
    ${htmlPomodoro}
  `

  card.addEventListener("click", (e) => {
    if (!e.target.classList.contains("timer-btn")) {
      abrirModalAtividade(atividade)
    }
  })

  const botoes = card.querySelectorAll(".timer-btn")
  botoes.forEach((b) => {
    b.addEventListener("click", (e) => {
      e.stopPropagation()
      if (b.dataset.action === "reset") {
        resetarPomodoro(atividade.id)
      } else {
        alternarPomodoro(atividade.id)
      }
    })
  })

  card.addEventListener("touchstart", iniciarToque, { passive: false })
  card.addEventListener("dragstart", iniciarArrasto)
  card.addEventListener("dragend", finalizarArrasto)

  return card
}

let idArrastada = null

function configurarDragDrop() {
  const conteudos = document.querySelectorAll(".dia-conteudo")

  conteudos.forEach((c) => {
    c.addEventListener("dragover", arrastarSobre)
    c.addEventListener("dragleave", sairArrasto)
    c.addEventListener("drop", soltarArrasto)
  })
}

function iniciarArrasto(e) {
  idArrastada = e.target.dataset.atividadeId
  e.target.style.opacity = "0.5"
}

function finalizarArrasto(e) {
  e.target.style.opacity = "1"
  document.querySelectorAll(".dia-conteudo").forEach((c) => c.classList.remove("drag-over"))
}

function arrastarSobre(e) {
  e.preventDefault()
  e.currentTarget.classList.add("drag-over")
}

function sairArrasto(e) {
  e.currentTarget.classList.remove("drag-over")
}

function soltarArrasto(e) {
  e.preventDefault()
  e.currentTarget.classList.remove("drag-over")

  if (!idArrastada) return

  const dia = e.currentTarget.closest(".dia-coluna").dataset.dia
  const tarefa = estado.atividades.find((t) => t.id === idArrastada)
  if (!tarefa) return

  if (existeConflito(tarefa.hora, dia, tarefa.id)) {
    mostrarErro("Conflito de horário! Já existe uma atividade neste horário (pessoal ou profissional).")
    return
  }

  tarefa.coluna = dia
  salvarAtividadesLocal()
  renderizarCalendario()
  idArrastada = null
}

function existeConflito(hora, dia, ignorarId) {
  return estado.atividades.some((t) => t.coluna === dia && t.hora === hora && t.id !== ignorarId)
}

function mostrarErro(msg) {
  const popup = document.getElementById("erro-popup")
  document.getElementById("mensagem-erro").textContent = msg
  popup.style.display = "flex"

  setTimeout(() => {
    popup.style.display = "none"
  }, 3000)
}

function criarNovaAtividade(dia) {
  const horasExistentes = estado.atividades.filter((t) => t.coluna === dia).map((t) => Number.parseInt(t.hora.split(":")[0]))

  let hora = estado.proximaHoraDisponivel
  while (horasExistentes.includes(hora)) {
    hora++
    if (hora > 22) hora = 8
  }

  estado.proximaHoraDisponivel = hora + 1
  if (estado.proximaHoraDisponivel > 22) estado.proximaHoraDisponivel = 8

  const novaHora = `${String(hora).padStart(2, "0")}:00`

  const nova = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    titulo: "Nova Atividade",
    descricao: "",
    hora: novaHora,
    complexidade: "media",
    tipo: estado.tipoCalendario,
    coluna: dia,
    completo: false,
    data: new Date().toISOString().split("T")[0],
    userId: estado.usuario.id,
  }

  estado.atividades.push(nova)
  salvarAtividadesLocal()
  renderizarCalendario()
  abrirModalAtividade(nova)
}

function abrirModalAtividade(atividade) {
  estado.atividadeEditando = atividade

  document.getElementById("atividade-titulo").value = atividade.titulo
  document.getElementById("atividade-descricao").value = atividade.descricao || ""
  document.getElementById("atividade-time").value = atividade.hora

  document.getElementById("atividade-concluida").checked = atividade.completo

  document.getElementById("atividade-modal").style.display = "flex"

  document.addEventListener("keydown", teclasModal)
}

function fecharModalAtividade() {
  document.getElementById("atividade-modal").style.display = "none"
  estado.atividadeEditando = null
  document.removeEventListener("keydown", teclasModal)
}

function teclasModal(e) {
  if (e.key === "Escape" || e.key === "Enter") {
    e.preventDefault()
    salvarAtividade()
  }
}

function salvarAtividade() {
  if (!estado.atividadeEditando) return

  const titulo = document.getElementById("atividade-titulo").value.trim()
  const descricao = document.getElementById("atividade-descricao").value.trim()
  const hora = document.getElementById("atividade-time").value
  const complexidade = document.querySelector(".botao-complexidade.active")?.dataset.complexidade || "media"
  const concluida = document.getElementById("atividade-concluida").checked

  if (!titulo) {
    mostrarErro("O título da atividade é obrigatório.")
    return
  }

  if (conflitoCalendarios(hora, estado.atividadeEditando.coluna, estado.atividadeEditando.id)) {
    mostrarErro(`Conflito de horário! Já existe uma atividade às ${hora} neste dia.`)
    return
  }

  estado.atividadeEditando.titulo = titulo
  estado.atividadeEditando.descricao = descricao
  estado.atividadeEditando.hora = hora
  estado.atividadeEditando.complexidade = complexidade
  estado.atividadeEditando.completo = concluida

  salvarAtividadesLocal()
  renderizarCalendario()
  fecharModalAtividade()
}

function excluirAtividade() {
  if (!estado.atividadeEditando) return

  estado.atividades = estado.atividades.filter((t) => t.id !== estado.atividadeEditando.id)
  salvarAtividadesLocal()
  renderizarCalendario()
  fecharModalAtividade()
}

function abrirInfo() {
  document.getElementById("info-modal").style.display = "flex"
}

function fecharInfo() {
  document.getElementById("info-modal").style.display = "none"
}

function iniciarChat() {
  estado.mensagens = [
    {
      role: "ai",
      content: "Olá! Sou seu assistente Planum. Posso analisar sua agenda e responder dúvidas sobre suas atividades.",
    },
  ]
  renderizarMensagens()
}

function renderizarMensagens() {
  const area = document.getElementById("chat-area")
  area.innerHTML = estado.mensagens
    .map(
      (msg) => `
        <div class="message ${msg.role}">
          <div class="avatar">${msg.role === "ai" ? "✨" : "👤"}</div>
          <div class="content">${msg.content}</div>
        </div>
      `,
    )
    .join("")

  area.scrollTop = area.scrollHeight
}

async function enviarMensagem() {
  const input = document.getElementById("prompt-input")
  const texto = input.value.trim()
  if (!texto) return

  estado.mensagens.push({ role: "user", content: texto })
  input.value = ""
  input.style.height = "auto"
  renderizarMensagens()

  const botao = document.getElementById("enviar-btn")
  botao.disabled = true

  const resposta = await responderPergunta(texto)
  estado.mensagens.push({ role: "ai", content: resposta })
  renderizarMensagens()

  botao.disabled = false
}

async function responderPergunta(textoUsuario) {
  try {
    const res = await fetch("http://localhost:3000/api/perguntar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pergunta: textoUsuario,
        atividades: estado.atividades
      })
    });

    if (!res.ok) {
      console.error("Erro na resposta do servidor:", res.status)
      return "Erro ao tentar obter resposta do assistente."
    }

    const data = await res.json()
    return data.resposta || "O assistente não respondeu nada."
  } catch (erro) {
    console.error("Erro ao chamar o assistente:", erro)
    return "Erro ao tentar obter resposta do assistente."
  }
}

function alternarPomodoro(id) {
  if (!estado.temporizadoresPomodoro[id]) {
    estado.temporizadoresPomodoro[id] = { minutes: 25, seconds: 0, running: false, interval: null }
  }

  const tm = estado.temporizadoresPomodoro[id]
  tm.running = !tm.running

  if (tm.running) {
    tm.interval = setInterval(() => {
      if (tm.seconds === 0) {
        if (tm.minutes === 0) {
          clearInterval(tm.interval)
          tm.running = false
          mostrarErro("Pomodoro concluído! Hora de uma pausa.")
          renderizarCalendario()
          return
        }
        tm.minutes--
        tm.seconds = 59
      } else {
        tm.seconds--
      }
      renderizarCalendario()
    }, 1000)
  } else {
    if (tm.interval) clearInterval(tm.interval)
  }

  renderizarCalendario()
}

function resetarPomodoro(id) {
  if (estado.temporizadoresPomodoro[id]) {
    if (estado.temporizadoresPomodoro[id].interval) {
      clearInterval(estado.temporizadoresPomodoro[id].interval)
    }
    estado.temporizadoresPomodoro[id] = {
      minutes: 25,
      seconds: 0,
      running: false,
      interval: null,
    }
    renderizarCalendario()
  }
}

function conflitoCalendarios(hora, dia, ignorarId) {
  return estado.atividades.some((t) => t.coluna === dia && t.hora === hora && t.id !== ignorarId)
}

function executarLogout() {
  estado.usuario = null
  document.getElementById("tela-login").style.display = "flex"
  document.getElementById("app-container").style.display = "none"
  document.getElementById("user-name").textContent = ""
}

let toqueY = 0
let toqueX = 0

function iniciarToque(e) {
  if (e.target.classList.contains("timer-btn")) return

  toqueY = e.touches[0].clientY
  toqueX = e.touches[0].clientX
  idArrastada = e.currentTarget.dataset.atividadeId
  e.currentTarget.style.opacity = "0.5"

  e.currentTarget.addEventListener("touchmove", moverToque, { passive: false })
  e.currentTarget.addEventListener("touchend", finalizarToque)
}

function moverToque(e) {
  e.preventDefault()
  const toque = e.touches[0]
  const abaixo = document.elementFromPoint(toque.clientX, toque.clientY)
  const dia = abaixo?.closest(".dia-conteudo")

  if (dia) {
    document.querySelectorAll(".dia-conteudo").forEach((c) => c.classList.remove("drag-over"))
    dia.classList.add("drag-over")
  }
}

function finalizarToque(e) {
  e.currentTarget.style.opacity = "1"
  e.currentTarget.removeEventListener("touchmove", moverToque)
  e.currentTarget.removeEventListener("touchend", finalizarToque)

  const toque = e.changedTouches[0]
  const abaixo = document.elementFromPoint(toque.clientX, toque.clientY)
  const dia = abaixo?.closest(".dia-conteudo")

  document.querySelectorAll(".dia-conteudo").forEach((c) => c.classList.remove("drag-over"))

  if (dia && idArrastada) {
    const diaAlvo = dia.closest(".dia-coluna").dataset.dia
    const tarefa = estado.atividades.find((t) => t.id === idArrastada)

    if (tarefa) {
      if (existeConflito(tarefa.hora, diaAlvo, tarefa.id)) {
        mostrarErro("Conflito de horário! Já existe uma atividade neste horário (pessoal ou profissional).")
      } else {
        tarefa.coluna = diaAlvo
        salvarAtividadesLocal()
        renderizarCalendario()
      }
    }
  }

  idArrastada = null
}