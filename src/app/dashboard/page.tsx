"use client";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

const ReportTable = ({ tabelaHTML }: { tabelaHTML: string }) => {
  // Removendo as duas últimas colunas da tabela
  const tabelaSemUltimasColunas = tabelaHTML
    ?.replace(/<a[^>]*>Detalhar<\/a>/g, "")
    .replace('<th id="th_opcoes" rowspan="2" class="no-print">Opções</th>', "")
    .replace(
      '<th id="th_mfd" rowspan="2" class="text-center"><span class="sr-only" abbr="MFD/Conceito">Média Final da Disciplina/Conceito</span><span aria-hidden="true">MFD/Conceito</span></th>',
      ""
    )
    .replace(/<td headers="th_mfd" class="text-center">-<\/td>/g, "")
    .replace(
      /<td headers="th_opcoes" class="no-print text-center"><\/td>/g,
      ""
    );

  return (
    <div>
      <h2>Boletim:</h2>
      <div dangerouslySetInnerHTML={{ __html: tabelaSemUltimasColunas }} />
    </div>
  );
};

export default function DashBoard() {
  const searchParams = useSearchParams();
  const userData = searchParams.get("data")
    ? JSON.parse(searchParams.get("data") as string)
    : null;

  const greeting = useMemo(() => {
    const d = new Date();
    const time = d.getHours();

    if (time < 12) {
      return "Bom dia";
    }
    if (time >= 12 && time < 18) {
      return "Boa tarde";
    }
    if (time >= 18) {
      return "Boa noite";
    }
  }, []);

  return (
    <div className="flex justify-center">
      <div className="flex min-h-screen flex-col items-center justify-between max-w-6xl p-4">
        {userData && (
          <div>
            <div className="flex gap-4">
              <div className="flex items-center justify-center">
                <img
                  src={userData.img}
                  alt="avatar"
                  className="size-32 rounded-full"
                />
              </div>
              <div>
                <div>
                  <span>
                    {greeting}{" "}
                    <span className="font-bold text-xl text-violet-500">
                      {userData.nome} 🎉
                    </span>
                  </span>
                </div>
                <div>
                  CRA:{" "}
                  <span className="font-bold text-green-600 text-xl">
                    {userData.cra}
                  </span>
                </div>
                <div>
                  Data de Ingresso: <span>{userData.ingresso}</span>
                </div>
                <div>
                  E-mail Acadêmico: <span>{userData.email_academico}</span>
                </div>
                <div>
                  E-mail Google Sala de Aula:{" "}
                  <span>
                    {userData.email_google_sala_de_aula?.substring(
                      0,
                      userData.email_google_sala_de_aula?.indexOf("O login")
                    )}
                  </span>
                </div>
                <div>
                  CPF: <span>{userData.cpf}</span>
                </div>
                <div>
                  Período de Referência:{" "}
                  <span>{userData.periodo_de_referencia}</span>
                </div>
                <div>
                  Curso: <span>{userData.curso}</span>
                </div>
                <div>
                  Matriz: <span>{userData.matriz}</span>
                </div>

                <div>
                  Quantidade de Períodos: <span>{userData.qtd_periodos}</span>
                </div>
              </div>
            </div>

            <ReportTable tabelaHTML={userData.table} />
          </div>
        )}
      </div>
    </div>
  );
}
