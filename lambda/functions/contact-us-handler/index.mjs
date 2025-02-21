import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

export const handler = async (event) => {
  console.log(JSON.stringify(event, null, 2));
  const sesClient = new SESClient({});
  const { body } = event;
  const { name, phone, email, comment } = JSON.parse(body);

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  };
  const date = new Date()
    .toLocaleString("en-GB", options)
    .replace(",", "")
    .replace(" AM", " am")
    .replace(" PM", " pm");
  const toEmail = [process.env.TO_EMAIL];
  const fromEmail = process.env.FROM_EMAIL;

  const emailBodyHtml = `
    <p>Hi,</p>
    <p><strong>Name:</strong> ${name}</p </br>
    <p><strong>Phone:</strong>${phone}<p> </br>
    <p><strong>Email:</strong> ${email}<p> </br>
    <p><strong>Comment:</strong> ${comment}<p> </br></br>
    <p>Best regards</p>
  `;

  const params = {
    Destination: {
      ToAddresses: [toEmail],
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: emailBodyHtml,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: `New customer message on ${date}`,
      },
    },
    Source: fromEmail,
  };

  const command = new SendEmailCommand(params);
  const response = await sesClient.send(command);
  console.log("Email sent successfully:", response);

  return {
    statusCode: 200,
    body: JSON.stringify(response),
  };
};
