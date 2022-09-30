import { CloudformationAdapter } from "./adapters/implementations/cloudfront";
import { SSMAdapter } from "./adapters/implementations/ssm";
import { accountDomain } from "./delivery/http/account";
import { blacklistDomain } from "./delivery/http/blacklist";
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

	await accountDomain(params);
	await blacklistDomain(params);
	await productDomain(params);
	await saleDomain(params);
	await storeDomain(params);
	await walletDomain(params);

	server.listen();
};

bootstrap();
