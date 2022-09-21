export interface CreatePixInput {
	saleId: string;
	value: number;
}

export interface CreatePixOutput {
	key: string;
	qrCodeBase64: string;
}

export interface PixManager {
	createPix: (p: CreatePixInput) => Promise<CreatePixOutput>;
}
