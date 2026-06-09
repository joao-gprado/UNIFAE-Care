# UNIFAE Care 🏥📱

O **UNIFAE Care** é um aplicativo móvel voltado para o acompanhamento e cuidado com pacientes, permitindo que eles tenham acesso a um plano de exercícios, registrem a evolução de suas dores diárias e mantenham-se motivados por meio de um sistema de progresso e notificações inteligentes.

Este projeto foi desenvolvido utilizando tecnologias modernas para desenvolvimento de aplicativos móveis multiplataforma.

---

## 🚀 Tecnologias e Bibliotecas Utilizadas

- **[React Native](https://reactnative.dev/):** Framework base para a construção das interfaces.
- **[Expo](https://expo.dev/):** Plataforma e conjunto de ferramentas para acelerar o desenvolvimento React Native.
- **[React Navigation](https://reactnavigation.org/):** Gerenciamento de rotas e navegação entre telas (Stack e Tabs).
- **[AsyncStorage](https://react-native-async-storage.github.io/async-storage/):** Armazenamento local de dados sensíveis e cache do app (como o *Token* de acesso).
- **[Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/):** Agendamento e envio de notificações locais (lembretes para a realização de atividades diárias).
- **[Expo Image Picker](https://docs.expo.dev/versions/latest/sdk/imagepicker/):** Integração com a câmera e galeria do dispositivo para personalização do perfil do usuário.

---

## ✨ Principais Funcionalidades

1. **Autenticação Segura:** Login no aplicativo com persistência de sessão e validação de "Termo de Consentimento" obrigatório.
2. **Dashboard de Acompanhamento (Home):**
   - **Metas Semanais:** Visualização do percentual de exercícios concluídos através de barras de progresso interativas.
   - **Alertas de Dor:** Sistema para registrar e verificar dores diárias do usuário, gerando dados para o fisioterapeuta responsável.
   - **Assistente Robô Motivacional:** Exibe mensagens dinâmicas para engajar o usuário todos os dias.
3. **Plano de Exercícios:** Detalhamento do exercício atual e controle de quais atividades já foram realizadas no plano de prescrição.
4. **Sistema de Perfil Dinâmico:** Conexão do paciente com o fisioterapeuta e coordenador responsável, permitindo envio direto de e-mail e customização de foto de perfil.
5. **Notificações Inteligentes:** Sistema de "Streak" (dias consecutivos de uso) e lembretes para manter o usuário aderente ao plano de cuidados.

---

## 📂 Estrutura do Projeto

O código-fonte está estruturado e modularizado dentro do diretório `/src` para facilitar a escalabilidade:

```text
📦 UNIFAE-Care
 ┣ 📂 assets/              # Imagens, ícones e fontes estáticas do aplicativo
 ┣ 📂 src/
 ┃ ┣ 📂 components/        # Componentes visuais reutilizáveis (Cards, Skeleton, Botões, etc.)
 ┃ ┣ 📂 navigation/        # Configuração das rotas e das "Tabs" inferiores
 ┃ ┣ 📂 screens/           # As telas principais do aplicativo (Login, Home, Profile, etc.)
 ┃ ┣ 📂 services/          # Arquivos de comunicação externa (ex: api.js conectando ao Backend)
 ┃ ┣ 📂 data/              # Dados mockados ou helpers locais do projeto
 ┃ ┗ 📜 theme.js           # Tokens de estilização global (cores, espaçamentos, tamanhos)
 ┣ 📜 App.js               # Ponto de entrada (Entrypoint) principal do aplicativo
 ┗ 📜 package.json         # Configurações de dependências e scripts do projeto
```

---

## 🛠️ Como Executar o Projeto Localmente

### Pré-requisitos

- Ter o **[Node.js](https://nodejs.org/en/)** instalado na máquina.
- Ter o aplicativo **Expo Go** instalado no seu smartphone (disponível na App Store ou Google Play), OU utilizar um Emulador Android/iOS configurado no computador.

### Passo a Passo

**1. Clone o repositório:**

```bash
git clone <URL_DO_REPOSITORIO>
cd UNIFAE-Care-main
```

**2. Instale as dependências:**

```bash
npm install
```

**3. Inicie o servidor de desenvolvimento:**

```bash
npx expo start
```

**4. Acesse o App:**

- Com o servidor rodando, um QR Code será exibido no terminal.
- Abra o app **Expo Go** no seu celular e escaneie o código.
- *(Opcional)* Pressione `a` no terminal para rodar em um Emulador Android, ou `i` para o Simulador iOS.

---

## 📝 Observações e Boas Práticas Adotadas

- **Componentização:** Padrões de design modernos no React usando hooks (`useState`, `useEffect`, `useCallback`, `useRef`).
- **Melhorias Visuais:** Uso do `KeyboardAvoidingView` para adaptação automática do teclado e componentes de estado vazio (como o Skeleton) para melhorar a experiência enquanto os dados da internet são baixados.

---

> Desenvolvido como projeto acadêmico para acompanhamento e suporte de fisioterapia.
