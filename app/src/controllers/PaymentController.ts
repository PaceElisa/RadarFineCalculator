import { Request, Response } from "express";
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import Payment from "../models/Payment";
import Violation from "../models/Violation";
import Transit from "../models/Transit";

//Import factory
import { successFactory } from "../factory/SuccessMessage";
import { errorFactory } from "../factory/FailMessage";
import { SuccesMessage, ErrorMessage } from "../factory/Messages";

const errorMessageFactory: errorFactory = new errorFactory();
const successMessageFactory: successFactory = new successFactory();

class PaymentController {

    // Genera un bollettino per il pagamento associato ad una multa dato l'id di quest'ultima.
    async generatePDFReceipt(req: Request, res: Response) {
        const { id_violation } = req.params;

        try {
            // Trova la multa e il pagamento associato
            const violation = await Violation.findByPk(id_violation, {
                include: [
                    Transit,
                    Payment
                ]
            });

            if (!violation) {
                const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `Violation not found`);
                return res.json({ error: message });
            }

            // accedo ai dati inclusi
            const transit = violation.get('Transit') as Transit;
            const payment = violation.get('Payment') as Payment;

            // Dati per il QR code
            const qrData = `${payment.uuid};${violation.id};${transit.plate};${violation.fine}`;

            // Genera il QR code
            const qrCodeImage = await QRCode.toBuffer(qrData);

            // Dimensioni pagina A5 PDF
            const width: number = 419.53;
            const height: number = 595.28;

            // Crea un PDF
            const doc = new PDFDocument({ size: 'A5' });

            // Configura la risposta per il download del PDF
            res.setHeader('Content-Disposition', `attachment; filename=${transit.plate}_receipt.pdf`);
            res.setHeader('Content-Type', 'application/pdf');

            // Aggiungi contenuti al PDF
            doc.fontSize(16).text('Bollettino di Pagamento', { align: 'center' });
            doc.fontSize(14).text('Multa', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Targa: ${transit.plate}`, { align: 'center' });
            doc.text(`Importo: € ${violation.fine.toFixed(2)}`, { align: 'center' });
            doc.moveDown();
            doc.image(qrCodeImage, (width - 100) / 2, 150, { fit: [100, 100], width: width, height: height });
            doc.pipe(res)
            doc.end();

        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.generalError, `Error generating the receipt`);
            return res.json({ error: message });
        }
    }
}

export default new PaymentController();