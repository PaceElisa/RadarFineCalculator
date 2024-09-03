import { Request, Response } from "express";
import { MessageFactory, HttpStatus } from '../factory/Messages';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { pipeline } from 'stream';
import Payment from "../models/Payment";
import Violation from "../models/Violation";
import Transit from "../models/Transit";

const MessageFact: MessageFactory = new MessageFactory();

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
                return res.status(404).json({ message: 'Violation not found' });
            }

            // accedo ai dati inclusi
            const transit = violation.get('Transit') as Transit;
            const payment = violation.get('Payment') as Payment;

            // Verifica che i dati inclusi esistano
            if (!transit || !payment) {
                return res.status(500).json({ message: 'Related data not found' });
            }

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
            console.error('Error generating receipt:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}

export default new PaymentController();