"use client";
import { UserData, scrapeSuap } from "@/actions/scrape-suap";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function Home() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const router = useRouter();

  const createQueryString = (name: string, value: string) => {
    const params = new URLSearchParams();
    params.set(name, value);

    return params.toString();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const form = e.target as HTMLFormElement;
    const userName = (form.elements.namedItem("user-name") as HTMLInputElement)
      .value;
    const userPassword = (
      form.elements.namedItem("user-password") as HTMLInputElement
    ).value;

    try {
      const scrap = await scrapeSuap(
        "https://suap.uepb.edu.br/accounts/login/?next=/",
        userName,
        userPassword
      );
      console.log(scrap);
      setUserData(scrap);

      router.push(
        "/dashboard" + "?" + createQueryString("data", JSON.stringify(scrap))
      );
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        Insira seus dados do SUAP:
        <input
          type="text"
          name="user-name"
          placeholder="usuário"
          className="bg-zinc-700 px-4 py-2 rounded-md"
        />
        <input
          type="text"
          name="user-password"
          placeholder="senha"
          className="bg-zinc-700 px-4 py-2 rounded-md"
        />
        <button type="submit" className="bg-violet-600 rounded-md py-2">
          Acessar
        </button>
      </form>
      {error && (
        <p>Algo deu errado, tente novamente. Se persistir, tente mais tarde.</p>
      )}
      {loading && (
        <div role="status" className="mt-4">
          <svg
            aria-hidden="true"
            className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-purple-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
          <span className="sr-only">Loading...</span>
        </div>
      )}
    </main>
  );
}
