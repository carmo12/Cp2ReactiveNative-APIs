# TVmaze App

Aplicativo React Native (Expo) que consome a API pública [TVmaze](https://www.tvmaze.com/api) para listar séries e exibir os episódios de cada uma.

Projeto desenvolvido para o CheckPoint 3: Manipulação de dados JSON via API com React Native.

## Funcionalidades

- **Tela inicial:** lista as séries obtidas em `https://api.tvmaze.com/shows`, com imagem e nome.
- **Tela de detalhe:** abre ao tocar em uma série e lista os episódios obtidos em `https://api.tvmaze.com/shows/{id}/episodes`, com temporada, número e nome.
- **Sinopse do episódio:** ao tocar em um episódio, a sinopse é exibida e traduzida para o português.
- **Carregamento e erros:** `ActivityIndicator` durante o carregamento e mensagem de erro caso a requisição falhe.
- **Dados nulos:** séries sem imagem mostram um espaço reservado, e episódios sem número aparecem como "Especial".

## Tecnologias

- React Native com Expo
- React Navigation (`@react-navigation/native` e `@react-navigation/native-stack`)
- `FlatList`, `useState` e `useEffect`
- `fetch` com `async/await` e `try/catch/finally`

## Estrutura do projeto

```
.
├── App.js                  # Configuração da Stack Navigation
├── index.js
├── package.json
└── screens
    ├── HomeScreen.js       # Listagem de séries
    └── DetailScreen.js     # Episódios da série selecionada
```

## Como executar

1. Instale as dependências:
   ```
   npm install
   ```
2. Inicie o projeto:
   ```
   npx expo start
   ```
3. Abra no celular com o app **Expo Go** (lendo o QR code) ou em um emulador.

O projeto também pode ser executado no [Expo Snack](https://snack.expo.dev).

## APIs utilizadas

| Finalidade | Endpoint |
|---|---|
| Lista de séries | `https://api.tvmaze.com/shows` |
| Episódios de uma série | `https://api.tvmaze.com/shows/{id}/episodes` |
| Tradução da sinopse | `https://api.mymemory.translated.net/get` |

## Autor

Substitua pelo seu nome e turma.
