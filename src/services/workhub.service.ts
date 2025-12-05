"use server";

import { cookies } from "next/headers";

import { COOKIES } from "@/common/constants/cookie.constants";
import { IFormOtp } from "@/common/interfaces/form.interfaces";

async function generateWorkhubAccessToken() {
  const cookieStore = await cookies();
  const variables = cookieStore.get(COOKIES.VARIABLES);
  const variablesObj = JSON.parse(variables?.value || "{}");
  return variablesObj;
}

export async function verifyOTP(otp: string, otpConfig: IFormOtp) {
  const workhubAccessToken = await generateWorkhubAccessToken();
  console.log(workhubAccessToken, otp, otpConfig);
}
