# ClackBum — Aspectos Técnicos

## Introdução

Este documento descreve a arquitetura técnica do ClackBum de forma prática e estruturada, com foco em manutenção, escalabilidade e previsibilidade operacional.

A proposta aqui é responder três perguntas:

1. como o sistema está organizado hoje;
2. por que as principais decisões foram tomadas;
3. como evoluir sem quebrar fluxos críticos.

---

## Stack e fundamentos

O projeto é multiplataforma e utiliza:

- **Expo + React Native** para interface e execução em iOS/Android/Web;
- **TypeScript** para tipagem estática e melhor manutenção;
- **Supabase** para autenticação, banco e storage;
- **Stripe** para onboarding financeiro e pagamentos;
- **Supabase Edge Functions** para processamento server-side sensível.

Essa combinação equilibra velocidade de entrega e robustez para fluxo transacional.

---

## Estrutura de pastas

```text
app/
components/
hooks/
services/
types/
lib/
utils/
supabase/functions/
assets/
```

### Leitura prática da estrutura

- `app/` contém rotas e telas da aplicação.
- `components/` concentra UI reutilizável.
- `hooks/` organiza a lógica de tela e coordenação de estado.
- `services/` isola chamadas de dados e regras de integração.
- `types/` define contratos tipados.
- `supabase/functions/` contém backend orientado a eventos.

A divisão foi adotada para reduzir acoplamento entre visual e regra.

---

## Arquitetura de frontend

A camada de frontend segue padrão de composição por responsabilidade:

- tela (container de rota),
- hook controlador (estado e ações),
- serviços (acesso a dados),
- componentes de apresentação.

Esse formato simplifica refatoração e melhora testabilidade, pois cada camada concentra um tipo de preocupação.

### Padrões adotados

- `useMemo` para valores derivados de custo repetitivo;
- `useCallback` para estabilidade de handlers;
- separação de componentes “burros” e “inteligentes”;
- fallback visual para carregamento e erro.

---

## Roteamento

O sistema usa `expo-router` com convenção de pastas.

### Benefícios da abordagem

- menos boilerplate de navegação;
- estrutura mais intuitiva para onboarding;
- maior previsibilidade na criação de telas.

### Layout raiz

No layout raiz, o app:

- carrega fontes;
- consulta sessão;
- assina mudanças de autenticação;
- decide redirecionamento entre rotas públicas/privadas.

---

## Autenticação e sessão

A autenticação utiliza client Supabase inicializado em `lib/supabaseClient.ts`.

### Estratégia de storage

- Web: `localStorage` (quando disponível);
- Mobile: `expo-secure-store`.

Essa estratégia respeita particularidades de cada plataforma sem duplicar lógica de sessão.

### Guardas de rota

O acesso a rotas privadas depende de sessão ativa. Esse controle está no nível de layout, o que reduz risco de exposição acidental de tela privada.

---

## Módulo de feed (arquitetura técnica)

O feed consome dados paginados e normaliza retornos para renderização estável.

### Pipeline do feed

1. consulta paginada no backend;
2. filtro de elegibilidade (`approved` + `public`);
3. transformação para modelo de UI;
4. merge por ID para evitar duplicidade;
5. renderização incremental na lista.

### Busca

A busca local utiliza texto normalizado para suportar acentos e variações de caixa, reduzindo fricção de pesquisa.

---

## Módulo de publicação

A publicação depende de pré-validação de estado financeiro do criador.

### Etapas técnicas

1. solicitar permissão de mídia;
2. selecionar imagem;
3. validar campos essenciais;
4. validar aptidão Stripe;
5. construir payload;
6. enviar upload/submissão;
7. retornar feedback e navegar.

Esse desenho prioriza consistência operacional em vez de permissividade.

---

## Módulo de perfil

O perfil concentra operações com maior diversidade de estado:

- duas abas de dados distintos;
- atualização de saldo;
- compartilhamento;
- alteração de visibilidade;
- exclusão.

### Estratégia de cache

Há cache em memória com TTL para reduzir chamadas redundantes ao alternar foco de tela. Quando o cache expira, o sistema dispara atualização silenciosa.

Isso melhora sensação de velocidade sem abrir mão de sincronização periódica.

---

## Integração com Supabase

O Supabase cumpre múltiplos papéis: autenticação, banco e storage.

### Princípios de uso

- cliente público somente com chave anônima;
- operações sensíveis no backend/funções;
- contratos tipados para consumo seguro no app.

### Storage

Previews públicos são usados para navegação no feed. Conteúdo original deve obedecer estratégia de acesso definida por política de produto.

---

## Integração com Stripe

O Stripe é responsável por:

- onboarding financeiro de criadores;
- processamento de pagamentos;
- eventos de confirmação via webhook.

### Fluxos suportados

- Web: Checkout Session;
- Mobile: PaymentIntent.

A confirmação real da compra ocorre no backend, nunca apenas no cliente.

---

## Edge Functions

As funções Edge são responsáveis por lógica crítica que não pode ficar no client.

### Caso mais sensível: webhook

No webhook, o sistema:

1. valida assinatura;
2. interpreta evento relevante;
3. extrai metadata obrigatória;
4. grava compra aprovada no banco.

Esse fluxo protege o domínio financeiro contra falsos positivos de confirmação.

---

## Tipagem e contratos

A pasta `types/` centraliza modelos de domínio por contexto (feed, profile, publish etc.).

Benefícios diretos:

- redução de bugs por contrato implícito;
- refatoração mais segura;
- documentação viva da estrutura de dados.

---

## Tratamento de erro

A base atual utiliza abordagem pragmática:

- logs para diagnóstico técnico;
- alertas/toasts para feedback de usuário;
- early returns para falhas de pré-condição.

Evolução recomendada: padronizar uma camada de erro por código semântico para melhorar monitoramento e suporte.

---

## Segurança

### Controles atuais

- separação entre chaves públicas e secretas;
- validação de assinatura de webhook;
- uso de storage seguro para sessão mobile;
- controle de rotas por autenticação.

### Melhorias recomendadas

- reforçar políticas RLS por tabela;
- adicionar idempotência explícita em gravação de compra;
- centralizar auditoria de eventos críticos.

---

## Performance

### Estratégias já adotadas

- paginação no feed;
- memoização de valores derivados;
- cache com TTL no perfil;
- skeletons para percepção de resposta.

### Pontos de evolução

- instrumentar métricas de tempo por fluxo;
- monitorar peso de imagens e custo de renderização;
- reduzir recomputação em listas extensas.

---

## Qualidade e testes

O projeto possui lint, porém ainda precisa ampliar cobertura automatizada de cenários críticos.

### Prioridade de testes

- autenticação e redirecionamentos;
- publicação com pré-condições;
- compra com confirmação de webhook;
- consistência de perfil após ações destrutivas.

### Estratégia sugerida

Combinar testes unitários de services com testes E2E de jornadas-chave.

---

## Operação e observabilidade

Para maturidade operacional, recomenda-se investir em:

- métricas por endpoint/função;
- alertas de falha em webhook;
- correlação de eventos por transação;
- dashboards de funil técnico.

Sem observabilidade, incidentes financeiros custam mais tempo e confiança.

---

## Configuração de ambiente

### Variáveis client

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_SITE_URL=
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

### Variáveis backend

```bash
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Recomendação

Utilizar gestão de segredos por ambiente e rotação periódica de chaves.

---

## Execução local técnica

### Instalar dependências

```bash
npm install
```

### Iniciar app

```bash
npm run start
```

### Rodar em plataformas

```bash
npm run web
npm run android
npm run ios
```

### Verificação estática

```bash
npm run lint
```

---

## Dívidas técnicas mapeadas

- ausência de suíte robusta de testes automatizados;
- falta de padronização global de erros de domínio;
- necessidade de idempotência financeira mais explícita;
- necessidade de observabilidade full-stack.

Esses pontos devem orientar backlog de engenharia de curto/médio prazo.

---

## Roadmap técnico sugerido

### Curto prazo

- padronizar tratamento de erro;
- fortalecer logs estruturados;
- ampliar cobertura de testes críticos.

### Médio prazo

- painel de moderação operacional;
- telemetria funcional de funil;
- melhorias na camada de integração financeira.

### Longo prazo

- arquitetura orientada a eventos para domínios sensíveis;
- rastreabilidade avançada de transação;
- otimização de custo de mídia/storage.

---

## Runbook resumido de incidentes

### Incidente de login

Validar envs e disponibilidade do serviço de autenticação.

### Incidente de feed

Validar query, políticas e integridade do bucket de preview.

### Incidente de compra

Validar entrega de evento Stripe e assinatura de webhook.

### Incidente de perfil

Forçar recarga e verificar consistência de cache.

---

## Checklist técnico de release

Antes de publicar:

- validar lint;
- validar autenticação em web/mobile;
- validar feed em cenário real;
- validar publicação;
- validar compra com webhook;
- validar perfil (visibilidade/exclusão/share);
- revisar logs pós-teste.

Esse checklist reduz regressões em fluxos essenciais.

---

## Conclusão

A base técnica do ClackBum é sólida para o estágio atual, com boa separação de responsabilidade e escolha de stack compatível com entrega rápida multiplataforma.

O principal ponto de atenção está na maturidade operacional de fluxos financeiros (idempotência, monitoramento, auditoria). O principal ganho de curto prazo está em testes automatizados e observabilidade.

Com disciplina nesses dois eixos, o produto pode evoluir com velocidade sem abrir mão de confiabilidade.

### Notas finais de engenharia

Decisões técnicas devem sempre considerar impacto no fluxo de negócio.

Mudanças financeiras devem ter revisão técnica adicional.

Refatorações devem preservar contratos de tipos e serviços.

Observabilidade deve evoluir junto com funcionalidades.

Toda dependência nova precisa de avaliação de risco e manutenção.

Toda alteração em sessão deve ser testada em mobile e web.

Toda alteração em roteamento deve revisar guardas.

Toda alteração em cache deve revisar consistência.

Toda alteração em webhook deve revisar segurança.

Toda alteração em integração externa deve prever fallback.

Toda alteração em schema deve atualizar documentação.

Toda alteração de regra técnica deve ser comunicada ao time.

Toda entrega deve buscar equilíbrio entre simplicidade e robustez.

Toda otimização precisa ser baseada em medição.

Toda dívida técnica priorizada deve ter critério objetivo de conclusão.

Toda documentação técnica deve permanecer legível e acionável.

Toda arquitetura deve refletir contexto real do produto.

Toda evolução deve reduzir risco acumulado ao longo do tempo.

Toda melhoria deve deixar trilha de aprendizado para o time.

Toda base de código deve favorecer manutenção futura.
