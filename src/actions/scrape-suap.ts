"use server";

import { revalidatePath } from "next/cache";
import puppeteer from "puppeteer";

export interface UserData {
  nome: string;
  matricula: string;
  ingresso: string;
  email_academico: string;
  email_google_sala_de_aula: string;
  cpf: string;
  nome_no_registro: string;
  periodo_de_referencia: string;
  cra: string;
  curso: string;
  matriz: string;
  qtd_periodos: string;
  situacao_sistemica: string;
  data_da_migracao: string;
  impressao_digital: string;
  emitiu_diploma: string;
  table: string;
  img: string | null;
}

export async function scrapeSuap(
  url: string,
  userName: string,
  userPassword: string
): Promise<UserData | null> {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle0", timeout: 120000 });

    await page.type("#id_username", userName);
    await page.type("#id_password", userPassword);

    // Espera o usuário resolver o captcha
    await page.click(".submit-row");

    // Aguarda a página carregar após o login
    await page.waitForNavigation({
      waitUntil: "networkidle0",
      timeout: 120000,
    });

    // Clica no link "Meus Dados"
    await page.evaluate(() => {
      let links = document.querySelectorAll("a");
      links.forEach((link) => {
        if (
          link &&
          link.textContent &&
          link.textContent.trim() === "Meus Dados"
        ) {
          link.click();
        }
      });
    });

    // Aguarda a página "Meus Dados" carregar
    await page.waitForNavigation({
      waitUntil: "networkidle0",
      timeout: 120000,
    });

    // Extrai os dados da div e armazena em um objeto JSON organizado
    const data: UserData = await page.evaluate(() => {
      const infoDiv = document.querySelector("dl");
      const data: Partial<UserData> = {};

      const selector = ".photo-circle.big img";

      // Obtenha o elemento da imagem
      const imgElement = document.querySelector(selector) as HTMLImageElement;

      // Verifique se o elemento foi encontrado e se possui o atributo src
      if (imgElement && imgElement.src) {
        // Retorne o valor do atributo src
        data.img = imgElement.src;
      } else {
        data.img = null;
      }

      if (infoDiv) {
        const items = Array.from(infoDiv.querySelectorAll(".list-item"));

        items.forEach((item) => {
          const dt = item.querySelector("dt");
          const dd = item.querySelector("dd");

          if (dt && dd) {
            const key = dt.textContent?.trim();
            const value = Array.from(item.querySelectorAll("dd, p"))
              .map((el) => el.textContent?.trim())
              .join(" ")
              .replace(/\s\s+/g, " "); // Remove múltiplos espaços

            switch (key) {
              case "Nome":
                data.nome = value;
                break;
              case "Matrícula":
                data.matricula = value;
                break;
              case "Ingresso":
                data.ingresso = value;
                break;
              case "E-mail Acadêmico":
                data.email_academico = value;
                break;
              case "E-mail Google Sala de Aula":
                data.email_google_sala_de_aula = value;
                break;
              case "CPF":
                data.cpf = value;
                break;
              case "Nome no Registro":
                data.nome_no_registro = value;
                break;
              case "Período de Referência":
                data.periodo_de_referencia = value;
                break;
              case "C.R.A.":
                data.cra = value;
                break;
              case "Curso":
                data.curso = value?.replace(/\n\s+/g, " ").trim(); // Limpa novas linhas e espaços adicionais
                break;
              case "Matriz":
                data.matriz = value?.replace(/\n\s+/g, " ").trim(); // Limpa novas linhas e espaços adicionais
                break;
              case "Qtd. Períodos":
                data.qtd_periodos = value;
                break;
              case "Situação Sistêmica":
                data.situacao_sistemica = value?.replace(/\n\s+/g, " ").trim(); // Limpa novas linhas e espaços adicionais
                break;
              case "Data da Migração":
                data.data_da_migracao = value;
                break;
              case "Impressão Digital":
                data.impressao_digital = value;
                break;
              case "Emitiu Diploma":
                data.emitiu_diploma = value;
                break;
              default:
                console.warn(`Unmapped key: ${key}`);
                break;
            }
          }
        });
      }

      return data as UserData;
    });

    // Espera pelo elemento estar presente na página
    await page.waitForSelector('[data-tab="boletim"]');

    // Clica no elemento com o atributo data-tab="boletim"
    await page.click('[data-tab="boletim"]');

    await page.waitForSelector("table.borda");
    const tableHTML = await page.$eval(
      "table.borda",
      (table) => table.outerHTML
    );
    data.table = tableHTML || "";

    await browser.close();
    revalidatePath("/");
    return data;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error);
  }
}
