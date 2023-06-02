import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { BuyersService } from "../buyers/buyers.service";
import { SellersService } from "../sellers/sellers.service";
import { ProductsService } from "../products/products.service";
import { Order } from "../orders/order.model";
import { Cart } from "../buyers/buyers.model";
import { formatDate } from "../utils/format-date.utils";

@Injectable()
export class MailService {
    constructor(
        private readonly buyersService: BuyersService,
        private readonly sellersService: SellersService,
        private readonly productsService: ProductsService,
        private readonly mailerService: MailerService
    ) { }

    async sendOrderConfirmationEmail(buyerEmail: string, orderData: Order, productData: Cart[], sellerEmail): Promise<void> {
        const mailOptions = {
            from: 'info.last.call.company@gmail.com',
            to: buyerEmail,
            subject: 'Order Confirmation',
            html: await this.generateOrderEmailContent(orderData, productData, buyerEmail, sellerEmail),
        };

        try {
            await this.mailerService.sendMail(mailOptions);
            //console.log('Order confirmation email sent successfully');
        } catch (error) {
            //console.error('Failed to send order confirmation email:', error);
            throw error;
        }
    }

    async generateOrderEmailContent(orderData: Order, productData: Cart[], buyerEmail: string, sellerEmail: string): Promise<string> {
        console.log(orderData);
        const sellerData = await this.sellersService.getSingleSellerByEmail(sellerEmail);
        //console.log(sellerData);
        const buyerData = await this.buyersService.getSingleBuyerByEmail(buyerEmail);
        //console.log(buyerData);
        let emailContent = '<h1>Order Confirmation</h1>';
        emailContent += '<p>Thank you for your order! We appreciate it.</p>';
        emailContent += `<p>Order ID: ${orderData.uid}</p>`;
        emailContent += '<h2>Order Details:</h2>';
        emailContent += '<table style="border-collapse: collapse; width: 100%; text-align: center;">';
        emailContent += '<tr>';
        emailContent += '<th style="border: 1px solid black;">Product</th>';
        emailContent += '<th style="border: 1px solid black;">Quantity</th>';
        emailContent += '<th style="border: 1px solid black;">Price</th>';
        emailContent += '<th style="border: 1px solid black;">Subtotal Product Price</th>';
        emailContent += '</tr>';

        for (const item of productData) {
            const product = await this.productsService.getSingleProduct(item.productId);
            const totalPrice = item.quantity * product.price;

            emailContent += '<tr>';
            emailContent += `<td style="border: 1px solid black;"><h3>${product.title}</h3><img src="${product.picture}" alt="${product.title}" style="max-width: 200px;"></td>`;
            emailContent += `<td style="border: 1px solid black;">${item.quantity}</td>`;
            emailContent += `<td style="border: 1px solid black;">${product.price.toFixed(2)} €</td>`;
            emailContent += `<td style="border: 1px solid black;">${totalPrice.toFixed(2)} €</td>`;
            emailContent += '</tr>';
        }

        emailContent += '</table>';
        emailContent += `<h2>Delivery & Handling:</h2>`;
        emailContent += `<p>${sellerData.deliveryCost} €</p>`;
        emailContent += `<h2>Total Price:</h2>`;
        emailContent += `<p>${orderData.totalPrice} €</p>`;
        emailContent += `<h2>Your Order Will Be Delivered To</h2>`;
        emailContent += `<p><b>${orderData.address}</b></p>`;
        emailContent += `<p><b>${orderData.city}</b></p>`;
        emailContent += `<p><b>${orderData.country}</b></p>`;
        emailContent += `<h2>Order Status:</h2>`;
        emailContent += `<p>Status: ${orderData.status}</p>`;
        emailContent += `<p>Date of Purchase: ${formatDate(orderData.dateOfPurchase)}</p>`;
        emailContent += `<p>Last Day of Delivery: ${formatDate(orderData.lastDateOfDelivery)}</p>`;
        emailContent += '<p>We will handle your order in the shortest possible time.</p>';
        emailContent += '<p>For any questions, please contact us at:</p>';
        emailContent += `<p>${sellerData.email}</p>`;
        emailContent += '<p>In the mean time you can check order status at:</p>';
        emailContent += `<p>http://localhost:3000/order/${orderData._id}</p>`; // !!! spremeni v actual url
        emailContent += '<p>Thank you,</p>';
        emailContent += `<p>${sellerData.title}</p>`;

        return emailContent;
    }

    async sendMessage(sellerEmail: string, buyerEmail: string, message: string): Promise<boolean> {
        const mailOptions = {
            to: sellerEmail,
            subject: 'Message from buyer',
            html: await this.generateMessageEmailContent(buyerEmail, message),
            replyTo: buyerEmail
        };

        try {
            await this.mailerService.sendMail(mailOptions);
            //console.log('Order confirmation email sent successfully');
            return true;
        } catch (error) {
            //console.error('Failed to send order confirmation email:', error);
            return false;
            //throw error;
        }
    }

    async generateMessageEmailContent(buyerEmail: string, message: string): Promise<string> {
        let emailContent = `<h3>You've got a new message from ${buyerEmail}:</h3>`;
        emailContent += `<p>${message}</p>`;
        emailContent += `<p>You can reply to this email and ${buyerEmail} will get it!</p>`;
        emailContent += '<p>Thanks,</p>';
        emailContent += `<p>Last Call Company</p>`;
        return emailContent;
    }
}