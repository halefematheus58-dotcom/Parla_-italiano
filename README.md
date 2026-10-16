# Italiano Academy — projeto inicial

Um protótipo responsivo de plataforma de estudos de italiano com:
- Cadastro e login por e-mail e senha com Supabase Auth.
- Recuperação de senha por e-mail.
- Salvamento online de XP, nível, sequência e lições concluídas.
- Lições interativas de exemplo e feedback de respostas.
- Interface responsiva para computador e celular.

## 1. Criar o backend gratuito
1. Crie um projeto em https://supabase.com/
2. No painel do projeto, abra **Project Settings → API** (ou **Connect**) e copie a Project URL e a chave pública/anon.
3. Abra `app.js` e substitua:
   - `COLE_A_URL_DO_SEU_PROJETO_SUPABASE`
   - `COLE_A_CHAVE_ANON_PUBLICA_DO_SEU_PROJETO`
4. A chave pública/anon pode estar no frontend quando o banco usa RLS corretamente. **Nunca coloque uma chave `service_role` no navegador.**

## 2. Criar a tabela de progresso
1. No Supabase, abra **SQL Editor → New query**.
2. Copie e execute todo o conteúdo de `supabase-schema.sql`.
3. Em **Authentication → URL Configuration**, configure a URL do seu site.
4. Durante testes, você pode desativar a confirmação de e-mail em **Authentication → Providers → Email**. Para uso real, prefira manter a confirmação ativa e configurar os e-mails.

## 3. Executar o site
Como os arquivos usam JavaScript no navegador, é melhor servir a pasta por um servidor local. Se tiver VS Code, instale a extensão Live Server e abra `index.html` com ela. Também pode publicar a pasta em um serviço de hospedagem estática HTTPS, como Netlify ou Vercel.

## Observações
- O projeto ainda é um protótipo inicial, não uma cópia do Duolingo.
- As lições e as respostas são exemplos didáticos; adicione mais conteúdo e revisão pedagógica antes de lançar.
- O streak conta dias em que uma lição é concluída, não apenas quando o usuário entra.
- Para produção, valide a lógica de XP e sequência no servidor/banco de dados, porque neste protótipo o navegador calcula esses valores.
- Configure as URLs de redirecionamento do Supabase para que a recuperação de senha funcione no endereço publicado.


## Trilha de 60 atividades
O projeto contém 60 atividades organizadas em 7 dias (9, 9, 9, 9, 8, 8 e 8 atividades). Cada atividade tem três perguntas em níveis Fácil, Médio e Difícil. O progresso tenta salvar no Supabase e mantém uma cópia local por usuário como alternativa.

### Importante ao atualizar
Se você já colocou sua URL e chave pública do Supabase no seu `app.js` antigo, copie esses dois valores para o novo `app.js` após extrair este ZIP. Use somente a chave pública/anon ou publishable; nunca use `service_role` ou outra chave secreta no navegador. Não precisa executar o SQL novamente se a tabela `progress` já existe.
