![Planum](./banner.png)

**[Site](https://z4ffarani-planum.vercel.app) · [Publicação](https://www.linkedin.com/posts/kaique-zaffarani_html-css-javascript-activity-7398508664136962048-vZGE)**

Planum é um protótipo de plataforma de gerenciamento de tarefas, desenvolvido com HTML, CSS e JavaScript. Ele reúne diferentes métodos de produtividade, dois calendários independentes (profissional e pessoal) e um assistente de IA que fornece respostas baseadas nas atividades cadastradas.

A interface foi desenvolvida com foco total em clareza e eficiência. É possível criar, editar, mover, reorganizar e concluir atividades utilizando drag and drop nativo. Cada elemento foi desenhado para favorecer a usabilidade: botões destacados, colunas diárias, modal de edição, marcações de conclusão e mensagens de conflito de horário. O chatbot interno acrescenta suporte interativo para consultas rápidas sobre sua agenda.

O layout é totalmente responsivo, adaptando-se a qualquer tamanho de tela. No desktop, a sidebar é flexível e o calendário aparece em sete colunas completas; em dispositivos móveis, menus tornam-se retráteis, o calendário recebe scroll horizontal e os ícones assumem papel central na navegação. A paleta escura com acentos em azul reforça a identidade visual e mantém o contraste adequado em todas as resoluções.

O objetivo principal do Planum é oferecer uma ferramenta simples para organização pessoal, permitindo que o usuário visualize rotinas, experimente diferentes métodos de gerenciamento de tempo e teste novas formas de lidar com suas atividades diárias.

---

## Funcionalidades

- **Gerenciamento de atividades** | Criação, exclusão, edição, conclusão e definição de complexidade e horário.
- **Drag and drop nativo** | Movimentação livre entre dias da semana, com feedback visual.
- **Detecção de conflitos** | Identificação automática de sobreposição de horários entre calendários pessoal e profissional, exibindo alertas claros.
- **Assistente de IA** | Chat de conversa dedicado a consultas sobre suas atividades utilizando a [API do Google Gemini](https://aistudio.google.com/).
- **Métodos de produtividade** | Reorganização visual com base na metodologia escolhida.
- **Sessão informativa** | Explicações rápidas sobre cada método de produtividade.
- **Responsividade** | Ajustes automáticos para desktop, tablet e mobile.

---

## Métodos de produtividade

Reorganização visual dinâmica conforme a técnica escolhida:

| Método | Como funciona |
|---|---|
| **Pomodoro** | Organização baseada em blocos de foco temporizando atividades |
| **Eisenhower** | Priorização por complexidade alta, média ou baixa |
| **Ivy Lee** | Convite para criação adiantada de seis tarefas em cada dia |
| **Habit Mixing** | Reorganização aleatória de atividades no calendário pessoal incentivando novas rotinas |

> Os métodos servem apenas como referência visual. Nenhum deles substitui orientação profissional ou garante resultados específicos. Cada usuário possui sua própria forma de adaptação às rotinas.

---

## Arquitetura

```
Planum/
├── front-end/   — interface estática (HTML, CSS, JavaScript) e dados de exemplo (JSON)
├── api/         — função serverless que consulta o Google Gemini (POST /api/perguntar)
└── vercel.json  — rotas: /api/* para a função e o restante para o front-end
```

---

## Como executar

### Pré-requisitos
- Node.js e **[Vercel CLI](https://vercel.com/docs/cli)**
- Uma chave da **[API do Google Gemini](https://aistudio.google.com/)** (necessária apenas para o assistente de IA)

```bash
git clone https://github.com/Z4ffarani/Planum.git
cd Planum/api
npm install
cd ..

# Crie o arquivo .env com a sua chave
echo "GOOGLE_API_KEY=sua_chave" > .env

vercel dev
```

Acesse o endereço exibido pelo `vercel dev` (por padrão, `http://localhost:3000`).

---

## Termos de uso

### Aceitação dos termos
- Ao utilizar o site Planum, o usuário concorda com estes termos de uso, que podem ser alterados sem aviso prévio. O uso contínuo indica aceitação das atualizações.

### Natureza do serviço
- Planum é um **protótipo experimental**, criado apenas para fins demonstrativos.
- Não deve ser utilizado como ferramenta oficial de gestão profissional ou substituto de orientação especializada.

### Ausência de persistência e riscos
- As atividades e dados registrados são armazenados unicamente no **navegador do usuário (LocalStorage)**.
- Limpezas do navegador, uso em modo anônimo ou erros locais podem ocasionar perda total das informações.
- O site **não armazena** dados em servidor e **não possui backup**.

### Responsabilidade do usuário
- Toda organização exibida no Planum reflete exclusivamente o que o próprio usuário registra.
- O site não recomenda, valida, julga, revisa ou garante a eficácia das atividades reorganizadas pelo sistema.
- O usuário é o único responsável por seguir, adaptar ou ignorar qualquer método ou estrutura exibida.

### Métodos de produtividade
- As metodologias integradas são apenas **sugestões visuais**.
- O Planum **não garante resultados**, pois estratégias de rotina variam entre indivíduos.

### Limitações de responsabilidade
- O site não se responsabiliza por danos diretos ou indiretos, perdas, atrasos, falhas, erros de organização ou decisões tomadas com base nas informações exibidas.
- O uso é feito integralmente sob responsabilidade do usuário.

### Privacidade e dados pessoais
- O site não coleta, armazena ou compartilha dados pessoais em servidores externos.
- Todo processamento acontece localmente no navegador.

### Propriedade intelectual
- Design, textos, interface, imagens e marca Planum são de uso exclusivo do projeto, salvo indicação contrária.
- É proibida a reprodução parcial ou total sem autorização.

### Conteúdo de terceiros (IA)
- O chatbot utiliza lógica interna simulada. Para utilizar as funcionalidades do chatbot via API externa, você deve fornecer sua própria chave de API. O Planum não se responsabiliza por respostas, erros ou interpretações produzidas por serviços de terceiros.

### Alterações no serviço
- Funcionalidades podem ser adicionadas, removidas ou modificadas sem aviso prévio.

### Exclusão de garantias
- O funcionamento contínuo do site não é garantido. Podem ocorrer instabilidades, falhas, indisponibilidade temporária ou permanente.

---

## Tecnologias

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/CSS-1572B6?style=flat-square&logo=css&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Node.js](https://img.shields.io/badge/Node.js-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=flat-square&logo=googlegemini&logoColor=white)](https://aistudio.google.com)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)
