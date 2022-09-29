import { SSMAdapter } from "./adapters/implementations/ssm";
import { accountDomain } from "./delivery/http/account";
import { blacklistDomain } from "./delivery/http/blacklist";
import { productDomain } from "./delivery/http/product";
import { saleDomain } from "./delivery/http/sale";
import { storeDomain } from "./delivery/http/store";
import { walletDomain } from "./delivery/http/wallet";
import { FastifyHttpProvider } from "./providers/implementations/fastify";

const bootstrap = async () => {
	const server = new FastifyHttpProvider();

	server.setSecretsManager(new SSMAdapter());

	accountDomain(server);
	blacklistDomain(server);
	productDomain(server);
	saleDomain(server);
	storeDomain(server);
	walletDomain(server);

	await server.loadSecrets();

	server.listen();
};

bootstrap();
