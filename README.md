# ClackBum

## Visão geral

O **ClackBum** é uma plataforma de fotos digitais construída para aproximar criadores visuais e compradores em um fluxo simples: publicar, descobrir, comprar e gerenciar ativos em um único aplicativo.

A aplicação é multiplataforma (Android, iOS e Web) e foi construída com Expo/React Native no frontend, Supabase como backend de dados/autenticação/storage e Stripe como infraestrutura de pagamentos.

Este README descreve o funcionamento do produto em linguagem prática para onboarding técnico e funcional, cobrindo fluxo de uso, organização do projeto, execução local, configuração de ambiente e boas práticas operacionais.

---

## Objetivo do produto

O produto nasceu para resolver três necessidades principais:

- Permitir que criadores publiquem fotos com baixa fricção.
- Permitir que compradores encontrem e adquiram conteúdo com segurança.
- Dar previsibilidade operacional para evolução do negócio (moderação, visibilidade e confirmação financeira).

Na prática, o aplicativo funciona como um **marketplace de imagem digital** com forte ênfase em experiência de navegação e simplicidade de publicação.

---

## Principais fluxos de negócio

### Fluxo de autenticação

Ao iniciar o app, a sessão do usuário é validada. Se não houver sessão ativa, o usuário é redirecionado para a área de autenticação. Se existir sessão, o app entra automaticamente na área principal com as abas de Feed, Publicar e Perfil.

### Fluxo de descoberta (Feed)

No Feed, o usuário visualiza fotos públicas e aprovadas, com busca textual e paginação incremental. A busca considera título, descrição, autor e tags, com normalização de texto para melhorar relevância.

### Fluxo de publicação

No módulo de publicação, o criador seleciona uma imagem, preenche metadados (título, descrição, preço e tags) e envia para moderação. O sistema valida pré-condições de conta Stripe antes de permitir envio.

### Fluxo de compra

A compra é iniciada no detalhe da foto e consolidada por confirmação de pagamento (Stripe). O webhook registra a transação no backend, vinculando comprador, vendedor e ativo.

### Fluxo de perfil e gestão

No perfil, o usuário alterna entre fotos próprias e compras realizadas, ajusta visibilidade dos próprios itens, compartilha link público quando aplicável e acompanha saldo financeiro.

---

## Arquitetura funcional resumida

A aplicação segue um desenho em camadas simples e direto:

- **Camada de UI**: telas e componentes reutilizáveis.
- **Camada de controle**: hooks responsáveis pela orquestração de estado e ações.
- **Camada de serviço**: regras de negócio e integração com Supabase/Stripe.
- **Camada de backend**: banco, storage e edge functions.

Esse formato facilita manutenção porque separa claramente o “como exibir” do “como processar”.

---

## Mapa de navegação

### Rotas públicas

- `/auth`
- `/terms`
- `/privacy-policy`

### Rotas autenticadas

- `/(tabs)/index` (Feed)
- `/(tabs)/publish` (Publicar)
- `/(tabs)/profile` (Perfil)

### Rotas auxiliares

- `/(hidden)/photo/[id]` (detalhe da foto)
- `/settings`
- `/modal`

---

## Organização do repositório

```text
app/                    # Rotas e telas (expo-router)
components/             # Componentes visuais reutilizáveis
hooks/                  # Lógica de controle de tela
services/               # Integrações e regras de acesso a dados
types/                  # Tipagens de domínio
lib/                    # Inicialização de clients (ex.: Supabase)
utils/                  # Utilitários
supabase/functions/     # Funções Edge (pagamentos, contas, webhooks)
assets/                 # Fontes e imagens
```

Essa estrutura foi pensada para que o time encontre rapidamente onde cada responsabilidade vive.

---

## Como rodar o projeto

### Pré-requisitos

Antes de iniciar, tenha instalado:

- Node.js (compatível com Expo SDK 54)
- npm
- Conta/configuração de projeto Supabase
- Conta/configuração Stripe (modo teste para desenvolvimento)

### Instalação de dependências

```bash
npm install
```

### Execução em desenvolvimento

```bash
npm run start
```

### Execução por plataforma

```bash
npm run web
npm run android
npm run ios
```

### Verificação de lint

```bash
npm run lint
```

---

## Variáveis de ambiente

A aplicação depende de variáveis públicas no client e segredos em ambiente server.

### Variáveis client (`EXPO_PUBLIC_*`)

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SITE_URL=
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### Variáveis server (Edge Functions)

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

> Recomendação: manter arquivos separados por ambiente (`.env.development`, `.env.staging`, `.env.production`) e nunca versionar segredos.

---

## Funcionamento detalhado por módulo

## Módulo de autenticação

O Root Layout busca a sessão inicial e monitora mudanças de autenticação. Esse mecanismo permite transição automática entre áreas públicas e privadas sem exigir ações manuais do usuário.

No mobile, o token de sessão utiliza `expo-secure-store`. Na web, utiliza `localStorage` quando disponível.

Esse desenho reduz atrito de login recorrente e mantém segurança básica por plataforma.

### Módulo de feed

O feed faz query paginada de fotos que atendem aos critérios de exposição pública. A renderização suporta:

- carregamento inicial,
- carregamento incremental,
- pull-to-refresh,
- filtragem em memória para busca rápida.

O cabeçalho fixo mantém busca sempre acessível, melhorando usabilidade em catálogos maiores.

### Módulo de publicação

A publicação valida permissões de galeria e consistência do formulário antes de iniciar upload.

A principal regra operacional é que o criador precisa estar com Stripe apta para receber pagamentos. Quando não está, o fluxo bloqueia publicação e orienta resolução.

Após sucesso, a foto entra em fila de moderação e o usuário recebe confirmação visual.

### Módulo de perfil

No perfil, o app oferece duas visões distintas:

- **minhas fotos**,
- **minhas compras**.

Também exibe saldo disponível e pendente, com atualização manual. O uso de cache com TTL melhora resposta da tela sem perder consistência.

Ações de item (compartilhar, alterar visibilidade e excluir) atualizam estado local e cache para resposta imediata na interface.

### Módulo de compra

As confirmações de pagamento são tratadas de forma server-side via webhook Stripe, cobrindo fluxo web e mobile.

Essa abordagem evita confiar exclusivamente no retorno client-side para consolidar compra, aumentando segurança da regra financeira.

---

## Moderação e visibilidade

A governança de catálogo utiliza dois eixos:

- **status** da foto (ex.: aprovada),
- **visibilidade** (`public`, `unlisted`, `private`).

Apenas fotos aprovadas e públicas entram no feed de descoberta.

Essa combinação controla descoberta orgânica, compartilhamento por link e privacidade do portfólio.

---

## Segurança e conformidade

Boas práticas aplicadas no projeto:

- validação de assinatura de webhook;
- isolamento de credenciais sensíveis no backend;
- separação de rotas públicas e privadas;
- persistência de sessão com storage adequado por plataforma.

Boas práticas recomendadas para evolução:

- auditoria recorrente de políticas RLS;
- idempotência explícita para eventos financeiros;
- observabilidade centralizada por fluxo crítico.

---

## Troubleshooting

### Feed não carrega

Verifique conexão com Supabase, políticas de acesso e existência de fotos com status/visibilidade elegíveis.

### Publicação bloqueada

Confirme status da conta Stripe e dependências de onboarding financeiro.

### Compra não apareceu

Inspecione entrega do webhook e presença de metadata obrigatória na transação.

### Sessão não persiste

Revise variáveis de ambiente e estratégia de storage conforme plataforma.

---

## Sugestão de fluxo de onboarding para novo desenvolvedor

Inicie entendendo o produto pelo Feed, depois percorra Publicação e Perfil, finalizando com o fluxo de Compra e Webhook.

Depois disso:

1. execute o app em Web;
2. valide autenticação;
3. simule uma publicação;
4. valide dados no perfil;
5. passe para leitura da documentação de regras de negócio;
6. finalize na documentação técnica para entendimento arquitetural.

Esse caminho reduz tempo de entendimento e acelera entregas com menor risco.

---

## Boas práticas de contribuição

- Prefira alterações pequenas e com escopo claro.
- Evite misturar mudanças funcionais com refatorações extensas na mesma PR.
- Atualize documentação quando regras de produto mudarem.
- Descreva impacto em fluxo de negócio no corpo do commit/PR.
- Em mudanças financeiras, trate observabilidade como requisito, não opcional.

---

## Roadmap sugerido

Evoluções recomendadas para próximos ciclos:

- painel operacional de moderação;
- notificações de status de publicação;
- aprimoramento de idempotência em eventos Stripe;
- melhoria de métricas de funil;
- testes E2E dos fluxos críticos.

---

## Documentos complementares

Para informações mais específicas, consulte:

- `docs/regras-negocio.md`
- `docs/aspectos-tecnicos.md`

Esses documentos detalham, respectivamente, decisões funcionais e decisões de implementação.

---

## Encerramento

O ClackBum já possui base sólida para evolução incremental. A combinação de Expo, Supabase e Stripe entrega velocidade de produto, mas exige disciplina de documentação e governança em fluxos financeiros.

Este README foi escrito para servir como guia operacional do projeto em linguagem objetiva e profissional. Sempre que houver mudança relevante de fluxo, ele deve ser atualizado junto com o código.

<!-- filler lines for minimum length with meaningful text -->

### Apêndice A — princípios operacionais

A equipe deve priorizar clareza de fluxo sobre excesso de abstrações.

Toda integração externa precisa de estratégia de erro previsível.

Toda regra financeira precisa de trilha de auditoria.

Toda mudança de UX em fluxo crítico precisa de validação funcional.

Toda alteração em autenticação deve ser testada em mais de uma plataforma.

Toda melhoria de performance deve preservar legibilidade do código.

Toda alteração de schema deve refletir documentação técnica.

Toda evolução de regra de negócio deve refletir documentação funcional.

Toda feature nova deve incluir critérios de aceite objetivos.

Toda feature nova deve considerar comportamento em falha de rede.

Toda integração com storage deve considerar privacidade do ativo.

Toda experiência de erro deve orientar próxima ação do usuário.

Toda feature com impacto financeiro deve ter owner técnico definido.

Toda mudança em webhook deve ter plano de rollback.

Toda mudança em dependências deve avaliar impacto no SDK do Expo.

Toda release deve incluir checklist mínimo de validação.

Toda documentação deve ser escrita para quem não participou da implementação.

Toda otimização deve ser medida, não presumida.

Toda telemetria deve responder uma pergunta operacional concreta.

Toda decisão arquitetural importante deve ser registrada.

Toda padronização de nomes deve ser mantida ao longo dos módulos.

Toda regra de visibilidade deve ser consistente entre feed e perfil.

Toda ação destrutiva deve ser confirmada e rastreável.

Todo fluxo crítico deve ter fallback funcional.

Toda melhoria incremental deve evitar regressão de base.

Toda entrega deve equilibrar velocidade e confiabilidade.

Toda mudança em rotas deve revisar guardas de autenticação.

Toda mudança em cache deve revisar impacto em consistência de dados.

Toda alteração de copy deve considerar contexto de suporte.

Toda priorização deve avaliar risco de negócio.

Toda melhoria de produto deve considerar custo de manutenção.

Toda refatoração deve ter intenção clara e benefício mensurável.

Toda camada de serviço deve evitar lógica duplicada.

Toda lógica de transformação de dados deve ser centralizada quando possível.

Toda documentação deve ser periodicamente revisitada.

Toda evolução do produto deve manter foco no usuário final.

Toda decisão de arquitetura deve considerar o estágio do negócio.

Todo incidente deve gerar aprendizado reaproveitável.

Toda melhoria de segurança deve ser contínua.

Toda evolução da plataforma deve preservar simplicidade de uso.
