/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/naming-convention */

import type { AxiosInstance } from "axios";
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

export class GerenciarnetManager implements PixManager {
	private readonly gerencianet: AxiosInstance;

	private readonly credentials: {
		accessToken: string;
		expiresAt: number;
	};

	private readonly pixExpirationInSeconds = 900;

	public constructor() {
		const httpsAgent = new Agent({
			rejectUnauthorized: true,
			cert: process.env.GERENCIANET_CERTIFICATE_CERT,
			key: process.env.GERENCIANET_CERTIFICATE_KEY,
		});

		this.gerencianet = axios.create({
			baseURL: process.env.GERENCIANET_URL,
			httpsAgent,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	private async getCredentials() {
		if (new Date().getTime() < this.credentials.expiresAt) {
			return this.credentials.accessToken;
		}

		const auth = Buffer.from(
			`${process.env.GERENCIANET_CLIENT_ID}:${process.env.GERENCIANET_CLIENT_SECRET}`,
		).toString("base64");

		const response = await this.gerencianet
			.post<ApiCredentialsResponse>(
				"/oauth/token",
				{
					grant_type: "client_credentials",
				},
				{
					headers: {
						Authorization: `Basic ${auth}`,
					},
				},
			)
			.then(r => r.data);

		this.credentials.accessToken = response.access_token;
		this.credentials.expiresAt =
			new Date().getTime() + response.expires_in - 150;

		return this.credentials.accessToken;
	}

	public async createPix({ value, saleId }: CreatePixInput) {
		const accessToken = await this.getCredentials();

		const valueString = String(value).includes(".")
			? String(value)
			: `${value}.00`;

		const responseCob = await this.gerencianet
			.put<ApiCobResponse>(
				`/v2/cob/${saleId.replace(/-/g, "")}`,
				{
					calendario: {
						expiracao: this.pixExpirationInSeconds,
					},
					valor: {
						original: valueString,
					},
					chave: process.env.GERENCIANET_PIX_KEY,
				},
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			)
			.then(r => r.data);

		const responseQrCode = await axios
			.get<ApiQrCodeResponse>(
				`${process.env.GERENCIANET_URL!}/v2/loc/${responseCob.loc.id}/qrcode`,
				{
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				},
			)
			.then(r => r.data);

		return {
			key: responseQrCode.qrcode,
			qrCodeBase64: responseQrCode.imagemQrcode.replace(
				"data:image/png;base64,",
				"",
			),
		};
	}
}
