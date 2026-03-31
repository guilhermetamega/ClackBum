import { useColorScheme } from "@/hooks/use-color-scheme";
import Head from "expo-router/head";
import { useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

type Theme = {
  background: string;
  surface: string;
  surfaceSoft: string;
  border: string;
  text: string;
  textSoft: string;
  title: string;
  accent: string;
  badgeBg: string;
  badgeText: string;
  shadow: string;
  warningBg: string;
  warningBorder: string;
};

function getTheme(colorScheme: "light" | "dark" | null | undefined): Theme {
  const isDark = colorScheme === "dark";

  return {
    background: isDark ? "#121212" : "#F5F5F5",
    surface: isDark ? "#181818" : "#FFFFFF",
    surfaceSoft: isDark ? "#141414" : "#FAFAFA",
    border: isDark ? "#2A2A2A" : "#E7E7E7",
    text: isDark ? "#F5F5F5" : "#121212",
    textSoft: isDark ? "#BDBDBD" : "#5F6368",
    title: "#EE9734",
    accent: "#1E4563",
    badgeBg: isDark ? "rgba(238,151,52,0.14)" : "#FFF2E2",
    badgeText: "#EE9734",
    shadow: isDark ? "transparent" : "rgba(18,18,18,0.06)",
    warningBg: isDark ? "rgba(30,69,99,0.22)" : "#EEF5FA",
    warningBorder: isDark ? "#2B5B80" : "#CFE0EC",
  };
}

function Section({
  theme,
  index,
  title,
  children,
}: {
  theme: Theme;
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={[
        styles.sectionCard,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}
    >
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIndex, { backgroundColor: theme.badgeBg }]}>
          <Text style={[styles.sectionIndexText, { color: theme.badgeText }]}>
            {index}
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {title}
        </Text>
      </View>

      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function Bullet({
  theme,
  children,
}: {
  theme: Theme;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.bulletRow}>
      <Text style={[styles.bulletDot, { color: theme.title }]}>•</Text>
      <Text style={[styles.bulletText, { color: theme.textSoft }]}>
        {children}
      </Text>
    </View>
  );
}

export default function PrivacyPolicyScreen() {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);
  const { width } = useWindowDimensions();

  const isDesktop = width >= 960;
  const contentWidth = isDesktop ? 920 : 760;

  return (
    <>
      {Platform.OS === "web" ? (
        <Head>
          <title>Política de Privacidade | ClackBum</title>
          <meta
            name="description"
            content="Conheça a Política de Privacidade da ClackBum, incluindo dados coletados, finalidades de uso, compartilhamento, direitos do titular e práticas de proteção em conformidade com a LGPD."
          />
          <meta
            name="keywords"
            content="ClackBum, política de privacidade, LGPD, dados pessoais, privacidade, proteção de dados"
          />
          <meta
            property="og:title"
            content="Política de Privacidade | ClackBum"
          />
          <meta
            property="og:description"
            content="Saiba como a ClackBum coleta, utiliza, compartilha e protege seus dados."
          />
          <meta property="og:type" content="website" />
          <meta
            property="og:url"
            content="https://clack-bum.vercel.app/privacy-policy"
          />
          <meta name="robots" content="index,follow" />
        </Head>
      ) : null}

      <ScrollView
        style={[styles.screen, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.screenContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.wrapper, { maxWidth: contentWidth }]}>
          <View
            style={[
              styles.hero,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                shadowColor: theme.shadow,
              },
            ]}
          >
            <View style={styles.heroTop}>
              <View
                style={[styles.heroBadge, { backgroundColor: theme.badgeBg }]}
              >
                <Text
                  style={[styles.heroBadgeText, { color: theme.badgeText }]}
                >
                  ClackBum
                </Text>
              </View>
            </View>

            <Text style={[styles.heroTitle, { color: theme.text }]}>
              Política de Privacidade
            </Text>

            <Text style={[styles.heroSubtitle, { color: theme.textSoft }]}>
              Última atualização: 31 de março de 2026.
            </Text>

            <Text style={[styles.heroDescription, { color: theme.textSoft }]}>
              Esta Política de Privacidade descreve como a ClackBum coleta,
              utiliza, compartilha, armazena e protege dados pessoais no
              contexto de uso da plataforma, observando a legislação brasileira
              aplicável, incluindo a LGPD.
            </Text>
          </View>

          <Section theme={theme} index="1" title="Introdução">
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              A ClackBum respeita a privacidade dos usuários e se compromete a
              tratar dados pessoais de forma responsável, transparente e
              compatível com a legislação vigente, especialmente a Lei Geral de
              Proteção de Dados Pessoais.
            </Text>
          </Section>

          <Section theme={theme} index="2" title="Dados que podemos coletar">
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              No contexto de funcionamento da plataforma, poderemos coletar
              dados fornecidos diretamente pelo usuário, dados gerados pelo uso
              do serviço e dados técnicos relacionados ao acesso.
            </Text>

            <Text style={[styles.subheading, { color: theme.text }]}>
              2.1 Dados cadastrais
            </Text>
            <Bullet theme={theme}>nome completo</Bullet>
            <Bullet theme={theme}>e-mail</Bullet>
            <Bullet theme={theme}>CPF</Bullet>
            <Bullet theme={theme}>telefone</Bullet>
            <Bullet theme={theme}>endereço e informações correlatas</Bullet>

            <Text style={[styles.subheading, { color: theme.text }]}>
              2.2 Dados de uso
            </Text>
            <Bullet theme={theme}>histórico de navegação na plataforma</Bullet>
            <Bullet theme={theme}>compras, transações e interações</Bullet>
            <Bullet theme={theme}>
              conteúdos publicados, enviados ou editados
            </Bullet>

            <Text style={[styles.subheading, { color: theme.text }]}>
              2.3 Dados técnicos
            </Text>
            <Bullet theme={theme}>endereço IP</Bullet>
            <Bullet theme={theme}>
              tipo de dispositivo, sistema e navegador
            </Bullet>
            <Bullet theme={theme}>logs técnicos e eventos de acesso</Bullet>
          </Section>

          <Section theme={theme} index="3" title="Finalidades do tratamento">
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              Os dados coletados poderão ser utilizados para finalidades
              legítimas relacionadas à operação, segurança, melhoria e expansão
              da plataforma.
            </Text>

            <Bullet theme={theme}>
              criação, autenticação e manutenção da conta
            </Bullet>
            <Bullet theme={theme}>
              processamento de pagamentos e repasses
            </Bullet>
            <Bullet theme={theme}>suporte ao usuário e atendimento</Bullet>
            <Bullet theme={theme}>
              prevenção à fraude, abuso e uso indevido
            </Bullet>
            <Bullet theme={theme}>
              melhorias técnicas, estatísticas e operacionais
            </Bullet>
            <Bullet theme={theme}>
              cumprimento de obrigações legais e regulatórias
            </Bullet>
          </Section>

          <Section theme={theme} index="4" title="Compartilhamento de dados">
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              A ClackBum poderá compartilhar dados pessoais com terceiros quando
              isso for necessário à operação do serviço, cumprimento de
              obrigação legal, execução contratual ou viabilização de
              funcionalidades da plataforma.
            </Text>

            <Bullet theme={theme}>
              provedores de pagamento e serviços financeiros, como Stripe
            </Bullet>
            <Bullet theme={theme}>
              provedores de infraestrutura, armazenamento, banco de dados e
              backend, como Supabase
            </Bullet>
            <Bullet theme={theme}>
              parceiros operacionais, comerciais, tecnológicos ou institucionais
            </Bullet>
          </Section>

          <Section
            theme={theme}
            index="5"
            title="Comercialização de dados e terceiros"
          >
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              Conforme informado para esta política, a ClackBum poderá
              compartilhar ou comercializar dados com terceiros. Isso poderá
              envolver dados anonimizados, agregados ou, quando juridicamente
              permitido e amparado por base legal adequada, outros conjuntos de
              dados relacionados ao uso da plataforma.
            </Text>

            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              O usuário declara ciência de que o uso da plataforma está sujeito
              a essa possibilidade, sem prejuízo dos direitos previstos na
              legislação aplicável.
            </Text>
          </Section>

          <Section theme={theme} index="6" title="Bases legais e LGPD">
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              O tratamento de dados pessoais poderá ocorrer com fundamento em
              uma ou mais bases legais previstas na LGPD, incluindo execução
              contratual, cumprimento de obrigação legal ou regulatória,
              exercício regular de direitos, legítimo interesse e, quando
              aplicável, consentimento do titular.
            </Text>
          </Section>

          <Section theme={theme} index="7" title="Direitos do titular de dados">
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              Nos termos da LGPD, o usuário poderá solicitar, observados os
              limites legais e regulatórios:
            </Text>

            <Bullet theme={theme}>
              confirmação da existência de tratamento
            </Bullet>
            <Bullet theme={theme}>acesso aos dados pessoais</Bullet>
            <Bullet theme={theme}>
              correção de dados incompletos ou desatualizados
            </Bullet>
            <Bullet theme={theme}>
              anonimização, bloqueio ou eliminação quando cabível
            </Bullet>
            <Bullet theme={theme}>
              informação sobre compartilhamentos realizados
            </Bullet>
            <Bullet theme={theme}>
              revogação de consentimento, quando aplicável
            </Bullet>

            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              Solicitações poderão ser enviadas para o canal de contato
              informado nesta política.
            </Text>
          </Section>

          <Section theme={theme} index="8" title="Exclusão de conta e retenção">
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              O usuário poderá solicitar ou realizar a exclusão da conta por
              meio dos recursos disponibilizados na plataforma. Após a
              solicitação, dados pessoais e conteúdos associados poderão ser
              eliminados ou anonimizados, conforme a natureza da informação e as
              exigências legais aplicáveis.
            </Text>

            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              Determinados dados poderão ser mantidos por prazo adicional quando
              necessário para:
            </Text>

            <Bullet theme={theme}>
              cumprimento de obrigação legal ou fiscal
            </Bullet>
            <Bullet theme={theme}>prevenção à fraude e segurança</Bullet>
            <Bullet theme={theme}>
              resolução de disputas e exercício de direitos
            </Bullet>
          </Section>

          <Section theme={theme} index="9" title="Segurança da informação">
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              A ClackBum adota medidas técnicas, administrativas e
              organizacionais compatíveis com a natureza de sua operação para
              reduzir riscos de acesso não autorizado, perda, alteração,
              vazamento ou tratamento inadequado de dados pessoais.
            </Text>
          </Section>

          <Section
            theme={theme}
            index="10"
            title="Cookies, métricas e tecnologia"
          >
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              Quando aplicável, poderão ser utilizados cookies, identificadores,
              ferramentas analíticas e mecanismos semelhantes para melhorar a
              experiência de navegação, compreender uso da plataforma, medir
              desempenho e apoiar segurança e personalização.
            </Text>
          </Section>

          <Section theme={theme} index="11" title="Atualizações desta política">
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              Esta Política de Privacidade poderá ser atualizada periodicamente
              para refletir alterações operacionais, jurídicas ou regulatórias.
              A versão vigente permanecerá publicada nesta página.
            </Text>
          </Section>

          <Section theme={theme} index="12" title="Contato">
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              Para dúvidas, solicitações relacionadas a privacidade ou exercício
              de direitos do titular:
            </Text>

            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              E-mail:{" "}
              <Text style={[styles.strong, { color: theme.text }]}>
                guitamega06@gmail.com
              </Text>
            </Text>
          </Section>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  screenContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  wrapper: {
    width: "100%",
    alignSelf: "center",
    gap: 16,
  },
  hero: {
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    gap: 12,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 2,
  },
  heroTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },
  heroBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  heroBadgeText: {
    fontSize: 13,
    fontWeight: "800",
  },
  backButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  backButtonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  heroTitle: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "900",
  },
  heroSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
  },
  heroDescription: {
    fontSize: 15,
    lineHeight: 24,
  },
  noticeCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    gap: 8,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: "900",
  },
  noticeText: {
    fontSize: 14,
    lineHeight: 22,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 18,
    gap: 14,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sectionIndex: {
    minWidth: 34,
    height: 34,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  sectionIndexText: {
    fontSize: 14,
    fontWeight: "900",
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "900",
  },
  sectionBody: {
    gap: 12,
  },
  subheading: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "900",
    marginTop: 2,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 24,
  },
  strong: {
    fontWeight: "900",
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingRight: 8,
  },
  bulletDot: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "900",
    marginTop: 1,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 24,
  },
});
