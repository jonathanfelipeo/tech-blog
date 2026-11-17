# Tech Blog — Tech Challenge

Plataforma educacional de postagens com API REST em Node.js, banco PostgreSQL e aplicativo React Native/Expo. A Fase 4 acrescenta uma interface com layout mobile para professores e alunos.

## Arquitetura

- **API (`src/`):** Express organiza as rotas; os controladores validam requisições e acessam o PostgreSQL por consultas parametrizadas. `src/utils/auth.js` implementa hash de senha dos alunos, tokens assinados e autorização por perfil.
- **Banco de dados:** PostgreSQL armazena posts, professores, alunos e comentários. As tabelas são criadas na inicialização da API; o volume Docker mantém os dados entre reinicializações. Comentários pertencem a um post e são excluídos junto com ele. O nome do autor é preservado caso seu cadastro de aluno ou professor seja excluído.
- **Mobile (`mobile/`):** React Native e Expo com componentes funcionais e hooks. React Navigation gerencia as telas; Context API e AsyncStorage mantêm a sessão; Axios comunica-se com a API. A navegação e os formulários usam um layout voltado a dispositivos móveis.
- **Interface web anterior (`frontend/`):** aplicação React/Vite da fase anterior, mantida no repositório. Seu login é simulado e não obtém o token exigido pela API atual; portanto, as operações protegidas não funcionam nela sem integração adicional. Para a Fase 4, use o aplicativo `mobile/`, inclusive para testes no navegador.
- **Infraestrutura e testes:** Docker Compose executa API e banco; Jest e Supertest testam a API. O GitHub Actions instala as dependências da API e executa seus testes em pushes e pull requests para `main`.

### Estrutura principal

```text
src/
  config/        conexão com o banco
  controllers/   regras das requisições
  routes/        endpoints e permissões
  tests/         testes automatizados da API
  utils/         autenticação e autorização
mobile/src/
  api/           chamadas HTTP
  contexts/      sessão de autenticação
  routes/        navegação
  screens/       telas de blog, conta e administração
  types/         tipos TypeScript
frontend/        interface React/Vite da fase anterior
```

## Requisitos da Fase 4

O trabalho solicita uma interface React Native para listar e buscar posts, ler seu conteúdo e permitir a criação, edição e administração de posts por professores autenticados. Também exige telas de cadastro, edição, listagem paginada e exclusão para professores e alunos, integração com os endpoints REST, autorização, documentação e apresentação gravada de até 15 minutos. Comentários são opcionais no enunciado e foram incluídos no projeto.

Regras adotadas pela equipe: visitantes podem ler e buscar posts e ler comentários; alunos e professores autenticados podem comentar. Professores podem editar seus próprios comentários, excluir comentários de qualquer autor e gerenciar posts, professores e alunos. Alunos não administram posts nem comentários. A API valida essas permissões independentemente da navegação.

## Como executar

### Pré-requisitos

- Docker com Docker Compose em execução.
- Node.js e npm para iniciar o aplicativo Expo; a API usa Node.js 20 na imagem Docker.
- Para celular, Expo Go ou ambiente de emulação compatível e acesso à mesma rede da API.

### 1. Configurar e iniciar API e banco

Na raiz, crie um arquivo `.env` com `AUTH_TOKEN_SECRET` definido como um valor aleatório longo; por exemplo, gere o valor com `openssl rand -hex 32`. Não compartilhe nem versione o arquivo. O Docker Compose configura a conexão da API ao banco.

```bash
docker compose up --build -d
docker compose ps
curl http://localhost:3000/posts
```

Uma lista vazia (`[]`) é esperada quando não há posts. Se a API iniciar antes de o banco estar pronto, verifique `docker compose logs api` e, após o PostgreSQL estar disponível, execute `docker compose restart api`. Se houver conflito de nomes ou portas, identifique os contêineres existentes antes de pará-los ou removê-los; não remova volumes para resolver conflitos.

### 2. Iniciar o aplicativo

Em outro terminal:

```bash
cd mobile
npm ci
npm run web
```

Abra no navegador o endereço informado pelo Expo, normalmente `http://localhost:8081`. Mantenha esse terminal aberto. Para encerrar, use `Ctrl+C`.

Para testar em um dispositivo, use `npm start` e siga as instruções do Expo. A URL da API em `mobile/src/api/client.ts` é `http://localhost:3000`: no celular físico, troque `localhost` pelo IP local do computador e garanta acesso à porta 3000; no emulador Android, geralmente use `10.0.2.2`. No navegador do mesmo computador, `localhost` é adequado.

### Interface web anterior

Opcionalmente, execute `npm ci` e `npm run dev` dentro de `frontend/`; o Vite usa a porta 5173. Essa interface é histórica e seu login simulado não autoriza as operações protegidas da API atual.

## Guia de uso do aplicativo

1. Em **Blog**, qualquer visitante pode listar, buscar e abrir posts. A leitura mostra o conteúdo e os comentários.
2. Em **Login**, selecione **Professor**. Em um banco novo, a API cria um professor de desenvolvimento com e-mail `admin@fiap.com.br` e senha `123456`. São credenciais inseguras e servem somente para teste local.
3. Como professor, use **Gerenciar Posts** para criar, editar e excluir posts; use **Professores** e **Alunos** para cadastrar, editar, listar com paginação e excluir cadastros.
4. Ao cadastrar um aluno, informe uma senha inicial de pelo menos seis caracteres. Para alterá-la, edite seu cadastro. Cadastros antigos sem senha precisam receber uma antes do primeiro login.
5. Em **Minha conta**, saia da conta de professor. Entre como **Aluno** com os dados cadastrados, abra um post e envie um comentário. Após recarregar ou reabrir o post, o comentário continuará disponível.
6. Entre novamente como **Professor** para enviar comentários, editar os próprios e excluir comentários de qualquer autor. Visitantes podem ler comentários, mas não enviá-los ou alterá-los.

O token de sessão é assinado e expira após 24 horas. Caso uma ação falhe por sessão expirada, saia e entre novamente. Não há revogação automática de tokens ao excluir usuários ou alterar senhas; senhas de professores ainda são armazenadas em texto puro. A implementação atual é destinada a aprendizado, não a produção.

### API principal

| Método e rota | Acesso | Uso |
|---|---|---|
| `GET /posts`, `GET /posts/search?term=...`, `GET /posts/:id` | Público | Listar, buscar e ler posts |
| `POST /posts`, `PUT /posts/:id`, `DELETE /posts/:id` | Professor | Criar, editar e excluir posts |
| `GET /posts/:id/comments` | Público | Listar comentários |
| `POST /posts/:id/comments` | Aluno ou professor | Enviar `{ "text": "..." }` |
| `PUT /posts/:id/comments/:commentId` | Professor | Editar o texto de seu próprio comentário |
| `DELETE /posts/:id/comments/:commentId` | Professor | Excluir qualquer comentário do post |
| `POST /teachers/login`, `POST /students/login` | Público | Autenticar com e-mail e senha |
| `GET /teachers`, `GET /teachers/:id`, `POST /teachers`, `PUT /teachers/:id`, `DELETE /teachers/:id` | Professor | Gerenciar professores |
| `GET /students`, `GET /students/:id`, `POST /students`, `PUT /students/:id`, `DELETE /students/:id` | Professor | Gerenciar alunos |

Nas rotas protegidas, envie o token retornado no login no cabeçalho `Authorization: Bearer <token>`. As listagens de professores e alunos aceitam `page` e `limit`.

### Testes automatizados

Na raiz, execute `npm ci` e `npm test`. Para verificar os tipos do aplicativo, execute `npx tsc --noEmit` dentro de `mobile/`, após instalar suas dependências.

## Relato de experiências e desafios

O desenvolvimento deste projeto representou um divisor de águas e um marco prático fundamental nesta etapa da pós-graduação. Vindo de uma bagagem tecnológica focada na agilidade do desenvolvimento low-code, trabalhando com arquiteturas visuais como o OutSystems, o desafio foi justamente o desapego dessas automações para mergulhar nos fundamentos estruturais da engenharia de software tradicional.

Compreender com exatidão como os pools de conexão são gerenciados, como tratar erros 500 para não vazar dados sensíveis, e como as persistências realmente ocorrem no nível do PostgreSQL trouxe uma clareza que plataformas de alto nível frequentemente mascaram.

Outro desafio considerável esteve ligado à infraestrutura e integração. Orquestrar a aplicação no Docker exigiu entender como volumes persistentes funcionam na prática. Além disso, a configuração do pipeline de CI/CD esbarrou em conflitos de histórico no controle de versão, o que forçou o aprofundamento em resoluções de conflitos e estratégias de mesclagem (merge vs rebase).

Superar esses obstáculos manuais não apenas consolidou a entrega rigorosa e 100% funcional exigida no Tech Challenge, mas também forjou uma compreensão realista, robusta e muito mais crítica do desenvolvimento fullstack.

Na Fase 4, o desafio foi a integração da interface React Native com a API existente e a distinção entre as permissões de visitantes, professores e alunos. A persistência de comentários exigiu relacionar posts e alunos no banco e tratar os efeitos da exclusão de cadastros.