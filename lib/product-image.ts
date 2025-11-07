import type { StaticImageData } from "next/image";
import drugImage from "@/app/drugimg.jpg";

const imageData = drugImage as StaticImageData;

export const DRUG_IMAGE_SRC = imageData?.src ?? "/drugimg.jpg";

export const getDrugImage = () => DRUG_IMAGE_SRC;
