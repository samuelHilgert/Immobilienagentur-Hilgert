import * as functions from "firebase-functions";
import * as express from "express";
import * as cors from "cors";
import * as nodemailer from "nodemailer";

// ✅ Firebase config variables für Email (gesetzt mit `firebase functions:config:set`)
const emailUser = functions.config().email.user;
const emailPass = functions.config().email.pass;

// ✅ Transporter für IONOS SMTP
const transporter = nodemailer.createTransport({
  host: "smtp.ionos.de",
  port: 587,
  secure: false, // Für STARTTLS
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

// ✅ Express App + CORS konfigurieren
const app = express();
app.use(cors({origin: true}));
app.use(express.json()); // Body parser für JSON

// ✅ POST-Route für deine Exposé-Anfragen
app.post("/sendExposeMail", async (req, res) => {
  const data = req.body;

  const mailOptions = {
    from: `"Hilgert Immobilien" <${emailUser}>`,
    to: emailUser,
    subject: `Neue Exposé-Anfrage für Immobilie ${data.immobilienId}`,
    html: `
      <h3>Neue Exposé-Anfrage</h3>
      <p><strong>Immobilie:</strong> ${data.immobilienTyp} (ID: ${data.immobilienId})</p>
      <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
      <p><strong>E-Mail:</strong> ${data.email}</p>
      <p><strong>Telefon:</strong> ${data.phone}</p>
      <p><strong>Firma:</strong> ${data.company || "-"}</p>
      <p><strong>Nachricht:</strong></p>
      <p>${data.message}</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({success: true});
  } catch (error) {
    console.error("E-Mail-Fehler:", error);
    res.status(500).send({success: false, error});
  }
});

// ✅ Externe Funktion exportieren
export const sendExposeMail = functions.https.onRequest(app);
