/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/naming-convention */

import axios from "axios";
import { Agent } from "https";

import type { CreatePixInput, PixManager } from "../pix-manager";

interface ApiCredentialsResponse {
	access_token: string;
	token_type: "Bearer";
	expires_in: 3600;
	scope: string;
}

interface ApiCobResponse {
	calendario: {
		criacao: string;
		expiracao: number;
	};
	txid: string;
	revisao: number;
	loc: {
		id: number;
		location: string;
		tipoCob: string;
	};
	location: string;
	status: string;
	valor: {
		original: string;
	};
	chave: string;
}

interface ApiQrCodeResponse {
	qrcode: string;
	imagemQrcode: string; // Base64 image
}

interface PixBody {
	pix: [
		{
			endToEndId: string; // Pix ID
			txid: string; // Sale ID (WITHOUT DASHES!!!!)
			chave: string; // Pix Key
			valor: string; // Value
			horario: string; // ISO Date
			infoPagador: string; // Message
		},
	];
}

export class GerenciarnetManager implements PixManager {
	private httpsAgent: Agent;

	private readonly credentials: {
		accessToken: string;
		expiresAt: number;
	};

	private readonly pixExpirationInSeconds = 900;

	private async getCredentials() {
		if (!this.httpsAgent) {
			this.httpsAgent = new Agent({
				rejectUnauthorized: true,
				cert: process.env.SALE_GERENCIANET_CERTIFICATE_CERT,
				key: process.env.SALE_GERENCIANET_CERTIFICATE_KEY,
			});
		}

		if (new Date().getTime() < this.credentials.expiresAt) {
			return axios.create({
				baseURL: process.env.SALE_GERENCIANET_URL,
				httpsAgent: this.httpsAgent,
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${this.credentials.accessToken}`,
				},
			});
		}

		const auth = Buffer.from(
			`${process.env.SALE_GERENCIANET_CLIENT_ID}:${process.env.SALE_GERENCIANET_CLIENT_SECRET}`,
		).toString("base64");

		const response = await axios
			.post<ApiCredentialsResponse>(
				"/oauth/token",
				{
					grant_type: "client_credentials",
				},
				{
					baseURL: process.env.SALE_GERENCIANET_URL,
					httpsAgent: this.httpsAgent,
					headers: {
						Authorization: `Basic ${auth}`,
					},
				},
			)
			.then(r => r.data);

		this.credentials.accessToken = response.access_token;
		this.credentials.expiresAt =
			new Date().getTime() + response.expires_in - 150;

		return axios.create({
			baseURL: process.env.SALE_GERENCIANET_URL,
			httpsAgent: this.httpsAgent,
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${this.credentials.accessToken}`,
			},
		});
	}

	public async createPix({ value, saleId }: CreatePixInput) {
		const instance = await this.getCredentials();

		const valueString = String(value).includes(".")
			? String(value)
			: `${value}.00`;

		const responseCob = await instance
			.put<ApiCobResponse>(`/v2/cob/${this.unmaskUuid(saleId)}`, {
				calendario: {
					expiracao: this.pixExpirationInSeconds,
				},
				valor: {
					original: valueString,
				},
				chave: process.env.SALE_GERENCIANET_PIX_KEY,
			})
			.then(r => r.data);

		const responseQrCode = await axios
			.get<ApiQrCodeResponse>(`/v2/loc/${responseCob.loc.id}/qrcode`)
			.then(r => r.data);

		return {
			key: responseQrCode.qrcode,
			qrCodeBase64: responseQrCode.imagemQrcode.replace(
				"data:image/png;base64,",
				"",
			),
		};
	}

	public getPixPaidData(p: PixBody) {
		const pix = p.pix.shift()!;
		const saleId = this.maskUuid(pix.txid);
		const value = parseFloat(pix.valor);

		return {
			saleId,
			value,
		};
	}

	protected unmaskUuid(uuid: string) {
		return uuid.replace(/-/g, "");
	}

	protected maskUuid(uuid: string) {
		return [
			uuid.slice(0, 8),
			uuid.slice(8, 12),
			uuid.slice(12, 16),
			uuid.slice(16, 20),
			uuid.slice(20),
		].join("-");
	}
}
