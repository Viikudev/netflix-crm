import {
  Body,
  Column,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface TwitchResetPasswordEmailProps {
  resetUrl: string;
  username?: string;
  updatedDate?: Date;
}

export const TwitchResetPasswordEmail = ({
  resetUrl,
  username,
  updatedDate,
}: TwitchResetPasswordEmailProps) => {
  const formattedDate = new Intl.DateTimeFormat("es", {
    dateStyle: "long",
    timeStyle: "medium",
  }).format(updatedDate);

  return (
    <Html>
      <Head />
      <Tailwind>
        <Body className="font-twitch bg-[#efeef1]">
          <Preview>
            Has actualizado la contraseña de tu cuenta de Streaming POZ
          </Preview>
          <Container className="mx-auto my-[30px] max-w-[580px] bg-white">
            <Section className="p-[30px]">
              <Img
                width={600}
                src="https://moviamedia.com/wp-content/uploads/feature-streaming-service.jpg"
                alt="Streaming POZ"
                className="mx-auto"
              />
            </Section>
            <Section className="w-full">
              <Row>
                <Column className="w-[249px] [border-bottom:1px_solid_rgb(238,238,238)]" />
                <Column className="w-[102px] [border-bottom:1px_solid_rgb(145,71,255)]" />
                <Column className="w-[249px] [border-bottom:1px_solid_rgb(238,238,238)]" />
              </Row>
            </Section>
            <Section className="px-5 pt-[5px] pb-[10px]">
              <Text className="text-[14px] leading-[1.5]">
                Hola {username},
              </Text>
              <Text className="text-[14px] leading-[1.5]">
                Has solicitado un reninicio de contraseña el {formattedDate}.
              </Text>
              <Text className="text-[14px] leading-[1.5]">
                Has click en el siguiente enlace para restablecer tu contraseña{" "}
                <Link href={resetUrl} className="underline">
                  restablece la contraseña de tu cuenta
                </Link>{" "}
              </Text>
              <Text className="text-[14px] leading-[1.5]">
                Atentamente,
                <br />
                Servicios de Streaming POZ
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

TwitchResetPasswordEmail.PreviewProps = {
  username: "alanturing",
  updatedDate: new Date("June 23, 2022 4:06:00 pm UTC"),
} as TwitchResetPasswordEmailProps;

export default TwitchResetPasswordEmail;
