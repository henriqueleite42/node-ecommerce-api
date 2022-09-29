/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { FastifyInstance } from "fastify";
import Fastify from "fastify";

import type { ExecFuncInput, RouteMethods } from "../delivery-manager";
import { DeliveryManager, Route } from "../delivery-manager";

import { CustomError } from "../../utils/error";

import { StatusCodeEnum } from "../../types/enums/status-code";

interface Config {
	method: RouteMethods;
	path: string;
	statusCode?: StatusCodeEnum;
}

class FastifyRoute<I = any> extends Route<I> {
	public constructor(protected readonly config: Config) {
		super();

		if (this.config.path.startsWith("/")) {
			throw new Error(`Routes ${this.config.path} cannot start with '/'`);
		}
	}

	public async execFunc(params: ExecFuncInput) {
		try {
			const result = await super.execFunc(params);

			return {
				statusCode: this.getStatusCode(),
				body: result,
			};
		} catch (err: any) {
			if (err instanceof CustomError) {
				return {
					statusCode: err.statusCode,
					body: err.getBody(),
				};
			}

			console.error(err);

			return {
				statusCode: StatusCodeEnum.INTERNAL,
			};
		}
	}

	public getMethod() {
		return this.config.method;
	}

	public getPath() {
		return this.config.path;
	}

	protected getStatusCode() {
		if (this.config.statusCode) return this.config.statusCode;

		switch (this.config.method) {
			case "DELETE":
				return StatusCodeEnum.NO_CONTENT;
			default:
				return StatusCodeEnum.SUCCESS;
		}
	}
}

export class FastifyHttpProvider extends DeliveryManager {
	protected readonly fastifyInstance: FastifyInstance;

	public constructor() {
		super();

		this.fastifyInstance = Fastify({
			logger: process.env.NODE_ENV !== "production",
			exposeHeadRoutes: false,
		});
	}

	public async loadSecrets() {
		if (!this.secretsManager) return;

		for (const secret of this.secretsToBeLoaded) {
			const newSecrets = await this.secretsManager.getSecrets({
				from: secret,
			});

			process.env = {
				...process.env,
				...newSecrets,
			};
		}
	}

	public addRoute<I>(
		config: Config,
		getRoute: (route: FastifyRoute<I>) => FastifyRoute<I>,
	) {
		const fastifyRoute = new FastifyRoute(config);
		const route = getRoute(fastifyRoute);

		const method = route.getMethod().toLowerCase();
		const path = route.getPath();

		this.fastifyInstance[method as "get"](`/${path}`, async (req, res) => {
			const { statusCode, body } = await route.execFunc({
				body: req.body as any,
				query: req.query as any,
				headers: req.headers as any,
				path: req.params as any,
			});

			res.status(statusCode).send(body);
		});

		return this;
	}

	public listen() {
		this.fastifyInstance.listen(
			{
				port: parseInt(process.env.API_PORT!, 10),
			},
			(err, address) => {
				if (err) {
					console.error(err);

					process.exit(1);
				}

				// eslint-disable-next-line no-console
				console.log(this.fastifyInstance.printRoutes());

				// eslint-disable-next-line no-console
				console.log(`Server is now listening on ${address}`);
			},
		);
	}
}
