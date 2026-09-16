Tech Challenge - Frontend do Blog

Este repositório contém a interface gráfica (Front-end) desenvolvida em React para a aplicação de blog dinâmico, referente à Fase 03 do Tech Challenge da pós-graduação em Full Stack Development.

O objetivo desta interface é proporcionar uma experiência de usuário ágil, responsiva e acessível, permitindo que alunos leiam as postagens e docentes (autenticados) gerenciem o conteúdo do blog através do consumo de uma API REST (Node.js).

Tecnologias Utilizadas

O projeto foi construído utilizando as seguintes tecnologias e bibliotecas:

*   **React:** Biblioteca JavaScript para construção de interfaces de usuário utilizando componentes funcionais e hooks.
*   **Vite:** Ferramenta de build utilizada para inicializar e empacotar o projeto.
*   **React Router Dom:** Gerenciamento de rotas e navegação na SPA (Single Page Application).
*   **Styled Components:** Biblioteca para estilização CSS-in-JS, garantindo escopo local e facilitando a criação de layouts responsivos.
*   **Axios:** Cliente HTTP baseado em Promises para realizar a comunicação e consumo dos endpoints REST do Back-end.
*   **Context API:** Gerenciamento de estado global nativo do React, utilizado neste projeto para controlar o fluxo de autenticação e autorização (Sessão do Professor).

Arquitetura da Aplicação

A estrutura de pastas dentro do diretório `src/` foi organizada para manter a escalabilidade e a separação de responsabilidades:

*   **`/components`**: Contém componentes visuais reaproveitáveis e estruturais.
*   **`/pages`**: Agrupa as telas completas mapeadas nas rotas da aplicação.
*   **`/services`**: Responsável pela configuração de comunicação.
*   **`/context`**: Armazena a lógica de estado global da aplicação.

Setup Inicial

Siga o passo a passo abaixo para rodar o projeto localmente na sua máquina:

Pré-requisitos
*   [Node.js](https://nodejs.org/) (versão 16 ou superior)
*   O back-end do projeto (Node.js/Express) deve estar rodando localmente, preferencialmente na porta `3000`.

Instalação e Execução

1. Abra o terminal e navegue até a pasta do frontend:
   ```bash
   cd frontend
   ```

2. Instale todas as dependências do projeto:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse a aplicação no seu navegador através do link gerado no terminal (geralmente `http://localhost:5173`).

*(Nota: Certifique-se de que a URL base no arquivo `src/services/api.js` está apontando para a porta correta do seu back-end).*

Guia de Uso

A aplicação é dividida em duas áreas principais:

1. Área Pública (Estudantes e Visitantes)
*   **Página Principal (`/`):** Exibe a lista de todos os posts disponíveis. Possui um campo de busca que filtra os artigos em tempo real por título ou conteúdo.
*   **Leitura de Post (`/post/:id`):** Ao clicar em "Ler mais" em um card, o usuário é direcionado para a página de leitura onde o conteúdo completo do post selecionado é exibido.

2. Área Administrativa (Professores/Docentes)
*   **Login (`/login`):** Tela de autenticação. Apenas usuários logados podem acessar o painel administrativo.
*   **Painel Admin (`/admin`):** Lista todos os posts em formato de tabela. A partir daqui, o professor pode gerenciar o conteúdo.
*   **Criar Postagem (`/admin/novo`):** Formulário para inserir um novo artigo (Título, Autor e Conteúdo).
*   **Editar Postagem (`/admin/editar/:id`):** Formulário que já vem preenchido com os dados atuais do post selecionado, permitindo a atualização das informações.
*   **Excluir:** Botão de ação rápida no painel admin para deletar uma postagem definitivamente do banco de dados (exige confirmação).