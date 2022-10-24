/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/naming-convention */

import axios from "axios";
import { loadImage, createCanvas, registerFont } from "canvas";
import { resolve } from "path";
import sharp from "sharp";

import type { GenTopStoresInput, ImageManager } from "../image-manager";

import type { GenderEnum } from "../../types/enums/gender";

export class CanvasAdapter implements ImageManager {
	private readonly topStoresConfig = {
		backgroundImgUrl:
			"https://cdn.discordapp.com/attachments/1014694887368687646/1033947702112825354/unknown.png",
		canvasWidth: 1344,
		canvasHeight: 4010,
	};

	private readonly genderSign: Record<GenderEnum, string> = {
		MAN: "♂️",
		WOMAN: "♀️",
		TRANS_MAN: "⚧️",
		TRANS_WOMAN: "⚧️",
		FEMBOY: "⚦",
	};

	private readonly genderColor: Record<GenderEnum, string> = {
		MAN: "#0091ce",
		WOMAN: "#ed1e79",
		TRANS_MAN: "#29abe2",
		TRANS_WOMAN: "#ef73aa",
		FEMBOY: "#9938d7",
	};

	public constructor() {
		registerFont(
			resolve(process.cwd(), "src", "assets", "fonts", "Poppins.ttf"),
			{
				family: "poppins",
			},
		);
	}

	public async genTopStores({ stores }: GenTopStoresInput) {
		const [background, ...storeImages] = await this.getImgs([
			this.topStoresConfig.backgroundImgUrl,
			...stores.map(s => s.avatarUrl!),
		]);

		const canvas = createCanvas(
			this.topStoresConfig.canvasWidth,
			this.topStoresConfig.canvasHeight,
		);
		const ctx = canvas.getContext("2d");
		ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

		const [firstPlace, ...otherPlaces] = stores;

		/**
		 *
		 * First place
		 *
		 */

		const firstPlaceImgX = 0;
		const firstPlaceImgY = 401;
		const firstPlaceImgRadius = 175;
		const firstPlaceImgW = this.topStoresConfig.canvasWidth;
		const firstPlaceImgH = this.topStoresConfig.canvasHeight;

		ctx.save();
		ctx.beginPath();
		ctx.moveTo(firstPlaceImgX + firstPlaceImgRadius, firstPlaceImgY);
		ctx.lineTo(
			firstPlaceImgX + firstPlaceImgW - firstPlaceImgRadius,
			firstPlaceImgY,
		);
		ctx.quadraticCurveTo(
			firstPlaceImgX + firstPlaceImgW,
			firstPlaceImgY,
			firstPlaceImgX + firstPlaceImgW,
			firstPlaceImgY + firstPlaceImgRadius,
		);
		ctx.lineTo(
			firstPlaceImgX + firstPlaceImgW,
			firstPlaceImgY + firstPlaceImgH - firstPlaceImgRadius,
		);
		ctx.quadraticCurveTo(
			firstPlaceImgX + firstPlaceImgW,
			firstPlaceImgY + firstPlaceImgH,
			firstPlaceImgX + firstPlaceImgW - firstPlaceImgRadius,
			firstPlaceImgY + firstPlaceImgH,
		);
		ctx.lineTo(
			firstPlaceImgX + firstPlaceImgRadius,
			firstPlaceImgY + firstPlaceImgH,
		);
		ctx.quadraticCurveTo(
			firstPlaceImgX,
			firstPlaceImgY + firstPlaceImgH,
			firstPlaceImgX,
			firstPlaceImgY + firstPlaceImgH - firstPlaceImgRadius,
		);
		ctx.lineTo(firstPlaceImgX, firstPlaceImgY + firstPlaceImgRadius);
		ctx.quadraticCurveTo(
			firstPlaceImgX,
			firstPlaceImgY,
			firstPlaceImgX + firstPlaceImgRadius,
			firstPlaceImgY,
		);
		ctx.closePath();
		ctx.clip();
		ctx.drawImage(
			storeImages[0],
			firstPlaceImgX,
			firstPlaceImgY,
			firstPlaceImgW,
			firstPlaceImgH,
		);
		ctx.restore();

		ctx.font = "85px poppins";

		const firstPlaceText = `1. ${firstPlace.name} ${
			this.genderSign[firstPlace.gender]
		}`;

		const textMeasure = ctx.measureText(firstPlaceText);

		const firstPlaceTextX = 100;
		const firstPlaceTextY = 1461;
		const firstPlaceTextRadius = 61;
		const firstPlaceTextW = textMeasure.width + 65 + 65;
		const firstPlaceTextH = 60 + 125;

		const firstPlaceTextMarginX = firstPlaceTextX + 65;
		const firstPlaceTextMarginY = firstPlaceTextY + 125;

		ctx.fillStyle = "#0e0e0e";

		ctx.save();
		ctx.beginPath();
		ctx.moveTo(firstPlaceTextX + firstPlaceTextRadius, firstPlaceTextY);
		ctx.lineTo(
			firstPlaceTextX + firstPlaceTextW - firstPlaceTextRadius,
			firstPlaceTextY,
		);
		ctx.quadraticCurveTo(
			firstPlaceTextX + firstPlaceTextW,
			firstPlaceTextY,
			firstPlaceTextX + firstPlaceTextW,
			firstPlaceTextY + firstPlaceTextRadius,
		);
		ctx.lineTo(
			firstPlaceTextX + firstPlaceTextW,
			firstPlaceTextY + firstPlaceTextH - firstPlaceTextRadius,
		);
		ctx.quadraticCurveTo(
			firstPlaceTextX + firstPlaceTextW,
			firstPlaceTextY + firstPlaceTextH,
			firstPlaceTextX + firstPlaceTextW - firstPlaceTextRadius,
			firstPlaceTextY + firstPlaceTextH,
		);
		ctx.lineTo(
			firstPlaceTextX + firstPlaceTextRadius,
			firstPlaceTextY + firstPlaceTextH,
		);
		ctx.quadraticCurveTo(
			firstPlaceTextX,
			firstPlaceTextY + firstPlaceTextH,
			firstPlaceTextX,
			firstPlaceTextY + firstPlaceTextH - firstPlaceTextRadius,
		);
		ctx.lineTo(firstPlaceTextX, firstPlaceTextY + firstPlaceTextRadius);
		ctx.quadraticCurveTo(
			firstPlaceTextX,
			firstPlaceTextY,
			firstPlaceTextX + firstPlaceTextRadius,
			firstPlaceTextY,
		);
		ctx.closePath();
		ctx.clip();
		ctx.fill();
		ctx.restore();

		ctx.fillStyle = this.genderColor[firstPlace.gender];
		ctx.fillText(firstPlaceText, firstPlaceTextMarginX, firstPlaceTextMarginY);

		/**
		 *
		 * Other places
		 *
		 */

		ctx.font = "65px poppins";

		const imgX = 0;
		let imgY = 1942;
		const imgRadius = 50;
		const imgW = 446;
		const imgH = 446;

		for (const idx in otherPlaces) {
			const store = otherPlaces[idx];

			const idxNbr = parseInt(idx, 10);
			const index = idxNbr + 1;

			ctx.save();
			ctx.beginPath();
			ctx.moveTo(imgX, imgY);
			ctx.lineTo(imgX + imgW - imgRadius, imgY);
			ctx.quadraticCurveTo(imgX + imgW, imgY, imgX + imgW, imgY + imgRadius);
			ctx.lineTo(imgX + imgW, imgY + imgH - imgRadius);
			ctx.quadraticCurveTo(
				imgX + imgW,
				imgY + imgH,
				imgX + imgW - imgRadius,
				imgY + imgH,
			);
			ctx.lineTo(imgX + imgRadius, imgY + imgH);
			ctx.quadraticCurveTo(imgX, imgY + imgH, imgX, imgY + imgH);
			ctx.lineTo(imgX, imgY + imgRadius);
			ctx.quadraticCurveTo(imgX, imgY, imgX, imgY);
			ctx.closePath();
			ctx.clip();
			ctx.drawImage(storeImages[index], imgX, imgY, imgW, imgH);
			ctx.restore();

			const textX = imgX + imgW + 75;
			const textY = imgY + 255;
			const text = `${index + 1}. ${store.name} ${
				this.genderSign[store.gender]
			}`;

			ctx.fillStyle = this.genderColor[store.gender];
			ctx.fillText(text, textX, textY);

			imgY += 446;
		}

		return canvas.toBuffer();
	}

	// Internal

	private async getImgs(urls: Array<string>) {
		const imgBuffer = await Promise.all(
			urls.map(url =>
				axios
					.get(url, {
						responseType: "arraybuffer",
					})
					.then(r => r.data),
			),
		);

		const jpegImgs = await Promise.all(
			imgBuffer.map(i => sharp(i).toFormat("jpeg").toBuffer()),
		);

		return Promise.all(jpegImgs.map(img => loadImage(img)));
	}
}
