import { Request, Response } from "express";
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import Payment from "../models/Payment";
import Violation from "../models/Violation";
import Transit from "../models/Transit";

// Import factory classes for success and error messages
import { successFactory } from "../factory/SuccessMessage";
import { errorFactory } from "../factory/FailMessage";
import { SuccesMessage, ErrorMessage } from "../factory/Messages";

const errorMessageFactory: errorFactory = new errorFactory();
const successMessageFactory: successFactory = new successFactory();

class PaymentController {

    // Generates a payment receipt (in PDF format) for a violation given the violation's ID
    async generatePDFReceipt(req: Request, res: Response) {
        const { id_violation } = req.params;

        try {
            // Find the violation and the associated payment and transit records
            const violation = await Violation.findByPk(id_violation, {
                include: [
                    Transit,
                    Payment
                ]
            });
            // If the violation is not found, return an error message
            if (!violation) {
                const message = errorMessageFactory.createMessage(ErrorMessage.recordNotFound, `Violation not found`);
                return res.json({ error: message });
            }

            // Access the included Transit and Payment data
            const transit = violation.get('Transit') as Transit;
            const payment = violation.get('Payment') as Payment;

            // Data for the QR code (concatenating payment UUID, violation ID, vehicle plate, and fine amount)
            const qrData = `${payment.uuid};${violation.id};${transit.plate};${violation.fine}`;

            // Generate a QR code
            const qrCodeImage = await QRCode.toBuffer(qrData);

            // Define A5 page dimensions for the PDF
            const width: number = 419.53;
            const height: number = 595.28;

            // Create a new PDF document with A5 size
            const doc = new PDFDocument({ size: 'A5' });

            // Configure the response to download the PDF file with the specified name
            res.setHeader('Content-Disposition', `attachment; filename=${transit.plate}_receipt.pdf`);
            res.setHeader('Content-Type', 'application/pdf');

            // Add content to the PDF
            doc.fontSize(16).text('Bollettino di Pagamento', { align: 'center' });
            doc.fontSize(14).text('Multa', { align: 'center' });
            doc.moveDown();
            doc.fontSize(12).text(`Targa: ${transit.plate}`, { align: 'center' });
            doc.text(`Importo: € ${violation.fine.toFixed(2)}`, { align: 'center' });
            doc.moveDown();
            // Add the QR code image to the PDF, centered on the page
            doc.image(qrCodeImage, (width - 100) / 2, 150, { fit: [100, 100], width: width, height: height });
            // Pipe the generated PDF to the response stream
            doc.pipe(res)
            doc.end(); // Finalize the PDF and send it

        } catch (error) {
            const message = errorMessageFactory.createMessage(ErrorMessage.generalError, `Error generating the receipt`);
            return res.json({ error: message });
        }
    }
}
// Export an instance of the PaymentController class
export default new PaymentController();