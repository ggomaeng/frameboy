import dotenv from "dotenv";
import { object, parse, string } from "valibot";

dotenv.config();

const envSchema = object({
  NEYNAR_API_KEY: string("NEYNAR_API_KEY is required"),
  PINATA_API_JWT: string("PINATA_API_JWT is required"),
});

export const { PINATA_API_JWT, NEYNAR_API_KEY } = parse(envSchema, process.env);
