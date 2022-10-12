/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-console */

import { CloudformationAdapter } from "./adapters/implementations/cloudfront";
import { SSMAdapter } from "./adapters/implementations/ssm";
import { accountDomain } from "./delivery/http/account";
import { blacklistDomain } from "./delivery/http/blacklist";
import { contentDomain } from "./delivery/http/content";
import { eventAlertDomainDomain } from "./delivery/http/event-alert";
import { productDomain } from "./delivery/http/product";
import { saleDomain } from "./delivery/http/sale";
import { storeDomain } from "./delivery/http/store";
import type { DomainInput } from "./delivery/http/types";
import { walletDomain } from "./delivery/http/wallet";
import { FastifyHttpProvider } from "./providers/implementations/fastify";

const bootstrap = async () => {
	const server = new FastifyHttpProvider();

	const params: DomainInput = {
		server,
		secretsLoader: new SSMAdapter(),
		resourcesLoader: new CloudformationAdapter(),
	};

	const initialEnvVars = Object.keys(process.env);

	await accountDomain(params);
	await blacklistDomain(params);
	await contentDomain(params);
	await eventAlertDomainDomain(params);
	await productDomain(params);
	await saleDomain(params);
	await storeDomain(params);
	await walletDomain(params);

	const currentEnvVars = Object.keys(process.env).filter(
		ev => ev === "NODE_ENV" || !initialEnvVars.includes(ev),
	);

	console.log(JSON.stringify(currentEnvVars, null, 2));

	server.listen();
};

bootstrap();
