declare module "paynow" {
  export class Payment {
    reference: string;
    authEmail: string;
    add(title: string, amount: number, quantity?: number): Payment;
    info(): string;
    total(): number;
  }

  export class InitResponse {
    success: boolean;
    hasRedirect: boolean;
    redirectUrl?: string;
    error?: string;
    pollUrl?: string;
    instructions?: string;
    status: string;
  }

  export class StatusResponse {
    reference?: string;
    amount?: string;
    paynowReference?: string;
    pollUrl?: string;
    status?: string;
    error?: string;
  }

  export class Paynow {
    constructor(integrationId: string, integrationKey: string, resultUrl: string, returnUrl: string);
    createPayment(reference: string, authEmail: string): Payment;
    send(payment: Payment): Promise<InitResponse>;
    sendMobile(payment: Payment, phone: string, method: string): Promise<InitResponse>;
    pollTransaction(url: string): Promise<InitResponse>;
    parseStatusUpdate(response: string): StatusResponse;
  }
}
