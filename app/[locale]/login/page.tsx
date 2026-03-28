import { signUp } from "@/lib/authClient";
import { useRouter } from "next/router";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  return <div className=""></div>;
}
