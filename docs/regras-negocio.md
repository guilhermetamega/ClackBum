# ClackBum — Regras de Negócio, Telas e Casos de Funcionamento

## Propósito deste documento

Este material descreve o comportamento funcional do ClackBum sob a ótica de negócio. Ele não substitui o código, mas reduz ambiguidades entre produto, engenharia, QA e operação ao documentar intenções, regras e decisões de uso.

A ideia central é transformar o sistema em algo previsível: quem publica sabe o que esperar, quem compra entende o que recebe e quem opera consegue auditar o que aconteceu.

---

## Contexto de produto

O ClackBum é um marketplace de fotos digitais orientado por três pilares:

- descoberta de conteúdo visual;
- monetização para criadores;
- confiança transacional para compradores.

Esses pilares orientam todas as regras descritas abaixo.

---

## Domínios de negócio

### Identidade e acesso

Controla autenticação, sessão e acesso às áreas privadas. O objetivo é impedir acesso indevido sem gerar fricção exagerada.

### Catálogo e conteúdo

Controla as entidades de foto, seus metadados, estado de moderação e visibilidade.

### Publicação

Controla a submissão de conteúdo por criadores e os pré-requisitos para essa submissão.

### Descoberta

Controla como o conteúdo é exibido e pesquisado no feed público.

### Compra e financeiro

Controla transações, confirmação por webhook e efeito dessas transações em histórico e saldo.

### Portfólio e propriedade

Controla gestão de fotos próprias, compras realizadas e ações sobre ativos.

---

## Papéis e responsabilidades

### Usuário visitante

Acessa apenas rotas públicas, principalmente autenticação e documentos legais.

### Usuário autenticado comprador

Navega no feed, abre detalhes de conteúdo, compra itens e acompanha aquisições.

### Usuário autenticado criador

Publica conteúdo, altera visibilidade do portfólio, compartilha links e acompanha saldo.

### Operação/moderação

Aprova ou reprova conteúdos antes de exposição pública.

### Sistema de pagamento

Confirma transações via evento assinado, influenciando registro de compra.

---

## Regras de acesso

A aplicação separa rotas públicas e privadas de forma explícita.

Sem sessão ativa, o usuário não entra nas abas principais. Com sessão ativa, o usuário não precisa permanecer na rota de autenticação.

Essa regra é importante para proteger dados de perfil e evitar incoerência de navegação.

---

## Regras de catálogo

Uma foto no sistema precisa ser tratada como ativo com ciclo de vida:

1. criação/submissão;
2. análise/moderação;
3. eventual exposição pública;
4. venda e consumo.

Além de ID e autor, uma foto carrega metadados textuais e preço, que influenciam descoberta e compra.

---

## Regras de moderação

A moderação existe para proteger o catálogo e a marca. A regra essencial é:

> conteúdo não aprovado não entra no feed público, mesmo que esteja configurado como público.

Essa regra separa intenção do autor (visibilidade desejada) da autorização de circulação (status aprovado).

---

## Regras de visibilidade

### Público (`public`)

Conteúdo elegível para descoberta ampla no feed, desde que também esteja aprovado.

### Não listado (`unlisted`)

Conteúdo não priorizado para descoberta orgânica; pode ser consumido por quem possui link, conforme políticas de acesso.

### Privado (`private`)

Conteúdo restrito, sem compartilhamento público.

A mudança de visibilidade é de responsabilidade do autor e deve refletir rapidamente no perfil.

---

## Regras de descoberta no feed

O feed foi desenhado como vitrine do produto. Por isso, aplica regras de elegibilidade antes da exibição:

- apenas fotos com moderação aprovada;
- apenas fotos com visibilidade pública;
- ordenação por recência para favorecer conteúdo novo.

A busca textual deve favorecer usabilidade, normalizando acentuação e caixa para ampliar chances de encontrar conteúdo relevante.

---

## Regras de publicação

Publicar conteúdo envolve mais que upload: envolve conformidade mínima para monetização.

Por esse motivo, o sistema exige conta Stripe apta. Sem isso, a publicação fica bloqueada e o app orienta o próximo passo para destravar o fluxo.

Além disso, o formulário exige campos essenciais (imagem, título e preço válido), evitando itens incompletos no catálogo.

---

## Regras de compra

A compra só é considerada consolidada quando o backend recebe confirmação oficial do processador de pagamento.

Esse ponto é crítico: retorno client-side não basta para fechar regra financeira.

No registro consolidado, precisam existir vínculo de foto, comprador, vendedor e valor. Sem metadados mínimos, o evento não deve produzir compra válida.

---

## Regras de histórico e propriedade

Quando uma compra é aprovada, ela passa a compor a área de aquisições do comprador.

O usuário precisa distinguir claramente:

- o que é de autoria própria;
- o que é adquirido.

Essa separação evita confusão na gestão do portfólio e melhora confiança sobre propriedade digital.

---

## Regras de saldo

O saldo de criador precisa ser tratado em duas categorias:

- **disponível**;
- **pendente**.

A distinção evita interpretação incorreta sobre liquidez imediata. Sempre que possível, a origem da verdade deve ser a Stripe.

---

## Regras de compartilhamento

Compartilhamento tem objetivo de distribuição, mas respeita privacidade e governança.

Por isso, foto privada não pode ser compartilhada como link público.

Quando o link é elegível, o sistema deve copiá-lo para clipboard e oferecer feedback claro ao usuário.

---

## Regras de exclusão

Exclusão de foto é ação sensível. Deve ser permitida apenas ao autor e refletir rapidamente na interface.

Se a operação falhar, o usuário precisa ser informado sem romper consistência local.

A regra de impacto sobre histórico de compra deve ser definida com cuidado em evolução futura.

---

## Telas e responsabilidade funcional

### Tela de autenticação

Responsável por iniciar a jornada do usuário e restabelecer sessão quando aplicável.

### Tela de feed

Responsável por descoberta, busca e entrada para detalhes de conteúdo.

### Tela de publicação

Responsável por coleta e validação de dados para submissão de foto.

### Tela de perfil

Responsável por gestão de portfólio, aquisições e visão financeira.

### Tela de detalhes

Responsável por visualização ampliada e ações contextuais de compra/consumo.

### Tela de configurações

Responsável por centralizar preferências e ações de conta.

---

## Casos de funcionamento (cenários principais)

### Cenário de autenticação bem-sucedida

Usuário inicia app, sessão é validada e a navegação segue automaticamente para as abas principais.

### Cenário de descoberta e busca

Usuário abre feed, visualiza conteúdo elegível e encontra itens por texto mesmo com variações de acento.

### Cenário de publicação válida

Criador com Stripe apta envia foto com dados essenciais e recebe confirmação de submissão.

### Cenário de compra consolidada

Comprador finaliza pagamento; webhook confirma evento; compra aparece no histórico.

### Cenário de gestão de visibilidade

Criador ajusta estado da foto e percebe resultado refletido no próprio perfil.

---

## Casos de exceção relevantes

### Permissão de galeria negada

A publicação não avança e o usuário recebe orientação para conceder permissão.

### Falha de rede no feed

A listagem apresenta erro amigável sem quebrar navegação do app.

### Conta Stripe não apta

Publicação é bloqueada de forma explícita, com direcionamento para resolução.

### Webhook inválido

Evento financeiro é descartado para proteger integridade do sistema.

### Metadata de pagamento incompleta

Compra não é consolidada, evitando registro incoerente.

---

## Diretrizes de UX para regras de negócio

Mensagens devem explicar consequência e próxima ação.

Toasts devem confirmar ações rápidas (copiar link, atualizar visibilidade, excluir).

Bloqueios críticos devem usar componentes mais explícitos (modal/alerta).

Estados de carregamento devem ser visíveis, sem gerar ambiguidade de “travamento”.

---

## Critérios de aceite funcionais

Uma entrega é considerada pronta quando:

- respeita guardas de autenticação;
- preserva elegibilidade correta do feed;
- mantém validações de publicação;
- não quebra confirmação financeira por webhook;
- mantém consistência entre perfil e dados persistidos.

Esses critérios devem ser usados por QA e produto como baseline mínimo.

---

## Matriz de decisão rápida

| Situação | Regra esperada |
|---|---|
| Usuário sem login acessando aba privada | Redirecionar para autenticação |
| Foto sem aprovação | Não exibir no feed |
| Foto privada | Não permitir compartilhamento público |
| Stripe não apta | Bloquear publicação |
| Pagamento sem confirmação de webhook | Não consolidar compra |

---

## Riscos de negócio e mitigação

### Risco de inconsistência financeira

Mitigar com idempotência, monitoramento de webhook e trilha de auditoria.

### Risco de conteúdo inadequado exposto

Mitigar com moderação robusta e revisão contínua de critérios.

### Risco de baixa conversão

Mitigar com melhoria de experiência de detalhe, confiança e clareza de preço.

### Risco de sobrecarga de suporte

Mitigar com mensagens melhores e documentação de autosserviço.

---

## Recomendação de evolução funcional

A evolução mais valiosa no curto prazo é aumentar transparência para o criador: status de moderação, motivo de reprovação e ação sugerida.

No médio prazo, vale investir em operações: painel de moderação e notificações transacionais.

No longo prazo, o ganho vem de recursos de retenção: favoritos, curadoria e novas estratégias de venda.

---

## Como usar este documento no dia a dia

Para produto, use este arquivo como referência de impacto de regra.

Para QA, derive cenários de teste a partir dos blocos “cenários principais” e “casos de exceção”.

Para engenharia, use este arquivo como “contrato funcional” antes de implementar.

Para suporte, use os tópicos de troubleshooting e exceções para triagem inicial.

---

## Apêndice — exemplos de critérios para histórias

### Exemplo: alterar visibilidade

**Dado** que o usuário é autor da foto,
**quando** altera a visibilidade para privada,
**então** o item não deve ser compartilhável publicamente.

### Exemplo: compra

**Dado** que houve pagamento no processador,
**quando** o webhook assinado é recebido com metadata válida,
**então** a compra deve ser registrada no histórico.

### Exemplo: publicação

**Dado** que o criador está com Stripe apta,
**quando** envia formulário válido com imagem,
**então** a foto deve entrar em estado de moderação.

---

## Encerramento

As regras aqui descritas visam garantir previsibilidade operacional e confiança do usuário. Sempre que uma regra mudar no produto, este documento deve ser ajustado na mesma entrega para evitar desalinhamento entre comportamento real e expectativa do negócio.

A qualidade funcional do ClackBum depende tanto da implementação quanto da clareza com que as regras são comunicadas. Este arquivo existe para sustentar essa clareza.

### Notas adicionais de governança

A equipe deve revisar este documento periodicamente.

Mudanças em fluxos financeiros exigem revisão dupla.

Mudanças em moderação exigem alinhamento com política de conteúdo.

Mudanças de UX em fluxo crítico exigem validação com suporte.

Documentação antiga deve ser removida para evitar conflito de fonte.

O histórico de alteração deste arquivo deve constar em PR.

Cada seção deve ser legível sem depender de contexto externo.

O arquivo deve permanecer objetivo, sem jargão excessivo.

As regras devem ser testáveis, não apenas conceituais.

As regras devem priorizar experiência do usuário sem comprometer segurança.

As regras devem equilibrar velocidade de produto e consistência operacional.

As regras devem apoiar escala futura sem reescrita completa.

As regras devem ser socializadas no onboarding.

As regras devem ser auditáveis em incidentes.

As regras devem servir de base para roadmap.

As regras devem ser revisadas após incidentes relevantes.

As regras devem ser compatíveis com limitações técnicas atuais.

As regras devem orientar priorização de dívida técnica.

As regras devem evitar ambiguidade entre equipes.

As regras devem permanecer alinhadas ao propósito do produto.
