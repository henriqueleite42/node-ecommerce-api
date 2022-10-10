/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import type { FastifyInstance } from "fastify";
import Fastify from "fastify";

import type { AccessTokenManager } from "../../adapters/access-token-manager";
import { PasetoAdapter } from "../../adapters/implementations/paseto";
import type { HttpRouteConfig } from "../http-manager";
import { HttpManager, HttpRoute } from "../http-manager";

import { AuthManagerProvider } from "./auth-manager";
import { ValidatorProvider } from "./validator";

export class FastifyHttpProvider extends HttpManager {
	protected readonly fastifyInstance: FastifyInstance;

	protected readonly accessTokenManager: AccessTokenManager;

	public constructor() {
		super();

		this.fastifyInstance = Fastify({
			logger: process.env.NODE_ENV !== "production",
			exposeHeadRoutes: false,
		});

		this.accessTokenManager = new PasetoAdapter();
	}

	public addRoute<I>(
		config: HttpRouteConfig<I>,
		getRoute: (route: HttpRoute<I>) => HttpRoute<I>,
	) {
		const fastifyRoute = new HttpRoute(
			config.validations
				? new ValidatorProvider(config.validations)
				: undefined,
			config.auth
				? new AuthManagerProvider(config.auth, this.accessTokenManager)
				: undefined,
			config,
		);
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
