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

export default function TermsScreen() {
  const colorScheme = useColorScheme();
  const theme = useMemo(() => getTheme(colorScheme), [colorScheme]);
  const { width } = useWindowDimensions();

  const isDesktop = width >= 960;
  const contentWidth = isDesktop ? 920 : 760;

  return (
    <>
      {Platform.OS === "web" ? (
        <Head>
          <title>Termos de Uso | ClackBum</title>
          <meta
            name="description"
            content="Leia os Termos de Uso da ClackBum para entender as regras de uso da plataforma, monetização, moderação de conteúdo, contas e direitos aplicáveis."
          />
          <meta
            name="keywords"
            content="ClackBum, termos de uso, política da plataforma, venda de fotos, conteúdo digital, LGPD"
          />
          <meta property="og:title" content="Termos de Uso | ClackBum" />
          <meta
            property="og:description"
            content="Conheça os Termos de Uso da plataforma ClackBum."
          />
          <meta property="og:type" content="website" />
          <meta
            property="og:url"
            content="https://clack-bum.vercel.app/terms"
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
              Termos de Uso
            </Text>

            <Text style={[styles.heroSubtitle, { color: theme.textSoft }]}>
              Última atualização: 31 de março de 2026.
            </Text>

            <Text style={[styles.heroDescription, { color: theme.textSoft }]}>
              Estes Termos de Uso regulam o acesso e a utilização da plataforma
              ClackBum, incluindo publicação de conteúdo, compra de imagens,
              monetização, moderação e uso geral da conta.
            </Text>
          </View>

          <Section theme={theme} index="1" title="Aceitação dos termos">
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              Ao acessar, navegar, criar conta ou utilizar a plataforma
              ClackBum, você declara que leu, compreendeu e concorda com estes
              Termos de Uso. Caso não concorde com qualquer disposição aqui
              prevista, você não deve utilizar a plataforma.
            </Text>
          </Section>

          <Section theme={theme} index="2" title="Sobre a plataforma">
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              A ClackBum é uma plataforma digital voltada à publicação,
              divulgação e comercialização de imagens, com foco em conteúdo
              fotográfico disponibilizado por usuários cadastrados.
            </Text>

            <Bullet theme={theme}>publicação de fotografias</Bullet>
            <Bullet theme={theme}>venda de imagens digitais</Bullet>
            <Bullet theme={theme}>gestão de conta de usuário</Bullet>
            <Bullet theme={theme}>
              intermediação tecnológica de pagamentos
            </Bullet>
          </Section>

          <Section
            theme={theme}
            index="3"
            title="Cadastro, acesso e responsabilidade da conta"
          >
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              Para utilizar determinadas funcionalidades, o usuário deverá
              fornecer informações verdadeiras, completas e atualizadas. O
              usuário é integralmente responsável pela confidencialidade de suas
              credenciais e por toda atividade realizada em sua conta.
            </Text>

            <Bullet theme={theme}>
              manter dados cadastrais corretos e atualizados
            </Bullet>
            <Bullet theme={theme}>
              não compartilhar senha, sessão ou acesso com terceiros
            </Bullet>
            <Bullet theme={theme}>
              comunicar uso não autorizado da conta quando identificado
            </Bullet>
          </Section>

          <Section
            theme={theme}
            index="4"
            title="Conteúdo publicado e direitos de uso"
          >
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              Ao publicar conteúdo na plataforma, o usuário declara possuir os
              direitos, autorizações e permissões necessárias para upload,
              exibição, comercialização e disponibilização desse material.
            </Text>

            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              O usuário também reconhece e concorda que as imagens publicadas na
              ClackBum poderão ser utilizadas livremente pela plataforma para
              fins operacionais, promocionais, institucionais, comerciais,
              editoriais ou publicitários relacionados à atividade da ClackBum,
              sem que isso gere pagamento adicional além das condições
              ordinárias de venda definidas na plataforma.
            </Text>
          </Section>

          <Section
            theme={theme}
            index="5"
            title="Monetização, pagamentos e taxas"
          >
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              Nas vendas realizadas por meio da plataforma, a ClackBum aplica,
              na data desta versão, uma taxa de{" "}
              <Text style={[styles.strong, { color: theme.text }]}>15%</Text>{" "}
              sobre o valor original da transação.
            </Text>

            <Bullet theme={theme}>
              a taxa incide sobre o valor original da venda
            </Bullet>
            <Bullet theme={theme}>
              o saldo remanescente é destinado ao usuário vendedor, conforme
              regras operacionais e do processador de pagamento
            </Bullet>
            <Bullet theme={theme}>
              taxas, repasses e regras operacionais podem ser alterados
              futuramente, mediante atualização destes termos
            </Bullet>
          </Section>

          <Section theme={theme} index="6" title="Conteúdo proibido">
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              É proibido publicar, vender, divulgar ou manter na plataforma
              qualquer conteúdo que viole a legislação aplicável, direitos de
              terceiros ou as regras internas da ClackBum.
            </Text>

            <Bullet theme={theme}>
              nudez, pornografia ou exploração sexual
            </Bullet>
            <Bullet theme={theme}>
              conteúdo obsceno ou sexualmente explícito
            </Bullet>
            <Bullet theme={theme}>
              apologia ou comercialização de drogas ilícitas
            </Bullet>
            <Bullet theme={theme}>
              violência gráfica, crueldade ou conteúdo perigoso
            </Bullet>
            <Bullet theme={theme}>
              material ilegal, fraudulento, difamatório ou que incentive crimes
            </Bullet>
            <Bullet theme={theme}>
              qualquer conteúdo que viole direitos autorais, imagem, privacidade
              ou direitos da personalidade
            </Bullet>
          </Section>

          <Section
            theme={theme}
            index="7"
            title="Moderação, bloqueio e remoção"
          >
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              A ClackBum poderá, a seu exclusivo critério e sempre que julgar
              necessário à segurança, legalidade, reputação da plataforma ou
              proteção de terceiros:
            </Text>

            <Bullet theme={theme}>
              bloquear, suspender, restringir ou remover conteúdos
            </Bullet>
            <Bullet theme={theme}>
              limitar funcionalidades da conta temporária ou permanentemente
            </Bullet>
            <Bullet theme={theme}>
              remover contas que violem regras da plataforma ou legislação
              aplicável
            </Bullet>
          </Section>

          <Section
            theme={theme}
            index="8"
            title="Compras e uso do conteúdo adquirido"
          >
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              Ao adquirir uma imagem por meio da plataforma, o comprador recebe
              o direito de uso conforme as condições de disponibilização do
              conteúdo e da própria plataforma, não sendo permitida
              redistribuição, revenda, sublicenciamento ou exploração irregular
              quando não autorizados.
            </Text>
          </Section>

          <Section theme={theme} index="9" title="Exclusão de conta">
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              O usuário pode solicitar ou realizar a exclusão da própria conta
              por meio das funcionalidades disponíveis na plataforma, observadas
              as retenções mínimas necessárias ao cumprimento de obrigações
              legais, regulatórias, fiscais, de prevenção à fraude e de
              resolução de disputas.
            </Text>

            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              A ClackBum também poderá excluir, desativar ou bloquear contas que
              descumpram estes Termos de Uso ou representem risco à integridade
              da plataforma.
            </Text>
          </Section>

          <Section
            theme={theme}
            index="10"
            title="Limitação de responsabilidade"
          >
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              A ClackBum atua como plataforma tecnológica e não garante ausência
              de indisponibilidade, interrupções temporárias, falhas de
              terceiros ou uso indevido do conteúdo por agentes externos.
            </Text>

            <Bullet theme={theme}>
              indisponibilidade temporária do sistema
            </Bullet>
            <Bullet theme={theme}>
              falhas decorrentes de terceiros, provedores ou integrações
              externas
            </Bullet>
            <Bullet theme={theme}>
              uso indevido do conteúdo por terceiros fora do controle razoável
              da plataforma
            </Bullet>
          </Section>

          <Section theme={theme} index="11" title="Atualizações destes termos">
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              A ClackBum poderá modificar estes Termos de Uso a qualquer
              momento. A versão vigente será sempre disponibilizada nesta
              página. O uso contínuo da plataforma após a atualização representa
              concordância com a nova versão.
            </Text>
          </Section>

          <Section
            theme={theme}
            index="12"
            title="Legislação aplicável e contato"
          >
            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              Estes Termos de Uso são regidos pela legislação brasileira,
              especialmente pelo Código Civil, Marco Civil da Internet, Lei
              Geral de Proteção de Dados Pessoais e demais normas aplicáveis.
            </Text>

            <Text style={[styles.paragraph, { color: theme.textSoft }]}>
              Contato:{" "}
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
