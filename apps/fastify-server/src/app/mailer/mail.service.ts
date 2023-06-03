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
            replyTo: sellerEmail,
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
        //console.log(orderData);
        const sellerData = await this.sellersService.getSingleSellerByEmail(sellerEmail);
        const buyerData = await this.buyersService.getSingleBuyerByEmail(buyerEmail);

        let emailContent = `<html>
            <head>
                <style>
                    @media only screen and (max-width: 600px) {
                        table {
                            width: 100%;
                            border-collapse: collapse;
                        }
                    }
                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f4f4;
                        font-family: Arial, sans-serif;
                        color: #333333;
                    }
                    h1 {
                        text-align: center;
                        color: #3f51b5;
                    }
                    h2 {
                        margin-top: 30px;
                        margin-bottom: 15px;
                        color: #3f51b5;
                    }
                    th, td {
                        border: 1px solid #dddddd;
                        padding: 8px;
                    }
                    img {
                        max-width: 200px;
                        height: auto;
                        margin-top: 10px;
                    }
                    .order-details {
                        margin-top: 30px;
                    }
                    .delivery-info {
                        margin-top: 30px;
                    }
                    .order-status {
                        margin-top: 30px;
                    }
                    .order-status p {
                        margin-bottom: 5px;
                    }
                    .order-status p:last-child {
                        margin-bottom: 0;
                    }
                    .contact-info {
                        margin-top: 30px;
                    }
                    .thank-you {
                        margin-top: 30px;
                        text-align: center;
                    }
                    .button {
                        display: inline-block;
                        padding: 10px 20px;
                        background-color: #3f51b5;
                        color: #FFFFFF;
                        text-decoration: none;
                        border-radius: 4px;
                    }
                    .button:hover {
                        background-color: #1a237e;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Order Confirmation</h1>
                    <p>${buyerData.name}, thank you for your order! We appreciate it.</p>
                    <p>Order ID: ${orderData.uid}</p>
                    <h2>Order Details:</h2>
                    <table style="width:100%; text-align:center;">
                        <tr>
                            <th>Product</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Subtotal Product Price</th>
                        </tr>`;

        for (const item of productData) {
            const product = await this.productsService.getSingleProduct(item.productId);
            const totalPrice = item.quantity * product.price;

            emailContent += `<tr>
                <td><h3>${product.title}</h3><img src="${product.picture}" alt="${product.title}"></td>
                <td>${item.quantity}</td>
                <td>${product.price.toFixed(2)} €</td>
                <td>${totalPrice.toFixed(2)} €</td>
            </tr>`;
        }

        emailContent += `</table>
                    <div class="delivery-info">
                        <h2>Delivery & Handling:</h2>
                        <p>${sellerData.deliveryCost} €</p>
                    </div>
                    <div class="order-details">
                        <h2>Total Price:</h2>
                        <p>${orderData.totalPrice} €</p>
                        <h2>Your Order Will Be Delivered To</h2>
                        <p><b>${orderData.address}</b></p>
                        <p><b>${orderData.city}</b></p>
                        <p><b>${orderData.country}</b></p>
                    </div>
                    <div class="order-status">
                        <h2>Order Status:</h2>
                        <p>Status: ${orderData.status}</p>
                        <p>Date of Purchase: ${formatDate(orderData.dateOfPurchase)}</p>
                        <p>Last Day of Delivery: ${formatDate(orderData.lastDateOfDelivery)}</p>
                        <p>We will handle your order in the shortest possible time.</p>
                    </div>
                    <div class="contact-info">
                        <p>For any questions, please contact us at</p>
                        <p>${sellerData.email} or reply to this email.</p>
                        <p>In the meantime, you can check the order status at:</p>
                        <p><a href="http://localhost:3000/order/${orderData._id}" class="button"><span style="color:white">Check Order Status</span></a></p>
                    </div>
                    <div class="thank-you">
                        <p>Thank you,</p>
                        <p>${sellerData.title}</p>
                    </div>
                </div>
            </body>
            </html>`;

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
        let emailContent = `<html>
            <head>
                <style>
                    @media only screen and (max-width: 600px) {
                        .container {
                            width: 100%;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                    }
                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f4f4f4;
                        font-family: Arial, sans-serif;
                        color: #333333;
                    }
                    h3 {
                        color: #3f51b5;
                    }
                    p {
                        margin-bottom: 10px;
                        font-size: 14px;
                    }
                    .thank-you {
                        margin-top: 30px;
                        text-align: center;
                        color: #777777;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h3>You've got a new message from ${buyerEmail}:</h3>
                    <p>${message}</p>
                    <p style="font-size: 12px;">You can reply directly to this email and ${buyerEmail} will get it.</p>
                    <div class="thank-you">
                        <p>Thank you,</p>
                        <p>Last Call Company</p>
                    </div>
                </div>
            </body>
            </html>`;

        return emailContent;
    }

}