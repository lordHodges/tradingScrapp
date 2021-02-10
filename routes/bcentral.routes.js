const Joi = require("@hapi/joi");
const rp = require("request-promise");
const cheerio = require("cheerio");
module.exports = {
	name: "users",
	version: "1.0.0",
	register: async (server) => {
		server.route([
			{
				method: "GET",
				path: "/series_chile_1",
				handler: async function (request, h) {
					const getYenValue = async () => {
						const baseURL =
							"https://si3.bcentral.cl/Indicadoressiete/secure/Indicadoresdiarios.aspx";
						const html = await rp(baseURL);
						const listaSerie = await cheerio("label", html).map((i, e) => {
							/* 
						uf: lblValor1_1
						ivp: lblValor1_2
						dollarObservado: lblValor1_3
						euro: lblValor1_5;
						yen: lblValor1_10; //contra dollar
						Onza troy de Oro: lblValor2_3; 	//en dolares;
						Onza troy de plata: lblValor2_4; 	//en dolares;
						Libra de Cobre: lblValor2_5;
						*/
							const serie = {};
							serie.labelId = e.attribs.id;
							serie.valor = e.childNodes[0].data;

							return serie;
						});
						const yen = await listaSerie.filter((i, data) => {
							return data.labelId === "lblValor1_10";
						});

						return Promise.all(yen);
					};
					/* https://mindicador.cl/api */
					const getSeriesChile = async () => {
						const baseURL = "https://mindicador.cl/api";
						const html = await rp(baseURL);
						const arrayHtml = Object.values(JSON.parse(html));
						return arrayHtml;
					};
					const yen = await (await getYenValue()).map((data) => {
						data.nombre = "yen";
						return data;
					});

					const mii = await getSeriesChile();
					mii.push(yen[0]);
					mii.splice(0, 3);
					return mii;
				},
				options: {
					description: "Listar series mindicador.cl",
					tags: ["api"],
				},
			},
			{
				method: "GET",
				path: "/series_bcentral_1",
				handler: async function (request, h) {
					return " await getSeries()";
				},
				options: {
					description: "List all series banco",
					tags: ["api"],
				},
			},
			{
				method: "POST",
				path: "/hello",
				handler: async function (request, h) {
					const { payload } = request;
					return `hello user ${payload.nombre}`;
				},
				options: {
					description: "say hello user",
					tags: ["api"],
					validate: {
						payload: Joi.object({
							nombre: Joi.string().max(6).min(3),
						}),
					},
				},
			},
		]);
	},
};
